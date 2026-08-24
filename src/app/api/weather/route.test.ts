// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";
import { translations } from "@/lib/translations";

/** Minimal OpenWeather current-weather payload for mapOpenWeatherPayload. */
const openWeatherOk = {
  name: "Riyadh",
  main: { temp: 33, humidity: 88, pressure: 1002 },
  weather: [{ id: 803 }],
};

function jsonResponse(
  status: number,
  body?: unknown
): {
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
} {
  return { ok: status < 400, status, json: async () => body ?? {} };
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("GET /api/weather", () => {
  it("returns an estimated fallback when no API key is configured", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("OPENWEATHER_API_KEY", "");
    vi.stubEnv("NEXT_PUBLIC_WEATHER_API_KEY", "");
    vi.stubEnv("OPENWEATHER_CITY", "NoKeyCity");

    const res = await GET(new Request("http://localhost/api/weather"));
    const data = await res.json();

    expect(data.source).toBe("fallback");
    expect(data.isEstimated).toBe(true);
    expect(String(data.note)).toMatch(/not configured/i);
    expect(Array.isArray(data.triggers)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("falls back to estimated data when OpenWeather rejects the key (401)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse(401))
    );
    vi.stubEnv("OPENWEATHER_API_KEY", "invalid-key");
    vi.stubEnv("OPENWEATHER_CITY", "RejectedKeyCity");

    const res = await GET(new Request("http://localhost/api/weather"));
    const data = await res.json();

    expect(data.source).toBe("fallback");
    expect(data.isEstimated).toBe(true);
    expect(String(data.note)).toContain("401");
  });

  it("serves live data with isEstimated false on success", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse(200, openWeatherOk))
    );
    // The NEXT_PUBLIC_ var must also work as a server-side key source.
    vi.stubEnv("OPENWEATHER_API_KEY", "");
    vi.stubEnv("NEXT_PUBLIC_WEATHER_API_KEY", "public-fallback-key");
    vi.stubEnv("OPENWEATHER_CITY", "LiveCity");

    const res = await GET(new Request("http://localhost/api/weather"));
    const data = await res.json();

    expect(data.source).toBe("live");
    expect(data.isEstimated).toBe(false);
    expect(data.location).toBe("Riyadh");
    expect(data.weather.temperature).toBe(33);
    expect(data.weather.humidity).toBe(88);
    expect(data.weather.pressure).toBe(1002);
    expect(data.weather.condition).toBe("cloudy");
    expect(Array.isArray(data.triggers)).toBe(true);
    expect(data.pressureTrend).toEqual({ trend: "steady", deltaHpa: 0 });
  });

  it("prefers OPENWEATHER_API_KEY over NEXT_PUBLIC_WEATHER_API_KEY", async () => {
    const fetchMock = vi.fn(
      async (_url: string | URL | Request) => jsonResponse(200, openWeatherOk)
    );
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("OPENWEATHER_API_KEY", "primary-secret-key");
    vi.stubEnv("NEXT_PUBLIC_WEATHER_API_KEY", "secondary-public-key");
    vi.stubEnv("OPENWEATHER_CITY", "PrecedenceCity");

    await GET(new Request("http://localhost/api/weather"));

    const calledUrl = String(fetchMock.mock.calls[0]?.[0]);
    expect(calledUrl).toContain("appid=primary-secret-key");
    expect(calledUrl).not.toContain("secondary-public-key");
  });
});

describe("weather widget translation keys", () => {
  it("exist in both locales with the required Arabic copy", () => {
    for (const key of ["today.triggers.neutral", "today.estimated"] as const) {
      expect(translations.en[key].length).toBeGreaterThan(0);
      expect(translations.ar[key].length).toBeGreaterThan(0);
    }
    expect(translations.ar["today.estimated"]).toBe(
      "قيم تقريبية (واجهة الطقس غير مهيأة)"
    );
    expect(translations.ar["today.triggers.neutral"]).toContain(
      "سجل أعراضك اليومية"
    );
  });
});
