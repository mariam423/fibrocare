import { describe, expect, it } from "vitest";
import {
  computePressureTrend,
  detectWeatherTriggers,
  deterministicWeather,
  mapOpenWeatherPayload,
} from "@/lib/weather";

describe("computePressureTrend", () => {
  it("flags a ≥2 hPa drop as falling with the signed delta", () => {
    expect(computePressureTrend(1008, 1013)).toEqual({
      trend: "falling",
      deltaHpa: -5,
    });
  });

  it("flags a ≥2 hPa rise as rising", () => {
    expect(computePressureTrend(1016, 1013)).toEqual({
      trend: "rising",
      deltaHpa: 3,
    });
  });

  it("treats sub-2 hPa moves as steady", () => {
    expect(computePressureTrend(1013.8, 1012.4)).toEqual({
      trend: "steady",
      deltaHpa: 1,
    });
  });

  it("reads steady when no previous reading exists", () => {
    expect(computePressureTrend(1000, null)).toEqual({
      trend: "steady",
      deltaHpa: 0,
    });
    expect(computePressureTrend(1000, undefined)).toEqual({
      trend: "steady",
      deltaHpa: 0,
    });
  });
});

describe("detectWeatherTriggers", () => {
  const base = {
    pressure: 1013,
    humidity: 50,
    temperature: 22,
    condition: "sunny" as const,
  };

  it("detects a rapid barometric drop from the trend", () => {
    const triggers = detectWeatherTriggers(
      { ...base, pressure: 1007 },
      { trend: "falling", deltaHpa: -6 }
    );
    expect(triggers).toContain("pressure-drop");
  });

  it("detects absolute low pressure", () => {
    expect(detectWeatherTriggers({ ...base, pressure: 998 })).toContain(
      "pressure-low"
    );
  });

  it("detects high humidity at the shared 70% engine threshold", () => {
    expect(detectWeatherTriggers({ ...base, humidity: 72 })).toContain(
      "humidity-high"
    );
  });

  it("detects temperature extremes", () => {
    expect(detectWeatherTriggers({ ...base, temperature: 35 })).toContain(
      "heat-extreme"
    );
    expect(detectWeatherTriggers({ ...base, temperature: 3 })).toContain(
      "cold-extreme"
    );
  });

  it("falls back to calm when nothing fires", () => {
    expect(detectWeatherTriggers(base)).toEqual(["calm"]);
  });
});

describe("mapOpenWeatherPayload", () => {
  it("maps rain condition groups to rainy and rounds metrics", () => {
    const mapped = mapOpenWeatherPayload({
      main: { temp: 22.6, humidity: 61.4, pressure: 1012.7 },
      weather: [{ id: 501 }],
    });
    expect(mapped).toEqual({
      temperature: 23,
      humidity: 61,
      pressure: 1013,
      condition: "rainy",
    });
  });

  it("collapses unknown conditions to cloudy", () => {
    expect(mapOpenWeatherPayload({ main: {}, weather: [{ id: 751 }] }).condition).toBe(
      "cloudy"
    );
  });
});

describe("deterministicWeather fallback", () => {
  it("stays within plausible physical bounds for the same instant", () => {
    const now = new Date("2026-08-24T10:00:00");
    const w = deterministicWeather(now);
    expect(w.temperature).toBeGreaterThanOrEqual(15);
    expect(w.temperature).toBeLessThanOrEqual(30);
    expect(w.humidity).toBeGreaterThanOrEqual(45);
    expect(w.humidity).toBeLessThanOrEqual(75);
    expect(w.pressure).toBeGreaterThanOrEqual(1008);
    expect(w.pressure).toBeLessThanOrEqual(1030);
    // Same bucket → identical values (SSR/hydration agreement).
    expect(deterministicWeather(now)).toEqual(w);
  });
});
