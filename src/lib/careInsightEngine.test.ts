import { describe, expect, it } from "vitest";
import {
  buildCareInsight,
  getComfort,
  getFlareState,
  getHumidityLevel,
  getPainTrend,
} from "@/lib/careInsightEngine";
import { sanitizeWarmTherapy } from "@/lib/ai/guardrails";
import { translations, type TranslationKey } from "@/lib/translations";

/** Cold-therapy advice is never allowed for fibromyalgia muscle flares. */
const COLD_THERAPY =
  /\b(cold|ice[d]?|chilled)\s+(compress|pack|bath|shower|water)|\bicing\b|كمادة باردة|كمادات باردة|حمام بارد|حمام مثلج|دش بارد|دش مثلج|ماء بارد|ماء مثلج|ثلج/i;

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

describe("barometric state (climate insights)", () => {
  it("defaults to stable when no pressure context is given", () => {
    const insight = buildCareInsight({
      painLevel: 3,
      temperature: 22,
      humidity: 50,
      trend: "stable",
    });
    expect(insight.barometric).toBe("stable");
  });

  it("reports dropping when the barometer is falling", () => {
    const insight = buildCareInsight({
      painLevel: 3,
      temperature: 22,
      humidity: 50,
      trend: "stable",
      pressure: 1006,
      pressureTrend: { trend: "falling", deltaHpa: -4 },
    });
    expect(insight.barometric).toBe("dropping");
  });

  it("reports low for absolute low pressure without a falling trend", () => {
    const insight = buildCareInsight({
      painLevel: 3,
      temperature: 22,
      humidity: 50,
      trend: "stable",
      pressure: 1001,
      pressureTrend: { trend: "steady", deltaHpa: 0 },
    });
    expect(insight.barometric).toBe("low");
  });

  it("keeps stable for healthy pressure", () => {
    const insight = buildCareInsight({
      painLevel: 3,
      temperature: 22,
      humidity: 50,
      trend: "stable",
      pressure: 1015,
      pressureTrend: { trend: "rising", deltaHpa: 2 },
    });
    expect(insight.barometric).toBe("stable");
  });
});

describe("warm-therapy guardrail (care insight)", () => {
  it("never emits cold-therapy advice across flare states and weather", () => {
    for (const painLevel of [1, 5, 9]) {
      for (const temperature of [12, 22, 31]) {
        const insight = buildCareInsight({
          painLevel,
          temperature,
          humidity: 50,
          trend: "stable",
        });
        const text = [
          insight.title,
          insight.message,
          ...insight.suggestions,
        ].join(" ");
        expect(text).not.toMatch(COLD_THERAPY);
      }
    }
  });

  it("recommends a warm compress or warm bath for severe flares", () => {
    const insight = buildCareInsight({
      painLevel: 9,
      temperature: 22,
      humidity: 50,
      trend: "stable",
    });
    expect(insight.suggestions.join(" ")).toMatch(
      /warm compress or a warm bath/i
    );
  });

  it("keeps EN and AR insight suggestions warm and synced", () => {
    const key = "careInsight.suggest.severe.2" as TranslationKey;
    const en = translations.en[key];
    const ar = translations.ar[key];
    expect(en).toMatch(/warm compress|warm bath/i);
    expect(en).not.toMatch(COLD_THERAPY);
    expect(ar).toMatch(/كمادة دافئة|حماما? دافئ/);
    expect(ar).not.toMatch(COLD_THERAPY);
    expect(ar).toContain("تشنج العضلات");
  });

  it("sanitizes cold-therapy phrases out of generated output fields", () => {
    // The engine routes every generated field through sanitizeWarmTherapy,
    // so even a future copy regression cannot ship cold advice.
    const insight = buildCareInsight({
      painLevel: 9,
      temperature: 22,
      humidity: 50,
      trend: "stable",
    });
    for (const field of [insight.title, insight.message, ...insight.suggestions]) {
      expect(field).toBe(sanitizeWarmTherapy(field));
    }
  });
});
