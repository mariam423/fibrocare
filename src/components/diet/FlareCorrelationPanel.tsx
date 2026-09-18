"use client";

/**
 * Next-day flare correlation panel. Fetches the deterministic report built
 * by the correlation engine (evening meals vs. next-morning symptom scores)
 * and renders it with an explicit "correlation, not diagnosis" disclaimer.
 */

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowUp01Icon,
  ChartHistogramIcon,
  Clock01Icon,
  FlameIcon,
  Loading01Icon,
  Moon01Icon,
  SaladIcon,
  TimeSetting01Icon,
} from "@hugeicons/core-free-icons";
import { useLanguage } from "@/context/LanguageContext";
import type { TranslationKey } from "@/lib/translations";
import { getFlareCorrelation } from "@/app/diet/actions";
import type { FlareCorrelationReport, FoodCorrelation, RiskGrade } from "@/lib/diet/flareCorrelation";
import { cn } from "@/lib/utils";

const RISK_STYLE: Record<
  RiskGrade,
  { badge: string; dot: string; tKey: TranslationKey; hintKey: TranslationKey }
> = {
  high: {
    badge: "bg-rose-500/10 text-rose-700 ring-1 ring-rose-500/25 dark:text-rose-300",
    dot: "bg-rose-500",
    tKey: "diet.correlation.risk.high",
    hintKey: "diet.correlation.risk.high.hint",
  },
  moderate: {
    badge: "bg-amber-500/10 text-amber-700 ring-1 ring-amber-500/25 dark:text-amber-300",
    dot: "bg-amber-500",
    tKey: "diet.correlation.risk.moderate",
    hintKey: "diet.correlation.risk.moderate.hint",
  },
  watch: {
    badge: "bg-slate-500/10 text-slate-600 ring-1 ring-slate-400/25 dark:text-slate-300",
    dot: "bg-slate-400",
    tKey: "diet.correlation.risk.watch",
    hintKey: "diet.correlation.risk.watch.hint",
  },
};

function formatLift(lift: number): string {
  if (lift >= 1) return `+${Math.round((lift - 1) * 100)}%`;
  return `${Math.round((1 - lift) * 100)}%`;
}

function formatHour(value: number | null): string {
  return value === null ? "—" : `${String(value).replace(/\.0$/, "")}`;
}

