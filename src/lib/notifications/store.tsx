"use client";

/**
 * Global notification store. Holds the persisted notification list
 * (localStorage), exposes read/dismiss/clear operations, and periodically
 * evaluates the smart triggers (weather, pain spikes, medication doses,
 * daily/zen reminders) against live data — the server-side weather API and
 * the user's latest logs. Everything is written through the pure engine in
 * `engine.ts`; this file is only the React + data-fetching binding.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { getLatestLogs } from "@/app/actions";
import { deterministicWeather, type WeatherData } from "@/lib/weather";
import {
  clearAll as clearAllEngine,
  markAllAsRead,
  markAsRead,
  prune,
  remove,
  sortNewestFirst,
  unreadCount,
  upsert,
} from "./engine";
import { evaluateAllTriggers, toDateKey } from "./triggers";
import {
  type AppNotification,
  type MedicationScheduleEntry,
  type NotificationInput,
} from "./types";

const STORAGE_KEY = "fibrocare:notifications";
const MEDICATION_SCHEDULE_KEY = "fibrocare:medication-schedule";
const LAST_PRESSURE_KEY = "fibrocare:last-pressure-reading";
const TRIGGER_INTERVAL_MS = 10 * 60 * 1000; // re-check every 10 minutes
const MAX_NOTIFICATIONS = 60;

/**
 * Default dose schedule, mirroring the tracker card on the dashboard
 * (morning supplement, mid-day pain relief, evening magnesium). Users can
 * override it by writing a `MedicationScheduleEntry[]` array to
 * `fibrocare:medication-schedule` (e.g. from the medication safety card).
 */
const DEFAULT_MEDICATION_SCHEDULE: MedicationScheduleEntry[] = [
  { id: "morning", name: "Morning supplement", hour: 8, minute: 0, actionUrl: "/toolkit" },
  { id: "pain", name: "Pain relief", hour: 14, minute: 0, actionUrl: "/toolkit" },
  { id: "evening", name: "Evening magnesium", hour: 21, minute: 0, actionUrl: "/toolkit" },
];

interface NotificationContextValue {
  notifications: AppNotification[];
  unread: number;
  /** Manually enqueue a notification (upserted by id). */
  push: (input: NotificationInput) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  dismiss: (id: string) => void;
  clearAll: () => void;
  /** Force an immediate trigger re-evaluation. */
  refreshTriggers: () => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

function readStoredSchedule(): MedicationScheduleEntry[] {
  if (typeof window === "undefined") return DEFAULT_MEDICATION_SCHEDULE;
  try {
    const raw = window.localStorage.getItem(MEDICATION_SCHEDULE_KEY);
    if (!raw) return DEFAULT_MEDICATION_SCHEDULE;
    const parsed = JSON.parse(raw) as MedicationScheduleEntry[];
    if (!Array.isArray(parsed)) return DEFAULT_MEDICATION_SCHEDULE;
    const valid = parsed.filter(
      (m) =>
        m &&
        typeof m.id === "string" &&
        typeof m.hour === "number" &&
        typeof m.minute === "number"
    );
    return valid.length > 0 ? valid : DEFAULT_MEDICATION_SCHEDULE;
  } catch {
    return DEFAULT_MEDICATION_SCHEDULE;
  }
}

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notifications, setNotifications] = useLocalStorage<AppNotification[]>(
    STORAGE_KEY,
    []
  );
  const [lastPressure, setLastPressure] = useLocalStorage<number | null>(
    LAST_PRESSURE_KEY,
    null
  );
  const scheduleRef = useRef<MedicationScheduleEntry[]>(
    readStoredSchedule()
  );
  const triggerInFlight = useRef(false);

  const apply = useCallback(
    (updater: (list: AppNotification[]) => AppNotification[]) => {
      setNotifications((prev) => prune(updater(prev), MAX_NOTIFICATIONS));
    },
    [setNotifications]
  );

  const push = useCallback(
    (input: NotificationInput) => {
      apply((list) => upsert(list, input));
    },
    [apply]
  );

  const markRead = useCallback(
    (id: string) => apply((list) => markAsRead(list, id)),
    [apply]
  );

  const markAllRead = useCallback(
    () => apply((list) => markAllAsRead(list)),
    [apply]
  );

  const dismiss = useCallback(
    (id: string) => apply((list) => remove(list, id)),
    [apply]
  );

  const clearAll = useCallback(() => apply(() => clearAllEngine()), [apply]);

  /**
   * Evaluate all smart triggers against current data and upsert whatever
   * should exist right now. Runs once on mount and then on an interval;
   * `triggerInFlight` guards against overlapping runs (slow weather fetch).
   */
  const refreshTriggers = useCallback(async () => {
    if (triggerInFlight.current) return;
    triggerInFlight.current = true;
    const now = new Date();
    try {
      let weather: WeatherData = deterministicWeather(now);
      let previousPressure = lastPressure;

      try {
        const res = await fetch("/api/weather", { cache: "no-store" });
        const data = (await res.json()) as {
          weather?: WeatherData;
          isEstimated?: boolean;
        };
        if (data?.weather) {
          weather = data.weather;
          if (!data.isEstimated) {
            previousPressure = lastPressure;
            setLastPressure(weather.pressure);
          }
        }
      } catch {
        // Keep the deterministic estimate — triggers still run on it.
      }

      let logs: Array<{ painLevel: number; loggedAt?: string | Date }> = [];
      try {
        const latest = await getLatestLogs();
        if (Array.isArray(latest)) {
          logs = latest.map((l) => ({ painLevel: l.painLevel, loggedAt: l.loggedAt }));
        }
      } catch {
        // Not signed in or fetch failed — pain-spike trigger stays silent.
      }

      // Most recent log's calendar day (if any) — the daily nudge only
      // fires when nothing was logged *today*.
      const newest = logs[0];
      const lastLogDate = newest?.loggedAt
        ? toDateKey(new Date(newest.loggedAt))
        : null;
      const inputs = evaluateAllTriggers({
        weather,
        previousPressure,
        logs,
        medications: scheduleRef.current,
        lastLogDate,
        now,
      });

      if (inputs.length > 0) {
        apply((list) =>
          inputs.reduce((acc, input) => upsert(acc, input), list)
        );
      }
    } finally {
      triggerInFlight.current = false;
    }
  }, [apply, lastPressure, setLastPressure]);

  useEffect(() => {
    // Prime the schedule from storage (fresh on each mount).
    scheduleRef.current = readStoredSchedule();
    refreshTriggers();
    const interval = setInterval(refreshTriggers, TRIGGER_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [refreshTriggers]);

  const value = useMemo<NotificationContextValue>(
    () => ({
      notifications: sortNewestFirst(notifications),
      unread: unreadCount(notifications),
      push,
      markRead,
      markAllRead,
      dismiss,
      clearAll,
      refreshTriggers,
    }),
    [notifications, push, markRead, markAllRead, dismiss, clearAll, refreshTriggers]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return ctx;
}
