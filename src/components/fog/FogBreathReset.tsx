"use client";

/**
 * FogBreathReset — one of the Fog Shield's four grounding tools.
 *
 * A guided 4-7-8 / box breathing session driven by the pure breathing engine
 * (`@/lib/somatic/breathing`). Each completed cycle reports a `calm` gain to
 * the Fog Shield page so the hero's clearing-sphere brightens with the user.
 * The card's own mini FogClearingSphere3D is bound to this session's local
 * calm, so the cloud visibly condenses as the breaths stack up.
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  WindPowerIcon,
  PauseIcon,
  RefreshIcon,
  CheckmarkCircle01Icon,
} from "@hugeicons/core-free-icons";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";
import { FogClearingSphere3D } from "@/components/ui/FogClearingSphere3D";
import {
  breathStateAt,
  cycleLength,
  type PatternName,
} from "@/lib/somatic/breathing";
import type { TranslationKey } from "@/lib/translations";

const GOAL_CYCLES = 4;
const CALM_PER_CYCLE = 0.2;

const PHASE_KEYS = {
  inhale: "fog.breath.inhale",
  hold: "fog.breath.hold",
  exhale: "fog.breath.exhale",
} as const satisfies Record<"inhale" | "hold" | "exhale", TranslationKey>;

interface FogBreathResetProps {
  /** Reports grounding progress (0..1 gains) up to the Fog Shield page. */
  onSettled: (delta: number) => void;
}

export function FogBreathReset({ onSettled }: FogBreathResetProps) {
  const { t } = useLanguage();
  const [pattern, setPattern] = useState<PatternName>("4-7-8");
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [calm, setCalmLocal] = useState(0);
  const [sessionDone, setSessionDone] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastCycleRef = useRef(0);
  const elapsedRef = useRef(0);

  const breath = breathStateAt(pattern, elapsed);
  const completed = breath.cycle;
  const total = cycleLength(pattern);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const start = () => {
    if (sessionDone) return;
    setRunning(true);
    timerRef.current = setInterval(() => {
      const prev = elapsedRef.current;
      const next = prev + 0.25;
      elapsedRef.current = next;
      const nextBreath = breathStateAt(pattern, next);
      if (nextBreath.cycle > lastCycleRef.current) {
        lastCycleRef.current = nextBreath.cycle;
        const newDone = nextBreath.cycle >= GOAL_CYCLES;
        setCalmLocal((c) => Math.min(1, c + CALM_PER_CYCLE));
        onSettled(newDone ? CALM_PER_CYCLE * 2 : CALM_PER_CYCLE);
        if (newDone) {
          setRunning(false);
          setSessionDone(true);
          if (timerRef.current) clearInterval(timerRef.current);
          timerRef.current = null;
        }
      }
      setElapsed(next);
    }, 250);
  };

  const pause = () => {
    setRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const reset = () => {
    pause();
    setElapsed(0);
    elapsedRef.current = 0;
    lastCycleRef.current = 0;
    setCalmLocal(0);
    setSessionDone(false);
  };

  const switchPattern = (next: PatternName) => {
    if (next === pattern) return;
    pause();
    setPattern(next);
    setElapsed(0);
    elapsedRef.current = 0;
    lastCycleRef.current = 0;
    setCalmLocal(0);
    setSessionDone(false);
  };

  const phaseLabel = useMemo(() => t(PHASE_KEYS[breath.phase]), [breath.phase, t]);

  return (
    <Card className="h-full border border-teal-500/15 bg-white/70 dark:bg-zinc-900/40 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden">
      <CardHeader className="border-b border-zinc-200/80 dark:border-white/5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-teal-500/20 bg-teal-500/10 backdrop-blur-sm">
            <HugeiconsIcon icon={WindPowerIcon} className="h-5 w-5 text-teal-600 dark:text-teal-400" aria-hidden="true" />
          </div>
          <div>
            <CardTitle className="text-xl text-zinc-900 dark:text-white font-semibold">
              {t("fog.breath.title")}
            </CardTitle>
            <CardDescription className="mt-1 text-sm text-muted-foreground">
              {t("fog.breath.subtitle")}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 p-5 sm:p-6">
        {/* Pattern selector */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            size="sm"
            variant={pattern === "4-7-8" ? "default" : "outline"}
            className="w-full"
            onClick={() => switchPattern("4-7-8")}
          >
            {t("fog.breath.pattern478")}
          </Button>
          <Button
            size="sm"
            variant={pattern === "box" ? "default" : "outline"}
            className="w-full"
            onClick={() => switchPattern("box")}
          >
            {t("fog.breath.patternBox")}
          </Button>
        </div>

        {/* Mini clearing sphere bound to this session's calm */}
        <FogClearingSphere3D calm={calm} className="h-[150px]" />

        {/* Phase + countdown */}
        <div className="text-center space-y-1" aria-live="polite">
          {sessionDone ? (
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-teal-600 dark:text-teal-300">
              <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-4 w-4" aria-hidden="true" />
              {t("fog.breath.sessionComplete")}
            </p>
          ) : (
            <>
              <p className="text-sm font-semibold capitalize">{phaseLabel}</p>
              <p className="text-3xl font-bold tabular-nums">
                {Math.max(0, Math.ceil(breath.secondsRemainingInPhase))}
                <span className="ms-1 text-sm font-normal text-muted-foreground">{t("fog.breath.seconds")}</span>
              </p>
            </>
          )}
        </div>

        {/* Cycle dots */}
        <div className="flex items-center justify-center gap-2" aria-label={t("fog.breath.cycles")}>
          {Array.from({ length: GOAL_CYCLES }, (_, i) => (
            <span
              key={i}
              className={cn(
                "h-2 w-2 rounded-full transition-colors",
                i < completed ? "bg-teal-500" : "bg-zinc-300 dark:bg-white/15"
              )}
            />
          ))}
          <span className="ms-2 text-xs text-muted-foreground">
            {completed}/{GOAL_CYCLES} {t("fog.breath.cycles")}
          </span>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {!running ? (
            <Button onClick={start} disabled={sessionDone} className="rounded-full">
              <HugeiconsIcon icon={WindPowerIcon} className="h-4 w-4" aria-hidden="true" />
              {t(sessionDone ? "fog.breath.sessionComplete" : "fog.breath.start")}
            </Button>
          ) : (
            <Button variant="secondary" onClick={pause} className="rounded-full">
              <HugeiconsIcon icon={PauseIcon} className="h-4 w-4" aria-hidden="true" />
              {t("fog.breath.pause")}
            </Button>
          )}
          <Button variant="outline" size="icon" onClick={reset} aria-label={t("fog.breath.reset")}>
            <HugeiconsIcon icon={RefreshIcon} className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>

        <p className="text-center text-[0.8rem] text-muted-foreground">
          {total}s / {t("fog.breath.cycles")}
        </p>
      </CardContent>
    </Card>
  );
}