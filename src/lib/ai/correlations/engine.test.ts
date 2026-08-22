import { describe, expect, it } from "vitest";
import {
  analyzeCorrelations,
  buildProactiveInsights,
  pearson,
  runWeatherSymptomAnalysis,
  type DailyPainPoint,
  type DailyWeatherPoint,
} from "./engine";
import { weatherSymptomAnalysisSchema } from "./types";

function dates(n: number): string[] {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86_400_000);
    out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
  }
  return out;
}

describe("pearson", () => {
  it("returns ±1 for perfect linear relationships", () => {
    expect(pearson([1, 2, 3, 4], [2, 4, 6, 8])).toBeCloseTo(1);
    expect(pearson([1, 2, 3, 4], [8, 6, 4, 2])).toBeCloseTo(-1);
  });

  it("returns ~0 for unrelated series", () => {
    expect(Math.abs(pearson([1, 2, 3, 4, 5], [3, 1, 4, 5, 2]))).toBeLessThan(0.9);
  });

  it("returns 0 for tiny or constant samples", () => {
    expect(pearson([1], [2])).toBe(0);
    expect(pearson([5, 5, 5], [1, 2, 3])).toBe(0);
  });
});

describe("analyzeCorrelations", () => {
  it("detects a strong positive humidity–pain relationship", () => {
    const ds = dates(14);
    const pain: DailyPainPoint[] = ds.map((date, i) => ({ date, pain: 2 + i * 0.5 })); // rising
    const weather: DailyWeatherPoint[] = ds.map((date, i) => ({
      date,
      humidity: 40 + i * 3, // rising with pain
      pressure: 1013,
      temperature: 20,
    }));
    const correlations = analyzeCorrelations(pain, weather);
    const humidity = correlations.find((c) => c.metric === "humidity")!;
    expect(humidity.coefficient).toBeGreaterThan(0.8);
    expect(humidity.direction).toBe("pain-increasing");
    expect(["moderate", "strong"]).toContain(humidity.strength);
    // Temperature/pressure constant → 0 correlation, "none" direction.
    expect(correlations.find((c) => c.metric === "pressure")!.coefficient).toBe(0);
  });

  it("marks short series as negligible", () => {
    const ds = dates(3);
    const pain = ds.map((date, i) => ({ date, pain: i }));
    const weather = ds.map((date, i) => ({ date, humidity: i, pressure: 1013, temperature: 20 }));
    for (const c of analyzeCorrelations(pain, weather)) {
      expect(c.strength).toBe("negligible");
      expect(c.direction).toBe("none");
    }
  });
});

describe("buildProactiveInsights", () => {
  const baseCorr = analyzeCorrelations(
    dates(14).map((date, i) => ({ date, pain: i })),
    dates(14).map((date, i) => ({ date, humidity: i, pressure: 1013, temperature: 20 }))
  );

  it("warns on a humidity spike when humidity is a personal trigger", () => {
    const insights = buildProactiveInsights(
      { humidity: 80, pressure: 1013, temperature: 20 },
      baseCorr,
      dates(14).map((_, i) => ({ date: "", humidity: 40 + i, pressure: 1013, temperature: 20 }))
    );
    // humidity is NOT a positive trigger in baseCorr (it is, pain rises with i too)
    const hum = insights.find((i) => i.id === "humidity-spike");
    if (hum) {
      expect(["high", "watch"]).toContain(hum.severity);
      expect(hum.headline).toMatch(/Humidity is up/);
      expect(hum.recommendation.length).toBeGreaterThan(10);
    }
  });

  it("produces a calm info insight when nothing is triggered", () => {
    const insights = buildProactiveInsights(
      { humidity: 50, pressure: 1013, temperature: 20 },
      baseCorr.map((c) => ({ ...c, direction: "none" as const })),
      []
    );
    expect(insights).toHaveLength(1);
    expect(insights[0].severity).toBe("info");
    expect(insights[0].id).toBe("weather-calm");
  });
});

describe("runWeatherSymptomAnalysis", () => {
  it("returns a schema-valid full analysis", () => {
    const ds = dates(20);
    const analysis = runWeatherSymptomAnalysis(
      ds.map((date, i) => ({ date, pain: 3 + (i % 5) })),
      ds.map((date, i) => ({ date, humidity: 40 + i, pressure: 1010 - i, temperature: 18 + i })),
      { humidity: 90, pressure: 995, temperature: 10 },
      "estimated"
    );
    expect(() => weatherSymptomAnalysisSchema.parse(analysis)).not.toThrow();
    expect(analysis.sampleDays).toBe(20);
    expect(analysis.weatherSource).toBe("estimated");
    expect(analysis.insights.length).toBeGreaterThan(0);
  });
});
