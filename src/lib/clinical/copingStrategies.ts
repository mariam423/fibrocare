/**
 * copingStrategies.ts — flare-up management & coping toolkit. Combines
 * evidence-supported flare coping modules (pacing, graded breathing,
 * grounding, gentle heat, sensory shutdown, social support) with an
 * embeddable 4-7-8 breathing component. Pure data and breathing math,
 * unit-tested; the UI localizes translation keys.
 */

export type CopingModuleId =
  | "pacing"
  | "breathing"
  | "grounding"
  | "heatComfort"
  | "sensoryShutdown"
  | "support";

export interface CopingModule {
  id: CopingModuleId;
  titleTKey: string;
  bodyTKey: string;
  /** Small actionable "try this" line rendered as a chip under the body. */
  actionTKey: string;
  gradient: string;
  iconTone: string;
}

export const COPING_MODULES: readonly CopingModule[] = [
  {
    id: "pacing",
    titleTKey: "clinical.coping.pacing.title",
    bodyTKey: "clinical.coping.pacing.body",
    actionTKey: "clinical.coping.pacing.action",
    gradient: "from-emerald-500/10 to-teal-500/5",
    iconTone: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  },
  {
    id: "breathing",
    titleTKey: "clinical.coping.breathing.title",
    bodyTKey: "clinical.coping.breathing.body",
    actionTKey: "clinical.coping.breathing.action",
    gradient: "from-sky-500/10 to-cyan-500/5",
    iconTone: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
  },
  {
    id: "grounding",
    titleTKey: "clinical.coping.grounding.title",
    bodyTKey: "clinical.coping.grounding.body",
    actionTKey: "clinical.coping.grounding.action",
    gradient: "from-violet-500/10 to-purple-500/5",
    iconTone: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
  },
  {
    id: "heatComfort",
    titleTKey: "clinical.coping.heatComfort.title",
    bodyTKey: "clinical.coping.heatComfort.body",
    actionTKey: "clinical.coping.heatComfort.action",
    gradient: "from-amber-500/10 to-orange-500/5",
    iconTone: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  },
  {
    id: "sensoryShutdown",
    titleTKey: "clinical.coping.sensoryShutdown.title",
    bodyTKey: "clinical.coping.sensoryShutdown.body",
    actionTKey: "clinical.coping.sensoryShutdown.action",
    gradient: "from-rose-500/10 to-pink-500/5",
    iconTone: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
  },
  {
    id: "support",
    titleTKey: "clinical.coping.support.title",
    bodyTKey: "clinical.coping.support.body",
    actionTKey: "clinical.coping.support.action",
    gradient: "from-indigo-500/10 to-blue-500/5",
    iconTone: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400",
  },
];

/** 4-7-8 breathing cycle timing (seconds). */
export const BREATHING_CYCLE = {
  inhale: 4,
  hold: 7,
  exhale: 8,
} as const;

export type BreathPhase = "inhale" | "hold" | "exhale";

export const BREATHING_TOTAL =
  BREATHING_CYCLE.inhale + BREATHING_CYCLE.hold + BREATHING_CYCLE.exhale;

/** Compute the active phase for a given second of the 4-7-8 cycle. */
export function breathPhaseAt(second: number): BreathPhase {
  const t = ((second % BREATHING_TOTAL) + BREATHING_TOTAL) % BREATHING_TOTAL;
  if (t < BREATHING_CYCLE.inhale) return "inhale";
  if (t < BREATHING_CYCLE.inhale + BREATHING_CYCLE.hold) return "hold";
  return "exhale";
}

/**
 * How long remains in the current phase, in seconds. The UI shows a
 * countdown ("hold… 5") while the circle animates.
 */
export function breathSecondsLeft(second: number): number {
  const t = ((second % BREATHING_TOTAL) + BREATHING_TOTAL) % BREATHING_TOTAL;
  if (t < BREATHING_CYCLE.inhale) return BREATHING_CYCLE.inhale - t;
  if (t < BREATHING_CYCLE.inhale + BREATHING_CYCLE.hold) {
    return BREATHING_CYCLE.inhale + BREATHING_CYCLE.hold - t;
  }
  return BREATHING_TOTAL - t;
}