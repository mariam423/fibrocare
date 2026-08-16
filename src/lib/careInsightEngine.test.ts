import { describe, expect, it } from "vitest";
import {
  buildCareInsight,
  getComfort,
  getFlareState,
  getHumidityLevel,
  getPainTrend,
} from "@/lib/careInsightEngine";

describe("getFlareState", () => {
  it("maps pain levels to calm / mild / severe", () => {
    expect(getFlareState(1)).toBe("calm");
    expect(getFlareState(3)).toBe("calm");
    expect(getFlareState(4)).toBe("mild");
    expect(getFlareState(6)).toBe("mild");
    expect(getFlareState(7)).toBe("severe");
    expect(getFlareState(10)).toBe("severe");
  });
});

describe("getComfort / getHumidityLevel", () => {
  it("classifies temperature and humidity", () => {
    expect(getComfort(30)).toBe("hot");
    expect(getComfort(21)).toBe("comfortable");
    expect(getComfort(10)).toBe("cool");
    expect(getHumidityLevel(75)).toBe("humid");
    expect(getHumidityLevel(50)).toBe("moderate");
    expect(getHumidityLevel(20)).toBe("dry");
  });
});

describe("getPainTrend", () => {
  it("detects rising / falling / stable from a short series", () => {
    expect(getPainTrend([{ level: 3 }, { level: 3 }, { level: 7 }, { level: 8 }])).toBe("rising");
    expect(getPainTrend([{ level: 8 }, { level: 7 }, { level: 3 }, { level: 2 }])).toBe("falling");
    expect(getPainTrend([{ level: 5 }, { level: 4 }, { level: 5 }, { level: 5 }])).toBe("stable");
    expect(getPainTrend([{ level: 5 }])).toBe("stable");
  });
});

describe("buildCareInsight", () => {
  it("returns a severe-flare message when pain is high", () => {
    const insight = buildCareInsight({
      painLevel: 9,
      temperature: 22,
      humidity: 50,
      trend: "stable",
    });
    expect(insight.flareState).toBe("severe");
    expect(insight.title.toLowerCase()).toContain("flare");
    expect(insight.suggestions).toHaveLength(3);
  });

  it("mentions heat when the room is hot", () => {
    const insight = buildCareInsight({
      painLevel: 5,
      temperature: 31,
      humidity: 40,
      trend: "stable",
    });
    expect(insight.title.toLowerCase()).toContain("heat");
    expect(insight.message.toLowerCase()).toContain("heat");
  });

  it("mentions humidity when the air is humid", () => {
    const insight = buildCareInsight({
      painLevel: 3,
      temperature: 24,
      humidity: 78,
      trend: "falling",
    });
    expect(insight.humidity).toBe("humid");
    expect(insight.message.toLowerCase()).toContain("humid");
  });

  it("respects a rising pain trend in the copy", () => {
    const insight = buildCareInsight({
      painLevel: 3,
      temperature: 22,
      humidity: 50,
      trend: "rising",
    });
    expect(insight.message).toContain("trending up");
  });
});
