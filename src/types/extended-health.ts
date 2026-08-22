/**
 * Shared domain types for the advanced health modules:
 * medications, somatic movement, sleep architecture / HRV, and community
 * insights. Zod schemas live beside each engine in `src/lib/<module>/types.ts`;
 * these are the derived TypeScript types shared across engines and UI.
 */

import type { TranslationKey } from "@/lib/translations";

/* ---------------- Medications ---------------- */

export type MedicationTiming = "morning" | "evening" | "bedtime";
export type MedicationKind = "medication" | "supplement";
export type InteractionSeverity = "critical" | "warning" | "caution";

export interface MedicationEntry {
  id: string;
  /** Generic name, e.g. "pregabalin" — matched against the interaction table. */
  name: string;
  dose: string;
  timing: MedicationTiming;
  kind: MedicationKind;
}

export interface MedicationAlert {
  pair: [string, string];
  severity: InteractionSeverity;
  effect: string;
  recommendation: string;
}

export interface AdherencePoint {
  date: string;
  takenOnSchedule: boolean;
  morningPain: number | null;
  sleepQuality: number | null;
}

/* ---------------- Somatic movement ---------------- */

export type ExerciseIntensity = "very-gentle" | "gentle" | "moderate";

export interface SomaticExercise {
  id: string;
  titleKey: TranslationKey;
  descriptionKey: TranslationKey;
  /** 0–10 max pain this exercise is still appropriate for. */
  maxPain: number;
  spoonCost: number;
  minutes: number;
  intensity: ExerciseIntensity;
  steps: number;
  /**
   * Optional curated guide link (direct video, YouTube/Vimeo, or a vetted
   * search page that opens externally). Absent → the card keeps rendering
   * step cards only; present → a "Guided Video" tab appears.
   */
  videoUrl?: string;
}

export type BreathPhase = "inhale" | "hold" | "exhale";

/* ---------------- Sleep & HRV ---------------- */

export interface SleepNight {
  date: string;
  hoursSlept: number;
  /** Deep (N3) sleep percentage 0–100, from wearable or self-report. */
  deepSleepPct: number | null;
  awakenings: number;
  hrvMs: number | null;
  restingHr: number | null;
  steps: number | null;
  selfReportedRest: 1 | 2 | 3 | 4 | 5;
}

/* ---------------- Community ---------------- */

export interface RegionalTrend {
  region: string;
  /** Share of reporting users with increased flare sensitivity, 0–100. */
  flareSensitivityPct: number;
  dominantTrigger: TranslationKey;
  barometricTrend: "falling" | "steady" | "rising";
  reportingUsers: number;
}

export interface CopingStrategyStat {
  rank: number;
  strategyKey: TranslationKey;
  /** Share of community votes reporting it helps, 0–100. */
  successPct: number;
  votes: number;
}
