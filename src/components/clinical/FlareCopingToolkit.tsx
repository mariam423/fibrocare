"use client";

/**
 * FlareCopingToolkit — Phase 3: Flare-up Management & Coping Strategies.
 *
 * Two halves, both driven by the pure engine in
 * `src/lib/clinical/copingStrategies.ts`:
 *
 *  1. Coping strategy cards — pacing, grounding, gentle heat, sensory
 *     shutdown and support, each with a concrete "try this" action.
 *  2. An interactive guided 4-7-8 breathing exercise: start/pause/reset,
 *     a phase label with countdown, a scaling breathing circle, and a
 *     completed-cycle counter. The breathing math (phase at second t,
 *     seconds remaining) comes from the unit-tested engine — the
 *     component only owns the timer.
 *
 * Safety: a persistent disclaimer tells users when a flare pattern
 * warrants prompt medical care. Fully localized (EN/AR); the breathing
 * circle animates with CSS transforms only (RTL-neutral).
 */

import React, { useEffect, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Alert01Icon,
  PauseIcon,
  PlayIcon,
  ReloadIcon,
  TimerIcon,
  WindPowerIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";
import type { TranslationKey } from "@/lib/translations";
import {
  COPING_MODULES,
  BREATHING_CYCLE,
  BREATHING_TOTAL,
  breathPhaseAt,
  breathSecondsLeft,
} from "@/lib/clinical/copingStrategies";

const PHASE_LABEL_KEYS: Record<
  ReturnType<typeof breathPhaseAt>,
  TranslationKey
> = {
  inhale: "clinical.coping.breath.inhale",
  hold: "clinical.coping.breath.hold",
  exhale: "clinical.coping.breath.exhale",
};

/** Circle scale per phase: grow on inhale, hold, shrink on exhale. */
const PHASE_SCALE: Record<ReturnType<typeof breathPhaseAt>, number> = {
  inhale: 1,
  hold: 1,
  exhale: 0.55,
};

const PHASE_TONE: Record<ReturnType<typeof breathPhaseAt>, string> = {
  inhale: "text-sky-700 dark:text-sky-300",
  hold: "text-teal-700 dark:text-teal-300",
  exhale: "text-indigo-700 dark:text-indigo-300",
};

function BreathingExercise() {
  const { t } = useLanguage();
  const [running, setRunning] = useState(false);
  const [second, setSecond] = useState(0);
  const [cycles, setCycles] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running) return;
    timerRef.current = setInterval(() => {
      setSecond((prev) => {
        const next = prev + 1;
        if (next % BREATHING_TOTAL === 0) {
          setCycles((c) => c + 1);
        }
        return next % BREATHING_TOTAL;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [running]);

  const reset = () => {
    setRunning(false);
    setSecond(0);
    setCycles(0);
  };

  const phase = breathPhaseAt(second);
  const secondsLeft = breathSecondsLeft(second);
  const scale = running || second > 0 ? PHASE_SCALE[phase] : 0.55;

  return (
    <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/15 text-sky-600 dark:text-sky-300">
          <HugeiconsIcon icon={WindPowerIcon} className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            {t("clinical.coping.breath.title")}
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t("clinical.coping.breath.subtitle")}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-center sm:gap-8">
        {/* Breathing circle */}
        <div
          className="relative flex h-36 w-36 shrink-0 items-center justify-center"
          role="img"
          aria-label={t("clinical.coping.breath.aria")}
        >
          <div
            className="absolute inset-0 rounded-full bg-gradient-to-br from-sky-400/30 via-teal-400/20 to-indigo-400/30 transition-transform duration-[1000ms] ease-in-out"
            style={{ transform: `scale(${scale})` }}
            aria-hidden="true"
          />
          <div
            className="absolute inset-3 rounded-full border border-sky-400/30 bg-white/60 dark:bg-slate-900/60"
            aria-hidden="true"
          />
          <div className="relative text-center" aria-live="polite">
            {running || second > 0 ? (
              <>
                <p
                  className={cn(
                    "text-sm font-semibold transition-colors",
                    PHASE_TONE[phase]
                  )}
                >
                  {t(PHASE_LABEL_KEYS[phase])}
                </p>
                <p className="text-2xl font-bold tabular-nums text-foreground">
                  <bdi>{secondsLeft}</bdi>
                </p>
              </>
            ) : (
              <div>
                <HugeiconsIcon
                  icon={TimerIcon}
                  className="h-6 w-6 text-muted-foreground"
                  aria-hidden="true"
                />
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex w-full max-w-[16rem] flex-col items-center gap-2">
          <div className="flex w-full items-center justify-center gap-2">
            <Button
              onClick={() => setRunning((r) => !r)}
              size="sm"
              className="rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <HugeiconsIcon
                icon={running ? PauseIcon : PlayIcon}
                className="me-1 h-4 w-4"
                aria-hidden="true"
              />
              {running
                ? t("clinical.coping.breath.pause")
                : t("clinical.coping.breath.start")}
            </Button>
            {(second > 0 || cycles > 0) && (
              <Button
                onClick={reset}
                variant="outline"
                size="sm"
                className="rounded-xl border-border transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                <HugeiconsIcon
                  icon={ReloadIcon}
                  className="me-1 h-4 w-4"
                  aria-hidden="true"
                />
                {t("clinical.coping.breath.reset")}
              </Button>
            )}
          </div>
          <p className="text-xs font-medium text-muted-foreground" aria-live="polite">
            {t("clinical.coping.breath.cycleCount", { count: cycles })}
          </p>
        </div>
      </div>
    </div>
  );
}

export function FlareCopingToolkit() {
  const { t } = useLanguage();

  return (
    <section
      aria-label={t("clinical.coping.title")}
      className="w-full break-inside-avoid rounded-2xl border border-rose-500/20 bg-white/70 p-5 shadow-lg shadow-rose-950/10 backdrop-blur-xl dark:bg-slate-900/60"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-300">
          <HugeiconsIcon icon={Alert01Icon} className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-base font-semibold text-foreground">
            {t("clinical.coping.title")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("clinical.coping.subtitle")}</p>
        </div>
      </div>

      {/* Strategy cards */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {COPING_MODULES.map((module) => (
          <article
            key={module.id}
            className={cn(
              "flex flex-col rounded-xl border border-border/60 bg-gradient-to-br p-4",
              module.gradient
            )}
          >
            <h3 className="text-sm font-semibold text-foreground">
              {t(module.titleTKey as TranslationKey)}
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              {t(module.bodyTKey as TranslationKey)}
            </p>
            <p className="mt-auto pt-3 text-xs font-medium text-emerald-700 dark:text-emerald-300">
              {t(module.actionTKey as TranslationKey)}
            </p>
          </article>
        ))}
      </div>

      {/* Guided breathing */}
      <div className="mt-4">
        <BreathingExercise />
      </div>

      <p className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
        <HugeiconsIcon
          icon={Alert01Icon}
          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-300"
          aria-hidden="true"
        />
        {t("clinical.coping.disclaimer")}
      </p>
    </section>
  );
}
