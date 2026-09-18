/**
 * sleepHygiene.ts — sleep hygiene guidance for fibromyalgia. Non-restorative
 * sleep is a core driver of flares and fibro fog, so these habits focus on
 * the sleep-promoting factors that research shows matter most (consistent
 * timing, cool dark room, wind-down, caffeine cut-off, screens, and gentle
 * bedtime routines). Pure data + scoring helper, unit-tested.
 */

export type SleepHabitId =
  | "consistentSchedule"
  | "darkCoolRoom"
  | "screenWindDown"
  | "caffeineCutoff"
  | "eveningRoutine"
  | "preSleepRelaxation"
  | "gentleDaylight"
  | "painComfortPrep";

export interface SleepHabit {
  id: SleepHabitId;
  titleTKey: string;
  bodyTKey: string;
}

export const SLEEP_HABITS: readonly SleepHabit[] = [
  {
    id: "consistentSchedule",
    titleTKey: "clinical.sleep.consistentSchedule.title",
    bodyTKey: "clinical.sleep.consistentSchedule.body",
  },
  {
    id: "darkCoolRoom",
    titleTKey: "clinical.sleep.darkCoolRoom.title",
    bodyTKey: "clinical.sleep.darkCoolRoom.body",
  },
  {
    id: "screenWindDown",
    titleTKey: "clinical.sleep.screenWindDown.title",
    bodyTKey: "clinical.sleep.screenWindDown.body",
  },
  {
    id: "caffeineCutoff",
    titleTKey: "clinical.sleep.caffeineCutoff.title",
    bodyTKey: "clinical.sleep.caffeineCutoff.body",
  },
  {
    id: "eveningRoutine",
    titleTKey: "clinical.sleep.eveningRoutine.title",
    bodyTKey: "clinical.sleep.eveningRoutine.body",
  },
  {
    id: "preSleepRelaxation",
    titleTKey: "clinical.sleep.preSleepRelaxation.title",
    bodyTKey: "clinical.sleep.preSleepRelaxation.body",
  },
  {
    id: "gentleDaylight",
    titleTKey: "clinical.sleep.gentleDaylight.title",
    bodyTKey: "clinical.sleep.gentleDaylight.body",
  },
  {
    id: "painComfortPrep",
    titleTKey: "clinical.sleep.painComfortPrep.title",
    bodyTKey: "clinical.sleep.painComfortPrep.body",
  },
];

/**
 * Score a user's sleep-hygiene checkoff (0–8 habits). Used by the guide to
 * show a gentle reading: 7+ "strong", 4–6 "building", < 4 "just starting".
 */
export function sleepHygieneScore(checked: SleepHabitId[]): number {
  return new Set(checked).size;
}

export type SleepHygieneReading = "strong" | "building" | "starting";

export function sleepHygieneReading(checked: SleepHabitId[]): SleepHygieneReading {
  const score = sleepHygieneScore(checked);
  if (score >= 7) return "strong";
  if (score >= 4) return "building";
  return "starting";
}