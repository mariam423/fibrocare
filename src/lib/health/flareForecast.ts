/**
 * Predictive flare forecast for the dashboard.
 *
 * Medical rationale: for many people with fibromyalgia, symptom severity
 * rises in the late luteal phase — the days immediately before menstruation
 * starts. This module turns the tracked cycle history into a forward-looking
 * risk view (unlike the insight engine, which only explains what already
 * happened) and pairs the forecast with gentle, proactive advice.
 *
 * Pure functions only, so the model is unit-testable (same pattern as
 * `cycleSummary` and `careInsightEngine`).
 */

export type ForecastLevel = "high" | "moderate" | "low";

export interface FlareForecast {
  /** Overall risk that a flare hits in the upcoming pre-period window. */
  level: ForecastLevel;
  /** Inclusive day range (within the current cycle) of elevated risk. */
  window: { start: number; end: number };
  /** Days from today until the predicted flare-risk window opens. */
  daysUntilWindow: number;
  /** Days from today until the next predicted period start. */
  daysUntilPeriod: number;
  /** Human-readable driver summary (untranslated; keys localize on the client). */
  drivers: Array<{ id: string; strength: "strong" | "supporting" }>;
  /** Concrete proactive actions, most helpful first. */
  advice: AdviceKey[];
}

export type AdviceKey =
  | "pacing"
  | "heat"
  | "sleep"
  | "hydrate"
  | "gentleMovement"
  | "trackDaily";

const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_CYCLE_LENGTH = 28;
const MIN_CYCLE_LENGTH = 20;
const MAX_CYCLE_LENGTH = 45;
/** Luteal-phase length used when history is insufficient to estimate it. */
const DEFAULT_LUTEAL_LENGTH = 5;
/** How many days before the period the elevated-risk window opens. */
const PRE_PERIOD_RISK_DAYS = 5;

interface CycleLike {
  phase: "MENSTRUAL" | "FOLLICULAR" | "OVULATORY" | "LUTEAL";
  startDate: Date;
  endDate: Date | null;
}

export interface ForecastInput {
  /** User's cycles, most recent first (desc by startDate). */
  cycles: CycleLike[];
  /** Symptom logs in the analysis window (shape mirrors SymptomPatternLog). */
  symptomLogs: Array<{
    symptom: string;
    date: string;
    severity: number;
    category: "PHYSICAL" | "COGNITIVE" | "MOOD";
    area?: "PELVIC" | "LOWER_BACK" | "WIDESPREAD" | "JOINTS" | "OTHER";
  }>;
  /** Recent average pain (0–10) — raises the floor of the forecast. */
  recentAvgPain?: number;
  now?: Date;
}

/**
 * Predict the pre-period flare risk window.
 * Returns `null` when there is no cycle history to forecast from —
 * the UI should show the "log your cycle" guidance instead.
 */
export function buildFlareForecast(input: ForecastInput): FlareForecast | null {
  const latest = input.cycles[0];
  if (!latest) return null;

  const now = input.now ?? new Date();

  // --- Estimate the cycle length from the previous gap (clamped). ---
  let cycleLength = DEFAULT_CYCLE_LENGTH;
  const previous = input.cycles[1];
  if (previous) {
    const gap = Math.round(
      (latest.startDate.getTime() - previous.startDate.getTime()) / DAY_MS
    );
    cycleLength = Math.min(MAX_CYCLE_LENGTH, Math.max(MIN_CYCLE_LENGTH, gap));
  }

  // --- Position within the current cycle. ---
  const dayOfCycle = Math.floor(
    (now.getTime() - latest.startDate.getTime()) / DAY_MS
  ) + 1;
  // --- Predict the next period start. ---
  // Projected at startDate + cycleLength. Once that day has passed without a
  // new cycle being logged (irregular cycle / unlogged period), the period is
  // treated as due now rather than pointing the forecast into the past.
  const overdue = dayOfCycle > cycleLength;
  const daysUntilPeriod = overdue
    ? 0
    : Math.max(
        0,
        Math.round(
          (latest.startDate.getTime() + cycleLength * DAY_MS - now.getTime()) /
            DAY_MS
        )
      );

  // --- Pre-period risk window: the N days before the period. ---
  const windowEnd = cycleLength;
  const windowStart = Math.max(1, windowEnd - PRE_PERIOD_RISK_DAYS + 1);
  const daysUntilWindow = Math.max(0, windowStart - dayOfCycle);

  // --- Risk scoring. ---
  const drivers: FlareForecast["drivers"] = [];

  // 1. Distance to the pre-period window (the dominant, cyclical driver).
  //    An overdue period (past cycleLength without a new log) counts as due.
  const inWindow = overdue || (dayOfCycle >= windowStart && dayOfCycle <= windowEnd);
  if (inWindow) {
    drivers.push({ id: "premenstrual-window", strength: "strong" });
  } else if (daysUntilWindow <= 3) {
    drivers.push({ id: "approaching-window", strength: "supporting" });
  }

  // 2. Phase signal: late luteal phase is the classic flare amplifier.
  if (latest.phase === "LUTEAL" && dayOfCycle >= cycleLength - PRE_PERIOD_RISK_DAYS) {
    drivers.push({ id: "luteal-phase", strength: "strong" });
  }

  // 3. Rising symptom pressure in the last week of logged symptoms.
  const nowKey = now.toISOString().split("T")[0];
  const weekAgo = new Date(now.getTime() - 7 * DAY_MS).toISOString().split("T")[0];
  const recentSymptoms = input.symptomLogs.filter((s) => {
    return s.date > weekAgo && s.date <= nowKey;
  });
  const recentAvg =
    recentSymptoms.length > 0
      ? recentSymptoms.reduce((sum, s) => sum + s.severity, 0) / recentSymptoms.length
      : 0;
  if (recentAvg >= 6.5) {
    drivers.push({ id: "elevated-symptoms", strength: "strong" });
  } else if (recentAvg >= 4.5) {
    drivers.push({ id: "elevated-symptoms", strength: "supporting" });
  }

  // 4. Baseline pain level.
  const baseline = input.recentAvgPain ?? 0;
  if (baseline >= 6.5) {
    drivers.push({ id: "high-baseline", strength: "strong" });
  } else if (baseline >= 4.5) {
    drivers.push({ id: "high-baseline", strength: "supporting" });
  }

  const strong = drivers.filter((d) => d.strength === "strong").length;
  const supporting = drivers.filter((d) => d.strength === "supporting").length;
  const score = strong * 2 + supporting;

  const level: ForecastLevel =
    strong >= 1 && score >= 3 ? "high" : score >= 1 ? "moderate" : "low";

  // --- Proactive advice: luteal/premenstrual care focus. ---
  const advice: AdviceKey[] = [];
  if (level !== "low") {
    advice.push("pacing"); // front-load rest before the window opens
    advice.push("heat"); // warmth is first-line for premenstrual flares
    advice.push("sleep"); // protect deep sleep — fog and pain amplify without it
    if (baseline >= 4 || recentAvg >= 4.5) advice.push("hydrate");
    if (level === "moderate" || level === "high") advice.push("gentleMovement");
  } else {
    advice.push("gentleMovement");
    advice.push("trackDaily");
  }

  return {
    level,
    window: { start: windowStart, end: windowEnd },
    daysUntilWindow,
    daysUntilPeriod,
    drivers,
    advice,
  };
}
