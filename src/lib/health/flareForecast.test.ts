// @vitest-environment node
import { describe, expect, it } from "vitest";
import { buildFlareForecast } from "./flareForecast";

const DAY_MS = 24 * 60 * 60 * 1000;
const NOW = new Date("2026-09-15T12:00:00.000Z");
const daysBeforeNow = (n: number) => new Date(NOW.getTime() - n * DAY_MS);
const dateKey = (d: Date) => d.toISOString().split("T")[0];

describe("buildFlareForecast", () => {
  it("returns null without cycle history", () => {
    expect(
      buildFlareForecast({ cycles: [], symptomLogs: [], now: NOW })
    ).toBeNull();
  });

  it("predicts the next period one cycleLength after the last start", () => {
    const forecast = buildFlareForecast({
      cycles: [
        { phase: "LUTEAL", startDate: daysBeforeNow(24), endDate: null },
        { phase: "MENSTRUAL", startDate: daysBeforeNow(52), endDate: null },
      ],
      symptomLogs: [],
      now: NOW,
    });

    expect(forecast).not.toBeNull();
    expect(forecast!.daysUntilPeriod).toBe(4); // 28 - 24
    // Risk window opens 5 days before the period → already open.
    expect(forecast!.daysUntilWindow).toBe(0);
    expect(forecast!.drivers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "premenstrual-window" }),
        expect.objectContaining({ id: "luteal-phase" }),
      ])
    );
    expect(forecast!.level).toBe("high");
    expect(forecast!.advice).toContain("pacing");
    expect(forecast!.advice).toContain("heat");
  });

  it("is low risk in the follicular phase far from the window", () => {
    const forecast = buildFlareForecast({
      cycles: [
        { phase: "FOLLICULAR", startDate: daysBeforeNow(6), endDate: null },
        { phase: "MENSTRUAL", startDate: daysBeforeNow(34), endDate: null },
      ],
      symptomLogs: [],
      now: NOW,
    });

    expect(forecast!.level).toBe("low");
    expect(forecast!.daysUntilPeriod).toBe(22);
    expect(forecast!.daysUntilWindow).toBe(17); // window starts day 24
    expect(forecast!.advice).toEqual(
      expect.arrayContaining(["gentleMovement", "trackDaily"])
    );
  });

  it("escalates when recent symptom severity is elevated", () => {
    const yesterday = dateKey(daysBeforeNow(1));
    const forecast = buildFlareForecast({
      cycles: [
        { phase: "LUTEAL", startDate: daysBeforeNow(24), endDate: null },
      ],
      symptomLogs: [
        { symptom: "Brain Fog", date: yesterday, severity: 8, category: "COGNITIVE" },
        { symptom: "Joint Pain", date: yesterday, severity: 7, category: "PHYSICAL" },
      ],
      now: NOW,
    });

    expect(forecast!.level).toBe("high");
    expect(forecast!.drivers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "elevated-symptoms", strength: "strong" }),
      ])
    );
  });

  it("keeps moderate risk to supportive drivers only", () => {
    const yesterday = dateKey(daysBeforeNow(1));
    const forecast = buildFlareForecast({
      cycles: [
        { phase: "FOLLICULAR", startDate: daysBeforeNow(6), endDate: null },
      ],
      symptomLogs: [
        { symptom: "Fatigue", date: yesterday, severity: 5, category: "PHYSICAL" },
      ],
      now: NOW,
    });

    // One supporting driver (symptom avg 5) → moderate.
    expect(forecast!.level).toBe("moderate");
    expect(forecast!.drivers).toEqual([
      { id: "elevated-symptoms", strength: "supporting" },
    ]);
  });

  it("treats an overdue cycle (past cycleLength, no new log) as period due now", () => {
    const forecast = buildFlareForecast({
      cycles: [
        { phase: "MENSTRUAL", startDate: daysBeforeNow(30), endDate: null },
      ],
      symptomLogs: [],
      now: NOW,
    });

    // Day 31 of a default 28-day cycle → overdue → due today.
    expect(forecast!.daysUntilPeriod).toBe(0);
  });
});