export function FlareCorrelationPanel() {
  const { t } = useLanguage();
  const [report, setReport] = useState<FlareCorrelationReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await getFlareCorrelation();
      if (!cancelled) {
        if (res.success && res.data) setReport(res.data.report);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const hasData = Boolean(report && (report.foods.length > 0 || report.analyzedDays > 0));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-500">
          <HugeiconsIcon icon={ChartHistogramIcon} className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">{t("diet.correlation.title")}</h3>
          <p className="text-xs text-muted-foreground">{t("diet.correlation.subtitle")}</p>
        </div>
      </div>

      {loading ? (
        <p className="flex items-center gap-2 rounded-xl border border-border/60 bg-muted/40 px-3 py-4 text-sm text-muted-foreground">
          <HugeiconsIcon icon={Loading01Icon} className="h-4 w-4 animate-spin" aria-hidden="true" />
          {t("common.loading")}
        </p>
      ) : !hasData || !report ? (
        <p className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-muted/40 px-3 py-4 text-sm text-muted-foreground">
          <HugeiconsIcon icon={SaladIcon} className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          {t("diet.correlation.empty")}
        </p>
      ) : (
        <div className="space-y-4">
          {/* Baseline */}
          <div className="rounded-xl border border-border/70 bg-card/60 p-3 backdrop-blur-md">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-muted-foreground">{t("diet.correlation.baseline")}</p>
                <p className="text-[11px] text-muted-foreground/70">{t("diet.correlation.baseline.hint")}</p>
              </div>
              <span className="text-lg font-semibold tabular-nums text-primary">
                {report.baselineNextDayScore}
                <span className="ms-1 text-[11px] font-medium text-muted-foreground">
                  {t("diet.correlation.outOf")}
                </span>
              </span>
            </div>
          </div>

          {/* Foods */}
          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {report.foods.map((food: FoodCorrelation, index: number) => {
                const style = RISK_STYLE[food.risk];
                return (
                  <motion.div
                    key={food.food}
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="rounded-xl border border-border/70 bg-card/60 px-3 py-2.5 backdrop-blur-md"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="min-w-0 space-y-0.5">
                        <p className="text-sm font-semibold capitalize text-foreground" dir="auto">
                          {food.food}
                        </p>
                        <p className="flex items-center gap-2 text-[11px] text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <HugeiconsIcon icon={Moon01Icon} className="h-3 w-3" aria-hidden="true" />
                            {t("diet.correlation.evenings")}: {food.eveningOccurrences}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <span className="h-1 w-3 rounded-full bg-emerald-500/60" aria-hidden="true" />
                            {t("diet.correlation.with")}: {food.avgNextDayScoreWhenConsumed}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <span className="h-1 w-3 rounded-full bg-slate-400/50" aria-hidden="true" />
                            {t("diet.correlation.without")}: {food.avgNextDayScoreWhenAbsent}
                          </span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                            style.badge
                          )}
                        >
                          <span className={cn("h-1.5 w-1.5 rounded-full", style.dot)} aria-hidden="true" />
                          {t(style.tKey)}
                        </span>
                        <span
                          className={cn(
                            "inline-flex items-center gap-0.5 rounded-full px-2 py-1 text-[11px] font-semibold tabular-nums",
                            liftArrowTone(food.lift)
                          )}
                        >
                          <HugeiconsIcon
                            icon={food.lift >= 1 ? ArrowUp01Icon : FlameIcon}
                            className="h-3 w-3"
                            aria-hidden="true"
                          />
                          {formatLift(food.lift)}
                        </span>
                      </div>
                    </div>
                    <p className="mt-1.5 text-[11px] text-muted-foreground">{t(style.hintKey)}</p>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Timing insight */}
          <div className="rounded-xl border border-primary/15 bg-primary/5 px-3 py-3 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={TimeSetting01Icon} className="h-4 w-4 text-primary" aria-hidden="true" />
              <p className="text-xs font-semibold text-foreground">{t("diet.correlation.timing.title")}</p>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-card/70 px-2.5 py-2">
                <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <HugeiconsIcon icon={Clock01Icon} className="h-3 w-3" aria-hidden="true" />
                  {t("diet.correlation.timing.highFlare")}
                </p>
                <p className="mt-0.5 text-sm font-semibold tabular-nums text-rose-600 dark:text-rose-300">
                  {formatHour(report.timing.avgHourHighFlare)}
                </p>
              </div>
              <div className="rounded-lg bg-card/70 px-2.5 py-2">
                <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <HugeiconsIcon icon={Clock01Icon} className="h-3 w-3" aria-hidden="true" />
                  {t("diet.correlation.timing.lowFlare")}
                </p>
                <p className="mt-0.5 text-sm font-semibold tabular-nums text-emerald-600 dark:text-emerald-300">
                  {formatHour(report.timing.avgHourLowFlare)}
                </p>
              </div>
            </div>
            {report.timing.laterEveningLinkedToFlare ? (
              <p className="mt-2 text-xs font-medium text-primary">
                {t("diet.correlation.timing.later", { hour: report.timing.suggestedBeforeHour })}
              </p>
            ) : (
              <p className="mt-2 text-xs text-muted-foreground">{t("diet.correlation.timing.nodata")}</p>
            )}
          </div>

          <p className="text-center text-[11px] text-muted-foreground/70">
            {t("diet.correlation.disclaimer")}
          </p>
        </div>
      )}
    </div>
  );
}

function liftArrowTone(lift: number): string {
  if (lift >= 1.35) return "bg-rose-500/10 text-rose-600 dark:text-rose-300";
  if (lift >= 1.15) return "bg-amber-500/10 text-amber-700 dark:text-amber-300";
  return "bg-slate-500/10 text-slate-500 dark:text-slate-300";
}