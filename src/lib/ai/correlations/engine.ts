/**
 * Deterministic weather–symptom correlation analytics.
 *
 * Pure functions: daily pain series + daily weather series in, Pearson
 * correlations and proactive insights out. No LLM, no network — the LLM can
 * later narrate these numbers, but it may never compute them.
 */

import {
  proactiveInsightSchema,
  weatherCorrelationSchema,
  weatherSymptomAnalysisSchema,
  type ProactiveInsight,
  type WeatherCorrelation,
  type WeatherSymptomAnalysis,
} from "./types";

export interface DailyPainPoint {
  /** ISO date key `YYYY-MM-DD`. */
  date: string;
  /** Average pain that day, 0–10. */
  pain: number;
}

export interface DailyWeatherPoint {
  date: string;
  humidity: number;
  pressure: number;
  temperature: number;
}

const MIN_SAMPLE_DAYS = 6;

/** Pearson correlation coefficient; 0 for tiny/constant samples. */
export function pearson(xs: number[], ys: number[]): number {
  const n = Math.min(xs.length, ys.length);
  if (n < 3) return 0;
  let sx = 0;
  let sy = 0;
  for (let i = 0; i < n; i++) {
    sx += xs[i];
    sy += ys[i];
  }
  const mx = sx / n;
  const my = sy / n;
  let num = 0;
  let dx = 0;
  let dy = 0;
  for (let i = 0; i < n; i++) {
    const a = xs[i] - mx;
    const b = ys[i] - my;
    num += a * b;
    dx += a * a;
    dy += b * b;
  }
  if (dx === 0 || dy === 0) return 0;
  return Math.max(-1, Math.min(1, num / Math.sqrt(dx * dy)));
}

function strengthOf(absR: number): WeatherCorrelation["strength"] {
  if (absR > 0.6) return "strong";
  if (absR > 0.4) return "moderate";
  if (absR > 0.2) return "weak";
  return "negligible";
}

