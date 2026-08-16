export interface WeatherData {
  temperature: number;
  humidity: number;
  pressure: number;
  condition: "sunny" | "cloudy" | "rainy";
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