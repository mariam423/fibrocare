import { NextResponse } from "next/server";
import {
  deterministicWeather,
  mapOpenWeatherPayload,
  type WeatherData,
} from "@/lib/weather";

export const dynamic = "force-dynamic";

export interface WeatherApiResponse {
  source: "live" | "fallback";
  weather: WeatherData;
  location?: string;
  note?: string;
}

const OPENWEATHER_URL = "https://api.openweathermap.org/data/2.5/weather";

function fallback(city: string): WeatherApiResponse {
  return {
    source: "fallback",
    weather: deterministicWeather(new Date()),
    location: city,
    note: "Weather API key not configured — using estimated values.",
  };
}

/**
 * GET /api/weather
 *
 * Proxy to the OpenWeather current-weather endpoint. Keeps the API key on
 * the server (never exposed to the client) and returns the same compact
 * `WeatherData` shape the rest of the app expects. Falls back to
 * deterministic estimated weather when no key is configured or the upstream
 * call fails, so the dashboard always renders usable weather.
 */
export async function GET() {
  const apiKey = process.env.OPENWEATHER_API_KEY?.trim();
  const city = process.env.OPENWEATHER_CITY?.trim() || "London";

  if (!apiKey) {
    return NextResponse.json(fallback(city));
  }

  try {
    const url = `${OPENWEATHER_URL}?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`;
    const res = await fetch(url, { cache: "no-store" });

    if (!res.ok) {
      return NextResponse.json(
        {
          ...fallback(city),
          note: `Weather service unavailable (${res.status}). Using estimated values.`,
        },
        { status: 200 }
      );
    }

    const data = await res.json();
    return NextResponse.json<WeatherApiResponse>({
      source: "live",
      weather: mapOpenWeatherPayload(data),
      location: typeof data.name === "string" ? data.name : city,
    });
  } catch (error) {
    console.error("[weather] OpenWeather fetch failed:", error);
    return NextResponse.json(fallback(city));
  }
}