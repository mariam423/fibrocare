/**
 * periodicReport.ts — deterministic aggregation of pain/symptom logs plus
 * clinical markers (ACR screen, flare triggers, lab results, medication
 * adherence) into a compact consultation-ready summary. Pure functions,
 * unit-tested; the UI renders the summary and (optionally) exports it as a
 * PDF via `src/lib/pdfGenerator.ts` conventions.
 */

import type { AcrClinicalSummary } from "./acr";
import type { FlareTriggerEntry, LabResult, MedicationDose } from "./trackers";

export type ReportPeriod = "week" | "month";

export interface PeriodReportInput {
  logs: Array<{
    loggedAt: Date | string;
    painLevel: number;
    fatigue?: number;
    mood: string;
  }>;
  triggers: FlareTriggerEntry[];
  labs: LabResult[];
  meds: MedicationDose[];
  acr?: AcrClinicalSummary | null;
}

export interface PeriodStats {
  days: number;
  avgPain: number | null;
  peakPain: number | null;
  flareDays: number;
  loggingAdherence: number; // 0–100
  triggerCounts: Array<{ factor: string; count: number }>;
  triggerTop: { factor: string; avgSeverity: number; count: number } | null;
  labHighlights: Array<{ testId: string; date: string; value: number; verdict: "low" | "inRange" | "high" }>;
  dueMedications: string[];
  acrMet: boolean | null;
}

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

/** Start date (inclusive) for a weekly/monthly period ending today. */
export function periodStartToday(period: ReportPeriod, now = new Date()): Date {
  const end = new Date(now);
  end.setHours(0, 0, 0, 0);
  const start = new Date(end);
  if (period === "week") {
    start.setDate(end.getDate() - 6);
  } else {
    start.setMonth(end.getMonth() - 1);
    // Keep day aligned so a 31-day month maps to ~30 days.
    if (start.getDate() !== end.getDate()) {
      start.setHours(0, 0, 0, 0);
      start.setDate(Math.min(end.getDate(), new Date(end.getFullYear(), end.getMonth(), 0).getDate()));
    }
  }
  return start;
}

/** Aggregate a log slice into consultation-grade statistics. */
export function buildPeriodStats(input: PeriodReportInput, period: ReportPeriod, now = new Date()): PeriodStats {
  const start = periodStartToday(period, now).getTime();

  const inWindow = input.logs.filter((log) => {
    const at = new Date(log.loggedAt).getTime();
    return at >= start && at <= now.getTime();
  });

  const daysLogged = new Set(inWindow.map((l) => dayKey(new Date(l.loggedAt)))).size;
  const windowDays =
    period === "week" ? 7 : Math.max(28, Math.round((now.getTime() - start) / 86_400_000) + 1);

  const painLevels = inWindow.map((l) => l.painLevel);
  const avgPain =
    painLevels.length === 0
      ? null
      : Math.round((painLevels.reduce((s, v) => s + v, 0) / painLevels.length) * 10) / 10;
  const peakPain = painLevels.length === 0 ? null : Math.max(...painLevels);

  const flareDays = painLevels.filter((p) => p >= 7).length;
  const loggingAdherence = Math.round((daysLogged / windowDays) * 100);

  const inWindowTriggers = input.triggers.filter(
    (t) => t.date >= dayKey(new Date(start)) && t.date <= dayKey(now)
  );

  const factorTotals = new Map<string, { count: number; sum: number }>();
  for (const t of inWindowTriggers) {
    for (const f of t.factors) {
      const bucket = factorTotals.get(f) ?? { count: 0, sum: 0 };
      bucket.count += 1;
      bucket.sum += t.severity;
      factorTotals.set(f, bucket);
    }
  }

  const triggerCounts = [...factorTotals.entries()]
    .map(([factor, bucket]) => ({ factor, count: bucket.count }))
    .sort((a, b) => b.count - a.count);

  let triggerTop: PeriodStats["triggerTop"] = null;
  if (factorTotals.size > 0) {
    let best: { factor: string; avgSeverity: number; count: number } | null = null;
    for (const [factor, bucket] of factorTotals) {
      const candidate = {
        factor,
        avgSeverity: Math.round((bucket.sum / bucket.count) * 10) / 10,
        count: bucket.count,
      };
      if (!best || candidate.avgSeverity > best.avgSeverity) best = candidate;
    }
    triggerTop = best;
  }

  // Lab highlights: carry each test's most recent in-window value forward.
  const labHighlights: PeriodStats["labHighlights"] = input.labs
    .filter((l) => l.date >= dayKey(new Date(start)) && l.date <= dayKey(now))
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
    .map((l) => {
      const field = fieldRef(l.testId);
      let verdict: "low" | "inRange" | "high" = "inRange";
      if (field) {
        if (l.value < field.low) verdict = "low";
        else if (l.value > field.high) verdict = "high";
      }
      return { testId: l.testId, date: l.date, value: l.value, verdict };
    });

  const dueMedications = input.meds.filter((m) => m.frequency !== "asNeeded").map((m) => m.name);

  return {
    days: windowDays,
    avgPain,
    peakPain,
    flareDays,
    loggingAdherence,
    triggerCounts,
    triggerTop,
    labHighlights,
    dueMedications,
    acrMet: input.acr ? input.acr.criteriaMet : null,
  };
}

/* Informational reference ranges mirrored from trackers.ts (kept local so
   the report stays self-contained and testable without unit-name mapping). */
const REF_RANGES: Readonly<Record<string, { low: number; high: number }>> = {
  tsh: { low: 0.4, high: 4.0 },
  ft4: { low: 12, high: 22 },
  vitaminD: { low: 30, high: 50 },
  esr: { low: 0, high: 20 },
  crp: { low: 0, high: 3.0 },
};

function fieldRef(testId: string): { low: number; high: number } | null {
  return REF_RANGES[testId] ?? null;
}