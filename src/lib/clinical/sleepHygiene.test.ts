import { describe, expect, it } from "vitest";
import {
  sleepHygieneScore,
  sleepHygieneReading,
  SLEEP_HABITS,
} from "./sleepHygiene";

describe("sleepHygiene helpers", () => {
  it("exposes 8 habits", () => {
    expect(SLEEP_HABITS).toHaveLength(8);
  });

  it("scores unique checked habits", () => {
    const ids: Array<(typeof SLEEP_HABITS)[number]["id"]> = [
      "consistentSchedule",
      "darkCoolRoom",
      "consistentSchedule", // duplicate collapses
    ];
    expect(sleepHygieneScore(ids)).toBe(2);
  });

  it("reads strong at 7+, building at 4–6, starting below 4", () => {
    expect(sleepHygieneReading(["consistentSchedule", "darkCoolRoom", "screenWindDown", "caffeineCutoff", "eveningRoutine", "preSleepRelaxation", "gentleDaylight", "painComfortPrep"])).toBe("strong");
    expect(sleepHygieneReading(["consistentSchedule", "darkCoolRoom", "screenWindDown", "caffeineCutoff"])).toBe("building");
    expect(sleepHygieneReading(["consistentSchedule"])).toBe("starting");
  });
});