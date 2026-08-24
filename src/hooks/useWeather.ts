"use client";

import { useEffect, useState } from "react";
import {
  detectWeatherTriggers,
  deterministicWeather,
  type PressureReading,
  type WeatherData,
  type WeatherTriggerId,
} from "@/lib/weather";

export interface LiveWeather {
  source: "live" | "fallback";
  /** True when the payload is a deterministic estimate, not live data. */
  isEstimated: boolean;
  weather: WeatherData;
  location?: string;
  note?: string;
  /** Fibromyalgia-relevant weather triggers detected server-side. */
  triggers: WeatherTriggerId[];
  /** Barometric movement vs the previous live reading (live mode only). */
  pressureTrend?: PressureReading;
}

/**
 * Fetches live weather through the server proxy (/api/weather), which keeps
 * the OpenWeather key server-side and caches upstream calls. Renders
 * deterministic estimated weather immediately for stable SSR/hydration,
 * then swaps in the live response when it arrives. Stays on the fallback if
 * the API is unconfigured or down.
 */
export function useWeather(): LiveWeather {
  const [state, setState] = useState<LiveWeather>(() => {
    const weather = deterministicWeather(new Date());
    return {
      source: "fallback",
      isEstimated: true,
      weather,
      triggers: detectWeatherTriggers(weather),
    };
  });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/weather", { cache: "no-store" });
        const data = (await res.json()) as Partial<LiveWeather>;
        if (!cancelled && data?.weather) {
          const source = data.source === "live" ? "live" : "fallback";
          setState({
            source,
            // Older cached payloads may lack the flag — derive from source.
            isEstimated: data.isEstimated ?? source !== "live",
            weather: data.weather,
            location: data.location,
            note: data.note,
            // Older cached payloads may lack triggers — derive client-side.
            triggers:
              data.triggers ?? detectWeatherTriggers(data.weather, data.pressureTrend),
            pressureTrend: data.pressureTrend,
          });
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