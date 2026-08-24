export interface WeatherData {
  temperature: number;
  humidity: number;
  pressure: number;
  condition: "sunny" | "cloudy" | "rainy";
}

/** Direction of barometric change between the two most recent readings. */
export type BarometricTrend = "falling" | "steady" | "rising";

export interface PressureReading {
  trend: BarometricTrend;
  /** Signed hPa delta vs the previous reading (rounded). */
  deltaHpa: number;
}

/** Fibromyalgia-relevant weather triggers detected from current conditions. */
export type WeatherTriggerId =
  | "pressure-drop"
  | "pressure-low"
  | "humidity-high"
  | "heat-extreme"
  | "cold-extreme"
  | "calm";

/**
 * Compare the current pressure against the previous stored reading.
 * A ≥2 hPa move between consecutive samples (minutes-to-hours apart) is a
 * meaningful, symptom-relevant shift; anything smaller reads as steady.
 */
export function computePressureTrend(
  currentPressure: number,
  previousPressure: number | null | undefined
): PressureReading {
  if (
    typeof previousPressure !== "number" ||
    !Number.isFinite(previousPressure)
  ) {
    return { trend: "steady", deltaHpa: 0 };
  }
  const deltaHpa = Math.round(currentPressure - previousPressure);
  if (deltaHpa <= -2) return { trend: "falling", deltaHpa };
  if (deltaHpa >= 2) return { trend: "rising", deltaHpa };
  return { trend: "steady", deltaHpa };
}

/**
 * Pure trigger detection over the current reading (+ optional pressure
 * trend). Thresholds align with the app's existing engines: humidity ≥70%
 * matches `getHumidityLevel`, heat/cold use absolute comfort extremes, and
 * low pressure follows the widget's sub-1010 hPa band with a stricter floor.
 */
export function detectWeatherTriggers(
  weather: WeatherData,
  pressure?: PressureReading
): WeatherTriggerId[] {
  const triggers: WeatherTriggerId[] = [];
  if (pressure?.trend === "falling") triggers.push("pressure-drop");
  if (weather.pressure < 1005) triggers.push("pressure-low");
  if (weather.humidity >= 70) triggers.push("humidity-high");
  if (weather.temperature >= 32) triggers.push("heat-extreme");
  if (weather.temperature <= 5) triggers.push("cold-extreme");
  return triggers.length > 0 ? triggers : ["calm"];
}

function hashSeed(key: string): number {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Deterministic per-(day, 8-hour-bucket) weather used as the offline
 * fallback. Seeded from the calendar date so every consumer renders the
 * same values, which keeps SSR, hydration and the AI Care Insight card in
 * agreement and avoids client/server mismatches when the weather API is not
 * configured or unreachable.
 */
export function deterministicWeather(now: Date): WeatherData {
  const hour = now.getHours();
  const bucket = Math.floor(hour / 8);
  const seed = hashSeed(
    `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${bucket}`
  );
  const rnd = mulberry32(seed);
  const baseTemp = hour < 12 ? 18 : hour < 18 ? 24 : 20;
  const temperature = baseTemp + Math.floor(rnd() * 5);
  const humidity = 45 + Math.floor(rnd() * 30);
  const pressure = 1008 + Math.floor(rnd() * 22);
  const conditions: WeatherData["condition"][] = ["sunny", "cloudy", "rainy"];
  const condition = conditions[Math.floor(hour / 8) % 3];

  return { temperature, humidity, pressure, condition };
}

/**
 * Normalizes the OpenWeather current-weather payload into the app's compact
 * `WeatherData` shape. Unknown conditions collapse to "cloudy" so the UI
 * never has to handle an unexpected enum value.
 */
export function mapOpenWeatherPayload(data: {
  main?: { temp?: number; humidity?: number; pressure?: number };
  weather?: Array<{ id?: number }>;
}): WeatherData {
  const id = data.weather?.[0]?.id ?? 800;
  let condition: WeatherData["condition"] = "cloudy";
  if (id === 800) condition = "sunny";
  else if ((id >= 200 && id < 300) || (id >= 300 && id < 600))
    condition = "rainy";
  else if (id >= 600 && id < 700) condition = "cloudy";

  return {
    temperature: Math.round(data.main?.temp ?? 18),
    humidity: Math.round(data.main?.humidity ?? 50),
    pressure: Math.round(data.main?.pressure ?? 1013),
    condition,
  };
}