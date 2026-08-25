/**
 * AI Rescue Recommendation engine.
 *
 * Turns today's pain, remaining spoons, and live weather factors into a
 * quiet, single-action calming tip. Deterministic and fully offline-safe:
 * the same inputs always produce the same recommendation (rotating only by
 * an explicit `variant` counter for variety), and every string is a
 * translation key so the card renders 100% localized in EN and AR.
 */

import type { TranslationKey } from "@/lib/translations";
import type { WeatherTriggerId } from "@/lib/weather";

export interface RescueInput {
  /** Current pain intensity, 0–10 (clamped). */
  painLevel: number;
  /** Remaining spoons, 0–12 (clamped). */
  spoonsRemaining: number;
  /** Fibromyalgia-relevant weather triggers (e.g. from `/api/weather`). */
  weatherTriggers: WeatherTriggerId[];
  /** Rotating variety: increment per "generate" press for a fresh pick. */
  variant?: number;
}

export interface RescueRecommendation {
  /** The calming framing for today. */
  tipKey: TranslationKey;
  /** The single action to take right now. */
  actionKey: TranslationKey;
  /** Why this action helps (short rationale). */
  whyKey: TranslationKey;
}

type Candidate = RescueRecommendation;

const POOLS = {
  /** Pain ≥ 7 — flare territory: low stimulation + warmth. */
  flare: [
    {
      tipKey: "rescue.tip.flare.1",
      actionKey: "rescue.action.flare.1",
      whyKey: "rescue.why.flare.1",
    },
    {
      tipKey: "rescue.tip.flare.2",
      actionKey: "rescue.action.flare.2",
      whyKey: "rescue.why.flare.2",
    },
  ],
  /** Weather is pulling (pressure/humidity/heat/cold) — protect energy. */
  weather: [
    {
      tipKey: "rescue.tip.weather.1",
      actionKey: "rescue.action.weather.1",
      whyKey: "rescue.why.weather.1",
    },
    {
      tipKey: "rescue.tip.weather.2",
      actionKey: "rescue.action.weather.2",
      whyKey: "rescue.why.weather.2",
    },
  ],
  /** Moderate pain, neutral weather — protect the best hour. */
  moderate: [
    {
      tipKey: "rescue.tip.moderate.1",
      actionKey: "rescue.action.moderate.1",
      whyKey: "rescue.why.moderate.1",
    },
    {
      tipKey: "rescue.tip.moderate.2",
      actionKey: "rescue.action.moderate.2",
      whyKey: "rescue.why.moderate.2",
    },
  ],
  /** Almost out of energy — stillness beats accomplishment. */
  lowSpoons: [
    {
      tipKey: "rescue.tip.lowSpoons.1",
      actionKey: "rescue.action.lowSpoons.1",
      whyKey: "rescue.why.lowSpoons.1",
    },
    {
      tipKey: "rescue.tip.lowSpoons.2",
      actionKey: "rescue.action.lowSpoons.2",
      whyKey: "rescue.why.lowSpoons.2",
    },
  ],
  /** Calm conditions, low pain — one focused block. */
  calm: [
    {
      tipKey: "rescue.tip.calm.1",
      actionKey: "rescue.action.calm.1",
      whyKey: "rescue.why.calm.1",
    },
    {
      tipKey: "rescue.tip.calm.2",
      actionKey: "rescue.action.calm.2",
      whyKey: "rescue.why.calm.2",
    },
  ],
} as const satisfies Record<string, readonly Candidate[]>;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}

/**
 * Pick the recommendation pool for a state, then rotate within it by
 * `variant` (defaults to 0). Low spoons outranks everything — at that point
 * rest is the only caring answer — then flare, then weather stress.
 */
export function generateRescueRecommendation(input: RescueInput): RescueRecommendation {
  const pain = clamp(input.painLevel, 0, 10);
  const spoons = clamp(input.spoonsRemaining, 0, 12);
  const variant = Math.max(0, Math.floor(input.variant ?? 0));
  const weatherStressed = input.weatherTriggers.some((trigger) => trigger !== "calm");

  let pool: readonly Candidate[];
  if (spoons <= 2) pool = POOLS.lowSpoons;
  else if (pain >= 7) pool = POOLS.flare;
  else if (weatherStressed) pool = POOLS.weather;
  else if (pain >= 4) pool = POOLS.moderate;
  else pool = POOLS.calm;

  const pick = pool[variant % pool.length];
  return { tipKey: pick.tipKey, actionKey: pick.actionKey, whyKey: pick.whyKey };
}
