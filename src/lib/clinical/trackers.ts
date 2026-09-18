/**
 * trackers.ts — shared types, constants and pure helpers for the advanced
 * health tracking modules:
 *  - Medication & Supplement Tracker (doses, adherence, scheduling)
 *  - Flare Triggers Log (weather, stress, sleep, diet factors)
 *  - Lab Results / Biomarkers Tracker (Thyroid, Vitamin D, ESR, CRP) for
 *    ruling out overlapping inflammatory / endocrine conditions.
 *
 * Pure data + pure functions, unit-tested; the UI persists snapshots via
 * `useLocalStorage` and shares them through the existing profile report
 * conventions.
 */

/* --------------------------- Medications --------------------------- */

export interface MedicationDose {
  id: string;
  name: string;
  /** e.g. "25", "50" — display-only; no dosing advice is implied. */
  dose: string;
  unit: string;
  frequency: "once" | "twice" | "threeTimes" | "asNeeded";
  category: "medication" | "supplement";
  /** Schedule labels by frequency — one or more times of day. */
  times: string[];
}

export const COMMON_MEDICATIONS: readonly MedicationDose[] = [
  {
    id: "duloxetine",
    name: "Duloxetine",
    dose: "30",
    unit: "mg",
    frequency: "once",
    category: "medication",
    times: ["08:00"],
  },
  {
    id: "pregabalin",
    name: "Pregabalin",
    dose: "75",
    unit: "mg",
    frequency: "twice",
    category: "medication",
    times: ["08:00", "20:00"],
  },
  {
    id: "aml-tramadol",
    name: "Tramadol (per clinician)",
    dose: "50",
    unit: "mg",
    frequency: "asNeeded",
    category: "medication",
    times: [],
  },
  {
    id: "mg-citrate",
    name: "Magnesium Citrate",
    dose: "200",
    unit: "mg",
    frequency: "once",
    category: "supplement",
    times: ["21:00"],
  },
  {
    id: "vit-d3",
    name: "Vitamin D3",
    dose: "1000",
    unit: "IU",
    frequency: "once",
    category: "supplement",
    times: ["08:00"],
  },
  {
    id: "b12",
    name: "Vitamin B12",
    dose: "500",
    unit: "mcg",
    frequency: "once",
    category: "supplement",
    times: ["08:00"],
  },
  {
    id: "coq10",
    name: "Coenzyme Q10",
    dose: "100",
    unit: "mg",
    frequency: "once",
    category: "supplement",
    times: ["12:00"],
  },
];

/** Collapse a "HH:MM" time to a comparable "HH" hour key. */
export function hourKey(time: string): string {
  return time.slice(0, 2);
}

/**
 * Which medication/supplement ids should be taken at a given "HH:MM" time.
 * `asNeeded` items never auto-suggest.
 */
export function dueAt(
  meds: readonly MedicationDose[],
  time: string
): MedicationDose[] {
  const hour = hourKey(time);
  return meds.filter((m) => {
    if (m.frequency === "asNeeded") return false;
    return m.times.some((t) => hourKey(t) === hour);
  });
}

/* --------------------------- Flare triggers --------------------------- */

export interface FlareTriggerEntry {
  id: string;
  date: string; // YYYY-MM-DD
  /** 0–10 how strong today's flare feels (0 = none). */
  severity: number;
  factors: FlareFactorId[];
  note: string;
}

export type FlareFactorId =
  | "weatherPressure"
  | "cold"
  | "heat"
  | "stress"
  | "poorSleep"
  | "overexertion"
  | "dietary"
  | "sittingTooLong"
  | "hormonal"
  | "illness";

export interface FlareFactor {
  id: FlareFactorId;
  labelTKey: string;
  group: "weather" | "stress" | "sleep" | "diet" | "activity" | "other";
  emoji: string;
}

