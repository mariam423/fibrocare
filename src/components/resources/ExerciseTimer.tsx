"use client";

/**
 * Interactive countdown timer for the Exercises guides.
 *
 * Start / pause / reset a session countdown with a soft synthesized chime
 * (Web Audio — no asset, works offline) at start and completion, plus an
 * estimated "Spoon Cost" pill so users can gauge energy spent before they
 * begin (a core pacing principle). The ticking math lives in the pure
 * `src/lib/resources/timer.ts` helpers; this component is a thin layer.
 */

import React, { useEffect, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Timer01Icon,
  PlayIcon,
  PauseIcon,
  RefreshIcon,
  FlameIcon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";
import { formatCountdown, nextTick } from "@/lib/resources/timer";
import type { TranslationKey } from "@/lib/translations";

interface ExerciseTimerProps {
  /** Full session length in seconds (e.g. 180 for a 3-minute stretch). */
  durationSeconds: number;
  /** Estimated energy cost shown in the pill (1–2 spoons). */
  spoonCost: number;
  /** Localized activity name (used for the aria-label). */
  labelKey: TranslationKey;
}

/** Soft synthesized two-tone chime — no audio files, offline-safe. */
function playChime(variant: "start" | "end"): void {
  try {
    if (typeof window === "undefined") return;
    const Ctor = window.AudioContext;
    if (!Ctor) return;
    const ctx = new Ctor();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    // Start chime is a single lower tone; completion is a brighter two-step.
    osc.frequency.setValueAtTime(variant === "start" ? 660 : 880, now);
    if (variant === "end") {
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.setValueAtTime(1100, now + 0.18);
    }
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.08, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.65);
    osc.onended = () => {
      void ctx.close();
    };
  } catch {
    // No audio available — the timer still works silently.
  }
}

export function ExerciseTimer({
  durationSeconds,
  spoonCost,
  labelKey,
}: ExerciseTimerProps) {
  const { t } = useLanguage();
  const [remaining, setRemaining] = useState(durationSeconds);
  const [running, setRunning] = useState(false);
  const endChimePlayed = useRef(false);

  const done = remaining <= 0 && !running;
  const progress = Math.min(1, Math.max(0, remaining / durationSeconds));

  // Tick once per second while running (setState lives in the interval
  // callback — not synchronously in the effect body).
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setRemaining((r) => nextTick(r));
    }, 1000);
    return () => window.clearInterval(id);
  }, [running]);

  // When the countdown reaches zero, stop ticking. Done via a timeout so
  // the setState is not synchronous inside the effect body.
  useEffect(() => {
    if (!running || remaining > 0) return;
    const id = window.setTimeout(() => setRunning(false), 0);
    return () => window.clearTimeout(id);
  }, [running, remaining]);

  // Completion chime — fires once per finished session.
  useEffect(() => {
    if (done && !endChimePlayed.current) {
      endChimePlayed.current = true;
      playChime("end");
    } else if (!done) {
      endChimePlayed.current = false;
    }
  }, [done]);

  const start = () => {
    setRemaining(durationSeconds);
    setRunning(true);
    playChime("start");
  };
  const pause = () => setRunning(false);
  const reset = () => {
    setRunning(false);
    setRemaining(durationSeconds);
  };

  const mainAction = done ? (
    <button
      type="button"
      onClick={start}
      className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-3 py-1.5 text-xs font-medium text-emerald-700 transition-all duration-200 hover:scale-[1.02] hover:bg-emerald-500/20 active:scale-[0.98] dark:text-emerald-300"
    >
      <HugeiconsIcon icon={RefreshIcon} className="h-3.5 w-3.5" aria-hidden="true" />
      {t("exercises.timer.reset")}
    </button>
  ) : running ? (
    <button
      type="button"
      onClick={pause}
      aria-label={t("exercises.timer.pause")}
      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/70 px-3 py-1.5 text-xs font-medium text-foreground transition-all duration-200 hover:scale-[1.02] hover:border-emerald-400/30 active:scale-[0.98]"
    >
      <HugeiconsIcon icon={PauseIcon} className="h-3.5 w-3.5" aria-hidden="true" />
      {t("exercises.timer.pause")}
    </button>
  ) : (
    <button
      type="button"
      onClick={start}
      className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-3 py-1.5 text-xs font-medium text-emerald-700 transition-all duration-200 hover:scale-[1.02] hover:bg-emerald-500/20 active:scale-[0.98] dark:text-emerald-300"
    >
      <HugeiconsIcon icon={PlayIcon} className="h-3.5 w-3.5" aria-hidden="true" />
      {t("exercises.timer.start")}
    </button>
  );

  return (
    <div
      className="flex flex-col gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 sm:flex-row sm:items-center sm:justify-between"
      role="timer"
      aria-label={t("exercises.timer.aria", { time: formatCountdown(remaining) })}
    >
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-300">
          <HugeiconsIcon icon={Timer01Icon} className="h-4.5 w-4.5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
            {t(labelKey)}
            {done && (
              <HugeiconsIcon
                icon={CheckmarkCircle02Icon}
                className="h-4 w-4 text-emerald-500"
                aria-label={t("exercises.timer.done")}
              />
            )}
          </p>
          <p className="text-xs text-muted-foreground">
            <span className="tabular-nums">
              <bdi>{formatCountdown(remaining)}</bdi>
            </span>
            {done && (
              <span className="ms-2 text-emerald-600 dark:text-emerald-400">
                {t("exercises.timer.done")}
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Spoon cost pill */}
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-700 dark:text-amber-300">
          <HugeiconsIcon icon={FlameIcon} className="h-3 w-3" aria-hidden="true" />
          <bdi>
            {spoonCost === 1
              ? t("exercises.timer.spoons.one")
              : t("exercises.timer.spoons.many", { count: spoonCost })}
          </bdi>
        </span>
        {mainAction}
        {running && (
          <button
            type="button"
            onClick={reset}
            aria-label={t("exercises.timer.reset")}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/70 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all duration-200 hover:scale-[1.02] hover:text-foreground active:scale-[0.98]"
          >
            <HugeiconsIcon icon={RefreshIcon} className="h-3.5 w-3.5" aria-hidden="true" />
            {t("exercises.timer.reset")}
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-emerald-500/10"
        aria-hidden="true"
      >
        <div
          className={cn(
            "h-full rounded-full bg-emerald-500/60 transition-[width] duration-1000 ease-linear",
            !running && "transition-none"
          )}
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
}
