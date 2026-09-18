/**
 * acr.ts — pure ACR 2010/2016 fibromyalgia criteria evaluation.
 *
 * Implements the American College of Rheumatology diagnostic dimensions:
 *  - Widespread Pain Index (WPI): 0–19, counts painful body areas over the
 *    last week.
 *  - Symptom Severity (SS) scale: 0–12 (fatigue + waking unrefreshed +
 *    cognitive severity 0–9, plus a somatic-symptom band 0–3).
 *  - 2016 modification: generalized pain in ≥4 of 5 regions, symptoms
 *    present for ≥ 3 months, and the decision rule
 *    (WPI ≥ 7 & SS ≥ 5) or (WPI 4–6 & SS ≥ 9).
 *
 * Everything here is deterministic, offline-safe and unit-tested; the UI
 * localizes the returned verdict keys. This is a screening / self-report
 * aid, never a diagnosis.
 */

export type WpiRegionId =
  | "shoulderL"
  | "shoulderR"
  | "upperArmL"
  | "upperArmR"
  | "lowerArmL"
  | "lowerArmR"
  | "hipL"
  | "hipR"
  | "upperLegL"
  | "upperLegR"
  | "lowerLegL"
  | "lowerLegR"
  | "jawL"
  | "jawR"
  | "chest"
  | "abdomen"
  | "neck"
  | "upperBack"
  | "lowerBack";

export interface WpiRegion {
  id: WpiRegionId;
  /**
   * ACR 2016 generalized-pain super-region this area belongs to. The jaw
   * contributes to the WPI but is excluded from the five generalized-pain
   * regions, so it maps to the non-generalized "face" bucket.
   */
  region: GeneralizedRegion | "face";
  /** Presentation order. */
  order: number;
}

/** The 19 WPI body areas in clinical display order. */
export const WPI_REGIONS: readonly WpiRegion[] = [
  { id: "shoulderL", region: "leftUpper", order: 1 },
  { id: "shoulderR", region: "rightUpper", order: 2 },
  { id: "upperArmL", region: "leftUpper", order: 3 },
  { id: "upperArmR", region: "rightUpper", order: 4 },
  { id: "lowerArmL", region: "leftUpper", order: 5 },
  { id: "lowerArmR", region: "rightUpper", order: 6 },
  { id: "hipL", region: "leftLower", order: 7 },
  { id: "hipR", region: "rightLower", order: 8 },
  { id: "upperLegL", region: "leftLower", order: 9 },
  { id: "upperLegR", region: "rightLower", order: 10 },
  { id: "lowerLegL", region: "leftLower", order: 11 },
  { id: "lowerLegR", region: "rightLower", order: 12 },
  { id: "jawL", region: "face", order: 13 },
  { id: "jawR", region: "face", order: 14 },
  { id: "chest", region: "axial", order: 15 },
  { id: "abdomen", region: "axial", order: 16 },
  { id: "neck", region: "axial", order: 17 },
  { id: "upperBack", region: "axial", order: 18 },
  { id: "lowerBack", region: "axial", order: 19 },
];

export type GeneralizedRegion =
  | "leftUpper"
  | "rightUpper"
  | "leftLower"
  | "rightLower"
  | "axial";

export const GENERALIZED_REGIONS: readonly GeneralizedRegion[] = [
  "leftUpper",
  "rightUpper",
  "leftLower",
  "rightLower",
  "axial",
];

/** 0–3 severity of a symptom dimension over the past week. */
export type SeverityBand = 0 | 1 | 2 | 3;

/** Curated widespread-somatic-symptom checklist (SS part 2 helper). */
export interface SomaticSymptom {
  id: string;
  tKey: string;
}

export const SOMATIC_SYMPTOMS: readonly SomaticSymptom[] = [
  { id: "headache", tKey: "clinical.somatic.headache" },
  { id: "lowerAbdomenPain", tKey: "clinical.somatic.lowerAbdomenPain" },
  { id: "depression", tKey: "clinical.somatic.depression" },
  { id: "constipation", tKey: "clinical.somatic.constipation" },
  { id: "diarrhea", tKey: "clinical.somatic.diarrhea" },
  { id: "nausea", tKey: "clinical.somatic.nausea" },
  { id: "dizziness", tKey: "clinical.somatic.dizziness" },
  { id: "tingling", tKey: "clinical.somatic.tingling" },
  { id: "irritableBowel", tKey: "clinical.somatic.irritableBowel" },
  { id: "tinnitus", tKey: "clinical.somatic.tinnitus" },
  { id: "blurredVision", tKey: "clinical.somatic.blurredVision" },
  { id: "chestPain", tKey: "clinical.somatic.chestPain" },
  { id: "dryMouth", tKey: "clinical.somatic.dryMouth" },
  { id: "mouthUlcers", tKey: "clinical.somatic.mouthUlcers" },
  { id: "skinSensitivity", tKey: "clinical.somatic.skinSensitivity" },
  { id: "anxiety", tKey: "clinical.somatic.anxiety" },
  { id: "restlessLegs", tKey: "clinical.somatic.restlessLegs" },
  { id: "coldIntolerance", tKey: "clinical.somatic.coldIntolerance" },
];

