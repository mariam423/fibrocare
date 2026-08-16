"use client";

import { useState } from "react";
import {
  deterministicWeather,
  type WeatherData,
} from "@/lib/weather";

export type { WeatherData };

/**
 * Deterministic per-(day, 8-hour-bucket) simulated weather.
 * Seeded from the calendar date so every consumer of this hook renders the
 * same values, which keeps the AI Care Insight card and Today's Context
 * widget in agreement and avoids client/server regeneration. Used as the
 * offline fallback when the OpenWeather API is not configured.
 */
export function useSimulatedWeather(): WeatherData {
  const [weather] = useState<WeatherData>(() => deterministicWeather(new Date()));
  return weather;
}