"use client";

/**
 * SleepHygieneGuide — Phase 3: Sleep Hygiene Guidance Section.
 *
 * Structured sleep-hygiene tips for fibromyalgia (from the pure
 * `src/lib/clinical/sleepHygiene.ts` engine) plus an interactive
 * nightly checklist:
 *  - 8 evidence-aligned habits, each checkable.
 *  - A 0–8 score with a gentle reading (strong / building / starting)
 *    and a locale-aware nudge.
 *  - Checklists persist locally (`useLocalStorage`) so the user can
 *    re-use the guide every night; nothing clinical is uploaded.
 *
 * Fully localized (EN/AR), responsive from mobile up.
 */

import React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircle02Icon,
  InformationCircleIcon,
  MoonCloudIcon,
} from "@hugeicons/core-free-icons";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";
import type { TranslationKey } from "@/lib/translations";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import {
  SLEEP_HABITS,
  sleepHygieneScore,
  sleepHygieneReading,
  type SleepHabitId,
} from "@/lib/clinical/sleepHygiene";

const READING_LABEL_KEYS: Record<
  ReturnType<typeof sleepHygieneReading>,
  TranslationKey
> = {
  strong: "clinical.sleep.reading.strong",
  building: "clinical.sleep.reading.building",
  starting: "clinical.sleep.reading.starting",
};

const HINT_KEYS: Record<
  ReturnType<typeof sleepHygieneReading>,
  TranslationKey
> = {
  strong: "clinical.sleep.hint.strong",
  building: "clinical.sleep.hint.building",
  starting: "clinical.sleep.hint.starting",
};

const READING_TONE: Record<
  ReturnType<typeof sleepHygieneReading>,
  string
> = {
  strong: "border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  building: "border-teal-500/40 bg-teal-500/15 text-teal-700 dark:text-teal-300",
  starting: "border-amber-500/40 bg-amber-500/15 text-amber-700 dark:text-amber-300",
};

export function SleepHygieneGuide() {
  const { t } = useLanguage();
  const [checked, setChecked] = useLocalStorage<SleepHabitId[]>(
    "fibrocare:clinical:sleep-habits",
    []
  );

  const toggleHabit = (id: SleepHabitId) => {
    setChecked((prev) =>
      prev.includes(id) ? prev.filter((h) => h !== id) : [...prev, id]
    );
  };

  const score = sleepHygieneScore(checked);
  const reading = sleepHygieneReading(checked);

  return (
    <section
      aria-label={t("clinical.sleep.title")}
      className="w-full break-inside-avoid rounded-2xl border border-indigo-500/20 bg-white/70 p-5 shadow-lg shadow-indigo-950/10 backdrop-blur-xl dark:bg-slate-900/60"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-300">
          <HugeiconsIcon icon={MoonCloudIcon} className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-base font-semibold text-foreground">
            {t("clinical.sleep.title")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("clinical.sleep.subtitle")}</p>
        </div>
      </div>

      {/* Score + reading */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div
          className={cn(
            "rounded-xl border px-3 py-1.5 text-sm font-semibold",
            READING_TONE[reading]
          )}
          aria-live="polite"
        >
          {t(READING_LABEL_KEYS[reading])} ·{" "}
          {t("clinical.sleep.score", { count: score })}
        </div>
        <p className="min-w-0 flex-1 text-xs text-muted-foreground">
          {t(HINT_KEYS[reading])}
        </p>
      </div>

      {/* Habit checklist */}
      <h3 className="mt-4 text-sm font-semibold text-foreground">
        {t("clinical.sleep.checklistTitle")}
      </h3>
      <ul className="mt-2 grid grid-cols-1 gap-2 lg:grid-cols-2">
        {SLEEP_HABITS.map((habit) => {
          const active = checked.includes(habit.id);
          return (
            <li key={habit.id}>
              <button
                type="button"
                role="checkbox"
                aria-checked={active}
                onClick={() => toggleHabit(habit.id)}
                className={cn(
                  "flex h-full w-full items-start gap-3 rounded-xl border px-3 py-2.5 text-left transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? "border-indigo-500/40 bg-indigo-500/10"
                    : "border-border bg-card/60 hover:border-indigo-400/30"
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-[11px] leading-none transition-all",
                    active
                      ? "border-indigo-500/60 bg-indigo-500 text-white"
                      : "border-border text-transparent"
                  )}
                  aria-hidden="true"
                >
                  ✓
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-foreground">
                    {t(habit.titleTKey as TranslationKey)}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {t(habit.bodyTKey as TranslationKey)}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <p className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
        <HugeiconsIcon
          icon={InformationCircleIcon}
          className="mt-0.5 h-3.5 w-3.5 shrink-0"
          aria-hidden="true"
        />
        {t("clinical.sleep.disclaimer")}
      </p>

      {/* Screen-reader-only live confirmation for check toggles */}
      <span className="sr-only" aria-live="polite">
        <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-3 w-3" aria-hidden="true" />
        {t("clinical.sleep.score", { count: score })}
      </span>
    </section>
  );
}