/**
 * Map a checked-symptom count onto the SS 0–3 band. The ACR bands are
 * 0 = none, 1 = few, 2 = moderate, 3 = a great deal; with a curated 18-item
 * subset the thresholds are distributed proportionally and the UI notes
 * that the count is an approximation.
 */
export function somaticBandFromCount(count: number): SeverityBand {
  if (count <= 0) return 0;
  if (count <= 5) return 1;
  if (count <= 11) return 2;
  return 3;
}

export interface AcrInput {
  /** WPI region ids with pain in the last week. */
  wpiAreas: WpiRegionId[];
  fatigue: SeverityBand;
  wakingUnrefreshed: SeverityBand;
  cognitive: SeverityBand;
  /**
   * SS somatic-symptom band (0–3). Use `somaticBandFromCount` when the user
   * answers via the curated checklist.
   */
  somaticBand: SeverityBand;
  /** Symptoms present at a similar level for ≥ 3 months. */
  durationAtLeast3Months: boolean;
}

export interface AcrResult {
  wpi: number;
  /** SS severity subscore (fatigue + unrefreshed + cognitive). */
  symptomSeverityScore: number;
  /** Total SS scale 0–12. */
  ss: number;
  /** How many of the five 2016 generalized-pain regions contain pain. */
  generalizedRegions: number;
  generalizedMet: boolean;
  durationMet: boolean;
  /** The 2016 decision rule. */
  scoreRuleMet: boolean;
  criteriaMet: boolean;
}

/** Count selected WPI areas. */
export function countWpi(areas: WpiRegionId[]): number {
  return new Set(areas).size;
}

/** Which 2016 generalized regions have at least one painful area. */
export function generalizedRegionsHit(areas: WpiRegionId[]): GeneralizedRegion[] {
  const hits = new Set<GeneralizedRegion | "face">();
  for (const region of WPI_REGIONS) {
    if (areas.includes(region.id)) hits.add(region.region);
  }
  return GENERALIZED_REGIONS.filter((r) => hits.has(r));
}

const clampBand = (n: number): SeverityBand => Math.max(0, Math.min(3, Math.round(n))) as SeverityBand;

/**
 * Evaluate the full ACR 2010/2016 picture from self-report inputs.
 *
 * - `wpi` = number of painful regions.
 * - `ss` = severity sum (0–9) + somatic band (0–3).
 * - Generalized pain: ≥ 4 of the five 2016 regions.
 * - 2016 met: generalized AND duration AND scoreRule.
 *
 * Returns structured numbers plus boolean gates so the UI can render the
 * "why" (which pillar passed / failed), not just the verdict.
 */
export function evaluateAcr(input: AcrInput): AcrResult {
  const wpi = countWpi(input.wpiAreas);
  const symptomSeverityScore =
    clampBand(input.fatigue) +
    clampBand(input.wakingUnrefreshed) +
    clampBand(input.cognitive);
  const ss = symptomSeverityScore + clampBand(input.somaticBand);

  const generalizedRegions = generalizedRegionsHit(input.wpiAreas).length;
  const generalizedMet = generalizedRegions >= 4;
  const durationMet = Boolean(input.durationAtLeast3Months);
  const scoreRuleMet = (wpi >= 7 && ss >= 5) || (wpi >= 4 && wpi <= 6 && ss >= 9);
  const criteriaMet = generalizedMet && durationMet && scoreRuleMet;

  return {
    wpi,
    symptomSeverityScore,
    ss,
    generalizedRegions,
    generalizedMet,
    durationMet,
    scoreRuleMet,
    criteriaMet,
  };
}

/** Compact JSON snapshot persisted to the user profile for clinician sharing. */
export function acrProfileSnapshot(result: AcrResult, input: AcrInput): AcrClinicalSummary {
  return {
    version: 1,
    date: new Date().toISOString(),
    wpi: result.wpi,
    ss: result.ss,
    symptomSeverityScore: result.symptomSeverityScore,
    somaticBand: input.somaticBand,
    generalizedRegions: result.generalizedRegions,
    criteriaMet: result.criteriaMet,
    wpiAreas: input.wpiAreas,
  };
}

export interface AcrClinicalSummary {
  version: number;
  date: string;
  wpi: number;
  ss: number;
  symptomSeverityScore: number;
  somaticBand: SeverityBand;
  generalizedRegions: number;
  criteriaMet: boolean;
  wpiAreas: WpiRegionId[];
}