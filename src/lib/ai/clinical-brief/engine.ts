/**
 * Deterministic Clinical Executive Brief engine.
 *
 * Pure analytics over 30-day log data → clinically phrased, schema-validated
 * brief. No LLM required; no number invented.
 */

import { clinicalBriefSchema, type ClinicalBrief } from "./types";

export interface BriefDailyPoint {
  /** `YYYY-MM-DD`. */
  date: string;
  /** Average pain that day. */
  pain: number;
  mood?: string | null;
}

export interface BriefInput {
  periodDays: number;
  /** Daily averages, oldest → newest. */
  daily: BriefDailyPoint[];
  /** Distinct symptoms reported in the window, most frequent first. */
  topSymptoms: string[];
  /** Patient-reported medication names (from their own notes). */
  medications: string[];
  /** Weather triggers detected by the correlation engine, phrased with evidence. */
  weatherTriggers: Array<{ factor: string; evidence: string }>;
  /** Consecutive-day logging streak ending today/yesterday. */
  streakDays: number;
  /** Notes flagged by the insight engine (already clinically screened). */
  redFlagNotes?: string[];
}

const FLARE_THRESHOLD = 7;

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/** Compare the last quarter of the series to the previous quarter. */
function velocityOf(daily: BriefDailyPoint[]): {
  velocity: ClinicalBrief["painProfile"]["velocity"];
  delta: number | null;
} {
  if (daily.length < 8) return { velocity: "insufficient-data", delta: null };
  const q = Math.max(3, Math.floor(daily.length / 4));
  const recent = daily.slice(-q);
  const prior = daily.slice(-2 * q, -q);
  const avgRecent = round1(recent.reduce((s, d) => s + d.pain, 0) / recent.length);
  const avgPrior = round1(prior.reduce((s, d) => s + d.pain, 0) / prior.length);
  const delta = round1(avgRecent - avgPrior);
  if (Math.abs(delta) < 0.5) return { velocity: "stable", delta };
  return { velocity: delta > 0 ? "worsening" : "improving", delta };
}

/** Build the full 1-page brief. */
export function buildClinicalBrief(input: BriefInput): ClinicalBrief {
  const { daily } = input;
  const loggedDays = daily.length;

  const flareDays = daily.filter((d) => d.pain >= FLARE_THRESHOLD);
  const perMonth = round1((flareDays.length / Math.max(1, input.periodDays)) * 30);

  // Trend: flare days in the recent half vs the earlier half.
  let flareTrend: ClinicalBrief["flareFrequency"]["trend"] = "insufficient-data";
  if (loggedDays >= 8) {
    const half = Math.floor(loggedDays / 2);
    const earlier = daily.slice(0, half).filter((d) => d.pain >= FLARE_THRESHOLD).length;
    const recent = daily.slice(half).filter((d) => d.pain >= FLARE_THRESHOLD).length;
    flareTrend =
      recent > earlier ? "rising" : recent < earlier ? "falling" : "stable";
  }

  const avg = loggedDays ? round1(daily.reduce((s, d) => s + d.pain, 0) / loggedDays) : null;
  const last7 = daily.slice(-7);
  const avg7d = last7.length ? round1(last7.reduce((s, d) => s + d.pain, 0) / last7.length) : null;
  const peak = loggedDays ? Math.max(...daily.map((d) => d.pain)) : null;
  const { velocity, delta } = velocityOf(daily);

  const moodCounts = new Map<string, number>();
  for (const d of daily) {
    if (d.mood) moodCounts.set(d.mood, (moodCounts.get(d.mood) ?? 0) + 1);
  }
  const dominantMood = [...moodCounts.entries()].sort((a, b) => b[1] - a[1])[0];
  const moodPattern = dominantMood
    ? `Predominant logged mood: "${dominantMood[0]}" (${dominantMood[1]}/${loggedDays} days).`
    : "No mood tags recorded in this period.";

  const adherencePct = Math.round((loggedDays / input.periodDays) * 100);
  const adherenceClamped = Math.min(100, adherencePct);

  const triggers = [...input.weatherTriggers].slice(0, 5);

  const velocityPhrase =
    velocity === "insufficient-data"
      ? "insufficient data to characterize"
      : `${velocity}${delta !== null ? ` (Δ ${delta > 0 ? "+" : ""}${delta} in 7-day mean)` : ""}`;

  const headline =
    loggedDays === 0
      ? "No logged data in this period — brief cannot characterize current status."
      : `30-day mean pain ${avg}/10 with ${flareDays.length} flare day(s) (≥7/10); ${velocityPhrase}.`;

  const discussionPoints: string[] = [];
  if (flareTrend === "rising" || velocity === "worsening") {
    discussionPoints.push(
      "Symptom trajectory is worsening — is the current management plan still appropriate?"
    );
  }
  if (avg !== null && avg >= 6) {
    discussionPoints.push(
      `Mean pain ${avg}/10 remains clinically significant — options for better control?`
    );
  }
  if (input.medications.length > 0) {
    discussionPoints.push(
      `Patient reports taking: ${input.medications.join(", ")} — confirm regimen, adherence, and tolerability.`
    );
  } else {
    discussionPoints.push(
      "No medications mentioned in logs — is the patient on any current pharmacotherapy?"
    );
  }
  if (input.topSymptoms.includes("insomnia") || input.topSymptoms.includes("unrefreshing sleep")) {
    discussionPoints.push(
      "Sleep disturbance is among the most-reported symptoms — evaluate sleep management."
    );
  }
  if (triggers.length > 0) {
    discussionPoints.push(
      `Weather correlation detected (${triggers.map((t) => t.factor).join(", ")}) — consider discussing environmental trigger management.`
    );
  }
  if (discussionPoints.length === 0) {
    discussionPoints.push(
      "Continue current plan; reinforce pacing, graded exercise, and sleep hygiene."
    );
  }

  const redFlags = [...(input.redFlagNotes ?? [])].slice(0, 4);

  return clinicalBriefSchema.parse({
    generatedAt: new Date().toISOString(),
    periodDays: input.periodDays,
    headline,
    flareFrequency: {
      flareDays: flareDays.length,
      perMonth,
      trend: flareTrend,
    },
    painProfile: {
      average: avg,
      average7d: avg7d,
      peak,
      velocity,
      velocityDelta: delta,
    },
    symptomProfile: {
      mostReported: input.topSymptoms.slice(0, 6),
      distinctCount: input.topSymptoms.length,
    },
    topTriggers: triggers,
    functionalCapacity: {
      loggingStreakDays: input.streakDays,
      loggingAdherencePct: adherenceClamped,
      moodPattern,
    },
    patientReportedMedications: input.medications.slice(0, 8),
    redFlags,
    suggestedDiscussionPoints: discussionPoints.slice(0, 5),
    dataCaveat:
      `Generated from ${loggedDays}/${input.periodDays} patient-logged days (${adherenceClamped}% adherence). ` +
      "self-reported data; not a clinical assessment or diagnosis.",
  });
}
