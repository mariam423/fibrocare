import { describe, expect, it } from "vitest";
import { getRegionalTrend, getCopingLeaderboard } from "./engine";

describe("getRegionalTrend", () => {
  it("returns schema-valid deterministic aggregates", () => {
    const now = new Date("2026-08-22T12:00:00Z");
    const a = getRegionalTrend("London", now);
    const b = getRegionalTrend("London", now);
    expect(a).toEqual(b);
    expect(a.region).toBe("London");
    expect(a.flareSensitivityPct).toBeGreaterThanOrEqual(35);
    expect(a.flareSensitivityPct).toBeLessThanOrEqual(90);
    expect(a.reportingUsers).toBeGreaterThan(0);
    expect(["falling", "steady", "rising"]).toContain(a.barometricTrend);
  });

  it("differs between regions", () => {
    const now = new Date("2026-08-22T12:00:00Z");
    expect(getRegionalTrend("London", now)).not.toEqual(getRegionalTrend("Cairo", now));
  });

  it("uses a known trigger key", () => {
    const trend = getRegionalTrend("Berlin", new Date("2026-08-22T12:00:00Z"));
    expect(trend.dominantTrigger).toMatch(/^triggers\./);
  });
});

describe("getCopingLeaderboard", () => {
  it("ranks strategies by success with sequential ranks", () => {
    const board = getCopingLeaderboard(new Date("2026-08-22T00:00:00Z"));
    expect(board.length).toBeGreaterThanOrEqual(5);
    expect(board.map((s) => s.rank)).toEqual(board.map((_, i) => i + 1));
    for (let i = 1; i < board.length; i++) {
      expect(board[i - 1].successPct).toBeGreaterThanOrEqual(board[i].successPct);
    }
  });

  it("is deterministic for the same day", () => {
    const now = new Date("2026-08-22T00:00:00Z");
    expect(getCopingLeaderboard(now)).toEqual(getCopingLeaderboard(now));
  });

  it("only contains non-pharmacological strategy keys", () => {
    for (const s of getCopingLeaderboard(new Date())) {
      expect(s.strategyKey).toMatch(/^coping\./);
    }
  });
});
