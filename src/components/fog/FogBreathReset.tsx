"use client";

/**
 * FogBreathReset — one of the Fog Shield's four grounding tools.
 *
 * A guided 4-7-8 / box breathing session driven by the pure breathing engine
 * (`@/lib/somatic/breathing`). Each completed cycle reports a `calm` gain to
 * the Fog Shield page so the hero's clearing-sphere brightens with the user.
 * The card's own breathing dial renders the live phase progress as segmented
 * arcs (inhale / hold / exhale) around a calm ring that closes as cycles
 * stack up, with a running "calm feed" of earned gains.
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  WindPowerIcon,
  PauseIcon,
  RefreshIcon,
  CheckmarkCircle01Icon,
  CloudIcon,
} from "@hugeicons/core-free-icons";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";
import {
  BREATHING_PATTERNS,
  breathStateAt,
  cycleLength,
  type PatternName,
  type BreathState,
} from "@/lib/somatic/breathing";
import type { TranslationKey } from "@/lib/translations";

const GOAL_CYCLES = 4;
const CALM_PER_CYCLE = 0.2;

/** Gap in degrees at the top of the dial, so the ring never bites its tail. */
const DIAL_GAP_DEG = 20;

/** Circumference of the outer calm ring (r = 54 in a 120×120 viewBox). */
const CALM_TRACK_LEN = 2 * Math.PI * 54;

const PHASE_KEYS = {
  inhale: "fog.breath.inhale",
  hold: "fog.breath.hold",
  exhale: "fog.breath.exhale",
} as const satisfies Record<"inhale" | "hold" | "exhale", TranslationKey>;

const PHASE_ICONS = {
  inhale: WindPowerIcon,
  hold: PauseIcon,
  exhale: CloudIcon,
} as const;

const PHASE_ARC_CLASS: Record<BreathState["phase"], string> = {
  inhale: "stroke-sky-400",
  hold: "stroke-teal-500",
  exhale: "stroke-teal-400",
};

/** SVG arc from fraction `a` to fraction `b` of a circle (0 = top, clockwise). */
function arcPath(a: number, b: number, radius: number, center: number): string {
  const toXY = (frac: number) => {
    const rad = (frac * 360 - 90) * (Math.PI / 180);
    return {
      x: center + radius * Math.cos(rad),
      y: center + radius * Math.sin(rad),
    };
  };
  const start = toXY(a);
  const end = toXY(b);
  const largeArc = (b - a) * 360 > 180 ? 1 : 0;
  return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
}

/**
 * Dial geometry for a pattern at the given cycle progress (0..1).
 * Background arcs tile the full ring (minus the top gap); foreground arcs
 * fill each phase segment up to the current progress. Render only — the
 * breathing engine computes the truth.
 */
