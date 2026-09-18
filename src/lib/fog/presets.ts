import type { TranslationKey } from "@/lib/translations";

/**
 * Offerable situational trigger labels for the Fog Shield. The server action
 * stores the `id` strings verbatim (bounded, sanitized); the UI maps them to
 * localized labels at render time. Plain module (not "use server") so the
 * client components can import it freely.
 */
export interface FogTriggerPreset {
  id: string;
  labelKey: TranslationKey;
}

export const FOG_TRIGGER_PRESETS: readonly FogTriggerPreset[] = [
  { id: "LOW_SLEEP", labelKey: "fog.trigger.lowSleep" },
  { id: "STRESS", labelKey: "fog.trigger.stress" },
  { id: "LONG_SCREEN_TIME", labelKey: "fog.trigger.screen" },
  { id: "NOISE", labelKey: "fog.trigger.noise" },
  { id: "LOW_FOOD", labelKey: "fog.trigger.lowFood" },
  { id: "MENSTRUAL", labelKey: "fog.trigger.menstrual" },
  { id: "MULTITASKING", labelKey: "fog.trigger.multitasking" },
  { id: "OVERWHELM", labelKey: "fog.trigger.overwhelm" },
  { id: "WEATHER", labelKey: "fog.trigger.weather" },
  { id: "MEDICATION_SKIPPED", labelKey: "fog.trigger.medication" },
  { id: "EXERCISE_PACING", labelKey: "fog.trigger.overdid" },
  { id: "OTHER", labelKey: "fog.trigger.other" },
];

export function labelKeyForTrigger(id: string): TranslationKey {
  return (
    FOG_TRIGGER_PRESETS.find((p) => p.id === id)?.labelKey ?? "fog.trigger.other"
  );
}