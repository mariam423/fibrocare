"use client";

import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Undo02Icon,
  Restaurant02Icon,
  DiceFaces02Icon,
  Tired01Icon,
  SleepingIcon,
  NeutralIcon,
  SmileIcon,
} from "@hugeicons/core-free-icons";
import { useLanguage } from "@/context/LanguageContext";
import type { TranslationKey } from "@/lib/translations";
import { cn } from "@/lib/utils";

/* ─── Types ──────────────────────────────────────────────────────── */

interface MealFatigueEntry {
  id: string;
  timestamp: number;
  mealType: MealType;
  fatigueLevel: FatigueLevel;
  notes: string;
}

type MealType = "breakfast" | "lunch" | "dinner" | "snack";
type FatigueLevel = 0 | 1 | 2 | 3 | 4; // 0 = none, 4 = severe

/* ─── Constants ──────────────────────────────────────────────────── */

const MEAL_OPTIONS: Array<{
  type: MealType;
  tKey: TranslationKey;
  emoji: string;
}> = [
  { type: "breakfast", tKey: "postMeal.meal.breakfast", emoji: "🌅" },
  { type: "lunch", tKey: "postMeal.meal.lunch", emoji: "☀️" },
  { type: "dinner", tKey: "postMeal.meal.dinner", emoji: "🌙" },
  { type: "snack", tKey: "postMeal.meal.snack", emoji: "🍪" },
];

const FATIGUE_LEVELS: Array<{
  level: FatigueLevel;
  tKey: TranslationKey;
  icon: typeof DiceFaces02Icon;
  color: string;
  ringColor: string;
  bgColor: string;
}> = [
  {
    level: 0,
    tKey: "postMeal.fatigue.none",
    icon: SmileIcon,
    color: "text-emerald-400",
    ringColor: "ring-emerald-400/40",
    bgColor: "bg-emerald-400/10",
  },
  {
    level: 1,
    tKey: "postMeal.fatigue.mild",
    icon: NeutralIcon,
    color: "text-amber-300",
    ringColor: "ring-amber-300/40",
    bgColor: "bg-amber-300/10",
  },
  {
    level: 2,
    tKey: "postMeal.fatigue.moderate",
    icon: Tired01Icon,
    color: "text-orange-400",
    ringColor: "ring-orange-400/40",
    bgColor: "bg-orange-400/10",
  },
  {
    level: 3,
    tKey: "postMeal.fatigue.high",
    icon: SleepingIcon,
    color: "text-rose-400",
    ringColor: "ring-rose-400/40",
    bgColor: "bg-rose-400/10",
  },
  {
    level: 4,
    tKey: "postMeal.fatigue.severe",
    icon: DiceFaces02Icon,
    color: "text-red-500",
    ringColor: "ring-red-500/40",
    bgColor: "bg-red-500/10",
  },
];

const STORAGE_KEY = "fibrocare:postMealFatigue";
const MAX_ENTRIES = 10;

/* ─── Helpers ────────────────────────────────────────────────────── */

function loadEntries(): MealFatigueEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveEntries(entries: MealFatigueEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // storage full or unavailable — fail silently
  }
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getMealEmoji(type: MealType): string {
  return MEAL_OPTIONS.find((m) => m.type === type)?.emoji ?? "🍽️";
}

/* ─── Component ──────────────────────────────────────────────────── */