export const FLARE_FACTORS: readonly FlareFactor[] = [
  { id: "weatherPressure", labelTKey: "clinical.trigger.weatherPressure", group: "weather", emoji: "🌧" },
  { id: "cold", labelTKey: "clinical.trigger.cold", group: "weather", emoji: "❄️" },
  { id: "heat", labelTKey: "clinical.trigger.heat", group: "weather", emoji: "☀️" },
  { id: "stress", labelTKey: "clinical.trigger.stress", group: "stress", emoji: "😰" },
  { id: "poorSleep", labelTKey: "clinical.trigger.poorSleep", group: "sleep", emoji: "🌙" },
  { id: "overexertion", labelTKey: "clinical.trigger.overexertion", group: "activity", emoji: "🏃" },
  { id: "dietary", labelTKey: "clinical.trigger.dietary", group: "diet", emoji: "🍔" },
  { id: "sittingTooLong", labelTKey: "clinical.trigger.sittingTooLong", group: "activity", emoji: "🪑" },
  { id: "hormonal", labelTKey: "clinical.trigger.hormonal", group: "other", emoji: "🔄" },
  { id: "illness", labelTKey: "clinical.trigger.illness", group: "other", emoji: "🤒" },
];

export const TRIGGER_GROUPS = [
  "weather",
  "stress",
  "sleep",
  "diet",
  "activity",
  "other",
] as const;

export type TriggerGroup = (typeof TRIGGER_GROUPS)[number];

/** Count of entries that matched a given factor across a log. */
export function factorFrequency(
  entries: readonly FlareTriggerEntry[],
  factor: FlareFactorId
): number {
  return entries.filter((e) => e.factors.includes(factor)).length;
}

/** Average flare severity among entries that include the factor. */
export function factorAvgSeverity(
  entries: readonly FlareTriggerEntry[],
  factor: FlareFactorId
): number | null {
  const matched = entries.filter((e) => e.factors.includes(factor));
  if (matched.length === 0) return null;
  return Math.round((matched.reduce((s, e) => s + e.severity, 0) / matched.length) * 10) / 10;
}

/* --------------------------- Lab results / biomarkers --------------------------- */

export type LabTestId = "tsh" | "ft4" | "vitaminD" | "esr" | "crp";

export interface LabField {
  id: LabTestId;
  labelTKey: string;
  hintTKey: string;
  unit: string;
  /** Typical normal reference range — informational, not advice. */
  referenceLow: number;
  referenceHigh: number;
  /** Rotation group on the tracker (thyroid / inflammation / vitamin). */
  group: "thyroid" | "inflammation" | "vitamin";
}

export const LAB_FIELDS: readonly LabField[] = [
  { id: "tsh", labelTKey: "clinical.lab.tsh.label", hintTKey: "clinical.lab.tsh.hint", unit: "mIU/L", referenceLow: 0.4, referenceHigh: 4.0, group: "thyroid" },
  { id: "ft4", labelTKey: "clinical.lab.ft4.label", hintTKey: "clinical.lab.ft4.hint", unit: "pmol/L", referenceLow: 12, referenceHigh: 22, group: "thyroid" },
  { id: "vitaminD", labelTKey: "clinical.lab.vitaminD.label", hintTKey: "clinical.lab.vitaminD.hint", unit: "ng/mL", referenceLow: 30, referenceHigh: 50, group: "vitamin" },
  { id: "esr", labelTKey: "clinical.lab.esr.label", hintTKey: "clinical.lab.esr.hint", unit: "mm/h", referenceLow: 0, referenceHigh: 20, group: "inflammation" },
  { id: "crp", labelTKey: "clinical.lab.crp.label", hintTKey: "clinical.lab.crp.hint", unit: "mg/L", referenceLow: 0, referenceHigh: 3.0, group: "inflammation" },
];

export interface LabResult {
  id: string;
  testId: LabTestId;
  /** YYYY-MM-DD of the blood draw. */
  date: string;
  value: number;
  note: string;
}

/** Interpret a value against the informational reference range. */
export type LabVerdict = "low" | "inRange" | "high";

export function labVerdict(
  value: number,
  field: Pick<LabField, "referenceLow" | "referenceHigh">
): LabVerdict {
  if (value < field.referenceLow) return "low";
  if (value > field.referenceHigh) return "high";
  return "inRange";
}

/** Most recent result per test id (chronological by date). */
export function latestPerTest(rows: readonly LabResult[]): Map<LabTestId, LabResult> {
  const latest = new Map<LabTestId, LabResult>();
  for (const row of rows) {
    const existing = latest.get(row.testId);
    if (!existing || row.date >= existing.date) latest.set(row.testId, row);
  }
  return latest;
}