import { prisma } from "@/lib/prisma";

export interface Insight {
  id: string;
  title: string;
  message: string;
  type: "correlation" | "pattern" | "tip";
  severity: "info" | "warning" | "critical";
  /**
   * Raw values used to build `title`/`message`, so clients can localize
   * the same insight into other languages. Absent for engines that emit
   * language-neutral content.
   */
  params?: Record<string, string | number>;
}

/** Minimal shape of a pain log the analysis needs (subset of the Prisma PainLog). */
export interface PainPatternLog {
  id: string;
  painLevel: number;
  moodTag: string;
  notes: string | null;
  loggedAt: Date;
}

/** Minimal shape of a symptom log the analysis needs (subset of the Prisma SymptomLog). */
export interface SymptomPatternLog {
  symptom: string;
  date: string;
}

const FLARE_THRESHOLD = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

function toDateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

const WEEKDAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

/**
 * Pure, data-driven health pattern analysis.
 * Every insight is derived from the actual logs — no hard-coded tips.
 * Returns an empty array until at least 5 logs exist in the period.
 *
 * Extracted from the Prisma-coupled `analyzeHealthPatterns` so the analysis
 * can be unit-tested in isolation (TDD).
 */
export function analyzePainPatterns(
  logs: PainPatternLog[],
  symptomLogs: SymptomPatternLog[],
  days = 30
): Insight[] {
  const insights: Insight[] = [];
  if (logs.length < 5) return insights;

  // --- Aggregate pain per day ---
  const dayAccum = new Map<string, { sum: number; count: number }>();
  for (const log of logs) {
    const key = toDateKey(new Date(log.loggedAt));
    const entry = dayAccum.get(key) ?? { sum: 0, count: 0 };
    entry.sum += log.painLevel;
    entry.count += 1;
    dayAccum.set(key, entry);
  }
  const dayPain = new Map<string, number>();
  dayAccum.forEach((v, k) => dayPain.set(k, v.sum / v.count));

  const avgPain = logs.reduce((s, l) => s + l.painLevel, 0) / logs.length;
  const flareDays = [...dayPain.values()].filter((p) => p >= FLARE_THRESHOLD).length;

  // --- 1. Average pain level ---
  if (avgPain > 6) {
    insights.push({
      id: "high-pain-avg",
      title: "Elevated Pain Levels",
      message: `Your average pain over the last ${days} days is ${avgPain.toFixed(
        1
      )}/10, in the high range. Consider discussing your current plan with your care team.`,
      type: "pattern",
      severity: "warning",
      params: { avg: Number(avgPain.toFixed(1)), days },
    });
  } else if (avgPain <= 3) {
    insights.push({
      id: "low-pain-avg",
      title: "Pain Is Well Managed",
      message: `Your average pain is ${avgPain.toFixed(
        1
      )}/10. Whatever you're doing is working. Keep it up.`,
      type: "pattern",
      severity: "info",
      params: { avg: Number(avgPain.toFixed(1)) },
    });
  }

  // --- 2. Flare-up frequency ---
  if (flareDays >= 7) {
    insights.push({
      id: "freq-flares",
      title: "Frequent Flare-ups",
      message: `You logged ${flareDays} flare-level days (pain ≥ 7) in the last ${days} days. Frequent flares may signal a need for a treatment review.`,
      type: "correlation",
      severity: "critical",
      params: { count: flareDays, days },
    });
  } else if (flareDays >= 3) {
    insights.push({
      id: "flares-rising",
      title: "Recurring Flare Days",
      message: `You've had ${flareDays} flare-level days recently. Patterns of flares often follow sleep, stress, or activity changes.`,
      type: "pattern",
      severity: "warning",
      params: { count: flareDays },
    });
  }

  // --- 3. Trend: first half vs second half of the period ---
  if (logs.length >= 8) {
    const mid = Math.floor(logs.length / 2);
    const firstAvg =
      logs.slice(0, mid).reduce((s, l) => s + l.painLevel, 0) / mid;
    const secondAvg =
      logs.slice(mid).reduce((s, l) => s + l.painLevel, 0) / (logs.length - mid);
    const delta = secondAvg - firstAvg;
    if (delta >= 0.7) {
      insights.push({
        id: "trend-worsening",
        title: "Pain Trending Upward",
        message: `Your pain has risen by ${delta.toFixed(
          1
        )} points between the first and second half of this period.`,
        type: "pattern",
        severity: "warning",
        params: { delta: Number(delta.toFixed(1)) },
      });
    } else if (delta <= -0.7) {
      insights.push({
        id: "trend-improving",
        title: "Pain Trending Downward",
        message: `Your pain has eased by ${Math.abs(delta).toFixed(
          1
        )} points across this period. Keep following what helps.`,
        type: "pattern",
        severity: "info",
        params: { delta: Number(Math.abs(delta).toFixed(1)) },
      });
    }
  }

  // --- 4. Day-of-week pattern (with sample guard) ---
  const weekdayAccum = new Map<number, { sum: number; count: number }>();
  for (const log of logs) {
    const dow = new Date(log.loggedAt).getDay();
    const entry = weekdayAccum.get(dow) ?? { sum: 0, count: 0 };
    entry.sum += log.painLevel;
    entry.count += 1;
    weekdayAccum.set(dow, entry);
  }
  let peakDow: { dow: number; day: string; avg: number; count: number } | null =
    null;
  weekdayAccum.forEach((entry, dow) => {
    if (entry.count >= 3) {
      const avg = entry.sum / entry.count;
      if (!peakDow || avg > peakDow.avg) {
        peakDow = { dow, day: WEEKDAY_NAMES[dow], avg, count: entry.count };
      }
    }
  });
  const peak = peakDow as { dow: number; day: string; avg: number; count: number } | null;
  if (peak && peak.avg >= 6 && peak.avg > avgPain + 0.8) {
    insights.push({
      id: "weekday-pattern",
      title: "Weekday Pattern",
      message: `${peak.day} tends to be your hardest day (avg ${peak.avg.toFixed(
        1
      )}/10 across ${peak.count} logs). Planning lighter on that day may help.`,
      type: "pattern",
      severity: "info",
      // `dayOfWeek` (0–6) lets clients format the day in their own locale.
      params: {
        day: peak.day,
        dayOfWeek: peak.dow,
        avg: Number(peak.avg.toFixed(1)),
        count: peak.count,
      },
    });
  }

  // --- 5. Symptom ↔ pain correlation (real, from symptom logs) ---
  const symptomsByDay = new Map<string, Set<string>>();
  for (const s of symptomLogs) {
    const set = symptomsByDay.get(s.date) ?? new Set<string>();
    set.add(s.symptom);
    symptomsByDay.set(s.date, set);
  }

  const symptomCounts = new Map<string, number>();
  const symptomPain = new Map<string, { presentSum: number; presentCount: number }>();
  const symptomAbsent = new Map<string, { absentSum: number; absentCount: number }>();

  dayPain.forEach((pain, date) => {
    const present = symptomsByDay.get(date);
    const knownSymptoms = symptomLogs
      .map((s) => s.symptom)
      .filter((v, i, a) => a.indexOf(v) === i);

    for (const sym of knownSymptoms) {
      if (present?.has(sym)) {
        symptomCounts.set(sym, (symptomCounts.get(sym) ?? 0) + 1);
        const p = symptomPain.get(sym) ?? { presentSum: 0, presentCount: 0 };
        p.presentSum += pain;
        p.presentCount += 1;
        symptomPain.set(sym, p);
      } else {
        const a = symptomAbsent.get(sym) ?? { absentSum: 0, absentCount: 0 };
        a.absentSum += pain;
        a.absentCount += 1;
        symptomAbsent.set(sym, a);
      }
    }
  });

  let strongestCorrelation: { symptom: string; delta: number; count: number } | null =
    null;
  symptomPain.forEach((p, symptom) => {
    const absent = symptomAbsent.get(symptom);
    if (!absent || p.presentCount < 3 || absent.absentCount < 3) return;
    const presentAvg = p.presentSum / p.presentCount;
    const absentAvg = absent.absentSum / absent.absentCount;
    const delta = presentAvg - absentAvg;
    if (Math.abs(delta) >= 1.5) {
      if (
        !strongestCorrelation ||
        Math.abs(delta) > Math.abs(strongestCorrelation.delta)
      ) {
        strongestCorrelation = { symptom, delta, count: p.presentCount };
      }
    }
  });

  const correlation =
    strongestCorrelation as { symptom: string; delta: number; count: number } | null;
  if (correlation) {
    const { symptom, delta, count } = correlation;
    insights.push({
      id: "symptom-correlation",
      title: delta > 0 ? "Symptom-Pain Link Detected" : "Symptom Seen on Easier Days",
      message:
        delta > 0
          ? `Days with "${symptom}" average ${delta.toFixed(
              1
            )} points higher pain (${count} occurrences). Worth tracking closely.`
          : `"${symptom}" appears mostly on lighter days (${delta.toFixed(
              1
            )} lower pain). It may be more of an outcome than a trigger.`,
      type: "correlation",
      severity: delta > 0 ? "warning" : "info",
      params: {
        symptom,
        delta: Number(delta.toFixed(1)),
        count,
      },
    });
  }

  const severityRank = { critical: 0, warning: 1, info: 2 } as const;
  insights.sort((a, b) => severityRank[a.severity] - severityRank[b.severity]);
  return insights;
}

/**
 * Data-driven health pattern analysis for a user's logs in the last `days`.
 * Fetches the data, then delegates to the pure `analyzePainPatterns`.
 */
export async function analyzeHealthPatterns(
  userId: string,
  days = 30
): Promise<Insight[]> {
  const since = new Date(Date.now() - days * DAY_MS);

  const [logs, symptomLogs] = await Promise.all([
    prisma.painLog.findMany({
      where: { userId, loggedAt: { gte: since } },
      orderBy: { loggedAt: "asc" },
    }),
    prisma.symptomLog.findMany({
      where: { userId, date: { gte: toDateKey(since) } },
    }),
  ]);

  return analyzePainPatterns(logs, symptomLogs, days);
}

/** Most frequently logged symptoms in the last `days`, descending. */
export async function getTopSymptoms(userId: string, days = 30): Promise<string[]> {
  const since = toDateKey(new Date(Date.now() - days * DAY_MS));
  const symptomLogs = await prisma.symptomLog.findMany({
    where: { userId, date: { gte: since } },
  });
  const counts = new Map<string, number>();
  for (const s of symptomLogs) {
    counts.set(s.symptom, (counts.get(s.symptom) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([symptom]) => symptom);
}
