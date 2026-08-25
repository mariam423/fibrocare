import { describe, expect, it } from "vitest";
import {
  evaluateAllTriggers,
  evaluateDailyReminders,
  evaluateMedicationReminders,
  evaluatePainSpike,
  evaluateWeatherTriggers,
  timeAgoParts,
  toDateKey,
} from "./triggers";
import type { MedicationScheduleEntry } from "./types";

const noon = new Date(2026, 7, 25, 12, 0, 0); // 2026-08-25 12:00 local

describe("toDateKey", () => {
  it("formats a local ISO day key", () => {
    expect(toDateKey(new Date(2026, 0, 5, 23, 59))).toBe("2026-01-05");
  });
});

describe("evaluateWeatherTriggers", () => {
  it("alerts on a falling pressure trend", () => {
    const out = evaluateWeatherTriggers(
      { temperature: 18, humidity: 50, pressure: 1004, condition: "cloudy" },
      1008,
      noon
    );
    expect(out.some((n) => n.id.startsWith("weather-pressure-drop-"))).toBe(true);
    expect(out[0].type).toBe("weather_trigger");
  });

  it("alerts on low absolute pressure without a trend", () => {
    const out = evaluateWeatherTriggers(
      { temperature: 18, humidity: 50, pressure: 1002, condition: "cloudy" },
      null,
      noon
    );
    expect(out.some((n) => n.id.startsWith("weather-pressure-low-"))).toBe(true);
  });

  it("alerts on high humidity, heat and cold", () => {
    const humid = evaluateWeatherTriggers(
      { temperature: 20, humidity: 75, pressure: 1013, condition: "rainy" },
      null,
      noon
    );
    expect(humid.some((n) => n.id.startsWith("weather-humidity-high-"))).toBe(true);

    const hot = evaluateWeatherTriggers(
      { temperature: 34, humidity: 40, pressure: 1013, condition: "sunny" },
      null,
      noon
    );
    expect(hot.some((n) => n.id.startsWith("weather-heat-extreme-"))).toBe(true);

    const cold = evaluateWeatherTriggers(
      { temperature: 2, humidity: 40, pressure: 1013, condition: "cloudy" },
      null,
      noon
    );
    expect(cold.some((n) => n.id.startsWith("weather-cold-extreme-"))).toBe(true);
  });

  it("produces nothing for a calm day", () => {
    const out = evaluateWeatherTriggers(
      { temperature: 20, humidity: 50, pressure: 1013, condition: "sunny" },
      1013,
      noon
    );
    expect(out).toEqual([]);
  });

  it("ids embed the calendar day (no duplicate per day)", () => {
    const out = evaluateWeatherTriggers(
      { temperature: 18, humidity: 50, pressure: 1002, condition: "cloudy" },
      null,
      noon
    );
    expect(out[0].id).toContain("2026-08-25");
  });
});

describe("evaluatePainSpike", () => {
  it("alerts when the last 2 logs are at/above the flare threshold", () => {
    const out = evaluatePainSpike([{ painLevel: 8 }, { painLevel: 7 }], noon);
    expect(out).toHaveLength(1);
    expect(out[0].type).toBe("ai_prediction");
    expect(out[0].params?.highest).toBe(8);
  });

  it("is silent with fewer than 2 logs", () => {
    expect(evaluatePainSpike([{ painLevel: 9 }], noon)).toEqual([]);
  });

  it("is silent when recent logs are below the threshold", () => {
    expect(evaluatePainSpike([{ painLevel: 6 }, { painLevel: 7 }], noon)).toEqual([]);
  });

  it("only looks at the newest logs (newest-first input, like getLatestLogs)", () => {
    // A spike happened 3+ logs ago, but the newest two are calm → no alert.
    expect(
      evaluatePainSpike(
        [{ painLevel: 3 }, { painLevel: 4 }, { painLevel: 9 }, { painLevel: 9 }],
        noon
      )
    ).toEqual([]);
  });
});

