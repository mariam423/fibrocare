/**
 * Token-budgeted health snapshot builder.
 *
 * Turns the user's Prisma records into a small, structured snapshot that is
 * cheap enough to embed in a system prompt (and available to the companion
 * as a tool call). Truncates the noisiest fields (notes, symptom lists)
 * instead of the instructions.
 */

import { prisma } from "@/lib/prisma";
import { analyzePainPatterns } from "@/lib/insightEngine";
import { healthSnapshotSchema, type HealthSnapshot } from "@/lib/ai/schemas";
import { getPainTrend } from "@/lib/careInsightEngine";

const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_LOGS = 14;

function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.round((values.reduce((s, v) => s + v, 0) / values.length) * 10) / 10;
}

/** Fetch and shape the user's current health data into a compact snapshot. */
export async function buildHealthSnapshot(
  userId: string
): Promise<HealthSnapshot> {
  const since30 = new Date(Date.now() - 30 * DAY_MS);
  const since7 = new Date(Date.now() - 7 * DAY_MS);

  // Newest-first so `take` keeps the most RECENT logs (the snapshot must
  // reflect where the user is today, not where they were 3 weeks ago).
  const [logs30, symptoms30] = await Promise.all([
    prisma.painLog.findMany({
      where: { userId, loggedAt: { gte: since30 } },
      orderBy: { loggedAt: "desc" },
      take: MAX_LOGS,
      select: { painLevel: true, moodTag: true, loggedAt: true },
    }),
    prisma.symptomLog.findMany({
      where: { userId, date: { gte: toDateKey(since30) } },
      select: { symptom: true },
    }),
  ]);

  const logs7 = logs30.filter((l) => l.loggedAt >= since7);

  // Flare days = distinct calendar days with avg pain >= 7 (same rule as the insight engine).
  const dayAccum = new Map<string, { sum: number; count: number }>();
  for (const log of logs30) {
    const key = toDateKey(log.loggedAt);
    const entry = dayAccum.get(key) ?? { sum: 0, count: 0 };
    entry.sum += log.painLevel;
    entry.count += 1;
    dayAccum.set(key, entry);
  }
  const flareDays30d = [...dayAccum.values()].filter(
    (v) => v.sum / v.count >= 7
  ).length;

  // Symptom counts -> top 5.
  const symptomCounts = new Map<string, number>();
  for (const s of symptoms30) {
    symptomCounts.set(s.symptom, (symptomCounts.get(s.symptom) ?? 0) + 1);
  }
  const topSymptoms = [...symptomCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([symptom]) => symptom);

  // Trend over the 7 most recent logs (reuse the care-insight trend helper).
  // logs30 is newest-first, so the head of the array is the recent data.
  const trendLogs = logs30.slice(0, 7).map((l) => ({ level: l.painLevel }));
  const trend = trendLogs.length >= 2 ? getPainTrend(trendLogs) : null;

  // Streak: consecutive distinct logged days ending today or yesterday.
  const distinctDays = [...dayAccum.keys()].sort().reverse();
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
      const prev = toDateKey(new Date(new Date(anchor + "T00:00:00").getTime() - DAY_MS));
      if (distinctDays.includes(prev)) anchor = prev;
      else anchor = null;
    }
  }

  const lastLog = logs30[0]; // newest first
  const snapshot = healthSnapshotSchema.parse({
    currentPain: lastLog?.painLevel ?? null,
    avgPain7d: logs7.length ? mean(logs7.map((l) => l.painLevel)) : null,
    avgPain30d: logs30.length ? mean(logs30.map((l) => l.painLevel)) : null,
    flareDays30d,
    logCount30d: logs30.length,
    topSymptoms,
    streakDays,
    mood: lastLog?.moodTag ?? null,
    lastLogAt: lastLog ? lastLog.loggedAt.toISOString() : null,
    trend,
  });

  return snapshot;
}

/**
 * Detected patterns used by narration / doctor-question prompts.
 * Reuses the pure insight engine so the AI never argues with the stats.
 */
export async function getInsightSummaries(
  userId: string,
  days = 30
): Promise<Array<{ title: string; message: string; severity: string }>> {
  const since = new Date(Date.now() - days * DAY_MS);
  const [logs, symptomLogs] = await Promise.all([
    prisma.painLog.findMany({
      where: { userId, loggedAt: { gte: since } },
      orderBy: { loggedAt: "asc" },
      select: { id: true, painLevel: true, moodTag: true, notes: true, loggedAt: true },
    }),
    prisma.symptomLog.findMany({
      where: { userId, date: { gte: toDateKey(since) } },
      select: { symptom: true, date: true },
    }),
  ]);

  return analyzePainPatterns(logs, symptomLogs, days).map((i) => ({
    title: i.title,
    message: i.message,
    severity: i.severity,
  }));
}
