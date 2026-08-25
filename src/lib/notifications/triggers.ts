import type { TranslationKey } from "@/lib/translations";
import {
  computePressureTrend,
  detectWeatherTriggers,
  type PressureReading,
  type WeatherData,
} from "@/lib/weather";
import type {
  MedicationScheduleEntry,
  NotificationInput,
} from "./types";

/**
 * Pure, deterministic trigger evaluation. Each function takes the data it
 * needs (weather, logs, schedules, the current time) and returns the
 * notifications that *should* exist right now. The store upserts by id, so
 * re-evaluating never duplicates an alert — ids embed the calendar day.
 */

const FLARE_PAIN_THRESHOLD = 7;
const SPIKE_CONSECUTIVE_LOGS = 2;
const DAY_MS = 24 * 60 * 60 * 1000;

export function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

/** Minutes since local midnight. */
function minutesSinceMidnight(d: Date): number {
  return d.getHours() * 60 + d.getMinutes();
}

/* ------------------------------------------------------------------ */
/* 1. AI & weather: pressure shifts, humidity, heat/cold extremes      */
/* ------------------------------------------------------------------ */

interface WeatherCopy {
  title: TranslationKey;
  message: TranslationKey;
}

const WEATHER_COPY: Record<string, WeatherCopy> = {
  "pressure-drop": {
    title: "notification.weather.pressureDrop.title",
    message: "notification.weather.pressureDrop.message",
  },
  "pressure-low": {
    title: "notification.weather.lowPressure.title",
    message: "notification.weather.lowPressure.message",
  },
  "humidity-high": {
    title: "notification.weather.humidity.title",
    message: "notification.weather.humidity.message",
  },
  "heat-extreme": {
    title: "notification.weather.heat.title",
    message: "notification.weather.heat.message",
  },
  "cold-extreme": {
    title: "notification.weather.cold.title",
    message: "notification.weather.cold.message",
  },
};

/**
 * Alert when a fibromyalgia-relevant weather condition is active: a falling
 * or low barometric pressure, high humidity, or heat/cold extremes. The
 * `calm` trigger (no risk) produces nothing.
 */
export function evaluateWeatherTriggers(
  weather: WeatherData,
  previousPressure: number | null | undefined,
  now = new Date()
): NotificationInput[] {
  const trend: PressureReading = computePressureTrend(
    weather.pressure,
    previousPressure
  );
  const active = detectWeatherTriggers(weather, trend).filter(
    (t) => t !== "calm"
  );
  const dayKey = toDateKey(now);
  return active.flatMap((triggerId) => {
    const copy = WEATHER_COPY[triggerId];
    if (!copy) return [];
    return [
      {
        id: `weather-${triggerId}-${dayKey}`,
        type: "weather_trigger",
        ...copy,
        params: {
          pressure: weather.pressure,
          delta: trend.deltaHpa,
          humidity: weather.humidity,
          temperature: weather.temperature,
        },
        actionUrl: "/dashboard",
      },
    ];
  });
}

/* ------------------------------------------------------------------ */
/* 2. AI prediction: consecutive pain spikes over recent logs          */
/* ------------------------------------------------------------------ */

/**
 * A "spike" is {SPIKE_CONSECUTIVE_LOGS} consecutive logs at or above the
 * flare threshold (pain ≥ 7) — the earliest warning the data supports.
 * Requires at least that many recent logs, evaluated newest-first.
 */
export function evaluatePainSpike(
  logs: Array<{ painLevel: number }>,
  now = new Date()
): NotificationInput[] {
  const recent = logs.slice(0, SPIKE_CONSECUTIVE_LOGS);
  if (recent.length < SPIKE_CONSECUTIVE_LOGS) return [];
  const spiking = recent.every((l) => l.painLevel >= FLARE_PAIN_THRESHOLD);
  if (!spiking) return [];
  const dayKey = toDateKey(now);
  return [
    {
      id: `ai-spike-${dayKey}`,
      type: "ai_prediction",
      title: "notification.ai.spike.title",
      message: "notification.ai.spike.message",
      params: {
        count: SPIKE_CONSECUTIVE_LOGS,
        threshold: FLARE_PAIN_THRESHOLD,
        highest: Math.max(...recent.map((l) => l.painLevel)),
      },
      actionUrl: "/health-logs",
    },
  ];
}