function joinSeries(
  pain: DailyPainPoint[],
  weather: DailyWeatherPoint[]
): Array<{ pain: number; weather: DailyWeatherPoint & { nextPain: number | null } }> {
  const painByDate = new Map(pain.map((p) => [p.date, p.pain]));
  const dates = new Set([...painByDate.keys()]);
  const result: Array<{ pain: number; weather: DailyWeatherPoint & { nextPain: number | null } }> = [];
  for (const w of weather) {
    if (!dates.has(w.date)) continue;
    // Lag-1: next calendar day's pain, so "pressure dropped yesterday" can
    // explain "flare today".
    const next = new Date(new Date(`${w.date}T00:00:00`).getTime() + 86_400_000);
    const nextKey = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}-${String(
      next.getDate()
    ).padStart(2, "0")}`;
    result.push({
      pain: painByDate.get(w.date)!,
      weather: { ...w, nextPain: painByDate.get(nextKey) ?? null },
    });
  }
  return result;
}

/** Correlate each weather metric against same-day (and lag-1) pain. */
export function analyzeCorrelations(
  pain: DailyPainPoint[],
  weather: DailyWeatherPoint[]
): WeatherCorrelation[] {
  const joined = joinSeries(pain, weather);
  const metrics = ["humidity", "pressure", "temperature"] as const;

  return metrics.map((metric) => {
    const sameDay = pearson(
      joined.map((j) => j.weather[metric]),
      joined.map((j) => j.pain)
    );
    const laggedPairs = joined.filter((j) => j.weather.nextPain !== null);
    const laggedR = pearson(
      laggedPairs.map((j) => j.weather[metric]),
      laggedPairs.map((j) => j.weather.nextPain as number)
    );
    // Prefer the lag-1 coefficient when it is clearly the stronger signal.
    const useLagged = Math.abs(laggedR) > Math.abs(sameDay) + 0.15;
    const coefficient = useLagged ? laggedR : sameDay;
    const sampleDays = useLagged ? laggedPairs.length : joined.length;
    const absR = Math.abs(coefficient);

    return weatherCorrelationSchema.parse({
      metric,
      coefficient: Math.round(coefficient * 1000) / 1000,
      sampleDays,
      strength: sampleDays >= MIN_SAMPLE_DAYS ? strengthOf(absR) : "negligible",
      direction:
        sampleDays < MIN_SAMPLE_DAYS || absR <= 0.2
          ? "none"
          : coefficient > 0
            ? "pain-increasing"
            : "pain-decreasing",
      lagged: useLagged,
    });
  });
}

export interface CurrentConditions {
  humidity: number;
  pressure: number;
  temperature: number;
}

/** Baseline = the mean of the joined weather series (the user's recent normal). */
function baselineOf(weather: DailyWeatherPoint[], key: keyof DailyWeatherPoint): number {
  if (weather.length === 0) return key === "humidity" ? 50 : key === "pressure" ? 1013 : 20;
  return weather.reduce((s, w) => s + (w[key] as number), 0) / weather.length;
}

/**
 * Turn current conditions + the user's personal correlations into proactive
 * guidance for today. Each insight is grounded in a computed deviation from
 * the user's own 30-day baseline — never a generic weather claim.
 */
export function buildProactiveInsights(
  current: CurrentConditions,
  correlations: WeatherCorrelation[],
  weatherHistory: DailyWeatherPoint[]
): ProactiveInsight[] {
  const insights: Array<Record<string, unknown>> = [];
  const byMetric = new Map(correlations.map((c) => [c.metric, c]));

  const humBase = baselineOf(weatherHistory, "humidity");
  const humDeltaPct = humBase > 0 ? ((current.humidity - humBase) / humBase) * 100 : 0;
  const humCorr = byMetric.get("humidity");
  const humMatters =
    humCorr?.direction === "pain-increasing" && humCorr.strength !== "negligible";

  if (humDeltaPct >= 10 && humMatters) {
    insights.push({
      id: "humidity-spike",
      severity: humDeltaPct >= 20 ? "high" : "watch",
      headline: `Humidity is up ${Math.round(humDeltaPct)}% versus your recent normal`,
      detail:
        `Your own logs show higher humidity tracks with more pain for you ` +
        `(r=${humCorr!.coefficient.toFixed(2)}${humCorr!.lagged ? ", with a 1-day delay" : ""}). ` +
        `Today's ${Math.round(current.humidity)}% is well above your ${Math.round(humBase)}% baseline.`,
      recommendation:
        "Consider reducing physical load today: postpone heavy tasks, take more rest breaks, and keep your space cool and dry.",
    });
  }

  const presBase = baselineOf(weatherHistory, "pressure");
  const presDrop = presBase - current.pressure;
  const presCorr = byMetric.get("pressure");
  if (presDrop >= 6 && presCorr?.direction === "pain-decreasing") {
    // negative r with pressure → LOWER pressure means HIGHER pain
    insights.push({
      id: "pressure-drop",
      severity: presDrop >= 12 ? "high" : "watch",
      headline: `Barometric pressure dropped ${Math.round(presDrop)} hPa`,
      detail:
        `Falling pressure is one of your personal pain triggers ` +
        `(r=${presCorr!.coefficient.toFixed(2)}${presCorr!.lagged ? ", lagged by a day" : ""}). ` +
        `A drop this size has historically preceded tougher days in your logs.`,
      recommendation:
        "Front-load gentle activity early, keep afternoon plans flexible, and have your flare comfort measures ready.",
    });
  }

  const tempBase = baselineOf(weatherHistory, "temperature");
  const tempCorr = byMetric.get("temperature");
  const tempCold = tempBase - current.temperature;
  if (tempCold >= 5 && tempCorr?.direction === "pain-decreasing") {
    insights.push({
      id: "cold-snap",
      severity: tempCold >= 10 ? "high" : "watch",
      headline: `It's ${Math.round(tempCold)}°C colder than your recent normal`,
      detail:
        `In your logs, colder days have lined up with higher pain ` +
        `(r=${tempCorr!.coefficient.toFixed(2)}). Cold can also tighten muscles on waking.`,
      recommendation:
        "Layer up warmly, warm up slowly before any movement, and consider a warm shower or heat pad for stiff areas.",
    });
  }

  if (insights.length === 0) {
    insights.push({
      id: "weather-calm",
      severity: "info",
      headline: "Weather looks unremarkable for you today",
      detail:
        `Conditions (humidity ${Math.round(current.humidity)}%, ` +
        `${Math.round(current.pressure)} hPa, ${Math.round(current.temperature)}°C) are close to your recent baseline` +
        (correlations.every((c) => c.strength === "negligible")
          ? ", and no weather metric shows a consistent personal link with your pain yet."
          : ", and none of your personal weather triggers are active."),
      recommendation:
        "A steady-weather day is a good day for gentle, graded activity — your normal pacing plan applies.",
    });
  }

  return insights.map((i) => proactiveInsightSchema.parse(i));
}

/** Full analysis: correlations + today's proactive insights. */
export function runWeatherSymptomAnalysis(
  pain: DailyPainPoint[],
  weatherHistory: DailyWeatherPoint[],
  current: CurrentConditions,
  weatherSource: "live" | "estimated"
): WeatherSymptomAnalysis {
  const correlations = analyzeCorrelations(pain, weatherHistory);
  const insights = buildProactiveInsights(current, correlations, weatherHistory);
  const sampleDays = new Set(pain.map((p) => p.date)).size;
  return weatherSymptomAnalysisSchema.parse({
    correlations,
    insights,
    sampleDays,
    weatherSource,
  });
}
