import { describe, expect, it } from "vitest";
import { generateRescueRecommendation } from "./engine";

const calmWeather = ["calm"] as const;

describe("generateRescueRecommendation", () => {
  it("picks flare tips when pain is at or above 7", () => {
    const rec = generateRescueRecommendation({
      painLevel: 7,
      spoonsRemaining: 6,
      weatherTriggers: [...calmWeather],
    });
    expect(rec.tipKey).toMatch(/^rescue\.tip\.flare\./);
    expect(rec.actionKey).toMatch(/^rescue\.action\.flare\./);
    expect(rec.whyKey).toMatch(/^rescue\.why\.flare\./);
  });

  it("picks weather-stressed tips when triggers are active and pain is below flare", () => {
    const rec = generateRescueRecommendation({
      painLevel: 3,
      spoonsRemaining: 6,
      weatherTriggers: ["pressure-drop", "humidity-high"],
    });
    expect(rec.tipKey).toMatch(/^rescue\.tip\.weather\./);
  });

  it("picks moderate tips for moderate pain in calm weather", () => {
    const rec = generateRescueRecommendation({
      painLevel: 5,
      spoonsRemaining: 6,
      weatherTriggers: [...calmWeather],
    });
    expect(rec.tipKey).toMatch(/^rescue\.tip\.moderate\./);
  });

  it("picks calm tips for low pain in calm weather", () => {
    const rec = generateRescueRecommendation({
      painLevel: 2,
      spoonsRemaining: 6,
      weatherTriggers: [...calmWeather],
    });
    expect(rec.tipKey).toMatch(/^rescue\.tip\.calm\./);
  });

  it("lets low spoons outrank a flare", () => {
    const rec = generateRescueRecommendation({
      painLevel: 9,
      spoonsRemaining: 1,
      weatherTriggers: [...calmWeather],
    });
    expect(rec.tipKey).toMatch(/^rescue\.tip\.lowSpoons\./);
  });

  it("rotates between variants within the same pool", () => {
    const base = { painLevel: 2, spoonsRemaining: 6, weatherTriggers: [...calmWeather] };
    const a = generateRescueRecommendation({ ...base, variant: 0 });
    const b = generateRescueRecommendation({ ...base, variant: 1 });
    expect(a.tipKey).not.toBe(b.tipKey);
    expect(a.tipKey).toMatch(/^rescue\.tip\.calm\./);
    expect(b.tipKey).toMatch(/^rescue\.tip\.calm\./);
  });

  it("clamps out-of-range inputs", () => {
    const rec = generateRescueRecommendation({
      painLevel: 99,
      spoonsRemaining: -5,
      weatherTriggers: [...calmWeather],
    });
    // spoons -5 → 0 → lowSpoons pool wins over flare
    expect(rec.tipKey).toMatch(/^rescue\.tip\.lowSpoons\./);
  });
});
