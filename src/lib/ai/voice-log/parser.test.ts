import { describe, expect, it } from "vitest";
import { heuristicParseLog } from "./parser";
import { parsedHealthLogSchema } from "./types";

describe("heuristicParseLog", () => {
  it("parses the canonical example: location + intensity + sleep", () => {
    const parsed = heuristicParseLog("Left shoulder hurts badly, slept poorly due to cold");
    expect(() => parsedHealthLogSchema.parse(parsed)).not.toThrow();
    expect(parsed.bodyLocations).toContain("left shoulder");
    expect(parsed.bodyLocations).not.toContain("shoulders"); // specific beats generic
    expect(parsed.painScore).toBe(8); // "badly"
    expect(parsed.sleepQuality).toBe(2); // "slept poorly"
  });

  it("uses an explicit numeric pain score when given", () => {
    const parsed = heuristicParseLog("pain is 7 out of 10 today, mostly in my lower back");
    expect(parsed.painScore).toBe(7);
    expect(parsed.bodyLocations).toContain("lower back");
  });

  it("extracts known symptoms and mood words", () => {
    const parsed = heuristicParseLog("exhausted all day, brain fog is terrible and a headache won't quit");
    expect(parsed.symptoms).toContain("brain fog");
    expect(parsed.symptoms).toContain("headache");
    expect(parsed.mood).toBe("exhausted");
    expect(parsed.energy).toBe(3);
  });

  it("returns nulls instead of guessing when nothing is indicated", () => {
    const parsed = heuristicParseLog("just wanted to say the app looks nice today");
    expect(parsed.painScore).toBeNull();
    expect(parsed.bodyLocations).toEqual([]);
    expect(parsed.sleepQuality).toBeNull();
    expect(parsed.symptoms).toEqual([]);
    expect(parsed.confidence).toBe(0);
  });

  it("maps extreme intensity words to a 10", () => {
    const parsed = heuristicParseLog("my knees are unbearable right now");
    expect(parsed.painScore).toBe(10);
    expect(parsed.bodyLocations).toContain("knees");
  });

  it("recognizes good sleep and fine mood", () => {
    const parsed = heuristicParseLog("slept well, knees are mild today, feeling okay");
    expect(parsed.sleepQuality).toBe(5);
    expect(parsed.painScore).toBe(3); // "mild"
    expect(parsed.mood).toBe("okay");
  });

  it("caps notes and confidence is honest about partial extraction", () => {
    const long = "neck hurts ".repeat(200);
    const parsed = heuristicParseLog(long);
    expect(parsed.notesClean.length).toBeLessThanOrEqual(600);
    expect(parsed.bodyLocations).toContain("neck");
    expect(parsed.confidence).toBeGreaterThan(0);
    expect(parsed.confidence).toBeLessThanOrEqual(1);
  });
});
