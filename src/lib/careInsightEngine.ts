/**
 * Pure, deterministic care-insight engine.
 *
 * Combines the active flare state (derived from the latest pain level) with
 * the day's environmental context (temperature + humidity) and a short
 * time-series signal (7-day pain trend) into an empathetic, actionable
 * recommendation. Kept side-effect free so it can be unit-tested in
 * isolation and shared between the AI Care Insight card and any backend
 * summarizer without an AI round-trip.
 */

export type FlareState = "calm" | "mild" | "severe";
export type PainTrend = "rising" | "stable" | "falling";
export type ComfortLevel = "hot" | "comfortable" | "cool";
export type HumidityLevel = "humid" | "moderate" | "dry";

export interface CareInsightInput {
  /** Latest pain level on the 0–10 scale. */
  painLevel: number;
  /** Ambient temperature in °C. */
  temperature: number;
  /** Relative humidity in %. */
  humidity: number;
  /** 7-day pain trend derived from recent logs. */
  trend: PainTrend;
}

export interface CareInsight {
  flareState: FlareState;
  comfort: ComfortLevel;
  humidity: HumidityLevel;
  /** Empathetic headline shown in the card. */
  title: string;
  /** One-sentence, non-alarmist explanation. */
  message: string;
  /** Three concrete, gentle actions. */
  suggestions: string[];
}

export function getFlareState(painLevel: number): FlareState {
  if (painLevel >= 7) return "severe";
  if (painLevel >= 4) return "mild";
  return "calm";
}

export function getComfort(temperature: number): ComfortLevel {
  if (temperature >= 28) return "hot";
  if (temperature <= 17) return "cool";
  return "comfortable";
}

export function getHumidityLevel(humidity: number): HumidityLevel {
  if (humidity >= 70) return "humid";
  if (humidity <= 35) return "dry";
  return "moderate";
}

/** Rough 7-day direction: falling when the most recent days trend down. */
export function getPainTrend(points: Array<{ level: number }>): PainTrend {
  if (points.length < 2) return "stable";
  const recent = points.slice(-3);
  const earlier = points.slice(0, -3);
  if (earlier.length === 0) return "stable";
  const recentAvg = recent.reduce((s, p) => s + p.level, 0) / recent.length;
  const earlierAvg =
    earlier.reduce((s, p) => s + p.level, 0) / earlier.length;
  const delta = recentAvg - earlierAvg;
  if (delta >= 0.5) return "rising";
  if (delta <= -0.5) return "falling";
  return "stable";
}

const TREND_NOTE: Record<PainTrend, string> = {
  rising: "Your pain has been gently trending up this week, so pacing matters more than usual today.",
  falling: "Your pain has been easing over recent days — a good moment for light, careful movement.",
  stable: "Your pain has been steady this week.",
};

function heatMessage(flare: FlareState): string {
  switch (flare) {
    case "severe":
      return "Heat and inflammation can make flare pain harder to manage. Keep the room cool and give your body extra rest.";
    case "mild":
      return "The heat can amplify achiness at your level. Staying cool and hydrated now can keep discomfort from climbing.";
    default:
      return "Today's warmth is mild enough to stay comfortable — just keep water close and avoid the midday sun.";
  }
}

function humidityMessage(level: HumidityLevel, flare: FlareState): string {
  if (level === "humid") {
    return flare === "severe"
      ? "High humidity can press on sensitive joints. A dehumidifier or fan in your space can make the room feel gentler."
      : "The air is humid today, which can add a heavy feeling. Light layers and airflow help.";
  }
  if (level === "dry") {
    return "Very dry air can irritate skin and sinuses. A little extra water and a humidifier keep things comfortable.";
  }
  return "Humidity is in a comfortable range today.";
}

export function buildCareInsight(input: CareInsightInput): CareInsight {
  const flare = getFlareState(input.painLevel);
  const comfort = getComfort(input.temperature);
  const humidity = getHumidityLevel(input.humidity);

  const isHeatFactor = comfort === "hot" || humidity === "humid";

  let title: string;
  if (flare === "severe") {
    title = isHeatFactor
      ? "A flare day with heat — let's protect your calm"
      : "A flare day — keep your support close";
  } else if (flare === "mild") {
    title = isHeatFactor
      ? "Mild discomfort with heat — small steps help"
      : "Mild discomfort — gentle care goes a long way";
  } else {
    title = isHeatFactor
      ? "Calm day, warm weather — maintain your rhythm"
      : "A steady, calm day — nurture it";
  }

  const messages: string[] = [];
  messages.push(heatMessage(flare));
  messages.push(humidityMessage(humidity, flare));
  messages.push(TREND_NOTE[input.trend]);

  let suggestions: string[];
  if (flare === "severe") {
    suggestions = [
      "Rest in a cool, low-light room and limit activity to essential tasks.",
      "Try a cool compress on tense areas and hydrate steadily.",
      "Switch on Calming Mode for 3 minutes of slow breathing.",
    ];
  } else if (flare === "mild") {
    suggestions = [
      "Take a short gentle walk or do light stretching to keep circulation moving.",
      "Keep water nearby and pace tasks with a small break between them.",
      "Note how your body responds so tomorrow's check-in is easier.",
    ];
  } else {
    suggestions = [
      "Keep your usual gentle routine and stay hydrated.",
      "Spend a few quiet minutes outdoors while the weather supports it.",
      "Stay consistent with logging — patterns become clearer every day.",
    ];
  }

  return {
    flareState: flare,
    comfort,
    humidity,
    title,
    message: messages.join(" "),
    suggestions,
  };
}
