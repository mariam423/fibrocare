import { describe, expect, it } from "vitest";
import { analyzeNight, fibroFogRisk } from "./analyzer";
import { parseWearablePayload, simulateWearableSync } from "./wearable";
import type { SleepNight } from "@/types/extended-health";

function night(overrides: Partial<SleepNight> = {}): SleepNight {
  return {
    date: "2026-08-22",
    hoursSlept: 7.5,
    deepSleepPct: 15,
    awakenings: 2,
    hrvMs: 35,
    restingHr: 68,
    steps: 4000,
    selfReportedRest: 3,
    ...overrides,
  };
}

describe("fibroFogRisk", () => {
  it("scores a good night as low risk", () => {
    const fog = fibroFogRisk(night({ hoursSlept: 8, deepSleepPct: 18, awakenings: 1, selfReportedRest: 4 }), 35);
    expect(fog.score).toBeLessThan(3);
    expect(fog.level).toBe("low");
  });

  it("scores a terrible night as high risk", () => {
    const fog = fibroFogRisk(
      night({ hoursSlept: 5, deepSleepPct: 6, awakenings: 6, selfReportedRest: 1, hrvMs: 20 }),
      40
    );
    expect(fog.score).toBeGreaterThanOrEqual(6);
    expect(fog.level).toBe("high");
    expect(fog.guidance).toContain("single-task");
  });

  it("adds risk when HRV is well under the personal baseline", () => {
    const ok = fibroFogRisk(night({ hrvMs: 38 }), 40);
    const low = fibroFogRisk(night({ hrvMs: 25 }), 40);
    expect(low.score).toBeGreaterThan(ok.score);
  });

  it("never leaves the 0–10 range and is a multiple of 0.5", () => {
    const extreme = fibroFogRisk(
      night({ hoursSlept: 0, deepSleepPct: 0, awakenings: 20, selfReportedRest: 1, hrvMs: 1 }),
      100
    );
    expect(extreme.score).toBeLessThanOrEqual(10);
    expect(Number.isInteger(extreme.score * 2)).toBe(true);
  });
});

describe("analyzeNight", () => {
  it("flags likely alpha–delta intrusion for low deep sleep + many awakenings", () => {
    const a = analyzeNight(night({ deepSleepPct: 7, awakenings: 5, selfReportedRest: 1 }));
    expect(a.alphaDeltaPattern).toBe("likely");
    expect(a.deepSleepStatus).toBe("low");
  });

  it("marks normal nights unlikely", () => {
    const a = analyzeNight(night({ deepSleepPct: 16, awakenings: 1, selfReportedRest: 4 }));
    expect(a.alphaDeltaPattern).toBe("unlikely");
    expect(a.deepSleepStatus).toBe("normal");
  });

  it("returns insufficient-data for alpha–delta without deep sleep data", () => {
    const a = analyzeNight(night({ deepSleepPct: null, awakenings: 1 }));
    expect(a.alphaDeltaPattern).toBe("insufficient-data");
    expect(a.deepSleepStatus).toBe("unknown");
  });

  it("computes deep-sleep vs HRV correlation across a series when enough pairs exist", () => {
    const series: SleepNight[] = Array.from({ length: 8 }, (_, i) =>
      night({ date: `2026-08-${String(i + 1).padStart(2, "0")}`, deepSleepPct: 8 + i * 2, hrvMs: 20 + i * 3 })
    );
    const a = analyzeNight(series[series.length - 1], series);
    expect(a.deepHrvCorrelation).not.toBeNull();
    expect(a.deepHrvCorrelation!).toBeGreaterThan(0.7);
  });

  it("validates nights through Zod (bad data throws)", () => {
    expect(() => analyzeNight(night({ hoursSlept: 40 }))).toThrow();
  });
});

describe("wearable adapter", () => {
  it("simulates deterministic syncs for the same date", () => {
    const a = simulateWearableSync("2026-08-22");
    const b = simulateWearableSync("2026-08-22");
    expect(a).toEqual(b);
    expect(a.source).toBe("mock");
    expect(a.restingHr).toBeGreaterThanOrEqual(62);
    expect(a.restingHr).toBeLessThanOrEqual(76);
  });

  it("varies across dates", () => {
    expect(simulateWearableSync("2026-08-22").hrvMs).not.toBe(simulateWearableSync("2026-08-23").hrvMs);
  });

  it("parses valid payloads and rejects invalid ones", () => {
    expect(() =>
      parseWearablePayload({ source: "apple-health", date: "2026-08-22", restingHr: 60, steps: 3000, hrvMs: 40, deepSleepPct: 12 })
    ).not.toThrow();
    expect(() => parseWearablePayload({ source: "fitbit", date: "x", restingHr: 0, steps: -1, hrvMs: 999 })).toThrow();
  });
});
