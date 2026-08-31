"use client";

import React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  WorkoutStretchingIcon,
  Clock01Icon,
  RefreshIcon,
} from "@hugeicons/core-free-icons";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";
import type { TranslationKey } from "@/lib/translations";

interface Exercise {
  titleKey: TranslationKey;
  stepsKey: TranslationKey;
  durationKey: TranslationKey;
  gradient: string;
  iconBg: string;
}

const EXERCISES: Exercise[] = [
  {
    titleKey: "stretching.neck.title",
    stepsKey: "stretching.neck.steps",
    durationKey: "stretching.neck.duration",
    gradient: "from-sky-500/10 to-cyan-500/5",
    iconBg: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
  },
  {
    titleKey: "stretching.shoulder.title",
    stepsKey: "stretching.shoulder.steps",
    durationKey: "stretching.shoulder.duration",
    gradient: "from-violet-500/10 to-purple-500/5",
    iconBg: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
  },
  {
    titleKey: "stretching.lowerBack.title",
    stepsKey: "stretching.lowerBack.steps",
    durationKey: "stretching.lowerBack.duration",
    gradient: "from-emerald-500/10 to-teal-500/5",
    iconBg: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  },
  {
    titleKey: "stretching.thigh.title",
    stepsKey: "stretching.thigh.steps",
    durationKey: "stretching.thigh.duration",
    gradient: "from-amber-500/10 to-orange-500/5",
    iconBg: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  },
  {
    titleKey: "stretching.calf.title",
    stepsKey: "stretching.calf.steps",
    durationKey: "stretching.calf.duration",
    gradient: "from-rose-500/10 to-pink-500/5",
    iconBg: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
  },
];

function ExerciseCard({ exercise, index }: { exercise: Exercise; index: number }) {
  const { t } = useLanguage();

  const steps = t(exercise.stepsKey)
    .split("\n")
    .filter((s: string) => s.trim());

  return (
    <ScrollReveal delay={index * 0.08}>
      <div
        className={cn(
          "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-emerald-500/15 bg-white/70 shadow-md shadow-emerald-950/5 backdrop-blur-lg transition-all duration-300 hover:border-emerald-400/30 hover:shadow-lg hover:shadow-emerald-950/10 hover:scale-[1.01] dark:bg-slate-900/50 dark:hover:border-emerald-500/25"
        )}
      >
        {/* Gradient header with per-exercise icon placeholder */}
        <div
          className={cn(
            "relative flex items-center justify-center py-8 bg-gradient-to-b",
            exercise.gradient
          )}
        >
          <div
            className={cn(
              "flex h-16 w-16 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3",
              exercise.iconBg
            )}
          >
            <HugeiconsIcon
              icon={WorkoutStretchingIcon}
              className="h-8 w-8"
              aria-hidden="true"
            />
          </div>
          {/* Subtle decorative circles */}
          <div
            className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-white/20 dark:bg-white/5"
            aria-hidden="true"
          />
          <div
            className="absolute -left-2 -bottom-2 h-10 w-10 rounded-full bg-white/15 dark:bg-white/5"
            aria-hidden="true"
          />
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-5 space-y-3">
          {/* Title */}
          <h3 className="text-base font-bold tracking-tight text-foreground">
            {t(exercise.titleKey)}
          </h3>

          {/* Steps */}
          <ol className="flex-1 space-y-2">
            {steps.map((step: string, i: number) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-foreground/80 leading-relaxed">
                <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                  {i + 1}
                </span>
                <span>{step.trim()}</span>
              </li>
            ))}
          </ol>

          {/* Duration tag */}
          <div className="flex items-center gap-2 pt-2 border-t border-border/40">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/8 px-2.5 py-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
              <HugeiconsIcon
                icon={Clock01Icon}
                className="h-3 w-3"
                aria-hidden="true"
              />
              {t(exercise.durationKey)}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
              <HugeiconsIcon
                icon={RefreshIcon}
                className="h-3 w-3"
                aria-hidden="true"
              />
              2-3x
            </span>
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
}

export function StretchingGuide() {
  const { t } = useLanguage();

  return (
    <ScrollReveal as="section" className="space-y-5">
      {/* Section header */}
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {t("stretching.intro")}
        </p>
      </div>

      {/* Exercise cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {EXERCISES.map((exercise, index) => (
          <ExerciseCard
            key={exercise.titleKey}
            exercise={exercise}
            index={index}
          />
        ))}
      </div>

      {/* General tips footer */}
      <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/5 p-4 text-sm text-emerald-800 dark:text-emerald-300 leading-relaxed">
        <p className="font-medium mb-1">{t("stretching.tipsTitle")}</p>
        <p>{t("stretching.tipsBody")}</p>
      </div>
    </ScrollReveal>
  );
}
