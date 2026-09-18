import { describe, expect, it } from "vitest";
import { buildPeriodStats, periodStartToday } from "./periodicReport";

const logs = [
  { loggedAt: new Date("2026-09-01T09:00:00Z"), painLevel: 5, mood: "Low Energy" },
  { loggedAt: new Date("2026-09-02T09:00:00Z"), painLevel: 8, mood: "Flare-up" },
  { loggedAt: new Date("2026-09-03T09:00:00Z"), painLevel: 6, mood: "Good Day" },
];
const now = new Date("2026-09-03T12:00:00Z");

describe("periodStartToday", () => {
  it("finds a 7-day window for weeks and ~30-day for months", () => {
    const week = periodStartToday("week", now);
    expect(now.getTime() - week.getTime()).toBeLessThanOrEqual(7 * 86_400_000);
    const month = periodStartToday("month", now);
    expect(now.getTime() - month.getTime()).toBeLessThanOrEqual(32 * 86_400_000);
  });
});

describe("buildPeriodStats snapshot", () => {
  it("aggregates pain + adherence for a week", () => {
    const stats = buildPeriodStats(
      {
        logs,
        triggers: [],
        labs: [],
        meds: [],
      },
      "week",
      now
    );
    expect(stats.days).toBe(7);
    expect(stats.avgPain).toBeCloseTo(6.3);
    expect(stats.peakPain).toBe(8);
    expect(stats.flareDays).toBe(1);
  });

  it("renders the top flare trigger by average severity", () => {
    const stats = buildPeriodStats(
      {
        logs,
        triggers: [
          { id: "t1", date: "2026-09-01", severity: 8, factors: ["stress", "poorSleep"], note: "" },
          { id: "t2", date: "2026-09-02", severity: 3, factors: ["stress"], note: "" },
        ],
        labs: [],
        meds: [],
      },
      "week",
      now
    );
    // poorSleep avg 8 > stress avg 5.5 → top = poorSleep.
    expect(stats.triggerTop?.factor).toBe("poorSleep");
    expect(stats.triggerCounts.find((c) => c.factor === "stress")?.count).toBe(2);
  });

  it("flags out-of-range lab values in the window", () => {
    const stats = buildPeriodStats(
      {
        logs,
        triggers: [],
        labs: [
          { id: "l1", testId: "tsh", date: "2026-09-01", value: 9.2, note: "" },
          { id: "l2", testId: "crp", date: "2026-09-02", value: 1.1, note: "" },
        ],
        meds: [{ id: "m", name: "Duloxetine", dose: "30", unit: "mg", frequency: "once", category: "medication", times: ["08:00"] }],
        acr: { version: 1, date: "2026-09-01", wpi: 8, ss: 6, symptomSeverityScore: 5, somaticBand: 1, generalizedRegions: 4, criteriaMet: true, wpiAreas: [] },
      },
      "week",
      now
    );
    expect(stats.labHighlights.find((l) => l.testId === "tsh")?.verdict).toBe("high");
    expect(stats.labHighlights.find((l) => l.testId === "crp")?.verdict).toBe("inRange");
    expect(stats.dueMedications).toContain("Duloxetine");
    expect(stats.acrMet).toBe(true);
  });

  it("does not count entries outside the window", () => {
    const stats = buildPeriodStats(
      {
        logs: [{ loggedAt: new Date("2026-07-01T09:00:00Z"), painLevel: 9, mood: "x" }],
        triggers: [],
        labs: [],
        meds: [],
      },
      "week",
      now
    );
    expect(stats.avgPain).toBeNull();
    expect(stats.loggingAdherence).toBe(0);
  });
});