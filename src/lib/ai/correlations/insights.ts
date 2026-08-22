/**
 * Server-side adapter: pulls the user's 30-day logs and a weather series,
 * then runs the pure correlation engine.
 *
 * Weather history: FibroCare does not persist weather, so the past series is
 * the deterministic per-day estimate (stable per calendar date — the same
 * source the dashboard uses offline). Today's conditions use the live
 * OpenWeather feed when a key is configured, otherwise the same estimate —
 * and `weatherSource` reports which, honestly.
 */

import { prisma } from "@/lib/prisma";
import { deterministicWeather } from "@/lib/weather";
import {
  runWeatherSymptomAnalysis,
  type DailyPainPoint,
  type DailyWeatherPoint,
} from "./engine";
import type { WeatherSymptomAnalysis } from "./types";

const DAY_MS = 24 * 60 * 60 * 1000;

function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

async function fetchCurrentConditions(): Promise<{
  conditions: { humidity: number; pressure: number; temperature: number };
  source: "live" | "estimated";
}> {
  const apiKey = process.env.OPENWEATHER_API_KEY?.trim();
  const city = process.env.OPENWEATHER_CITY?.trim() || "London";
  if (apiKey) {
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
        city
      )}&units=metric&appid=${apiKey}`;
      const res = await fetch(url, {
        cache: "no-store",
        signal: AbortSignal.timeout(2500),
      });
      if (res.ok) {
        const data = await res.json();
        const main = data?.main as
          | { temp?: number; humidity?: number; pressure?: number }
          | undefined;
        if (
          main &&
          typeof main.temp === "number" &&
          typeof main.humidity === "number" &&
          typeof main.pressure === "number"
        ) {
          return {
            conditions: {
              temperature: main.temp,
              humidity: main.humidity,
              pressure: main.pressure,
            },
            source: "live",
          };
        }
      }
    } catch {
      // fall through to the labeled estimate
    }
  }
  const est = deterministicWeather(new Date());
  return {
    conditions: {
      temperature: est.temperature,
      humidity: est.humidity,
      pressure: est.pressure,
    },
    source: "estimated",
  };
}

/** Build the full weather–symptom analysis for a user (30-day window). */
export async function getWeatherSymptomAnalysis(
  userId: string
): Promise<WeatherSymptomAnalysis> {
  const since = new Date(Date.now() - 30 * DAY_MS);
  const [logs, current] = await Promise.all([
    prisma.painLog.findMany({
      where: { userId, loggedAt: { gte: since } },
      select: { painLevel: true, loggedAt: true },
    }),
    fetchCurrentConditions(),
  ]);

  // Daily average pain series.
  const acc = new Map<string, { sum: number; count: number }>();
  for (const log of logs) {
    const key = toDateKey(log.loggedAt);
    const entry = acc.get(key) ?? { sum: 0, count: 0 };
    entry.sum += log.painLevel;
    entry.count += 1;
    acc.set(key, entry);
  }
  const pain: DailyPainPoint[] = [...acc.entries()]
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([date, v]) => ({ date, pain: v.sum / v.count }));

  // Deterministic daily weather for every logged day (covers the whole window).
  const weather: DailyWeatherPoint[] = pain.map((p) => {
    const w = deterministicWeather(new Date(`${p.date}T12:00:00`));
    return { date: p.date, humidity: w.humidity, pressure: w.pressure, temperature: w.temperature };
  });

  return runWeatherSymptomAnalysis(
    pain,
    weather,
    current.conditions,
    current.source
  );
}
