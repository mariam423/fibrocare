/**
 * pantryMeals.ts — pure matching engine for the Pantry Meal Helper.
 *
 * The user ticks which pantry staples they have; `matchMeals` returns the
 * 5-minute anti-inflammatory meals they can make, best-first:
 *  1. rank by how much of the meal's ingredient list they already have
 *     (hit ratio, then fewest missing, then stable id order);
 * 2. drop meals missing more than one core ingredient (low-energy days
 *     have no shopping trips);
 * 3. never mutate inputs; deterministic on equal inputs.
 */

import type { TranslationKey } from "@/lib/translations";

/** Pantry staple ids (stable — persisted in localStorage). */
export type PantryIngredientId =
  | "oats"
  | "oliveOil"
  | "fattyFish"
  | "leafyGreens"
  | "berries"
  | "nuts"
  | "yogurt"
  | "turmeric"
  | "ginger"
  | "eggs"
  | "bananas"
  | "wholeGrainBread";

export interface PantryIngredient {
  id: PantryIngredientId;
  labelTKey: TranslationKey;
}

export interface PantryMeal {
  id: string;
  labelTKey: TranslationKey;
  howTKey: TranslationKey;
  minutes: number;
  /** Ingredient ids required; one missing max to stay eligible. */
  needs: PantryIngredientId[];
}

export const PANTRY_INGREDIENTS: readonly PantryIngredient[] = [
  { id: "oats", labelTKey: "pantry.ing.oats" },
  { id: "oliveOil", labelTKey: "pantry.ing.oliveOil" },
  { id: "fattyFish", labelTKey: "pantry.ing.fattyFish" },
  { id: "leafyGreens", labelTKey: "pantry.ing.leafyGreens" },
  { id: "berries", labelTKey: "pantry.ing.berries" },
  { id: "nuts", labelTKey: "pantry.ing.nuts" },
  { id: "yogurt", labelTKey: "pantry.ing.yogurt" },
  { id: "turmeric", labelTKey: "pantry.ing.turmeric" },
  { id: "ginger", labelTKey: "pantry.ing.ginger" },
  { id: "eggs", labelTKey: "pantry.ing.eggs" },
  { id: "bananas", labelTKey: "pantry.ing.bananas" },
  { id: "wholeGrainBread", labelTKey: "pantry.ing.wholeGrainBread" },
];

/** 5-minute, muscle-soothing, anti-inflammatory meals. */
export const PANTRY_MEALS: readonly PantryMeal[] = [
  {
    id: "oatBerryBowl",
    labelTKey: "pantry.meal.oatBerryBowl",
    howTKey: "pantry.meal.oatBerryBowl.how",
    minutes: 5,
    needs: ["oats", "berries", "nuts"],
  },
  {
    id: "turmericYogurtBowl",
    labelTKey: "pantry.meal.turmericYogurtBowl",
    howTKey: "pantry.meal.turmericYogurtBowl.how",
    minutes: 3,
    needs: ["yogurt", "turmeric", "berries"],
  },
  {
    id: "toastAvocadoSpinach",
    labelTKey: "pantry.meal.toastAvocadoSpinach",
    howTKey: "pantry.meal.toastAvocadoSpinach.how",
    minutes: 5,
    needs: ["wholeGrainBread", "leafyGreens", "oliveOil"],
  },
  {
    id: "sardineToast",
    labelTKey: "pantry.meal.sardineToast",
    howTKey: "pantry.meal.sardineToast.how",
    minutes: 4,
    needs: ["wholeGrainBread", "fattyFish", "leafyGreens"],
  },
  {
    id: "gingerBananaSmoothie",
    labelTKey: "pantry.meal.gingerBananaSmoothie",
    howTKey: "pantry.meal.gingerBananaSmoothie.how",
    minutes: 3,
    needs: ["bananas", "ginger", "yogurt"],
  },
  {
    id: "eggGreenScramble",
    labelTKey: "pantry.meal.eggGreenScramble",
    howTKey: "pantry.meal.eggGreenScramble.how",
    minutes: 5,
    needs: ["eggs", "leafyGreens", "oliveOil"],
  },
];

/** Meals the user can make now, best-first. Pure. */
export function matchMeals(
  have: readonly PantryIngredientId[],
  meals: readonly PantryMeal[]
): PantryMeal[] {
  const haveSet = new Set(have);
  return meals
    .map((meal) => {
      const missing = meal.needs.filter((id) => !haveSet.has(id));
      const hits = meal.needs.length - missing.length;
      return { meal, missing, hits, ratio: hits / meal.needs.length };
    })
    .filter((m) => m.missing.length <= 1)
    .sort(
      (a, b) =>
        b.ratio - a.ratio ||
        a.missing.length - b.missing.length ||
        a.meal.id.localeCompare(b.meal.id)
    )
    .map((m) => m.meal);
}
