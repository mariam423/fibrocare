/**
 * Somatic exercise catalog + adaptive selector.
 *
 * Exercises carry a max pain level and spoon cost; the selector only offers
 * what today's remaining budget and pain level can actually absorb.
 * Titles/descriptions are translation keys so EN/AR render natively.
 *
 * `videoUrl` is optional per exercise. The curated links below point to
 * vetted YouTube search pages (official yoga/breathing channels surface
 * first) rather than hard-coded third-party video IDs — a specific medical
 * video must be reviewed before being embedded for patients, and search
 * pages stay correct as videos move. The VideoPlayer degrades to an
 * external link card for these.
 */

import type { SomaticExercise } from "@/types/extended-health";

export const SOMATIC_EXERCISES: SomaticExercise[] = [
  {
    id: "diaphragmatic-breathing",
    titleKey: "somatic.ex.breathing.title",
    descriptionKey: "somatic.ex.breathing.desc",
    maxPain: 10,
    spoonCost: 0,
    minutes: 4,
    intensity: "very-gentle",
    steps: 3,
    videoUrl: "https://www.youtube.com/results?search_query=diaphragmatic+breathing+exercise+relaxation",
  },
  {
    id: "vagus-humming",
    titleKey: "somatic.ex.humming.title",
    descriptionKey: "somatic.ex.humming.desc",
    maxPain: 10,
    spoonCost: 0,
    minutes: 3,
    intensity: "very-gentle",
    steps: 3,
    videoUrl: "https://www.youtube.com/results?search_query=vagus+nerve+humming+exercise",
  },
  {
    id: "eye-movement-calm",
    titleKey: "somatic.ex.eyes.title",
    descriptionKey: "somatic.ex.eyes.desc",
    maxPain: 9,
    spoonCost: 1,
    minutes: 3,
    intensity: "very-gentle",
    steps: 2,
    videoUrl: "https://www.youtube.com/results?search_query=slow+eye+movement+relaxation+exercise",
  },
  {
    id: "neck-micro-releases",
    titleKey: "somatic.ex.neck.title",
    descriptionKey: "somatic.ex.neck.desc",
    maxPain: 7,
    spoonCost: 1,
    minutes: 5,
    intensity: "gentle",
    steps: 4,
    videoUrl: "https://www.youtube.com/results?search_query=gentle+neck+stretches+chronic+pain",
  },
  {
    id: "shoulder-circles",
    titleKey: "somatic.ex.shoulders.title",
    descriptionKey: "somatic.ex.shoulders.desc",
    maxPain: 6,
    spoonCost: 1,
    minutes: 5,
    intensity: "gentle",
    steps: 3,
    videoUrl: "https://www.youtube.com/results?search_query=gentle+shoulder+circles+exercise",
  },
  {
    id: "cat-cow",
    titleKey: "somatic.ex.catcow.title",
    descriptionKey: "somatic.ex.catcow.desc",
    maxPain: 5,
    spoonCost: 2,
    minutes: 6,
    intensity: "gentle",
    steps: 4,
    videoUrl: "https://www.youtube.com/results?search_query=cat+cow+yoga+gentle",
  },
  {
    id: "legs-up-wall",
    titleKey: "somatic.ex.legs.title",
    descriptionKey: "somatic.ex.legs.desc",
    maxPain: 8,
    spoonCost: 0,
    minutes: 8,
    intensity: "very-gentle",
    steps: 2,
    videoUrl: "https://www.youtube.com/results?search_query=legs+up+the+wall+yoga+pose",
  },
  {
    id: "body-scan",
    titleKey: "somatic.ex.bodyscan.title",
    descriptionKey: "somatic.ex.bodyscan.desc",
    maxPain: 10,
    spoonCost: 0,
    minutes: 10,
    intensity: "very-gentle",
    steps: 5,
    videoUrl: "https://www.youtube.com/results?search_query=guided+body+scan+meditation",
  },
];

export interface ExerciseFilter {
  painLevel: number;
  spoonsRemaining: number;
  /** Hard cap on how many exercises to suggest (default 5). */
  limit?: number;
}

/**
 * Adaptive selection: pain-safe first, then cheapest spoons first, so the
 * plan protects the remaining energy budget.
 */
export function selectExercises(filter: ExerciseFilter): SomaticExercise[] {
  const { painLevel, spoonsRemaining, limit = 5 } = filter;
  return SOMATIC_EXERCISES.filter(
    (ex) => ex.maxPain >= painLevel && ex.spoonCost <= Math.max(0, spoonsRemaining)
  )
    .sort((a, b) => a.spoonCost - b.spoonCost || b.maxPain - a.maxPain)
    .slice(0, limit);
}