describe("evaluateMedicationReminders", () => {
  const schedule: MedicationScheduleEntry[] = [
    { id: "morning", name: "Morning supplement", hour: 8, minute: 0 },
    { id: "evening", name: "Evening magnesium", hour: 21, minute: 0 },
  ];

  it("reminds for a dose that just came due", () => {
    const at = new Date(2026, 7, 25, 8, 30, 0);
    const out = evaluateMedicationReminders(schedule, at);
    expect(out).toHaveLength(1);
    expect(out[0].id).toBe("medication-morning-2026-08-25");
    expect(out[0].type).toBe("medication_reminder");
    expect(out[0].params?.name).toBe("Morning supplement");
  });

  it("does not remind before the dose time", () => {
    const at = new Date(2026, 7, 25, 7, 59, 0);
    expect(evaluateMedicationReminders(schedule, at)).toEqual([]);
  });

  it("stops reminding after the reminder window passes", () => {
    const at = new Date(2026, 7, 25, 8, 0, 0);
    expect(evaluateMedicationReminders(schedule, at)).toHaveLength(1);
    const late = new Date(2026, 7, 25, 10, 30, 0);
    expect(evaluateMedicationReminders(schedule, late)).toEqual([]);
  });
});

describe("evaluateDailyReminders", () => {
  it("emits a zen recommendation at the zen hour", () => {
    const at = new Date(2026, 7, 25, 10, 0, 0);
    const out = evaluateDailyReminders(null, at);
    expect(out.some((n) => n.type === "zen_recommendation" && n.actionUrl === "/zen")).toBe(true);
  });

  it("emits a daily check-in nudge in the evening when nothing was logged today", () => {
    const at = new Date(2026, 7, 25, 19, 0, 0);
    const out = evaluateDailyReminders("2026-08-24", at);
    expect(out.some((n) => n.type === "daily_checkin")).toBe(true);
  });

  it("does not nudge when today was already logged", () => {
    const at = new Date(2026, 7, 25, 19, 0, 0);
    expect(evaluateDailyReminders("2026-08-25", at)).toEqual([]);
  });

  it("dedupes both reminders by day id", () => {
    const at = new Date(2026, 7, 25, 10, 0, 0);
    const out = evaluateDailyReminders(null, at);
    expect(out[0].id).toContain("2026-08-25");
  });
});

describe("evaluateAllTriggers", () => {
  it("merges results from every trigger", () => {
    const out = evaluateAllTriggers({
      weather: { temperature: 18, humidity: 50, pressure: 1002, condition: "cloudy" },
      previousPressure: null,
      logs: [{ painLevel: 8 }, { painLevel: 9 }],
      medications: [
        { id: "morning", name: "Morning supplement", hour: 12, minute: 0 },
      ],
      lastLogDate: "2026-08-24",
      now: noon,
    });
    const types = new Set(out.map((n) => n.type));
    expect(types.has("weather_trigger")).toBe(true);
    expect(types.has("ai_prediction")).toBe(true);
    expect(types.has("medication_reminder")).toBe(true);
    expect(types.has("daily_checkin")).toBe(false); // noon is before 18:00
    expect(types.has("zen_recommendation")).toBe(false); // 12:00 is not the zen hour
  });
});

describe("timeAgoParts", () => {
  const now = Date.UTC(2026, 7, 25, 12, 0, 0);

  it("returns minutes for recent timestamps", () => {
    const { value, unit } = timeAgoParts(now - 5 * 60_000, now);
    expect(unit).toBe("minute");
    expect(value).toBe(5);
  });

  it("returns hours past 60 minutes", () => {
    const { value, unit } = timeAgoParts(now - 3 * 3_600_000, now);
    expect(unit).toBe("hour");
    expect(value).toBe(3);
  });

  it("returns days past 24 hours", () => {
    const { value, unit } = timeAgoParts(now - 2 * 86_400_000, now);
    expect(unit).toBe("day");
    expect(value).toBe(2);
  });

  it("never returns 0 minutes for a just-now timestamp", () => {
    const { value } = timeAgoParts(now, now);
    expect(value).toBeGreaterThanOrEqual(1);
  });
});