export function PostMealFatigueCard() {
  const { t } = useLanguage();

  const [entries, setEntries] = useState<MealFatigueEntry[]>([]);
  const [selectedMeal, setSelectedMeal] = useState<MealType>("lunch");
  const [selectedFatigue, setSelectedFatigue] = useState<FatigueLevel>(0);
  const [justSaved, setJustSaved] = useState(false);

  // Hydrate from localStorage after mount
  useEffect(() => {
    setEntries(loadEntries());
  }, []);

  const logFatigue = useCallback(() => {
    const entry: MealFatigueEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: Date.now(),
      mealType: selectedMeal,
      fatigueLevel: selectedFatigue,
      notes: "",
    };

    const next = [entry, ...entries].slice(0, MAX_ENTRIES);
    setEntries(next);
    saveEntries(next);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  }, [selectedMeal, selectedFatigue, entries]);

  const undoLast = useCallback(() => {
    if (entries.length === 0) return;
    const next = entries.slice(1);
    setEntries(next);
    saveEntries(next);
  }, [entries]);

  return (
    <div className="flex flex-1 flex-col p-6">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-card-foreground">
            {t("postMeal.title")}
          </h3>
          <button
            type="button"
            onClick={undoLast}
            disabled={entries.length === 0}
            aria-label={t("postMeal.undoAria")}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <HugeiconsIcon icon={Undo02Icon} className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <p className="text-sm text-muted-foreground">
          {t("postMeal.subtitle")}
        </p>
      </div>

      <div className="flex flex-1 flex-col justify-between space-y-4">
        {/* Meal Type Selector */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
            {t("postMeal.mealLabel")}
          </p>
          <div className="grid grid-cols-4 gap-2">
            {MEAL_OPTIONS.map((meal) => (
              <button
                key={meal.type}
                type="button"
                onClick={() => setSelectedMeal(meal.type)}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl px-2 py-2.5 text-xs font-medium transition-all duration-200",
                  selectedMeal === meal.type
                    ? "border border-primary/40 bg-primary/15 text-primary ring-1 ring-primary/20 shadow-[0_0_12px_rgba(16,185,129,0.12)]"
                    : "border border-border bg-muted/60 text-muted-foreground hover:bg-muted"
                )}
              >
                <span className="text-base leading-none" aria-hidden="true">
                  {meal.emoji}
                </span>
                <span className="text-[11px] leading-tight truncate w-full text-center">
                  {t(meal.tKey)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Fatigue Level Selector */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
            {t("postMeal.fatigueLabel")}
          </p>
          <div className="flex items-center gap-2">
            {FATIGUE_LEVELS.map((fl) => {
              const IconComp = fl.icon;
              return (
                <button
                  key={fl.level}
                  type="button"
                  onClick={() => setSelectedFatigue(fl.level)}
                  aria-label={t(fl.tKey)}
                  className={cn(
                    "flex flex-1 flex-col items-center gap-1 rounded-xl py-2.5 px-1 transition-all duration-200",
                    selectedFatigue === fl.level
                      ? cn("border-2", fl.ringColor, fl.bgColor, fl.color, "font-semibold")
                      : "border border-border bg-muted/40 text-muted-foreground hover:bg-muted"
                  )}
                >
                  <HugeiconsIcon icon={IconComp} className="h-5 w-5" aria-hidden="true" />
                  <span className="text-[10px] leading-tight text-center">
                    {t(fl.tKey)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Log Button */}
        <motion.button
          type="button"
          onClick={logFatigue}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary/90 text-primary-foreground py-3 text-sm font-semibold shadow-md hover:bg-primary transition-colors"
        >
          <HugeiconsIcon icon={Restaurant02Icon} className="h-4 w-4" aria-hidden="true" />
          {t("postMeal.log")}
        </motion.button>

        {/* Success feedback */}
        <AnimatePresence>
          {justSaved && (
            <motion.p
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="text-center text-xs font-medium text-primary"
              role="status"
              aria-live="polite"
            >
              ✓ {t("postMeal.saved")}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Recent entries */}
        {entries.length > 0 && (
          <div className="space-y-1.5 max-h-28 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              {t("postMeal.recent")}
            </p>
            {entries.slice(0, 4).map((entry) => {
              const fl = FATIGUE_LEVELS[entry.fatigueLevel];
              const IconComp = fl.icon;
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/30 px-2.5 py-1.5"
                >
                  <span className="text-sm" aria-hidden="true">
                    {getMealEmoji(entry.mealType)}
                  </span>
                  <span className="text-xs text-muted-foreground flex-1">
                    {formatTime(entry.timestamp)}
                  </span>
                  <HugeiconsIcon icon={IconComp} className={cn("h-3.5 w-3.5", fl.color)} aria-hidden="true" />
                  <span className={cn("text-[11px] font-medium", fl.color)}>
                    {t(fl.tKey)}
                  </span>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
