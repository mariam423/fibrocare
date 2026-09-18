"use client";

/**
 * SpoonCheckInCard — the daily Spoon Theory check-in.
 *
 * Morning prompt: "how many energy spoons do you have today?" (1–10).
 * The check-in persists to the database (SpoonLog, one row per day via a
 * session+PIN-guarded server action) and mirrors to localStorage so other
 * dashboard widgets can read today's energy without another fetch.
 *
 * Low battery (≤3 spoons) flips the card into Energy Saving Mode: the
 * guidance changes from "spend on what matters" to "rest is the task",
 * and the card signals the mode via `data-energy-saving` so the dashboard
 * can adapt (hide secondary widgets) without prop drilling.
 *
 * A 7-day strip of past check-ins gives the "am I overdoing it?" read.
 * Fully localized (EN/AR), responsive, keyboard-accessible.
 */

import React, { useCallback, useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  BatteryLowIcon,
  BatteryChargingIcon,
  Loading01Icon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";
import { localizeActionError } from "@/lib/actionErrors";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import {
  saveSpoonLog,
  getTodaySpoonLog,
  getSpoonWeek,
  type SpoonLogEntry,
} from "@/app/actions";

/** localStorage mirror key — day-scoped readers check `logDate`. */
export const SPOON_MIRROR_KEY = "fibrocare-spoon-today";

const SPOONS_MIN = 1;
const SPOONS_MAX = 10;
/** At or below this the card switches into Energy Saving Mode. */
export const ENERGY_SAVING_THRESHOLD = 3;

type DayState =
  | { status: "loading" }
  | { status: "prompt" }
  | { status: "saved"; log: SpoonLogEntry };

/** Tone per spoon level: healthy → cautious → low battery. */
function toneFor(spoons: number): {
  chip: string;
  text: string;
  ring: string;
} {
  if (spoons <= ENERGY_SAVING_THRESHOLD) {
    return {
      chip: "border-rose-500/40 bg-rose-500/15 text-rose-700 dark:text-rose-300",
      text: "text-rose-700 dark:text-rose-300",
      ring: "focus-visible:ring-rose-500/50",
    };
  }
  if (spoons <= 6) {
    return {
      chip: "border-amber-500/40 bg-amber-500/15 text-amber-700 dark:text-amber-300",
      text: "text-amber-700 dark:text-amber-300",
      ring: "focus-visible:ring-amber-500/50",
    };
  }
  return {
    chip: "border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    text: "text-emerald-700 dark:text-emerald-300",
    ring: "focus-visible:ring-emerald-500/50",
  };
}

export function SpoonCheckInCard() {
  const { t } = useLanguage();
  const [day, setDay] = useState<DayState>({ status: "loading" });
  const [week, setWeek] = useState<SpoonLogEntry[]>([]);
  const [picked, setPicked] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, setMirror] = useLocalStorage<SpoonLogEntry | null>(SPOON_MIRROR_KEY, null);

  useEffect(() => {
    let alive = true;
    void Promise.all([getTodaySpoonLog(), getSpoonWeek()])
      .then(([todayRes, weekRes]) => {
        if (!alive) return;
        if (todayRes.success && todayRes.data) {
          const log = todayRes.data.log;
          if (log) {
            setDay({ status: "saved", log });
            setMirror(log);
          } else {
            setDay({ status: "prompt" });
          }
        } else {
          setDay({ status: "prompt" });
        }
        if (weekRes.success && weekRes.data) setWeek(weekRes.data.logs);
      })
      .catch(() => {
        if (alive) setDay({ status: "prompt" });
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = useCallback(
    async (spoons: number) => {
      setSaving(true);
      setError(null);
      try {
        const res = await saveSpoonLog(spoons);
        if (res.success && res.data?.log) {
          setDay({ status: "saved", log: res.data.log });
          setMirror(res.data.log);
          void getSpoonWeek().then((w) => {
            if (w.success && w.data) setWeek(w.data.logs);
          });
        } else {
          setError(
            res.success
              ? null
              : localizeActionError(res.error, "spoon.checkin.failed", t)
          );
        }
      } finally {
        setSaving(false);
      }
    },
    [setMirror, t]
  );

  const saved = day.status === "saved" ? day.log : null;
  const level = saved ? saved.currentSpoons : picked ?? 0;
  const energySaving = saved !== null && saved.currentSpoons <= ENERGY_SAVING_THRESHOLD;
  const tone = toneFor(level || 5);

  const guidance = saved
    ? energySaving
      ? t("spoon.checkin.guide.rest")
      : t("spoon.checkin.guide.spend")
    : t("spoon.checkin.guide.ask");

  return (
    <Card
      data-energy-saving={energySaving ? "true" : "false"}
      className={cn(
        "w-full h-full overflow-hidden border backdrop-blur-md",
        energySaving
          ? "border-rose-500/25 bg-rose-500/5"
          : "border-amber-200 dark:border-amber-900/30 bg-amber-50/20 dark:bg-amber-950/10"
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <HugeiconsIcon
            icon={energySaving ? BatteryLowIcon : BatteryChargingIcon}
            className={cn(
              "h-5 w-5",
              energySaving
                ? "text-rose-600 dark:text-rose-400"
                : "text-amber-600 dark:text-amber-400"
            )}
            aria-hidden="true"
          />
          <CardTitle className="text-lg font-semibold">
            {t("spoon.checkin.title")}
          </CardTitle>
        </div>
        <CardDescription className="text-sm">
          {t("spoon.checkin.subtitle")}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 1–10 spoon picker */}
        <div>
          <p className="mb-2 text-sm font-medium text-foreground/90">
            {t("spoon.checkin.question")}
          </p>
          <div className="grid grid-cols-10 gap-1" role="group" aria-label={t("spoon.checkin.question")}>
            {Array.from({ length: SPOONS_MAX }, (_, i) => i + SPOONS_MIN).map((n) => {
              const on = n <= level;
              const isPicked = picked === n || saved?.startSpoons === n;
              return (
                <button
                  key={n}
                  type="button"
                  disabled={saving || day.status === "loading"}
                  onClick={() => {
                    setPicked(n);
                    void handleSave(n);
                  }}
                  aria-pressed={isPicked}
                  aria-label={`${n} / ${SPOONS_MAX}`}
                  className={cn(
                    "h-9 rounded-lg border text-xs font-bold tabular-nums transition-all focus-visible:outline-none focus-visible:ring-2",
                    tone.ring,
                    isPicked
                      ? tone.chip
                      : on
                        ? "border-border/60 bg-muted/60 text-muted-foreground"
                        : "border-border/40 text-muted-foreground/50 hover:border-amber-500/40 hover:bg-amber-500/10"
                  )}
                >
                  {n}
                </button>
              );
            })}
          </div>
        </div>

        {/* Live level + guidance */}
        {saved ? (
          <div
            aria-live="polite"
            className={cn(
              "rounded-xl px-4 py-3 text-center",
              energySaving
                ? "bg-rose-500/10"
                : "bg-gradient-to-br from-amber-500/15 to-orange-500/10"
            )}
          >
            <p className={cn("text-4xl font-black tabular-nums", tone.text)}>
              {saved.currentSpoons}
              <span className="text-lg font-normal text-muted-foreground">
                {" "}
                / {saved.startSpoons}
              </span>
            </p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide">
              {energySaving ? t("spoon.checkin.mode.rest") : t("spoon.checkin.mode.spend")}
            </p>
            <p className="mt-1.5 text-sm text-muted-foreground">{guidance}</p>
            <p className="mt-1 flex items-center justify-center gap-1 text-[11px] text-muted-foreground/70">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-3.5 w-3.5" aria-hidden="true" />
              {t("spoon.checkin.savedNote")}
            </p>
          </div>
        ) : (
          <p aria-live="polite" className="rounded-xl bg-muted/40 px-4 py-3 text-center text-sm text-muted-foreground">
            {saving ? (
              <span className="inline-flex items-center gap-2">
                <HugeiconsIcon icon={Loading01Icon} className="h-4 w-4 animate-spin" aria-hidden="true" />
                {t("spoon.checkin.saving")}
              </span>
            ) : (
              guidance
            )}
          </p>
        )}

        {error && (
          <p role="alert" className="text-xs font-medium text-rose-600 dark:text-rose-400">
            {error}
          </p>
        )}

        {/* 7-day trend strip */}
        {week.length > 0 && (
          <div>
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">
              {t("spoon.checkin.week")}
            </p>
            <div className="flex items-end gap-1.5" aria-hidden="true">
              {week.map((entry) => {
                const h = Math.max(12, Math.round((entry.startSpoons / SPOONS_MAX) * 36));
                const low = entry.startSpoons <= ENERGY_SAVING_THRESHOLD;
                return (
                  <div
                    key={entry.logDate}
                    title={`${entry.logDate}: ${entry.startSpoons}`}
                    className={cn(
                      "w-full max-w-[28px] rounded-t-md",
                      low ? "bg-rose-500/60" : "bg-amber-500/60"
                    )}
                    style={{ height: h }}
                  />
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
