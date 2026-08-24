import { NextResponse } from "next/server";
import { TtlCache } from "@/lib/ai/cache";
import {
  computePressureTrend,
  detectWeatherTriggers,
  deterministicWeather,
  mapOpenWeatherPayload,
  type PressureReading,
  type WeatherData,
  type WeatherTriggerId,
} from "@/lib/weather";

export const dynamic = "force-dynamic";

export interface WeatherApiResponse {
  source: "live" | "fallback";
  weather: WeatherData;
  location?: string;
  note?: string;
  /** Fibromyalgia-relevant triggers for the dashboard card and AI insights. */
  triggers: WeatherTriggerId[];
  /** Barometric movement vs the previous live reading (live mode only). */
  pressureTrend?: PressureReading;
}

const OPENWEATHER_URL = "https://api.openweathermap.org/data/2.5/weather";
/** OpenWeather free tier updates every ~10 min; cache to stay well inside it. */
const CACHE_TTL_MS = 10 * 60 * 1000;

/** Response cache keyed by location — protects the upstream quota. */
const weatherCache = new TtlCache<WeatherApiResponse>(CACHE_TTL_MS);

/**
 * Last live pressure per location, feeding the short-horizon
 * falling/steady/rising delta. In-process by design: it resets harmlessly on
 * server restart and the UI treats a missing previous reading as steady.
 */
const lastPressureByLocation = new Map<string, number>();

function fallback(city: string): WeatherApiResponse {
  const weather = deterministicWeather(new Date());
  return {
    source: "fallback",
    weather,
    location: city,
    note: "Weather API key not configured — using estimated values.",
    triggers: detectWeatherTriggers(weather),
  };
}

/** Validate optional ?lat=&lon= query params (client geolocation). */
function parseCoordinates(request: Request): { lat: number; lon: number } | null {
  const url = new URL(request.url);
  const lat = Number.parseFloat(url.searchParams.get("lat") ?? "");
  const lon = Number.parseFloat(url.searchParams.get("lon") ?? "");
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  if (Math.abs(lat) > 90 || Math.abs(lon) > 180) return null;
  return { lat, lon };
}

async function fetchLive(
  request: Request,
  apiKey: string
): Promise<WeatherApiResponse> {
  const city = process.env.OPENWEATHER_CITY?.trim() || "London";
  const coords = parseCoordinates(request);
  const key = locationKey(coords);
  const query = coords
    ? `lat=${coords.lat}&lon=${coords.lon}`
    : `q=${encodeURIComponent(city)}`;
  const url = `${OPENWEATHER_URL}?${query}&units=metric&appid=${apiKey}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    return {
      ...fallback(city),
      note: `Weather service unavailable (${res.status}). Using estimated values.`,
    };
  }

  const data = await res.json();
  const weather = mapOpenWeatherPayload(data);

  // Barometric trend vs the previous live reading for this location.
  const pressureTrend = computePressureTrend(
    weather.pressure,
    lastPressureByLocation.get(key)
  );
  lastPressureByLocation.set(key, weather.pressure);

  return {
    source: "live",
    weather,
    location:
      typeof data.name === "string" && data.name.length > 0 ? data.name : city,
    triggers: detectWeatherTriggers(weather, pressureTrend),
    pressureTrend,
  };
}

function locationKey(coords: { lat: number; lon: number } | null): string {
  if (coords) return `${coords.lat.toFixed(2)},${coords.lon.toFixed(2)}`;
  return `city:${process.env.OPENWEATHER_CITY?.trim() || "London"}`;
}

/**
 * GET /api/weather[?lat=&lon=]
 *
 * Proxy to the OpenWeather current-weather endpoint (or explicit client
 * coordinates). Keeps the API key server-side, caches responses for 10
 * minutes per location, tracks the barometric trend between consecutive
 * live readings, and detects fibromyalgia-relevant weather triggers. Falls
 * back to deterministic estimated weather when no key is configured or the
 * upstream call fails, so the dashboard always renders usable weather.
 */
export async function GET(request: Request) {
  if (!process.env.OPENWEATHER_API_KEY?.trim()) {
    const city = process.env.OPENWEATHER_CITY?.trim() || "London";
    return NextResponse.json(fallback(city));
  }

  try {
    const apiKey = process.env.OPENWEATHER_API_KEY.trim();
    const payload = await weatherCache.getOrSet(
      locationKey(parseCoordinates(request)),
      () => fetchLive(request, apiKey)
    );
    return NextResponse.json(payload);
  } catch (error) {
    console.error("[weather] OpenWeather fetch failed:", error);
    const city = process.env.OPENWEATHER_CITY?.trim() || "London";
    return NextResponse.json(fallback(city));
  }
}
