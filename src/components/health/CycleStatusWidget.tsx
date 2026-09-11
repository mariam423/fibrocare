"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
      <NoCycleCard />
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

/** Empty state with an inline cycle logger so the correlation engine has data to work with. */
function NoCycleCard() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [phase, setPhase] = useState<"MENSTRUAL" | "FOLLICULAR" | "OVULATORY" | "LUTEAL">("MENSTRUAL");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLog(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/health/cycle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startDate, phase }),
      });
      if (!res.ok) {
        setError(t("health.cycle.saveError"));
        return;
      }
      // Refresh server components / other widgets on the page.
      window.location.reload();
    } catch {
      setError(t("health.cycle.saveError"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="w-full h-full min-h-[160px] flex flex-col items-center justify-center text-center p-6 border-purple-200 dark:border-purple-900/30">
      <HugeiconsIcon icon={Moon02Icon} className="h-6 w-6 text-purple-400 mb-2" />
      <p className="text-sm text-muted-foreground max-w-[26ch]">
        {t("health.cycle.emptyGuidance")}
      </p>
      {!open ? (
        <Button variant="outline" size="sm" className="mt-3" onClick={() => setOpen(true)}>
          {t("health.cycle.logCta")}
        </Button>
      ) : (
        <form onSubmit={handleLog} className="mt-3 flex flex-col gap-2 items-center">
          <div className="flex gap-2">
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-9 w-40 text-base"
              aria-label={t("health.cycle.startDateAria")}
              required
            />
            <select
              value={phase}
              onChange={(e) => setPhase(e.target.value as typeof phase)}
              className="h-9 rounded-md border border-input bg-background px-2 text-base"
              aria-label={t("health.cycle.phaseAria")}
            >
              <option value="MENSTRUAL">{t("health.phase.menstrual")}</option>
              <option value="FOLLICULAR">{t("health.phase.follicular")}</option>
              <option value="OVULATORY">{t("health.phase.ovulatory")}</option>
              <option value="LUTEAL">{t("health.phase.luteal")}</option>
            </select>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" size="sm" disabled={saving} className="w-40">
            {saving ? t("dashboard.save.saving") : t("health.cycle.saveCta")}
          </Button>
        </form>
      )}
    </Card>
  );
}
