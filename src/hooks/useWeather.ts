"use client";

import { useEffect, useState } from "react";
import { deterministicWeather, type WeatherData } from "@/lib/weather";

export interface LiveWeather {
  source: "live" | "fallback";
  weather: WeatherData;
  location?: string;
  note?: string;
}

/**
 * Fetches live weather through the server proxy (/api/weather), which keeps
 * the OpenWeather key server-side. Renders deterministic estimated weather
 * immediately for stable SSR/hydration, then swaps in the live response when
 * it arrives. Stays on the fallback if the API is unconfigured or down.
 */
export function useWeather(): LiveWeather {
  const [state, setState] = useState<LiveWeather>(() => ({
    source: "fallback",
    weather: deterministicWeather(new Date()),
  }));

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/weather", { cache: "no-store" });
        const data = (await res.json()) as LiveWeather;
        if (!cancelled && data?.weather) {
          setState(data);
        }
      } catch (error) {
        console.error("[weather] fetch failed, using fallback:", error);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}