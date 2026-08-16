import { describe, expect, it } from "vitest";
import { analyzePainPatterns, type PainPatternLog } from "@/lib/insightEngine";

const DAY_MS = 24 * 60 * 60 * 1000;

function toDateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

/** Build a PainLog-shaped fixture `daysAgo` days from now. */
function pain(level: number, daysAgo: number, id = 1): PainPatternLog {
  return {
    id: `p${id}`,
    painLevel: level,
    moodTag: "Good Day",
    notes: null,
    loggedAt: new Date(Date.now() - daysAgo * DAY_MS),
  };
}

/** Build a SymptomLog-shaped fixture for `daysAgo` days from now. */
function symptom(symptom: string, daysAgo: number): { symptom: string; date: string } {
  return { symptom, date: toDateKey(new Date(Date.now() - daysAgo * DAY_MS)) };
}

describe("analyzePainPatterns", () => {
  it("returns an empty array when fewer than 5 logs exist", () => {
    const insights = analyzePainPatterns([pain(5, 1), pain(5, 2), pain(5, 3)], []);
    expect(insights).toEqual([]);
  });

  it("flags high average pain (avg > 6) as a warning", () => {
    const logs = [
      pain(8, 1, 1),
      pain(9, 2, 2),
      pain(7, 3, 3),
      pain(8, 4, 4),
      pain(9, 5, 5),
    ];
    const insights = analyzePainPatterns(logs, []);
    const high = insights.find((i) => i.id === "high-pain-avg");
    expect(high).toBeDefined();
    expect(high?.severity).toBe("warning");
    expect(high?.message).toContain("8.2");
  });

  it("reports well-managed pain (avg <= 3) as info", () => {
    const logs = [
      pain(2, 1, 1),
      pain(3, 2, 2),
      pain(2, 3, 3),
      pain(1, 4, 4),
      pain(3, 5, 5),
    ];
    const insights = analyzePainPatterns(logs, []);
    expect(insights.find((i) => i.id === "low-pain-avg")?.severity).toBe("info");
  });

  it("flags frequent flare-ups (7+ flare days) as critical", () => {
    const logs = Array.from({ length: 8 }, (_, i) => pain(8, i + 1, i + 1));
    const insights = analyzePainPatterns(logs, []);
    const flares = insights.find((i) => i.id === "freq-flares");
    expect(flares).toBeDefined();
    expect(flares?.severity).toBe("critical");
    expect(flares?.message).toContain("8 flare-level days");
  });

  it("flags recurring flare days (3-6) as a warning", () => {
    const logs = [
      pain(8, 1, 1),
      pain(8, 2, 2),
      pain(8, 3, 3),
      pain(4, 4, 4),
      pain(3, 5, 5),
      pain(2, 6, 6),
      pain(8, 7, 7),
    ];
    const insights = analyzePainPatterns(logs, []);
    const flares = insights.find((i) => i.id === "flares-rising");
    expect(flares).toBeDefined();
    expect(flares?.severity).toBe("warning");
  });

  it("detects a worsening trend (second half >= 0.7 higher)", () => {
    const logs = [
      pain(3, 1, 1),
      pain(3, 2, 2),
      pain(4, 3, 3),
      pain(4, 4, 4),
      pain(8, 5, 5),
      pain(9, 6, 6),
      pain(9, 7, 7),
      pain(8, 8, 8),
    ];
    const insights = analyzePainPatterns(logs, []);
    expect(insights.find((i) => i.id === "trend-worsening")).toBeDefined();
  });

  it("detects an improving trend (second half <= -0.7 lower)", () => {
    const logs = [
      pain(9, 1, 1),
      pain(8, 2, 2),
      pain(9, 3, 3),
      pain(8, 4, 4),
      pain(3, 5, 5),
      pain(2, 6, 6),
      pain(2, 7, 7),
      pain(1, 8, 8),
    ];
    const insights = analyzePainPatterns(logs, []);
    expect(insights.find((i) => i.id === "trend-improving")).toBeDefined();
  });

  it("detects a day-of-week pattern when a weekday averages >= 6 and 0.8 above the mean", () => {
    // 4 logs on Mondays (getDay() === 1), all high pain
    const monday = (daysAgo: number, level: number, id: number) => {
      const d = new Date(Date.now() - daysAgo * DAY_MS);
      // shift to a Monday
      const shift = (d.getDay() - 1 + 7) % 7;
      d.setDate(d.getDate() - shift);
      return { id: `w${id}`, painLevel: level, moodTag: "Flare-up", notes: null, loggedAt: d } as PainPatternLog;
    };
    const logs = [
      monday(0, 9, 1),
      monday(7, 8, 2),
      monday(14, 9, 3),
      monday(21, 8, 4),
      pain(3, 1, 5),
      pain(2, 2, 6),
      pain(3, 3, 7),
      pain(2, 4, 8),
    ];
    const insights = analyzePainPatterns(logs, []);
    const weekday = insights.find((i) => i.id === "weekday-pattern");
    expect(weekday).toBeDefined();
    expect(weekday?.message).toContain("Monday");
  });

  it("detects a positive symptom-pain correlation (>= 1.5 delta, min 3 samples)", () => {
    const logs = [
      pain(8, 1, 1),
      pain(8, 2, 2),
      pain(8, 3, 3),
      pain(2, 4, 4),
      pain(2, 5, 5),
      pain(2, 6, 6),
      pain(2, 7, 7),
    ];
    const symptoms = [
      symptom("fatigue", 1),
      symptom("fatigue", 2),
      symptom("fatigue", 3),
    ];
    const insights = analyzePainPatterns(logs, symptoms);
    const corr = insights.find((i) => i.id === "symptom-correlation");
    expect(corr).toBeDefined();
    expect(corr?.title).toBe("Symptom-Pain Link Detected");
    expect(corr?.severity).toBe("warning");
    expect(corr?.message).toContain("fatigue");
    expect(corr?.message).toContain("6.0");
  });

  it("reports a negative correlation as 'Symptom Seen on Easier Days' info", () => {
    const logs = [
      pain(2, 1, 1),
      pain(2, 2, 2),
      pain(2, 3, 3),
      pain(8, 4, 4),
      pain(8, 5, 5),
      pain(8, 6, 6),
      pain(8, 7, 7),
    ];
    const symptoms = [symptom("stretching", 1), symptom("stretching", 2), symptom("stretching", 3)];
    const insights = analyzePainPatterns(logs, symptoms);
    const corr = insights.find((i) => i.id === "symptom-correlation");
    expect(corr).toBeDefined();
    expect(corr?.title).toBe("Symptom Seen on Easier Days");
    expect(corr?.severity).toBe("info");
  });

  it("sorts insights by severity (critical, warning, info)", () => {
    const logs = [
      pain(8, 1, 1),
      pain(8, 2, 2),
      pain(8, 3, 3),
      pain(8, 4, 4),
      pain(8, 5, 5),
      pain(8, 6, 6),
      pain(8, 7, 7),
      pain(8, 8, 8),
    ];
    const insights = analyzePainPatterns(logs, []);
    const order = insights.map((i) => i.severity);
    expect(order).toEqual([...order].sort());
  });
});
