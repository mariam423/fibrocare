"use client";

/**
 * CycleSymptomTracker — fibromyalgia-specific symptom-fluctuation widget
 * for the /resources/cycle page.
 *
 * Shows how common fibro symptoms (widespread muscle ache, fatigue, sleep
 * disruption, brain fog) typically shift across the four cycle phases plus
 * the pre-period flare window, with a plain-language coping insight per
 * phase. Fully RTL-safe (logical properties + BdiText), bilingual (all copy
 * flows through TranslationKeys), and accessible (each phase card is a
 * focusable region with aria-describedby).
 *
 * This is a self-contained widget — it does not write health data; the
 * "Log today's symptoms" CTA links to the dashboard health log where the
 * real symptom entries live.
 */

import React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  DropletIcon,
  FireIcon,
  Moon02Icon,
  Brain01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { BdiText } from "./BdiText";
import { useLanguage } from "@/context/LanguageContext";
import type { TranslationKey } from "@/lib/translations";

const PHASES: Array<{
  key: TranslationKey;
  subKey: TranslationKey;
  symptomKey: TranslationKey;
  insightKey: TranslationKey;
  tone: "rose" | "emerald" | "sky" | "amber" | "rose";
}> = [
  {
    key: "cycle.phase.menstrual",
    subKey: "cycle.phase.menstrualSub",
    symptomKey: "cycleTracker.symptom.menstrual",
    insightKey: "cycleTracker.insight.menstrual",
    tone: "rose",
  },
  {
    key: "cycle.phase.follicular",
    subKey: "cycle.phase.follicularSub",
    symptomKey: "cycleTracker.symptom.follicular",
    insightKey: "cycleTracker.insight.follicular",
    tone: "emerald",
  },
  {
    key: "cycle.phase.ovulatory",
    subKey: "cycle.phase.ovulatorySub",
    symptomKey: "cycleTracker.symptom.ovulatory",
    insightKey: "cycleTracker.insight.ovulatory",
    tone: "sky",
  },
  {
    key: "cycle.phase.luteal",
    subKey: "cycle.phase.lutealSub",
    symptomKey: "cycleTracker.symptom.luteal",
    insightKey: "cycleTracker.insight.luteal",
    tone: "amber",
  },
  {
    key: "cycle.phase.window",
    subKey: "cycle.phase.windowSub",
    symptomKey: "cycleTracker.symptom.window",
    insightKey: "cycleTracker.insight.window",
    tone: "rose",
  },
];

const PHASE_TONE = {
  rose: {
    dot: "bg-rose-400/80",
    text: "text-rose-700 dark:text-rose-300",
    ring: "border-rose-400/30 bg-rose-500/5",
    bar: "bg-rose-400",
  },
  emerald: {
    dot: "bg-emerald-400/80",
    text: "text-emerald-700 dark:text-emerald-300",
    ring: "border-emerald-400/30 bg-emerald-500/5",
    bar: "bg-emerald-400",
  },
  sky: {
    dot: "bg-sky-400/80",
    text: "text-sky-700 dark:text-sky-300",
    ring: "border-sky-400/30 bg-sky-500/5",
    bar: "bg-sky-400",
  },
  amber: {
    dot: "bg-amber-400/80",
    text: "text-amber-700 dark:text-amber-300",
    ring: "border-amber-400/30 bg-amber-500/5",
    bar: "bg-amber-400",
  },
};

const SYMPTOM_ICONS: Array<React.ComponentProps<typeof HugeiconsIcon>["icon"]> = [
  FireIcon,    // muscle ache
  Moon02Icon,  // sleep
  Brain01Icon, // brain fog
  DropletIcon, // fatigue
];

export function CycleSymptomTracker() {
  const { t } = useLanguage();

  return (
    <section
      aria-labelledby="cycle-tracker-heading"
      className="rounded-2xl border border-rose-500/15 bg-white/50 p-5 shadow-lg shadow-rose-950/10 backdrop-blur-xl dark:border-slate-700/40 dark:bg-slate-950/30"
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2
            id="cycle-tracker-heading"
            className="text-base font-semibold text-foreground"
          >
            {t("cycleTracker.title")}
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {t("cycleTracker.subtitle")}
          </p>
        </div>
        <a
          href="/dashboard/health-logs"
          className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-500/18 hover:scale-[1.02] active:scale-[0.98] dark:text-emerald-300"
        >
          {t("cycleTracker.logCta")}
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            className="h-3 w-3"
            aria-hidden="true"
          />
        </a>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {PHASES.map((phase) => {
          const tone = PHASE_TONE[phase.tone];
          return (
            <article
              key={phase.key}
              className={cn(
                "rounded-xl border p-3.5 transition-all duration-200 hover:border-rose-400/40",
                tone.ring,
              )}
            >
              <div className="flex items-start gap-2.5">
                <span
                  className={cn("mt-0.5 h-2 w-2 shrink-0 rounded-full", tone.dot)}
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <p
                    className={cn("text-xs font-bold", tone.text)}
                    lang={phase.key.includes("ar") ? "ar" : "en"}
                  >
                    <BdiText text={t(phase.key)} />
                  </p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                    <BdiText text={t(phase.subKey)} />
                  </p>
                </div>
              </div>

              <p className="mt-2 text-sm leading-relaxed text-foreground/90">
                <BdiText text={t(phase.symptomKey)} />
              </p>

              <div className="mt-2.5 rounded-lg bg-muted/50 p-2.5">
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
                  <HugeiconsIcon
                    icon={DropletIcon}
                    className="h-3 w-3"
                    aria-hidden="true"
                  />
                  <span className="hidden sm:inline">{t("cycleTracker.insightLabel")}</span>
                  <span className="sm:hidden">{t("cycleTracker.insightShort")}</span>
                </div>
                <p className="mt-0.5 text-xs leading-relaxed text-foreground/85">
                  <BdiText text={t(phase.insightKey)} />
                </p>
              </div>

              {/* Symptom chips for scanability */}
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {SYMPTOM_ICONS.map((icon, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 rounded-full border border-border/40 bg-muted/40 px-2 py-0.5 text-[10px] text-muted-foreground"
                    aria-hidden="true"
                  >
                    <HugeiconsIcon icon={icon} className="h-3 w-3" aria-hidden="true" />
                    <span className="hidden sm:inline">
                      {i === 0 && t("cycleTracker.symptomChip.ache")}
                      {i === 1 && t("cycleTracker.symptomChip.sleep")}
                      {i === 2 && t("cycleTracker.symptomChip.fog")}
                      {i === 3 && t("cycleTracker.symptomChip.fatigue")}
                    </span>
                  </span>
                ))}
              </div>
            </article>
          );
        })}
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
        <BdiText text={t("cycleTracker.disclaimer")} />
      </p>
    </section>
  );
}
