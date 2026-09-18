import { describe, expect, it } from "vitest";
import {
  BREATHING_CYCLE,
  BREATHING_TOTAL,
  breathPhaseAt,
  breathSecondsLeft,
  COPING_MODULES,
} from "./copingStrategies";

describe("coping modules data", () => {
  it("ships the six core modules", () => {
    expect(COPING_MODULES.map((m) => m.id)).toEqual([
      "pacing",
      "breathing",
      "grounding",
      "heatComfort",
      "sensoryShutdown",
      "support",
    ]);
  });
});

describe("4-7-8 breathing math", () => {
  it("totals 19 seconds", () => {
    expect(BREATHING_TOTAL).toBe(19);
  });

  it("maps cycle seconds to phases", () => {
    expect(breathPhaseAt(0)).toBe("inhale");
    expect(breathPhaseAt(3)).toBe("inhale");
    expect(breathPhaseAt(5)).toBe("hold");
    expect(breathPhaseAt(11)).toBe("exhale");
    expect(breathPhaseAt(18)).toBe("exhale");
  });

  it("wraps around the cycle", () => {
    // 20 ≡ 1 → still inhaling.
    expect(breathPhaseAt(BREATHING_TOTAL + 1)).toBe("inhale");
  });

  it("counts down within the active phase", () => {
    expect(breathSecondsLeft(0)).toBe(BREATHING_CYCLE.inhale);
    expect(breathSecondsLeft(1)).toBe(3);
    expect(breathSecondsLeft(4)).toBe(BREATHING_CYCLE.hold);
    expect(breathSecondsLeft(11)).toBe(BREATHING_CYCLE.exhale);
  });
});