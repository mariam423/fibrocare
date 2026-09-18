"use client";

/**
 * MovementReminder — gentle micro-stretch nudges for long sessions.
 *
 * Sitting through a long study/coding session stiffens fibromyalgia
 * muscles. This widget watches for idle stretches (configurable 20/30/45
 * minutes of focused stillness) and pops a soft, dismissible toast: one
 * 30-second micro-stretch suggestion, quietly. No alarms, no guilt —
 * the whole point is that stiffness prevention must be cheaper than the
 * stiffness itself.
 *
 * Design decisions:
 *  - Off by default (opt-in); interval choice persists in localStorage.
 *  - The timer resets on any user input (mousemove/keydown/touch/scroll),
 *    so "focused session" is measured honestly.
 *  - The popup is a small card pinned to the bottom-start corner; it
 *    never covers the SOS button (bottom-end), auto-dismisses after 90s,
 *    and "snooze 10 min" is always available.
 *  - The stretch engine is the pure `pickMicroStretch` in
 *    `src/lib/fog/microTasks.ts`... actually it lives here as a tiny pure
 *    helper exported for tests.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  AlarmClockIcon,
  Cancel01Icon,
  TimerIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { TranslationKey } from "@/lib/translations";

/** Reminder interval options (minutes). */
const INTERVALS = [20, 30, 45] as const;
type IntervalMin = (typeof INTERVALS)[number];

const AUTO_DISMISS_MS = 90_000;
const SNOOZE_MS = 10 * 60_000;

const STRETCH_KEYS = [
  "movement.stretch.neck",
  "movement.stretch.shoulders",
  "movement.stretch.wrists",
  "movement.stretch.hips",
  "movement.stretch.calves",
] as const satisfies readonly TranslationKey[];

/** Pure: pick the stretch for a given idle cycle (stable, cycle-based). */
export function pickMicroStretch(cycle: number): TranslationKey {
  return STRETCH_KEYS[cycle % STRETCH_KEYS.length];
}

type EnabledState = "off" | IntervalMin;

export function MovementReminder() {
  const { t } = useLanguage();
  const [enabled, setEnabled] = useLocalStorage<EnabledState>(
    "fibrocare-movement-reminder",
    "off"
  );
  const [showCard, setShowCard] = useState(false);
  const [cycle, setCycle] = useState(0);
  const [mounted, setMounted] = useState(false);
  // useRef initializers must be pure — `0` now, stamped with Date.now()
  // in the mount effect below.
  const lastActivityRef = useRef<number>(0);
  const showAtRef = useRef<number | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Stamp the initial activity time + flip mounted without a
  // synchronous setState inside the effect body (react-hooks rule).
  useEffect(() => {
    lastActivityRef.current = Date.now();
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const minutes = mounted && enabled !== "off" ? enabled : null;

  const markActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    showAtRef.current = null;
  }, []);

  const dismiss = useCallback(() => {
    setShowCard(false);
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    // Next nudge scheduled from now.
    lastActivityRef.current = Date.now();
    showAtRef.current = null;
  }, []);

  const snooze = useCallback(() => {
    dismiss();
    lastActivityRef.current = Date.now() + SNOOZE_MS;
  }, [dismiss]);

  useEffect(() => {
    if (!minutes) {
      // Hide the card via a microtask — no synchronous setState in the
      // effect body (react-hooks rule).
      Promise.resolve().then(() => setShowCard(false));
      return;
    }
    const onActivity = () => markActivity();
    const events = ["mousemove", "mousedown", "keydown", "touchstart", "scroll"] as const;
    events.forEach((ev) => window.addEventListener(ev, onActivity, { passive: true }));

    const tick = setInterval(() => {
      const now = Date.now();
      if (showCard) return;
      if (showAtRef.current === null) {
        // Idle long enough? Schedule the nudge (small random ±90s jitter
        // so it doesn't always land at the same beat).
        const idleMs = now - lastActivityRef.current;
        if (idleMs > minutes * 60_000) {
          showAtRef.current = now + Math.floor(Math.random() * 90_000);
        }
      } else if (now >= showAtRef.current) {
        setCycle((c) => c + 1);
        setShowCard(true);
        showAtRef.current = null;
        lastActivityRef.current = now;
        hideTimerRef.current = setTimeout(() => setShowCard(false), AUTO_DISMISS_MS);
      }
    }, 5_000);

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, onActivity));
      clearInterval(tick);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [minutes, showCard, markActivity]);

  // A picker tick is needed for the stretch label to re-render per cycle.
  const stretchKey = useMemo(() => pickMicroStretch(cycle), [cycle]);

  const settings = (
    <div className="flex items-center gap-1.5">
      <HugeiconsIcon icon={AlarmClockIcon} className="h-4 w-4 text-teal-600 dark:text-teal-400" aria-hidden="true" />
      <span className="text-xs font-medium text-muted-foreground">{t("movement.title")}</span>
      <div className="ms-1 flex overflow-hidden rounded-full border border-border/70">
        {(["off", ...INTERVALS] as const).map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => setEnabled(opt)}
            aria-pressed={enabled === opt}
            className={cn(
              "px-2 py-0.5 text-[11px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/40",
              enabled === opt
                ? "bg-teal-500/15 text-teal-700 dark:text-teal-300"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            {opt === "off" ? t("movement.off") : t("movement.minutes", { count: opt })}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <>
      {/* Inline settings row (mount in dashboard/toolkit footer areas) */}
      <div className="flex items-center justify-between rounded-xl border border-border/60 bg-card/50 px-3 py-2 backdrop-blur-sm">
        {settings}
      </div>

      {/* Gentle popup card */}
      {showCard && (
        <div
          role="status"
          aria-live="polite"
          className={cn(
            "fixed bottom-[calc(env(safe-area-inset-bottom)+1.25rem)] start-4 z-40",
            "w-[calc(100vw-2rem)] max-w-xs rounded-2xl border border-teal-500/30",
            "bg-background/95 p-4 shadow-xl backdrop-blur-md sm:start-6"
          )}
        >
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-teal-500/25 bg-teal-500/10" aria-hidden="true">
              <HugeiconsIcon icon={TimerIcon} className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">{t("movement.popup.title")}</p>
              <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                {t(stretchKey)}
              </p>
              <div className="mt-2.5 flex gap-2">
                <Button type="button" size="sm" onClick={dismiss} className="h-8 rounded-full px-3 text-xs">
                  {t("movement.done")}
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={snooze} className="h-8 rounded-full px-3 text-xs">
                  {t("movement.snooze")}
                </Button>
              </div>
            </div>
            <button
              type="button"
              onClick={dismiss}
              aria-label={t("movement.dismiss")}
              className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <HugeiconsIcon icon={Cancel01Icon} className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