/* ------------------------------------------------------------------ */
/* 3. Medication: fire when a registered dose time comes due           */
/* ------------------------------------------------------------------ */

/**
 * Emit a reminder for each medication whose dose time has arrived within
 * the last REMINDER_WINDOW_MINUTES and has not been acknowledged today.
 * Ids embed the calendar day so a dose is reminded at most once per day.
 */
const REMINDER_WINDOW_MINUTES = 120;

export function evaluateMedicationReminders(
  schedule: MedicationScheduleEntry[],
  now = new Date()
): NotificationInput[] {
  const nowMinutes = minutesSinceMidnight(now);
  const dayKey = toDateKey(now);
  const results: NotificationInput[] = [];
  for (const med of schedule) {
    const doseMinutes = med.hour * 60 + med.minute;
    const due =
      nowMinutes >= doseMinutes &&
      nowMinutes - doseMinutes <= REMINDER_WINDOW_MINUTES;
    if (!due) continue;
    results.push({
      id: `medication-${med.id}-${dayKey}`,
      type: "medication_reminder",
      title: "notification.medication.due.title",
      message: "notification.medication.due.message",
      params: { name: med.name },
      actionUrl: med.actionUrl ?? "/toolkit",
    });
  }
  return results;
}

/* ------------------------------------------------------------------ */
/* 4. Care & zen: daily symptom-log nudge + breathing-break reminder   */
/* ------------------------------------------------------------------ */

const ZEN_REMINDER_HOUR = 10; // 10:00 local — a calm morning break
const LOG_REMINDER_HOUR = 18; // 18:00 local — evening check-in nudge

/**
 * Daily routine reminders, deduped by day:
 * - `zen_break` at ZEN_REMINDER_HOUR:00 (skip it once the window has passed).
 * - `daily_log` from LOG_REMINDER_HOUR onward, only if nothing was logged
 *   today (`lastLogDate` is the ISO day key of the most recent log).
 */
export function evaluateDailyReminders(
  lastLogDate: string | null,
  now = new Date()
): NotificationInput[] {
  const dayKey = toDateKey(now);
  const hour = now.getHours();
  const results: NotificationInput[] = [];

  if (hour === ZEN_REMINDER_HOUR) {
    results.push({
      id: `zen-break-${dayKey}`,
      type: "zen_recommendation",
      title: "notification.zen.reminder.title",
      message: "notification.zen.reminder.message",
      actionUrl: "/zen",
    });
  }

  const loggedToday = lastLogDate === dayKey;
  if (!loggedToday && hour >= LOG_REMINDER_HOUR) {
    results.push({
      id: `daily-log-${dayKey}`,
      type: "daily_checkin",
      title: "notification.dailyLog.reminder.title",
      message: "notification.dailyLog.reminder.message",
      actionUrl: "/dashboard",
    });
  }

  return results;
}

/* ------------------------------------------------------------------ */

/** Convenience aggregate: run every trigger and merge the results. */
export function evaluateAllTriggers(input: {
  weather: WeatherData;
  previousPressure?: number | null;
  logs?: Array<{ painLevel: number }>;
  medications?: MedicationScheduleEntry[];
  lastLogDate?: string | null;
  now?: Date;
}): NotificationInput[] {
  const now = input.now ?? new Date();
  return [
    ...evaluateWeatherTriggers(input.weather, input.previousPressure, now),
    ...evaluatePainSpike(input.logs ?? [], now),
    ...evaluateMedicationReminders(input.medications ?? [], now),
    ...evaluateDailyReminders(input.lastLogDate ?? null, now),
  ];
}

/** Approximate human "time ago" helpers used by the center (pure). */
export function timeAgoParts(timestamp: number, now = Date.now()): {
  value: number;
  unit: "minute" | "hour" | "day";
} {
  const diff = Math.max(0, now - timestamp);
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 60) return { value: Math.max(1, minutes), unit: "minute" };
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return { value: hours, unit: "hour" };
  return { value: Math.floor(hours / 24), unit: "day" };
}

export { DAY_MS, FLARE_PAIN_THRESHOLD, SPIKE_CONSECUTIVE_LOGS };
