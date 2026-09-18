/**
 * exerciseLibrary.ts — low-impact exercise library tailored for people
 * living with fibromyalgia. Exercises are graded (very gentle → moderate),
 * prioritise form and pacing over intensity, and each carries a translation
 * key used by the UI. Follows clinical guidance that movement should start
 * low and go slow, with pacing and "hurt ≠ gain" caveats.
 */

export type ExerciseIntensity = "gentle" | "light" | "moderate";

export interface ExerciseEntry {
  id: string;
  tKey: string;
  detailsTKey: string;
  stepsTKey: string;
  intensity: ExerciseIntensity;
  minutes: number;
  /** True when this exercise benefits from supervision / clearance first. */
  needsClearance?: boolean;
  gradient: string;
  iconTone: string;
}

export const LOW_IMPACT_EXERCISES: readonly ExerciseEntry[] = [
  {
    id: "gentle-walking",
    tKey: "clinical.exercise.walking.title",
    detailsTKey: "clinical.exercise.walking.details",
    stepsTKey: "clinical.exercise.walking.steps",
    intensity: "gentle",
    minutes: 10,
    gradient: "from-emerald-500/10 to-teal-500/5",
    iconTone: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  },
  {
    id: "water-aquatic",
    tKey: "clinical.exercise.water.title",
    detailsTKey: "clinical.exercise.water.details",
    stepsTKey: "clinical.exercise.water.steps",
    intensity: "gentle",
    minutes: 20,
    gradient: "from-sky-500/10 to-cyan-500/5",
    iconTone: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
  },
  {
    id: "tai-chi",
    tKey: "clinical.exercise.taiChi.title",
    detailsTKey: "clinical.exercise.taiChi.details",
    stepsTKey: "clinical.exercise.taiChi.steps",
    intensity: "light",
    minutes: 20,
    gradient: "from-teal-500/10 to-indigo-500/5",
    iconTone: "bg-teal-500/15 text-teal-600 dark:text-teal-400",
  },
  {
    id: "gentle-yoga",
    tKey: "clinical.exercise.yoga.title",
    detailsTKey: "clinical.exercise.yoga.details",
    stepsTKey: "clinical.exercise.yoga.steps",
    intensity: "light",
    minutes: 15,
    gradient: "from-violet-500/10 to-purple-500/5",
    iconTone: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
  },
  {
    id: "stretching-pattern",
    tKey: "clinical.exercise.stretching.title",
    detailsTKey: "clinical.exercise.stretching.details",
    stepsTKey: "clinical.exercise.stretching.steps",
    intensity: "gentle",
    minutes: 10,
    gradient: "from-amber-500/10 to-orange-500/5",
    iconTone: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  },
  {
    id: "strength-light",
    tKey: "clinical.exercise.strength.title",
    detailsTKey: "clinical.exercise.strength.details",
    stepsTKey: "clinical.exercise.strength.steps",
    intensity: "moderate",
    minutes: 20,
    needsClearance: true,
    gradient: "from-rose-500/10 to-pink-500/5",
    iconTone: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
  },
  {
    id: "cycling-stationary",
    tKey: "clinical.exercise.cycling.title",
    detailsTKey: "clinical.exercise.cycling.details",
    stepsTKey: "clinical.exercise.cycling.steps",
    intensity: "light",
    minutes: 15,
    gradient: "from-lime-500/10 to-emerald-500/5",
    iconTone: "bg-lime-500/15 text-lime-600 dark:text-lime-400",
  },
  {
    id: "seated-band",
    tKey: "clinical.exercise.seatedBand.title",
    detailsTKey: "clinical.exercise.seatedBand.details",
    stepsTKey: "clinical.exercise.seatedBand.steps",
    intensity: "light",
    minutes: 10,
    gradient: "from-orange-500/10 to-amber-500/5",
    iconTone: "bg-orange-500/15 text-orange-600 dark:text-orange-400",
  },
];

export const INTENSITY_ORDER: readonly ExerciseIntensity[] = [
  "gentle",
  "light",
  "moderate",
];

/** Pacing rules rendered as a footer strip below the library grid. */
export const EXERCISE_PACING_TIPS: readonly string[] = [
  "clinical.exercise.tip.1",
  "clinical.exercise.tip.2",
  "clinical.exercise.tip.3",
  "clinical.exercise.tip.4",
];