function buildDialArcs(pattern: PatternName, progress: number) {
  const total = cycleLength(pattern);
  const span = 1 - DIAL_GAP_DEG / 360;
  let acc = 0;
  return BREATHING_PATTERNS[pattern].map((step) => {
    const share = (step.seconds / total) * span;
    const frac = Math.min(1, Math.max(0, (progress - acc) / share));
    const seg = {
      phase: step.phase,
      bgD: arcPath(acc, acc + share, 44, 60),
      fgD: frac > 0.001 ? arcPath(acc, acc + frac * share, 44, 60) : null,
    };
    acc += share;
    return seg;
  });
}

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
  const [calmGains, setCalmGains] = useState<number[]>([]);
  const [sessionDone, setSessionDone] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastCycleRef = useRef(0);
  const elapsedRef = useRef(0);

  const breath = breathStateAt(pattern, elapsed);
  const completed = breath.cycle;
  const total = cycleLength(pattern);
  const dialArcs = useMemo(
    () => buildDialArcs(pattern, (elapsed % total) / total),
    [pattern, elapsed, total]
  );

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
        setCalmGains((g) => [CALM_PER_CYCLE, ...g].slice(0, 5));
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
    setCalmGains([]);
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
    setCalmGains([]);
    setSessionDone(false);
  };

  const phaseLabel = useMemo(() => t(PHASE_KEYS[breath.phase]), [breath.phase, t]);
  const ActivePhaseIcon = PHASE_ICONS[breath.phase];

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

        {/* Breathing dial: segmented phase arcs around a calm ring. */}
        <div className="relative mx-auto h-[180px] w-[180px]" aria-hidden="true">
          <svg viewBox="0 0 120 120" className="h-full w-full -rotate-[calc(var(--gap)/2)] [--gap:20deg]">
            {/* Outer calm ring: closes as cycles complete. */}
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              strokeWidth="3"
              className="stroke-zinc-200 dark:stroke-white/10"
              strokeDasharray={CALM_TRACK_LEN}
              strokeLinecap="round"
            />
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              strokeWidth="3"
              className="stroke-teal-500 transition-[stroke-dashoffset] duration-700 ease-out"
              strokeDasharray={CALM_TRACK_LEN}
              strokeDashoffset={CALM_TRACK_LEN * (1 - calm)}
              strokeLinecap="round"
              transform="rotate(-90 60 60)"
            />
            {/* Phase segments: dim track + lit progress per phase. */}
            <g transform={`rotate(${DIAL_GAP_DEG / 2} 60 60)`}>
              {dialArcs.map((seg) => (
                <React.Fragment key={seg.phase}>
                  <path
                    d={seg.bgD}
                    fill="none"
                    strokeWidth="6"
                    strokeLinecap="round"
                    className="stroke-zinc-200 dark:stroke-white/10"
                  />
                  {seg.fgD && (
                    <path
                      d={seg.fgD}
                      fill="none"
                      strokeWidth="6"
                      strokeLinecap="round"
                      className={cn(PHASE_ARC_CLASS[seg.phase], running && "transition-none")}
                    />
                  )}
                </React.Fragment>
              ))}
            </g>
          </svg>
          {/* Center readout: active phase icon + seconds remaining. */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
            <HugeiconsIcon
              icon={sessionDone ? CheckmarkCircle01Icon : ActivePhaseIcon}
              className={cn(
                "h-7 w-7",
                sessionDone ? "text-teal-500" : "text-teal-600 dark:text-teal-300"
              )}
            />
            <p className="text-3xl font-bold tabular-nums leading-none">
              {sessionDone ? "✓" : Math.max(0, Math.ceil(breath.secondsRemainingInPhase))}
            </p>
          </div>
        </div>

        {/* Phase pills + live countdown (announced politely). */}
        <div className="space-y-1" aria-live="polite">
          {sessionDone ? (
            <p className="flex items-center justify-center gap-2 text-sm font-semibold text-teal-600 dark:text-teal-300">
              <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-4 w-4" aria-hidden="true" />
              {t("fog.breath.sessionComplete")}
            </p>
          ) : (
            <>
              <div className="flex items-center justify-center gap-2">
                {(Object.keys(PHASE_KEYS) as Array<keyof typeof PHASE_KEYS>).map((phase) => {
                  const Icon = PHASE_ICONS[phase];
                  const active = breath.phase === phase;
                  return (
                    <span
                      key={phase}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                        active
                          ? "border-teal-500/40 bg-teal-500/10 text-teal-700 dark:text-teal-300"
                          : "border-border bg-card/50 text-muted-foreground"
                      )}
                    >
                      <HugeiconsIcon icon={Icon} className="h-3.5 w-3.5" aria-hidden="true" />
                      {t(PHASE_KEYS[phase])}
                    </span>
                  );
                })}
              </div>
              <p className="sr-only">
                {phaseLabel} — {Math.max(0, Math.ceil(breath.secondsRemainingInPhase))} {t("fog.breath.seconds")}
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

        {/* Live calm feed: chips of earned gains, newest first. */}
        {calmGains.length > 0 && (
          <div className="flex items-center justify-center gap-1.5" aria-label={t("fog.breath.calmFeed")}>
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t("fog.breath.calmFeed")}
            </span>
            {calmGains.map((gain, i) => (
              <span
                key={`${i}-${gain}`}
                className="rounded-full bg-teal-500/10 px-1.5 py-0.5 text-[0.65rem] font-bold tabular-nums text-teal-700 dark:text-teal-300"
              >
                +{gain.toFixed(2)}
              </span>
            ))}
            <span className="sr-only">{t("fog.breath.calmAria")}</span>
          </div>
        )}

        <p className="text-center text-[0.8rem] text-muted-foreground">
          {total}s / {t("fog.breath.cycles")}
        </p>
      </CardContent>
    </Card>
  );
}
