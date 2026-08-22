/**
 * Non-Restorative Sleep Analyzer + Fibro Fog Risk Index.
 *
 * Deterministic heuristics grounded in published observations about
 * fibromyalgia sleep: alpha-wave intrusion into deep (delta) sleep, reduced
 * N3 percentage, and low HRV correlating with unrefreshing sleep and
 * next-day cognitive fog. These are screening signals for self-tracking —
 * explicitly not a sleep study.
 */

import { sleepAnalysisSchema, sleepNightSchema } from "./types";
import type { SleepNight } from "@/types/extended-health";

function pearson(xs: number[], ys: number[]): number | null {
  const n = Math.min(xs.length, ys.length);
  if (n < 5) return null;
  let sx = 0;
  let sy = 0;
  for (let i = 0; i < n; i++) {
    sx += xs[i];
    sy += ys[i];
  }
  const mx = sx / n;
  const my = sy / n;
  let num = 0;
  let dx = 0;
  let dy = 0;
  for (let i = 0; i < n; i++) {
    const a = xs[i] - mx;
    const b = ys[i] - my;
    num += a * b;
    dx += a * a;
    dy += b * b;
  }
  if (dx === 0 || dy === 0) return null;
  return Math.max(-1, Math.min(1, num / Math.sqrt(dx * dy)));
}

function deepSleepStatus(pct: number | null): "low" | "normal" | "high" | "unknown" {
  if (pct === null) return "unknown";
  if (pct < 10) return "low";
  if (pct > 25) return "high";
  return "normal";
}

/**
 * Alpha–delta intrusion heuristic: fibromyalgia sleep classically shows
 * enough deep sleep *time* that feels unrefreshing, with many brief
 * awakenings. Signal = low deep % OR (normal deep % + high awakenings +
 * poor self-reported rest despite adequate hours).
 */
function alphaDelta(
  night: SleepNight
): "likely" | "possible" | "unlikely" | "insufficient-data" {
  const hasDeep = night.deepSleepPct !== null;
  if (!hasDeep) {
    // Without wearable deep-sleep data we can only screen on perception.
    if (night.selfReportedRest <= 2 && night.hoursSlept >= 7 && night.awakenings >= 3) {
      return "possible";
    }
    return "insufficient-data";
  }
  const deep = night.deepSleepPct as number;
  if (deep < 10 && night.awakenings >= 3) return "likely";
  if (deep < 13 && night.awakenings >= 2) return "possible";
  if (deep >= 13 && night.selfReportedRest <= 2 && night.awakenings >= 3) return "possible";
  return "unlikely";
}

/**
 * Fibro Fog Risk Index (0–10) from last night + optional HRV context.
 * Weighted additive model — deterministic and explainable:
 *   short sleep, low deep %, many awakenings, unrefreshing rest, low HRV.
 */
export function fibroFogRisk(
  night: SleepNight,
  hrvBaseline: number | null
): { score: number; level: "low" | "moderate" | "high"; guidance: string } {
  let score = 0;

  if (night.hoursSlept < 6) score += 2.5;
  else if (night.hoursSlept < 7) score += 1;

  if (night.deepSleepPct !== null) {
    if (night.deepSleepPct < 8) score += 2.5;
    else if (night.deepSleepPct < 13) score += 1.5;
  } else if (night.selfReportedRest <= 2) {
    score += 1.5; // no wearable data, but rest felt poor
  }

  if (night.awakenings >= 5) score += 2;
  else if (night.awakenings >= 3) score += 1;

  if (night.selfReportedRest === 1) score += 2;
  else if (night.selfReportedRest === 2) score += 1;

  if (night.hrvMs !== null && hrvBaseline !== null && night.hrvMs < hrvBaseline * 0.75) {
    score += 1; // HRV well under the personal baseline
  } else if (hrvBaseline !== null && night.hrvMs !== null && night.hrvMs < hrvBaseline * 0.9) {
    score += 0.5;
  }

  const rounded = Math.max(0, Math.min(10, Math.round(score * 2) / 2));

  const level = rounded >= 6 ? "high" : rounded >= 3 ? "moderate" : "low";
  const guidance =
    level === "high"
      ? "High fog risk today — treat thinking like a spoon: single-task, use notes and reminders, postpone decisions that can wait, and protect a 20-minute rest before you crash."
      : level === "moderate"
        ? "Some fog risk — front-load anything requiring focus to your best hours, keep lists short, and take a real break midday."
        : "Fog risk looks low — a good day for tasks that need focus; still pace yourself and protect tonight's sleep.";

  return { score: rounded, level, guidance };
}

/** Full night analysis (also correlates deep sleep vs HRV across a series). */
export function analyzeNight(
  night: SleepNight,
  series: SleepNight[] = []
) {
  // Re-validate through Zod so a hand-built object can't smuggle bad fields
  // past the narrower literal types (e.g. selfReportedRest).
  const parsed = sleepNightSchema.parse(night) as SleepNight;

  const pairs = series.filter(
    (n) => n.deepSleepPct !== null && n.hrvMs !== null
  );
  const deepHrv =
    pairs.length >= 5
      ? pearson(
          pairs.map((n) => n.deepSleepPct as number),
          pairs.map((n) => n.hrvMs as number)
        )
      : null;

  const hrvValues = series
    .map((n) => n.hrvMs)
    .filter((v): v is number => v !== null);
  const hrvBaseline = hrvValues.length >= 5
    ? hrvValues.reduce((s, v) => s + v, 0) / hrvValues.length
    : null;

  const fog = fibroFogRisk(parsed, hrvBaseline);

  return sleepAnalysisSchema.parse({
    date: parsed.date,
    deepSleepStatus: deepSleepStatus(parsed.deepSleepPct),
    alphaDeltaPattern: alphaDelta(parsed),
    deepHrvCorrelation: deepHrv === null ? null : Math.round(deepHrv * 1000) / 1000,
    fogRisk: fog,
  });
}
