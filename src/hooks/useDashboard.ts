"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  getCurrentUser,
  getStreak,
  getLatestLogs,
  getWeeklyPainTrend,
  getSymptomsForDate,
  getDashboardInsights,
  savePainLog,
  updateHydration,
  toggleSymptom as toggleSymptomAction,
} from "@/app/actions";
import type { PainTrendPoint } from "@/lib/types";
import type { Insight } from "@/lib/insightEngine";

const FLARE_TOAST_THRESHOLD = 7;

function toIsoKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

function formatLogDate(value: string | Date) {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface DashboardData {
  userName: string;
  hydrationCount: number;
  streak: number;
  weeklyTrend: PainTrendPoint[];
  symptoms: string[];
  insights: Insight[];
  lastLogDate: string;
  painLevel: number;
  mood: string;
}

async function fetchDashboardData(): Promise<DashboardData> {
  const user = await getCurrentUser();
  const [currentStreak, trend, todaySymptoms, logs, insights] = await Promise.all([
    getStreak(),
    getWeeklyPainTrend(),
    getSymptomsForDate(toIsoKey(new Date())),
    getLatestLogs(),
    getDashboardInsights(),
  ]);

  const lastLog = logs[0];
  return {
    userName: user.name,
    hydrationCount: user.hydrationCount || 0,
    streak: currentStreak,
    weeklyTrend: trend,
    symptoms: todaySymptoms,
    insights,
    lastLogDate: lastLog ? formatLogDate(lastLog.loggedAt) : "Never",
    painLevel: lastLog ? lastLog.painLevel : 3,
    mood: lastLog ? lastLog.moodTag : "Good Day",
  };
}

export interface LogOverrides {
  painLevel?: number;
  mood?: string;
  notes?: string;
  symptoms?: string[];
}

export interface DashboardState {
  isLoading: boolean;
  userName: string;
  hydrationCount: number;
  streak: number;
  weeklyTrend: PainTrendPoint[];
  insights: Insight[];
  symptoms: string[];
  lastLogDate: string;
  painLevel: number[];
  setPainLevel: (value: number[]) => void;
  mood: string;
  setMood: (value: string) => void;
  notes: string;
  setNotes: (value: string) => void;
  isSaving: boolean;
  showSuccess: boolean;
  showToast: boolean;
  setShowToast: (value: boolean) => void;
  logEntry: (overrides?: LogOverrides) => Promise<void>;
  incrementHydration: (delta: number) => Promise<void>;
  toggleSymptom: (id: string) => Promise<void>;
}

export function useDashboard(): DashboardState {
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState("User");
  const [hydrationCount, setHydrationCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [weeklyTrend, setWeeklyTrend] = useState<PainTrendPoint[]>([]);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [lastLogDate, setLastLogDate] = useState("Never");

  const [painLevel, setPainLevel] = useState([3]);
  const [mood, setMood] = useState("Good Day");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const successTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerFlareToast = useCallback((level: number) => {
    if (level >= FLARE_TOAST_THRESHOLD) setShowToast(true);
  }, []);

  useEffect(() => {
    return () => {
      if (successTimer.current) clearTimeout(successTimer.current);
    };
  }, []);

  const applyData = useCallback((data: DashboardData) => {
    setUserName(data.userName);
    setHydrationCount(data.hydrationCount);
    setStreak(data.streak);
    setWeeklyTrend(data.weeklyTrend);
    setSymptoms(data.symptoms);
    setInsights(data.insights);
    setLastLogDate(data.lastLogDate);
    setPainLevel([data.painLevel]);
    setMood(data.mood);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchDashboardData()
      .then((data) => {
        if (!cancelled) {
          applyData(data);
          triggerFlareToast(data.painLevel);
        }
      })
      .catch((error) => {
        console.error("Failed to load dashboard data", error);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [applyData, triggerFlareToast]);

  const logEntry = useCallback(
    async (overrides?: LogOverrides) => {
      const level = overrides?.painLevel ?? painLevel[0] ?? 3;
      const moodTag = overrides?.mood ?? mood;
      const note = overrides?.notes ?? notes;
      const symptomList = overrides?.symptoms ?? [];
      setIsSaving(true);
      setShowSuccess(false);
      try {
        const result = await savePainLog(level, moodTag, note, symptomList);
        if (!result.success) {
          throw new Error(result.error || "Failed to save pain log");
        }

        const data = await fetchDashboardData();
        applyData(data);

        triggerFlareToast(level);

        setShowSuccess(true);
        if (successTimer.current) clearTimeout(successTimer.current);
        successTimer.current = setTimeout(() => setShowSuccess(false), 3000);
      } catch (error) {
        console.error("Failed to save log", error);
        alert("Something went wrong while saving your log. Please try again.");
      } finally {
        setIsSaving(false);
      }
    },
    [painLevel, mood, notes, applyData, triggerFlareToast]
  );

  const incrementHydration = useCallback(async (delta: number) => {
    const res = await updateHydration(delta);
    if (res.success) {
      setHydrationCount((count) => Math.max(0, count + delta));
    }
  }, []);

  const toggleSymptom = useCallback(
    async (id: string) => {
      const active = !symptoms.includes(id);
      setSymptoms((prev) =>
        active ? [...prev, id] : prev.filter((s) => s !== id)
      );
      const res = await toggleSymptomAction(id, toIsoKey(new Date()), active);
      if (!res.success) {
        setSymptoms((prev) =>
          active ? prev.filter((s) => s !== id) : [...prev, id]
        );
      }
    },
    [symptoms]
  );

  return {
    isLoading,
    userName,
    hydrationCount,
    streak,
    weeklyTrend,
    insights,
    symptoms,
    lastLogDate,
    painLevel,
    setPainLevel,
    mood,
    setMood,
    notes,
    setNotes,
    isSaving,
    showSuccess,
    showToast,
    setShowToast,
    logEntry,
    incrementHydration,
    toggleSymptom,
  };
}
