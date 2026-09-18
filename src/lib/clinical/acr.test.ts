import { describe, expect, it } from "vitest";
import {
  evaluateAcr,
  countWpi,
  generalizedRegionsHit,
  somaticBandFromCount,
  acrProfileSnapshot,
  WPI_REGIONS,
  GENERALIZED_REGIONS,
} from "./acr";

describe("WPI region data", () => {
  it("has exactly 19 regions and 5 generalized super-regions", () => {
    expect(WPI_REGIONS).toHaveLength(19);
    expect(GENERALIZED_REGIONS).toHaveLength(5);
  });

  it("has unique ids and sequential clinical display order", () => {
    const ids = WPI_REGIONS.map((r) => r.id);
    expect(new Set(ids).size).toBe(19);
    expect(WPI_REGIONS.map((r) => r.order)).toEqual(
      Array.from({ length: 19 }, (_, i) => i + 1)
    );
  });
});

describe("countWpi", () => {
  it("counts unique areas (duplicates collapse)", () => {
    expect(countWpi(["neck", "neck", "upperBack"])).toBe(2);
    expect(countWpi([])).toBe(0);
  });
});

describe("generalizedRegionsHit", () => {
  it("maps pains across the five 2016 regions", () => {
    const hits = generalizedRegionsHit([
      "shoulderL",
      "upperArmL",
      "shoulderR",
      "upperArmR",
      "hipL",
      "upperLegL",
      "hipR",
      "upperLegR",
      "neck",
      "lowerBack",
    ]);
    expect(hits).toEqual([
      "leftUpper",
      "rightUpper",
      "leftLower",
      "rightLower",
      "axial",
    ]);
  });

  it("jaw pain never counts toward generalized regions", () => {
    // Jaw counts toward the WPI but is excluded from the five 2016 regions.
    expect(generalizedRegionsHit(["jawL", "jawR"])).toEqual([]);

    const r = evaluateAcr({
      fatigue: 2,
      wakingUnrefreshed: 2,
      cognitive: 1,
      somaticBand: 1,
      durationAtLeast3Months: true,
      wpiAreas: ["jawL", "jawR", "neck", "upperBack", "lowerBack"],
    });
    // Only the axial region is hit (jaw excluded) → not generalized.
    expect(r.generalizedRegions).toBe(1);
    expect(r.generalizedMet).toBe(false);
  });
});

describe("somaticBandFromCount", () => {
  it("maps the curated checklist counts to 0–3 bands", () => {
    expect(somaticBandFromCount(0)).toBe(0);
    expect(somaticBandFromCount(3)).toBe(1);
    expect(somaticBandFromCount(7)).toBe(2);
    expect(somaticBandFromCount(12)).toBe(3);
  });
});

describe("evaluateAcr", () => {
  const base = {
    fatigue: 2 as const,
    wakingUnrefreshed: 2 as const,
    cognitive: 1 as const,
    somaticBand: 1 as const,
    durationAtLeast3Months: true,
  };

  it("meets criteria with WPI 7 + SS 5 (score rule A)", () => {
    const r = evaluateAcr({
      ...base,
      wpiAreas: [
        "shoulderL", "shoulderR", "upperArmL", "upperArmR",
        "hipL", "upperLegL", "neck", "upperBack",
      ],
    });
    expect(r.wpi).toBe(8);
    expect(r.symptomSeverityScore).toBe(5);
    expect(r.ss).toBe(6);
    expect(r.generalizedRegions).toBe(4);
    expect(r.generalizedMet).toBe(true);
    expect(r.scoreRuleMet).toBe(true);
    expect(r.criteriaMet).toBe(true);
  });

  it("meets criteria with WPI 5 + SS 9 (score rule B)", () => {
    // Five areas spanning all five 2016 regions while keeping WPI low.
    const r = evaluateAcr({
      wpiAreas: ["neck", "shoulderL", "shoulderR", "hipL", "hipR"],
      fatigue: 3,
      wakingUnrefreshed: 3,
      cognitive: 3,
      somaticBand: 0,
      durationAtLeast3Months: true,
    });
    expect(r.wpi).toBe(5);
    expect(r.ss).toBe(9);
    expect(r.generalizedRegions).toBe(5);
    expect(r.generalizedMet).toBe(true);
    expect(r.scoreRuleMet).toBe(true);
    expect(r.criteriaMet).toBe(true);
  });

  it("fails when score rule is not met despite generalized + duration", () => {
    const r = evaluateAcr({
      ...base,
      wpiAreas: ["neck", "upperBack", "lowerBack"],
    });
    expect(r.wpi).toBe(3);
    expect(r.scoreRuleMet).toBe(false);
    expect(r.criteriaMet).toBe(false);
  });

  it("fails when generalized pain is not met", () => {
    const r = evaluateAcr({
      ...base,
      wpiAreas: ["neck", "upperBack", "jawL", "jawR", "chest", "abdomen"],
    });
    // Only axial + leftUpper/rightUpper (jaw) regions — 3 total → not generalized.
    expect(r.generalizedMet).toBe(false);
    expect(r.criteriaMet).toBe(false);
  });

  it("fails when duration is not met", () => {
    const r = evaluateAcr({
      ...base,
      wpiAreas: [
        "shoulderL", "shoulderR", "upperArmL", "upperArmR",
        "hipL", "upperLegL", "neck", "upperBack", "lowerLegR",
      ],
      durationAtLeast3Months: false,
    });
    expect(r.durationMet).toBe(false);
    expect(r.criteriaMet).toBe(false);
  });

  it("clamps out-of-range severity to 0–3", () => {
    const r = evaluateAcr({
      ...base,
      wpiAreas: [],
      // @ts-expect-error — deliberate misuse to verify clamping
      fatigue: 9,
      // @ts-expect-error — deliberate misuse to verify clamping
      cognitive: -2,
    });
    expect(r.symptomSeverityScore).toBe(5);
    expect(r.ss).toBe(6);
  });
});

describe("acrProfileSnapshot", () => {
  it("builds a doctor-shareable profile snapshot", () => {
    const input = {
      wpiAreas: ["neck" as const, "upperBack" as const],
      fatigue: 1 as const,
      wakingUnrefreshed: 2 as const,
      cognitive: 1 as const,
      somaticBand: 1 as const,
      durationAtLeast3Months: true,
    };
    const result = evaluateAcr(input);
    const snap = acrProfileSnapshot(result, input);
    expect(snap.version).toBe(1);
    expect(snap.wpi).toBe(2);
    expect(snap.ss).toBe(5);
    expect(snap.wpiAreas).toEqual(["neck", "upperBack"]);
    expect(typeof snap.date).toBe("string");
  });
});