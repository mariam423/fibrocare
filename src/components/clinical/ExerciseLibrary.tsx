"use client";

/**
 * ExerciseLibrary — Phase 3: Low-Impact Exercise Library.
 *
 * Tailored exercise guides for fibromyalgia patients, rendered from the
 * pure library in `src/lib/clinical/exerciseLibrary.ts`:
 *  - 8 graded guides (gentle → moderate) with duration, details and a
 *    step-by-step "how to do it" panel.
 *  - An intensity filter (all / gentle / light / moderate) so users can
 *    pick a starting point for their current capacity.
 *  - Exercises that benefit from clinician clearance carry a visible
 *    flag; pacing principles close the card.
 *
 * Fully localized (EN/AR) and responsive: the grid collapses from 2–3
 * columns on desktop to a single column on mobile, using logical
 * properties so it mirrors cleanly in RTL.
 */

import React, { useMemo, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Alert01Icon,
  BookOpenIcon,
  BulbIcon,
  DumbbellIcon,
  TimerIcon,
} from "@hugeicons/core-free-icons";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";
import type { TranslationKey } from "@/lib/translations";
import {
  LOW_IMPACT_EXERCISES,
  EXERCISE_PACING_TIPS,
  INTENSITY_ORDER,
  type ExerciseIntensity,
} from "@/lib/clinical/exerciseLibrary";

const INTENSITY_LABEL_KEYS: Record<ExerciseIntensity, TranslationKey> = {
  gentle: "clinical.exercise.intensity.gentle",
  light: "clinical.exercise.intensity.light",
  moderate: "clinical.exercise.intensity.moderate",
};

const INTENSITY_CHIP_TONE: Record<ExerciseIntensity, string> = {
  gentle: "border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  light: "border-teal-500/40 bg-teal-500/15 text-teal-700 dark:text-teal-300",
  moderate: "border-rose-500/40 bg-rose-500/15 text-rose-700 dark:text-rose-300",
};

const INTENSITY_FILTER_TONE: Record<ExerciseIntensity, string> = {
  gentle: "data-[on=true]:border-emerald-500/40 data-[on=true]:bg-emerald-500/15 data-[on=true]:text-emerald-700 dark:data-[on=true]:text-emerald-300",
  light: "data-[on=true]:border-teal-500/40 data-[on=true]:bg-teal-500/15 data-[on=true]:text-teal-700 dark:data-[on=true]:text-teal-300",
  moderate: "data-[on=true]:border-rose-500/40 data-[on=true]:bg-rose-500/15 data-[on=true]:text-rose-700 dark:data-[on=true]:text-rose-300",
};

type Filter = "all" | ExerciseIntensity;

/** Steps are stored as "1. …\n2. …" strings — split for a clean list. */
function stepsToList(steps: string): string[] {
  return steps
    .split("\n")
    .map((line) => line.replace(/^\d+\.\s*/, ""))
    .filter(Boolean);
}

export function ExerciseLibrary() {
  const { t } = useLanguage();
  const [filter, setFilter] = useState<Filter>("all");

  const visible = useMemo(
    () =>
      filter === "all"
        ? [...LOW_IMPACT_EXERCISES]
        : LOW_IMPACT_EXERCISES.filter((e) => e.intensity === filter),
    [filter]
  );

  const filters: Array<{ id: Filter; label: string }> = [
    { id: "all", label: t("clinical.exercise.filter.all") },
    ...INTENSITY_ORDER.map((id) => ({ id, label: t(INTENSITY_LABEL_KEYS[id]) })),
  ];

  return (
    <section
      aria-label={t("clinical.exercise.title")}
      className="w-full break-inside-avoid rounded-2xl border border-emerald-500/20 bg-white/70 p-5 shadow-lg shadow-emerald-950/10 backdrop-blur-xl dark:bg-slate-900/60"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-300">
          <HugeiconsIcon icon={DumbbellIcon} className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-base font-semibold text-foreground">
            {t("clinical.exercise.title")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("clinical.exercise.subtitle")}</p>
        </div>
      </div>

      {/* Intensity filter */}
      <div
        className="mt-4 flex flex-wrap items-center gap-2"
        role="group"
        aria-label={t("clinical.exercise.title")}
      >
        {filters.map((f) => {
          const active = filter === f.id;
          return (
            <button
              key={f.id}
              type="button"
              aria-pressed={active}
              data-on={active}
              onClick={() => setFilter(f.id)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-all duration-200 active:scale-[0.95] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active
                  ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                  : "border-border bg-card/60 text-muted-foreground hover:border-emerald-400/30 hover:text-foreground",
                !active && f.id !== "all" && INTENSITY_FILTER_TONE[f.id]
              )}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Exercise cards */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {visible.map((exercise) => (
          <article
            key={exercise.id}
            className={cn(
              "flex flex-col rounded-xl border border-border/60 bg-gradient-to-br p-4 transition-colors duration-200",
              exercise.gradient
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-foreground">
                {t(exercise.tKey as TranslationKey)}
              </h3>
              <span
                className={cn(
                  "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                  INTENSITY_CHIP_TONE[exercise.intensity]
                )}
              >
                {t(INTENSITY_LABEL_KEYS[exercise.intensity])}
              </span>
            </div>

            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              {t(exercise.detailsTKey as TranslationKey)}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <HugeiconsIcon icon={TimerIcon} className="h-3.5 w-3.5" aria-hidden="true" />
                {t("clinical.exercise.minutes", { count: exercise.minutes })}
              </span>
              {exercise.needsClearance && (
                <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-300">
                  <HugeiconsIcon icon={Alert01Icon} className="h-3.5 w-3.5" aria-hidden="true" />
                  {t("clinical.exercise.clearance")}
                </span>
              )}
            </div>

            {/* Steps — inside a disclosure so the grid stays scannable */}
            <details className="group mt-3 rounded-lg border border-border/50 bg-card/50">
              <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2 text-xs font-medium text-foreground/90 transition-colors hover:text-foreground [&::-webkit-details-marker]:hidden">
                <HugeiconsIcon icon={BookOpenIcon} className="h-3.5 w-3.5" aria-hidden="true" />
                {t("clinical.exercise.stepsLabel")}
              </summary>
              <ol className="space-y-1.5 px-3 pb-3 pt-1 text-xs text-muted-foreground">
                {stepsToList(t(exercise.stepsTKey as TranslationKey)).map((step, i) => (
                  <li key={i} className="flex gap-2">
                    <span
                      className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-[9px] font-bold text-emerald-700 dark:text-emerald-300"
                      aria-hidden="true"
                    >
                      {i + 1}
                    </span>
                    <span className="min-w-0">{step}</span>
                  </li>
                ))}
              </ol>
            </details>
          </article>
        ))}
      </div>

      {/* Pacing principles */}
      <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
        <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <HugeiconsIcon
            icon={BulbIcon}
            className="h-4 w-4 text-emerald-600 dark:text-emerald-300"
            aria-hidden="true"
          />
          {t("clinical.exercise.tipsTitle")}
        </p>
        <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-muted-foreground">
          {EXERCISE_PACING_TIPS.map((tipKey) => (
            <li key={tipKey}>{t(tipKey as TranslationKey)}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
