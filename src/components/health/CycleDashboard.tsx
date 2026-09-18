"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import { PieChart03Icon, ChartBreakoutCircleIcon, Moon02Icon } from "@hugeicons/core-free-icons";
import { useLanguage } from "@/context/LanguageContext";
import { getCycleDashboardData, type CycleDashboardData } from "@/app/actions";

const PHASE_KEYS: Record<string, "health.phase.menstrual" | "health.phase.follicular" | "health.phase.ovulatory" | "health.phase.luteal"> = {
  MENSTRUAL: "health.phase.menstrual",
  FOLLICULAR: "health.phase.follicular",
  OVULATORY: "health.phase.ovulatory",
  LUTEAL: "health.phase.luteal",
};

function OverlapBars({ data }: { data: CycleDashboardData["overlap"] }) {
  const { t } = useLanguage();
  if (data.noData) {
    return <p className="text-xs text-muted-foreground">{t("health.overlap.noData")}</p>;
  }

  return (
    <div className="space-y-2" role="img" aria-label={t("health.overlap.title")}>
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-rose-600 dark:text-rose-400">{t("health.overlap.hormonal")}</span>
        <span className="tabular-nums font-bold text-rose-600 dark:text-rose-400">{data.hormonalAmplification}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-gradient-to-r from-rose-500 to-purple-500 transition-all duration-700"
          style={{ width: `${data.hormonalAmplification}%` }} />
      </div>
      <div className="flex items-center justify-between text-xs pt-1">
        <span className="font-medium text-teal-600 dark:text-teal-400">{t("health.overlap.physical")}</span>
        <span className="tabular-nums font-bold text-teal-600 dark:text-teal-400">{data.physicalExertion}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-700"
          style={{ width: `${data.physicalExertion}%` }} />
      </div>
    </div>
  );
}

/**
 * Cycle Dashboard — the correlation hub (Points 9–11).
 *
 *  - Active phase, day-in-cycle and a mini phase timeline (Point 9).
 *  - Fibro-Hormonal Overlap Score: the share of flare-heavy days that land
 *    in hormonal (menstrual/luteal) vs non-hormonal phases (Point 10).
 *  - Phase-based care plan: diet / supplements / pacing per cycle phase
 *    (Point 11).
 *
 * Data comes from the getCycleDashboardData server action (session + PIN
 * guarded server-side, zero raw-data exposure beyond the widget's shape).
 */
export function CycleDashboard() {
  const { t } = useLanguage();
  const [data, setData] = useState<CycleDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCycleDashboardData()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Card className="w-full h-full min-h-[220px] flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground text-sm">{t("dashboard.loading")}</div>
      </Card>
    );
  }

  if (!data?.activeCycle) {
    return (
      <Card className="w-full h-full min-h-[220px] flex flex-col items-center justify-center text-center gap-3 p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 dark:bg-purple-900/40">
          <HugeiconsIcon icon={Moon02Icon} className="h-6 w-6 text-purple-700 dark:text-purple-300" aria-hidden="true" />
        </div>
        <p className="text-sm font-semibold">{t("health.menstrualLog.noActiveCycle")}</p>
        <p className="text-sm text-muted-foreground max-w-[38ch]">
          {t("health.cycle.emptyGuidance")}
        </p>
      </Card>
    );
  }

  const cycle = data.activeCycle;
  const phaseKey = PHASE_KEYS[cycle.phase] ?? "health.phase.unknown";
  const progress = Math.min(Math.max((cycle.currentDay / cycle.cycleLength) * 100, 0), 100);

  const carePlan: Record<string, { diet: string; supplements: string; pacing: string }> = {
    MENSTRUAL: {
      diet: t("health.carePlan.diet.menstrual"),
      supplements: t("health.carePlan.supplements.menstrual"),
      pacing: t("health.carePlan.pacing.menstrual"),
    },
    FOLLICULAR: {
      diet: t("health.carePlan.diet.follicular"),
      supplements: t("health.carePlan.supplements.follicular"),
      pacing: t("health.carePlan.pacing.follicular"),
    },
    OVULATORY: {
      diet: t("health.carePlan.diet.ovulatory"),
      supplements: t("health.carePlan.supplements.ovulatory"),
      pacing: t("health.carePlan.pacing.ovulatory"),
    },
    LUTEAL: {
      diet: t("health.carePlan.diet.luteal"),
      supplements: t("health.carePlan.supplements.luteal"),
      pacing: t("health.carePlan.pacing.luteal"),
    },
  };
  const plan = carePlan[cycle.phase] ?? carePlan.FOLLICULAR;

  return (
    <Card className="w-full h-full overflow-hidden border-purple-200 dark:border-purple-900/30 bg-purple-50/20 dark:bg-purple-950/10">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <HugeiconsIcon icon={ChartBreakoutCircleIcon} className="h-5 w-5 text-purple-600 dark:text-purple-400" aria-hidden="true" />
            {t("health.overlap.title")}
          </CardTitle>
          <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-bold text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
            {t(phaseKey)}
          </span>
        </div>
        <CardDescription className="text-sm">
          {t("health.currentDay")}: {cycle.currentDay}/{cycle.cycleLength}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Phase timeline */}
        <div className="relative h-2.5 w-full rounded-full bg-purple-200/50 dark:bg-purple-900/30 overflow-hidden" aria-hidden="true">
          <div
            className="h-full rounded-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-purple-500 transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Overlap score */}
        <section className="space-y-2.5">
          <OverlapBars data={data.overlap} />
        </section>

        {/* Phase care plan */}
        <section className="space-y-2 border-t border-border/60 pt-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <HugeiconsIcon icon={PieChart03Icon} className="h-4 w-4 text-primary" aria-hidden="true" />
            {t("health.carePlan.title")}
          </div>
          <dl className="space-y-2 text-sm">
            <div className="rounded-lg bg-muted/50 px-3 py-2">
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("health.carePlan.diet")}</dt>
              <dd className="mt-0.5 text-foreground/90">{plan.diet}</dd>
            </div>
            <div className="rounded-lg bg-muted/50 px-3 py-2">
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("health.carePlan.supplements")}</dt>
              <dd className="mt-0.5 text-foreground/90">{plan.supplements}</dd>
            </div>
            <div className="rounded-lg bg-muted/50 px-3 py-2">
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("health.carePlan.pacing")}</dt>
              <dd className="mt-0.5 text-foreground/90">{plan.pacing}</dd>
            </div>
          </dl>
        </section>
      </CardContent>
    </Card>
  );
}