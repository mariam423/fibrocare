// @vitest-environment node
import { describe, expect, it } from "vitest";
import { deriveCycleSummary } from "./cycleSummary";

const DAY_MS = 24 * 60 * 60 * 1000;
const daysAgo = (n: number) => new Date(Date.now() - n * DAY_MS);

describe("deriveCycleSummary", () => {
  it("returns null when no cycles exist", () => {
    expect(deriveCycleSummary([])).toBeNull();
  });

  it("uses the textbook 28-day length when only one cycle exists", () => {
    const s = deriveCycleSummary([
      { phase: "MENSTRUAL", startDate: daysAgo(2), endDate: null },
    ]);
    expect(s).not.toBeNull();
    expect(s!.cycleLength).toBe(28);
    expect(s!.currentDay).toBe(3); // started 2 days ago → day 3
    expect(s!.phase).toBe("MENSTRUAL");
    expect(s!.flareWindow).toEqual({ start: 1, end: 5 });
  });

  it("derives cycle length from the gap to the previous cycle", () => {
    const s = deriveCycleSummary([
      { phase: "LUTEAL", startDate: daysAgo(24), endDate: null },
      { phase: "MENSTRUAL", startDate: daysAgo(52), endDate: null },
    ]);
    expect(s!.cycleLength).toBe(28); // 52-24 = 28
    expect(s!.currentDay).toBe(25);
    // Luteal flare window is the 7 days before the next period.
    expect(s!.flareWindow).toEqual({ start: 21, end: 28 });
  });

  it("clamps implausible cycle lengths", () => {
    const s = deriveCycleSummary([
      { phase: "FOLLICULAR", startDate: daysAgo(60), endDate: null },
      { phase: "MENSTRUAL", startDate: daysAgo(140), endDate: null },
    ]);
    expect(s!.cycleLength).toBe(45); // 80-day gap clamped
    expect(s!.currentDay).toBe(45); // clamped to length
  });

  it("never reports a day below 1", () => {
    const s = deriveCycleSummary([
      { phase: "MENSTRUAL", startDate: new Date(Date.now() + DAY_MS / 2), endDate: null },
    ]);
    expect(s!.currentDay).toBe(1);
  });
});
