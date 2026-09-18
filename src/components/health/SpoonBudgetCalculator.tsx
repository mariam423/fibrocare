"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import { Coffee02Icon } from "@hugeicons/core-free-icons";
import { useLanguage } from "@/context/LanguageContext";
import { getActiveCycle } from "@/app/actions";
import { cn } from "@/lib/utils";

type Phase = "MENSTRUAL" | "FOLLICULAR" | "OVULATORY" | "LUTEAL";

const PHASE_ADJUST: Record<Phase, number> = {
  MENSTRUAL: -10,
  FOLLICULAR: 4,
  OVULATORY: 8,
  LUTEAL: -6,
};

/**
 * Spoon Theory Energy Calculator (Point 13).
 *
 * Budget = baseline (12) + sleep admission (0–6) + small adjustment from the
 * current cycle phase (luteal/menstrual drain a bit, follicular/ovulatory
 * add a bit). Pure client-side math fed by the active cycle.
 */
export function SpoonBudgetCalculator() {
  const { t } = useLanguage();
  const [phase, setPhase] = useState<Phase | null>(null);
  const [sleepQuality, setSleepQuality] = useState(3);

  useEffect(() => {
    getActiveCycle()
      .then((c) => setPhase(c?.phase ?? null))
      .catch(() => setPhase(null));
  }, []);

  const base = 12;
  const phaseAdj = phase ? PHASE_ADJUST[phase] : 0;
  const sleepAdj = sleepQuality * 2; // 0–6 spoons
  const budget = Math.max(base + phaseAdj + sleepAdj, 4);

  const sleepLabels = [
    { value: 0, label: "0", short: "0" },
    { value: 1, label: "1", short: "1" },
    { value: 2, label: "2", short: "2" },
    { value: 3, label: "3", short: "3" },
  ];

  return (
    <Card className="w-full h-full overflow-hidden border-amber-200 dark:border-amber-900/30 bg-amber-50/20 dark:bg-amber-950/10">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <HugeiconsIcon icon={Coffee02Icon} className="h-5 w-5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
          <CardTitle className="text-lg font-semibold">{t("health.spoonCalc.title")}</CardTitle>
        </div>
        <CardDescription className="text-sm">{t("health.spoonCalc.subtitle")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sleep quality input */}
        <div>
          <div className="flex items-center justify-between text-sm">
            <label htmlFor="spoon-sleep" className="font-medium text-foreground/90">
              {t("health.spoonCalc.sleepQuality")}
            </label>
            <span className="text-xs font-bold tabular-nums text-amber-600 dark:text-amber-400">
              {sleepQuality}/3
            </span>
          </div>
          <div className="mt-2 flex items-center gap-3">
            <input
              id="spoon-sleep"
              type="range"
              min={0}
              max={3}
              step={1}
              value={sleepQuality}
              onChange={(e) => setSleepQuality(Number(e.target.value))}
              className="w-full accent-amber-500"
            />
            {sleepLabels.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setSleepQuality(s.value)}
                aria-label={`${s.label} / 3`}
                aria-pressed={sleepQuality === s.value}
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-bold border transition-colors",
                  sleepQuality === s.value
                    ? "border-amber-500 bg-amber-500/15 text-amber-700 dark:text-amber-300"
                    : "border-border bg-muted/50 text-muted-foreground"
                )}
              >
                {s.short}
              </button>
            ))}
          </div>
        </div>

        {/* Cycle adjustment */}
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-foreground/90">{t("health.spoonCalc.cycleAdjust")}</span>
          <span className="text-xs font-bold text-muted-foreground">
            {phase ? (PHASE_ADJUST[phase] > 0 ? `+${PHASE_ADJUST[phase]}` : PHASE_ADJUST[phase]) : "—"}
          </span>
        </div>

        {/* Result */}
        <div className="rounded-xl bg-gradient-to-br from-amber-500/15 to-orange-500/10 px-4 py-4 text-center">
          <p className="text-4xl font-black tabular-nums text-amber-700 dark:text-amber-300">
            {budget}
          </p>
          <p className="mt-1 text-xs font-medium uppercase tracking-wide text-amber-700/80 dark:text-amber-300/80">
            {t("health.spoonCalc.available")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}