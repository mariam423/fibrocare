import { describe, expect, it } from "vitest";
import { checkInteractions, knownMedicationNames } from "./interactions";
import { correlateAdherence } from "./correlation";

function med(name: string) {
  return { id: name, name, dose: "75mg", timing: "evening" as const, kind: "medication" as const };
}

describe("checkInteractions", () => {
  it("flags serotonin syndrome between duloxetine and tramadol as critical", () => {
    const alerts = checkInteractions([med("duloxetine"), med("tramadol")]);
    expect(alerts.length).toBeGreaterThan(0);
    expect(alerts[0].severity).toBe("critical");
    expect(alerts[0].effect.toLowerCase()).toContain("serotonin");
  });

  it("flags enhanced drowsiness between pregabalin and amitriptyline", () => {
    const alerts = checkInteractions([med("pregabalin"), med("amitriptyline")]);
    expect(alerts.length).toBeGreaterThan(0);
    expect(alerts[0].severity).toBe("warning");
    expect(alerts[0].effect.toLowerCase()).toContain("drowsiness");
  });

  it("recognizes brand aliases (cymbalta, lyrica)", () => {
    const alerts = checkInteractions([med("cymbalta"), med("ultram")]);
    expect(alerts.length).toBeGreaterThan(0);
    expect(alerts[0].severity).toBe("critical");
  });

  it("normalizes case and whitespace in names", () => {
    const alerts = checkInteractions([
      { ...med("  Duloxetine "), name: "  Duloxetine " },
      med("tramadol"),
    ]);
    expect(alerts.length).toBeGreaterThan(0);
  });

  it("returns no alerts for non-interacting meds and supplements", () => {
    expect(checkInteractions([med("magnesium"), med("melatonin")])).toEqual([]);
  });

  it("sorts critical before warning", () => {
    const alerts = checkInteractions([
      med("duloxetine"),
      med("tramadol"),
      med("amitriptyline"),
    ]);
    const severities = alerts.map((a) => a.severity);
    expect(severities.indexOf("critical")).toBeLessThan(severities.indexOf("warning"));
  });

  it("rejects invalid lists via Zod", () => {
    expect(() => checkInteractions([{ id: "x", name: "a" }])).toThrow();
  });
});

describe("knownMedicationNames", () => {
  it("includes core fibromyalgia medications", () => {
    const names = knownMedicationNames();
    for (const expected of ["pregabalin", "duloxetine", "amitriptyline", "tramadol", "naltrexone", "magnesium"]) {
      expect(names).toContain(expected);
    }
  });
});

describe("correlateAdherence", () => {
  const day = (n: number) => `2026-08-${String(n).padStart(2, "0")}`;

  it("detects that on-schedule days are better (negative pain delta)", () => {
    const result = correlateAdherence([
      { date: day(1), takenOnSchedule: true, morningPain: 4, sleepQuality: 4 },
      { date: day(2), takenOnSchedule: true, morningPain: 5, sleepQuality: 4 },
      { date: day(3), takenOnSchedule: false, morningPain: 8, sleepQuality: 2 },
      { date: day(4), takenOnSchedule: false, morningPain: 7, sleepQuality: 2 },
    ]);
    expect(result.painDelta).toBe(-3);
    expect(result.sleepDelta).toBe(2);
    expect(result.interpretation).toMatch(/better for you/);
  });

  it("reports no clear difference for identical outcomes", () => {
    const result = correlateAdherence([
      { date: day(1), takenOnSchedule: true, morningPain: 5, sleepQuality: 3 },
      { date: day(2), takenOnSchedule: false, morningPain: 5, sleepQuality: 3 },
    ]);
    expect(result.painDelta).toBe(0);
    expect(result.interpretation).toMatch(/No clear difference/);
  });

  it("handles missing comparison days gracefully", () => {
    const result = correlateAdherence([
      { date: day(1), takenOnSchedule: true, morningPain: 5, sleepQuality: null },
    ]);
    expect(result.painDelta).toBeNull();
    expect(result.sleepDelta).toBeNull();
    expect(result.interpretation).toMatch(/Not enough days/);
  });
});
