"use client";

/**
 * Sleep Architecture & HRV card: log last night (or pull a simulated
 * wearable sync), see the alpha–delta screen, deep-sleep vs HRV verdict,
 * and the Fibro Fog Risk Index with pacing guidance for the day.
 */

import React, { useMemo, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Moon02Icon, RefreshIcon } from "@hugeicons/core-free-icons";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DepthCard } from "@/components/ui/DepthCard";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";
import { analyzeNight, fibroFogRisk } from "@/lib/sleep-hrv/analyzer";
import { simulateWearableSync } from "@/lib/sleep-hrv/wearable";
import type { SleepNight } from "@/types/extended-health";

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

const REST_KEYS = {
  1: "sleep.rest.1",
  2: "sleep.rest.2",
  3: "sleep.rest.3",
  4: "sleep.rest.4",
  5: "sleep.rest.5",
} as const;

const ALPHA_DELTA_KEYS = {
  likely: "sleep.alphaDelta.likely",
  possible: "sleep.alphaDelta.possible",
  unlikely: "sleep.alphaDelta.unlikely",
  "insufficient-data": "sleep.alphaDelta.insufficient-data",
} as const;

const DEEP_KEYS = {
  low: "sleep.deep.low",
  normal: "sleep.deep.normal",
  high: "sleep.deep.high",
  unknown: "sleep.deep.unknown",
} as const;

const FOG_LEVEL_KEYS = {
  low: "sleep.fogLevel.low",
  moderate: "sleep.fogLevel.moderate",
  high: "sleep.fogLevel.high",
} as const;

const fogLevelStyle = {
  low: "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200",
  moderate: "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200",
  high: "border-red-300 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200",
} as const;

export function SleepHrvCard() {
  const { t } = useLanguage();
  const [night, setNight] = useState<SleepNight>(() => {
    const w = simulateWearableSync(todayKey());
    return {
      date: w.date,
      hoursSlept: 7,
      deepSleepPct: w.deepSleepPct,
      awakenings: 3,
      hrvMs: w.hrvMs,
      restingHr: w.restingHr,
      steps: w.steps,
      selfReportedRest: 3,
    };
  });

  const analysis = useMemo(() => analyzeNight(night), [night]);
  const fog = fibroFogRisk(night, null);

  const resync = () => {
    const w = simulateWearableSync(todayKey());
    setNight((n) => ({ ...n, hrvMs: w.hrvMs, restingHr: w.restingHr, steps: w.steps, deepSleepPct: w.deepSleepPct }));
  };

  return (
    <DepthCard tilt={3}>
      <Card className="h-full border-none shadow-depth-sm ring-1 ring-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HugeiconsIcon icon={Moon02Icon} className="h-5 w-5 text-primary" aria-hidden="true" />
            {t("sleep.title")}
          </CardTitle>
          <CardDescription>{t("sleep.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Inputs */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <label className="block">
              <span className="text-muted-foreground">{t("sleep.hours")}: {night.hoursSlept}h</span>
              <input
                type="range" min={0} max={12} step={0.5} value={night.hoursSlept}
                onChange={(e) => setNight((n) => ({ ...n, hoursSlept: Number(e.target.value) }))}
                className="mt-1 w-full accent-primary"
              />
            </label>
            <label className="block">
              <span className="text-muted-foreground">{t("sleep.awakenings")}: {night.awakenings}</span>
              <input
                type="range" min={0} max={12} value={night.awakenings}
                onChange={(e) => setNight((n) => ({ ...n, awakenings: Number(e.target.value) }))}
                className="mt-1 w-full accent-primary"
              />
            </label>
            <label className="block">
              <span className="text-muted-foreground">{t("sleep.restLabel")}</span>
              <select
                value={night.selfReportedRest}
                onChange={(e) => setNight((n) => ({ ...n, selfReportedRest: Number(e.target.value) as SleepNight["selfReportedRest"] }))}
                className="mt-1 w-full rounded-xl border border-border bg-background px-2 py-1.5"
              >
                {[1, 2, 3, 4, 5].map((v) => (
                  <option key={v} value={v}>{t(REST_KEYS[v as 1 | 2 | 3 | 4 | 5])}</option>
                ))}
              </select>
            </label>
            <div className="flex items-end">
              <Button size="sm" variant="outline" className="rounded-xl" onClick={resync}>
                <HugeiconsIcon icon={RefreshIcon} className="me-1 h-4 w-4" aria-hidden="true" />
                {t("sleep.syncWearable")}
              </Button>
            </div>
          </div>

          {/* Metrics row */}
          <div className="grid grid-cols-3 gap-2 text-center text-sm">
            <div className="rounded-xl border border-border/60 bg-muted/30 p-2">
              <p className="text-xs text-muted-foreground">{t("sleep.deep")}</p>
              <p className="font-semibold">{night.deepSleepPct !== null ? `${night.deepSleepPct}%` : "—"}</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/30 p-2">
              <p className="text-xs text-muted-foreground">{t("sleep.hrv")}</p>
              <p className="font-semibold">{night.hrvMs !== null ? `${night.hrvMs} ms` : "—"}</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/30 p-2">
              <p className="text-xs text-muted-foreground">{t("sleep.restingHr")}</p>
              <p className="font-semibold">{night.restingHr !== null ? `${night.restingHr} bpm` : "—"}</p>
            </div>
          </div>

          {/* Alpha–delta screen */}
          <p className="text-sm">
            <span className="font-medium">{t("sleep.alphaDelta")}: </span>
            <span className="text-muted-foreground">{t(ALPHA_DELTA_KEYS[analysis.alphaDeltaPattern])}</span>
            <span className="text-muted-foreground"> · {t("sleep.deepStatus")}: {t(DEEP_KEYS[analysis.deepSleepStatus])}</span>
          </p>

          {/* Fog risk */}
          <div className={cn("rounded-xl border p-3", fogLevelStyle[fog.level])}>
            <p className="font-semibold">
              {t("sleep.fogRisk")} · {fog.score}/10 · {t(FOG_LEVEL_KEYS[fog.level])}
            </p>
            <p className="mt-1 text-sm opacity-90">{fog.guidance}</p>
          </div>

          <p className="text-xs text-muted-foreground">{t("sleep.disclaimer")}</p>
        </CardContent>
      </Card>
    </DepthCard>
  );
}
