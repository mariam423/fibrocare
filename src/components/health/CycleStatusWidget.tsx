"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import { Moon02Icon, SparklesIcon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";

interface CycleData {
  phase: "MENSTRUAL" | "FOLLICULAR" | "OVULATORY" | "LUTEAL";
  currentDay: number;
  cycleLength: number;
  flareWindow: { start: number; end: number };
}

export function CycleStatusWidget() {
  const { t } = useLanguage();
  const [data, setData] = useState<CycleData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCycleData() {
      try {
        const res = await fetch("/api/health/correlations");
        const result = await res.json();
        if (result.success && result.data?.cycle) {
          setData(result.data.cycle);
        }
      } catch (e) {
        console.error("Failed to fetch cycle data", e);
      } finally {
        setLoading(false);
      }
    }
    fetchCycleData();
  }, []);

  if (loading) {
    return (
      <Card className="w-full h-full min-h-[160px] flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground text-sm">
          {t("dashboard.loading")}
        </div>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="w-full h-full min-h-[160px] flex items-center justify-center">
        <div className="text-muted-foreground text-sm">
          {t("dashboard.noCycleData")}
        </div>
      </Card>
    );
  }

  const phaseNames: Record<string, string> = {
    MENSTRUAL: t("health.phase.menstrual"),
    FOLLICULAR: t("health.phase.follicular"),
    OVULATORY: t("health.phase.ovulatory"),
    LUTEAL: t("health.phase.luteal"),
  };

  const progress = (data.currentDay / data.cycleLength) * 100;
  const flareStart = (data.flareWindow.start / data.cycleLength) * 100;
  const flareEnd = (data.flareWindow.end / data.cycleLength) * 100;

  return (
    <Card className="w-full h-full overflow-hidden border-purple-200 dark:border-purple-900/30 bg-purple-50/30 dark:bg-purple-950/10">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-purple-800 dark:text-purple-300 flex items-center gap-2">
            <HugeiconsIcon icon={Moon02Icon} className="h-5 w-5" />
            {phaseNames[data.phase] || data.phase}
          </CardTitle>
          <div className="text-base font-medium px-2 py-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
            Day {data.currentDay}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative h-4 w-full bg-purple-200/50 dark:bg-purple-900/30 rounded-full overflow-hidden">
          {/* Flare Window */}
          <div
            className="absolute h-full bg-teal-400/40 dark:bg-teal-500/30 border-x border-teal-500/50"
            style={{
              left: `${flareStart}%`,
              width: `${flareEnd - flareStart}%`
            }}
            title={t("health.flareWindow")}
          />
          {/* Current Day Marker */}
          <div
            className="absolute h-full w-1 bg-purple-600 dark:bg-purple-400 transition-all duration-500"
            style={{ left: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-base text-purple-600/80 dark:text-purple-400/70">
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-purple-600 dark:bg-purple-400" />
            <span>{t("health.currentDay")}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-teal-400 dark:bg-teal-500" />
            <span>{t("health.flareRisk")}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
