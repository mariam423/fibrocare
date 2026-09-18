/**
 * Fibro-Dietary trigger matching engine.
 *
 * Pure, deterministic functions shared between the client (real-time smart
 * warnings while typing a meal) and the server (warning snapshot + personal
 * trigger list). No I/O — every input is passed in, so it is trivially
 * testable and safe to run on either side of the wire.
 *
 * Warnings are advisory, not diagnostic: they combine the patient's own
 * personal trigger list with a small set of known inflammatory food groups
 * (gluten, dairy, refined sugar, fried, processed, alcohol, caffeine).
 */

import type { TranslationKey } from "@/lib/translations";

/* ------------------------------------------------------------------ */
/* Known inflammatory food groups                                       */
/* ------------------------------------------------------------------ */

export interface InflammatoryTrigger {
  /** Stable id — pump into translation keys: `diet.warn.known.{id}`. */
  id: string;
  keywords: string[];
}

export const KNOWN_INFLAMMATORY_TRIGGERS: InflammatoryTrigger[] = [
  {
    id: "gluten",
    keywords: [
      "gluten",
      "wheat",
      "bread",
      "pasta",
      "noodle",
      "bagel",
      "couscous",
      "barley",
      "rye",
      "spelt",
    ],
  },
  {
    id: "dairy",
    keywords: [
      "dairy",
      "milk",
      "cheese",
      "yogurt",
      "yoghurt",
      "butter",
      "cream",
      "whey",
      "ghee",
      "ice cream",
    ],
  },
  {
    id: "sugar",
    keywords: [
      "sugar",
      "syrup",
      "soda",
      "sweet",
      "candy",
      "dessert",
      "cake",
      "cookie",
      "pastry",
      "chocolate",
    ],
  },
  {
    id: "fried",
    keywords: ["fried", "fries", "battered", "crispy", "tempura"],
  },
  {
    id: "processed",
    keywords: [
      "processed",
      "nugget",
      "sausage",
      "bacon",
      "hot dog",
      "deli",
      "instant",
      "frozen meal",
      "microwave meal",
      "fast food",
      "chips",
    ],
  },
  {
    id: "alcohol",
    keywords: ["alcohol", "beer", "wine", "whiskey", "whisky", "rum", "vodka", "cocktail"],
  },
  {
    id: "caffeine",
    keywords: ["caffeine", "coffee", "espresso", "cola", "energy drink", "black tea"],
  },
];

/* ------------------------------------------------------------------ */
/* Matching helpers                                                     */
/* ------------------------------------------------------------------ */

/** Normalize a food / trigger name for case-insensitive substring matching. */
export function normalizeFoodName(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[.,;:!?'"()[\]{}]+$/g, "")
    .replace(/\s+/g, " ");
}

/**
 * Whether a keyword hit is just a "-free"/"free from" qualifier, e.g.
 * "gluten-free bread" or "dairy-free yogurt" should never warn.
 */
function isQualifiedAway(name: string, keyword: string): boolean {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`${escaped}\\s*(?:-|\\s+)?\\s*free`).test(name);
}

/** Whether any keyword matches the given (normalized) food name. */
export function matchesKeywords(name: string, keywords: string[]): boolean {
  return keywords.some((kw) => {
    if (!kw) return false;
    if (name.includes(kw)) return !isQualifiedAway(name, kw);
    return kw.includes(name);
  });
}

/* ------------------------------------------------------------------ */
/* Match results                                                       */
/* ------------------------------------------------------------------ */

export interface PersonalTriggerMatch {
  kind: "personal";
  id: string;
  /** The patient's own trigger label (plain text, as saved). */
  label: string;
  severity: number;
  matchedFood: string;
}

export interface KnownTriggerMatch {
  kind: "known";
  id: string;
  /** Stable key for the category label. */
  labelKey: TranslationKey;
  matchedFood: string;
}

export type TriggerMatch = PersonalTriggerMatch | KnownTriggerMatch;

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

/** Personal list item shape expected by the matcher (server rows / UI). */
export interface PersonalTriggerItem {
  id: string;
  name: string;
  severity: number;
}

/**
 * Match foods against the patient's personal trigger list. Both directions
 * (food contains trigger / trigger contains food) so "cheddar cheese" and
 * "cheese" still collide, but only when the name is meaningful.
 */
