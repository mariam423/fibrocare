/**
 * Server adapter: assembles BriefInput from Prisma + the correlation engine
 * and runs the deterministic brief builder. Used by the clinical-brief API
 * route and the PDF export.
 */

import { prisma } from "@/lib/prisma";
import { buildMedicationMentions } from "@/lib/ai/memory";
import { analyzeCorrelations } from "@/lib/ai/correlations/engine";
import { buildClinicalBrief, type BriefDailyPoint } from "./engine";
import type { ClinicalBrief } from "./types";

const DAY_MS = 24 * 60 * 60 * 1000;
const PERIOD_DAYS = 30;

function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

/** Build the 30-day clinical executive brief for a user. */
export async function getClinicalBrief(userId: string): Promise<ClinicalBrief> {
  const since = new Date(Date.now() - PERIOD_DAYS * DAY_MS);
  const [logs, symptomLogs, medications] = await Promise.all([
    prisma.painLog.findMany({
      where: { userId, loggedAt: { gte: since } },
      orderBy: { loggedAt: "asc" },
      select: { painLevel: true, moodTag: true, loggedAt: true },
    }),
    prisma.symptomLog.findMany({
      where: { userId, date: { gte: toDateKey(since) } },
      select: { symptom: true },
    }),
    buildMedicationMentions(userId),
  ]);

  // Daily averages, oldest → newest.
  const acc = new Map<string, { sum: number; count: number; mood: string | null }>();
  for (const log of logs) {
    const key = toDateKey(log.loggedAt);
    const entry = acc.get(key) ?? { sum: 0, count: 0, mood: null };
    entry.sum += log.painLevel;
    entry.count += 1;
    if (!entry.mood) entry.mood = log.moodTag;
    acc.set(key, entry);
  }
  const daily: BriefDailyPoint[] = [...acc.entries()]
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([date, v]) => ({ date, pain: v.sum / v.count, mood: v.mood }));

  // Top symptoms, most frequent first.
  const counts = new Map<string, number>();
  for (const s of symptomLogs) counts.set(s.symptom, (counts.get(s.symptom) ?? 0) + 1);
  const topSymptoms = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([symptom]) => symptom);

  // Weather triggers with evidence — reuse the correlation engine on the
  // deterministic daily series (same source as insights.ts).
  const { deterministicWeather } = await import("@/lib/weather");
  const weather = daily.map((d) => {
    const w = deterministicWeather(new Date(`${d.date}T12:00:00`));
    return { date: d.date, humidity: w.humidity, pressure: w.pressure, temperature: w.temperature };
  });
  const correlations = analyzeCorrelations(daily, weather).filter(
    (c) => c.direction !== "none" && c.strength !== "negligible"
  );
  const weatherTriggers = correlations.map((c) => ({
    factor: `${c.metric}${c.lagged ? " (1-day lag)" : ""}`,
    evidence: `r=${c.coefficient.toFixed(2)} over ${c.sampleDays} logged days (${c.strength}, ${c.direction}).`,
  }));

  // Streak: consecutive distinct logged days ending today or yesterday.
  const distinctDays = [...acc.keys()].sort().reverse();
  let streakDays = 0;
  if (distinctDays.length > 0) {
    const cursor = new Date();
    cursor.setHours(0, 0, 0, 0);
    const todayKey = toDateKey(cursor);
    const yesterdayKey = toDateKey(new Date(cursor.getTime() - DAY_MS));
    let anchor =
      distinctDays[0] === todayKey || distinctDays[0] === yesterdayKey
        ? distinctDays[0]
        : null;
    while (anchor) {
      streakDays += 1;
      const prev = toDateKey(new Date(new Date(`${anchor}T00:00:00`).getTime() - DAY_MS));
      anchor = distinctDays.includes(prev) ? prev : null;
    }
  }

  return buildClinicalBrief({
    periodDays: PERIOD_DAYS,
    daily,
    topSymptoms,
    medications,
    weatherTriggers,
    streakDays,
  });
}
