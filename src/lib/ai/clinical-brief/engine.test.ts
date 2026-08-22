import { describe, expect, it } from "vitest";
import { buildClinicalBrief, type BriefInput } from "./engine";
import { clinicalBriefSchema } from "./types";

function makeInput(overrides: Partial<BriefInput> = {}): BriefInput {
  return {
    periodDays: 30,
    daily: Array.from({ length: 20 }, (_, i) => ({
      date: `2026-08-${String(i + 1).padStart(2, "0")}`,
      pain: 5,
      mood: "okay",
    })),
    topSymptoms: ["fatigue", "insomnia", "brain fog"],
    medications: ["amitriptyline"],
    weatherTriggers: [{ factor: "humidity (1-day lag)", evidence: "r=0.52 over 18 logged days (moderate)." }],
    streakDays: 6,
    ...overrides,
  };
}

describe("buildClinicalBrief", () => {
  it("produces a schema-valid brief with correct headline numbers", () => {
    const brief = buildClinicalBrief(makeInput());
    expect(() => clinicalBriefSchema.parse(brief)).not.toThrow();
    expect(brief.headline).toContain("0 flare day(s)");
    expect(brief.flareFrequency.flareDays).toBe(0);
    expect(brief.painProfile.average).toBe(5);
  });

  it("counts flare days and computes monthly rate", () => {
    const daily = Array.from({ length: 30 }, (_, i) => ({
      date: `2026-08-${String(i + 1).padStart(2, "0")}`,
      pain: i < 6 ? 8 : 4, // 6 flare days
    }));
    const brief = buildClinicalBrief(makeInput({ daily }));
    expect(brief.flareFrequency.flareDays).toBe(6);
    expect(brief.flareFrequency.perMonth).toBeCloseTo(6, 0);
  });

  it("detects worsening velocity when the recent quarter is higher", () => {
    const daily = Array.from({ length: 20 }, (_, i) => ({
      date: `2026-08-${String(i + 1).padStart(2, "0")}`,
      pain: i < 15 ? 3 : 7,
    }));
    const brief = buildClinicalBrief(makeInput({ daily }));
    expect(brief.painProfile.velocity).toBe("worsening");
    expect(brief.painProfile.velocityDelta).toBeGreaterThan(0);
    expect(
      brief.suggestedDiscussionPoints.some((p) => p.toLowerCase().includes("worsening"))
    ).toBe(true);
  });

  it("reports insufficient-data velocity for short series", () => {
    const brief = buildClinicalBrief(makeInput({ daily: [] }));
    expect(brief.painProfile.velocity).toBe("insufficient-data");
    expect(brief.painProfile.average).toBeNull();
    expect(brief.headline).toContain("No logged data");
  });

  it("includes medications and weather triggers with evidence", () => {
    const brief = buildClinicalBrief(makeInput());
    expect(brief.patientReportedMedications).toContain("amitriptyline");
    expect(brief.topTriggers[0].factor).toContain("humidity");
    expect(brief.topTriggers[0].evidence).toMatch(/r=/);
    expect(
      brief.suggestedDiscussionPoints.some((p) => p.includes("amitriptyline"))
    ).toBe(true);
  });

  it("computes adherence and includes the data caveat", () => {
    const brief = buildClinicalBrief(makeInput());
    expect(brief.functionalCapacity.loggingAdherencePct).toBe(Math.round((20 / 30) * 100));
    expect(brief.dataCaveat).toContain("self-reported");
    expect(brief.dataCaveat).toContain("20/30");
  });
});