export function matchPersonalTriggers(
  foods: string[],
  personalTriggers: PersonalTriggerItem[]
): PersonalTriggerMatch[] {
  const normalizedFoods = foods.map(normalizeFoodName).filter(Boolean);
  const seen = new Set<string>();
  const matched: PersonalTriggerMatch[] = [];

  for (const trigger of personalTriggers) {
    const triggerName = normalizeFoodName(trigger.name);
    if (!triggerName) continue;
    for (const food of normalizedFoods) {
      if (!triggerName || food.length < 1) continue;
      if (matchesKeywords(food, [triggerName])) {
        const key = `${trigger.id}:${food}`;
        if (seen.has(key)) continue;
        seen.add(key);
        matched.push({
          kind: "personal",
          id: trigger.id,
          label: trigger.name,
          severity: trigger.severity,
          matchedFood: food,
        });
      }
    }
  }
  return matched;
}

/**
 * Match foods against the known set of inflammatory groups. One match per
 * category (first food wins) so the warning stays compact.
 */
export function matchKnownTriggers(foods: string[]): KnownTriggerMatch[] {
  const normalizedFoods = foods.map(normalizeFoodName).filter(Boolean);
  const matched: KnownTriggerMatch[] = [];

  for (const group of KNOWN_INFLAMMATORY_TRIGGERS) {
    for (const food of normalizedFoods) {
      if (matchesKeywords(food, group.keywords)) {
        matched.push({
          kind: "known",
          id: group.id,
          labelKey: `diet.warn.known.${group.id}` as TranslationKey,
          matchedFood: food,
        });
        break; // one match per category
      }
    }
  }
  return matched;
}

/** Combined warning evaluation — personal first, then known groups. */
export function computeWarnings(
  foods: string[],
  personalTriggers: PersonalTriggerItem[]
): TriggerMatch[] {
  return [
    ...matchPersonalTriggers(foods, personalTriggers),
    ...matchKnownTriggers(foods),
  ];
}

/** Deterministic swap suggestion for a matched known trigger category. */
export function suggestSwapForKnown(id: string): {
  swapKey: TranslationKey;
  reasonKey: TranslationKey;
} {
  return {
    swapKey: `diet.swap.${id}.swap` as TranslationKey,
    reasonKey: `diet.swap.${id}.reason` as TranslationKey,
  };
}

export interface TimingSuggestion {
  /** Stable slug: "veryLow" | "low" | "moderate" | "good" | "full". */
  tone: "veryLow" | "low" | "moderate" | "good" | "full";
  tKey: TranslationKey;
  reasonKey: TranslationKey;
  /** Pushing the evening meal before this hour (local time) is suggested. */
  suggestedBeforeHour?: number;
}

/**
 * Eating-timing suggestion driven by the user's current energy/fatigue
 * state (0 = very low … 4 = full). Low energy → smaller, earlier, gentler
 * evening meals; decent energy → normal window is fine.
 */
export function suggestEatingTiming(energyBefore: number): TimingSuggestion {
  switch (energyBefore) {
    case 0:
      return {
        tone: "veryLow",
        tKey: "diet.timing.veryLow.title",
        reasonKey: "diet.timing.veryLow.reason",
        suggestedBeforeHour: 19,
      };
    case 1:
      return {
        tone: "low",
        tKey: "diet.timing.low.title",
        reasonKey: "diet.timing.low.reason",
        suggestedBeforeHour: 20,
      };
    case 2:
      return {
        tone: "moderate",
        tKey: "diet.timing.moderate.title",
        reasonKey: "diet.timing.moderate.reason",
      };
    case 3:
      return {
        tone: "good",
        tKey: "diet.timing.good.title",
        reasonKey: "diet.timing.good.reason",
      };
    default:
      return {
        tone: "full",
        tKey: "diet.timing.full.title",
        reasonKey: "diet.timing.full.reason",
      };
  }
}

/** True when a meal falls in the evening/late-night correlation window. */
export function isEveningMeal(hour: number): boolean {
  return hour >= 17;
}

/**
 * Stable JSON snapshot of warnings, persisted on MealLog so the history
 * keeps the exact alert set that was shown when the meal was logged.
 */
export function serializeWarnings(warnings: TriggerMatch[]): string {
  return JSON.stringify(
    warnings.map((w) =>
      w.kind === "personal"
        ? { kind: "personal", id: w.id, label: w.label, severity: w.severity }
        : { kind: "known", id: w.id, labelKey: w.labelKey }
    )
  );
}