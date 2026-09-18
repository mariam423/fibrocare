import { describe, expect, it } from "vitest";
import {
  analyzeFoodFlareCorrelation,
  EVENING_WINDOW_HOUR,
  flareScoreForDate,
  nextDay,
  type MealLogLike,
  type PainLogLike,
  type SymptomLogLike,
} from "./flareCorrelation";

function meal(
  id: string,
  date: string,
  hour: number,
  foods: string[]
): MealLogLike {
  return {
    id,
    date,
    eatenAt: new Date(Number(date.slice(0, 4)), Number(date.slice(5, 7)) - 1, Number(date.slice(8, 10)), hour, 0),
    items: foods.map((name, i) => ({ id: `${id}-${i}`, name })),
  };
}

function pain(isoYear: number, monthIndex: number, day: number, level: number): PainLogLike {
  return { loggedAt: new Date(isoYear, monthIndex, day, 9, 0), painLevel: level };
}

function symptom(date: string, severity: number, label: string): SymptomLogLike {
  return { date, severity, symptom: label };
}

describe("nextDay", () => {
  it("advances one calendar day including month and year boundaries", () => {
    expect(nextDay("2026-09-17")).toBe("2026-09-18");
    expect(nextDay("2026-12-31")).toBe("2027-01-01");
    expect(nextDay("2026-02-28")).toBe("2026-03-01");
  });
});

describe("flareScoreForDate", () => {
  it("weights max pain twice and adds pain/fatigue/fog symptom severity", () => {
    const painByDate = new Map([["2026-09-18", 7]]);
    const symptomsByDate = new Map([
      ["2026-09-18", [symptom("2026-09-18", 6, "Joint pain"), symptom("2026-09-18", 4, "Brain fog")]],
    ]);
    const score = flareScoreForDate("2026-09-18", painByDate, symptomsByDate);
    expect(score).toBe(14 + 6 + 4);
  });

  it("returns 0 when no pain or symptoms exist for the date", () => {
    expect(flareScoreForDate("2026-09-18", new Map(), undefined)).toBe(0);
  });
});

describe("analyzeFoodFlareCorrelation", () => {
  it("flags an evening food whose next mornings spike pain/fog as high risk", () => {
    const meals = [
      meal("m1", "2026-09-10", 19, ["Cheese pizza"]),
      meal("m2", "2026-09-11", 21, ["Cheese pizza"]),
      meal("m3", "2026-09-12", 18, ["Grilled salmon"]),
    ];
    const painLogs = [
      pain(2026, 8, 11, 7),
      pain(2026, 8, 12, 8),
      pain(2026, 8, 13, 3),
    ];
    const symptomLogs = [
      symptom("2026-09-11", 6, "Joint pain"),
      symptom("2026-09-12", 7, "Brain fog"),
      symptom("2026-09-13", 2, "Mood swings"),
    ];

    const report = analyzeFoodFlareCorrelation(meals, painLogs, symptomLogs);
    expect(report.analyzedDays).toBe(3);

    const pizza = report.foods.find((f) => f.food === "cheese pizza");
    expect(pizza).toBeDefined();
    expect(pizza!.eveningOccurrences).toBe(2);
    expect(pizza!.risk).toBe("high");
    expect(pizza!.lift).toBeGreaterThan(1.35);
    // Salmon appears only once in the evening — below the min sample count.
    expect(report.foods.some((f) => f.food === "grilled salmon")).toBe(false);
  });

  it("returns an empty report when there are no evening meals", () => {
    const meals = [meal("m1", "2026-09-10", 12, ["Lentil soup"])];
    const report = analyzeFoodFlareCorrelation(meals, [], []);
    expect(report.analyzedDays).toBe(0);
    expect(report.foods).toEqual([]);
  });

  it("surfaces a timing insight when later dinners track with flare mornings", () => {
    const meals = [
      meal("m1", "2026-09-10", 18, ["Rice"]),
      meal("m2", "2026-09-11", 22, ["Rice"]),
      meal("m3", "2026-09-12", 18, ["Rice"]),
    ];
    const painLogs = [
      pain(2026, 8, 11, 2),
      pain(2026, 8, 12, 9),
      pain(2026, 8, 13, 2),
    ];
    const report = analyzeFoodFlareCorrelation(meals, painLogs, []);
    expect(report.foods[0].food).toBe("rice");
    expect(report.timing.avgHourHighFlare).toBeGreaterThanOrEqual(22);
    expect(report.timing.avgHourLowFlare).toBeLessThanOrEqual(18);
    expect(report.timing.laterEveningLinkedToFlare).toBe(true);
  });

  it("does not flag foods when next-day scores are calm", () => {
    const meals = [
      meal("m1", "2026-09-10", 19, ["Dark chocolate"]),
      meal("m2", "2026-09-11", 19, ["Dark chocolate"]),
    ];
    const painLogs = [pain(2026, 8, 11, 2), pain(2026, 8, 12, 2)];
    const report = analyzeFoodFlareCorrelation(meals, painLogs, []);
    expect(report.foods[0].risk).toBe("watch");
  });
});

describe("EVENING_WINDOW_HOUR", () => {
  it("uses a 17:00 evening cutoff", () => {
    expect(EVENING_WINDOW_HOUR).toBe(17);
  });
});