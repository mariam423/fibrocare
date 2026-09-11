"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CalendarArrowUpIcon,
  CalendarArrowDownIcon,
  AlertCircleIcon,
  Moon02Icon,
} from "@hugeicons/core-free-icons";
import { useLanguage } from "@/context/LanguageContext";
import type { TranslationKey } from "@/lib/translations";
import { cn } from "@/lib/utils";

/**
 * Client-side mirror of the API's forecast payload
 * (`buildFlareForecast` in src/lib/health/flareForecast.ts).
 */
type ForecastLevel = "high" | "moderate" | "low";

interface FlareForecast {
  level: ForecastLevel;
  window: { start: number; end: number };
  daysUntilWindow: number;
  daysUntilPeriod: number;
  drivers: Array<{ id: string; strength: "strong" | "supporting" }>;
  advice: Array<
    "pacing" | "heat" | "sleep" | "hydrate" | "gentleMovement" | "trackDaily"
  >;
}

const LEVEL_STYLE: Record<
  ForecastLevel,
  { ring: string; badge: string; labelKey: TranslationKey }
> = {
  high: {
    ring: "border-amber-400/50 dark:border-amber-500/40 bg-amber-50/60 dark:bg-amber-950/20",
    badge:
      "bg-amber-500/15 text-amber-700 dark:text-amber-300 ring-1 ring-amber-500/30",
    labelKey: "health.forecast.levelHigh",
  },
  moderate: {
    ring: "border-teal-300/60 dark:border-teal-500/30 bg-teal-50/40 dark:bg-teal-950/15",
    badge:
      "bg-teal-500/15 text-teal-700 dark:text-teal-300 ring-1 ring-teal-500/30",
    labelKey: "health.forecast.levelModerate",
  },
  low: {
    ring: "border-emerald-300/50 dark:border-emerald-500/25 bg-emerald-50/40 dark:bg-emerald-950/15",
    badge:
      "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/30",
    labelKey: "health.forecast.levelLow",
  },
};

const ADVICE_KEYS: Record<FlareForecast["advice"][number], TranslationKey> = {
  pacing: "health.forecast.advice.pacing",
  heat: "health.forecast.advice.heat",
  sleep: "health.forecast.advice.sleep",
  hydrate: "health.forecast.advice.hydrate",
  gentleMovement: "health.forecast.advice.gentleMovement",
  trackDaily: "health.forecast.advice.trackDaily",
};

interface FlareForecastCardProps {
  forecast: FlareForecast | null;
  /** Whether the user has any cycle logged (drives the guidance state). */
  hasCycle: boolean;
}

interface CorrelationsPayload {
  success?: boolean;
  data?: {
    forecast?: FlareForecast | null;
    cycle?: unknown;
  };
}

/**
 * Self-fetching dashboard widget — mirrors the data flow of its grid
 * siblings (CycleStatusWidget, CareRecommendationCard): one call to the
 * correlations API feeds the presentational card below.
 */
export function FlareForecastWidget() {
  const { t } = useLanguage();
  const [forecast, setForecast] = useState<FlareForecast | null>(null);
  const [hasCycle, setHasCycle] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchForecast() {
      try {
        const res = await fetch("/api/health/correlations");
        const result: CorrelationsPayload = await res.json();
        if (result.success && result.data) {
          setForecast(result.data.forecast ?? null);
          setHasCycle(result.data.cycle !== null && result.data.cycle !== undefined);
        }
      } catch (e) {
        console.error("Failed to fetch flare forecast", e);
      } finally {
        setLoading(false);
      }
    }
    fetchForecast();
  }, []);

  if (loading) {
    return (
      <Card className="w-full h-full min-h-[96px] flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground text-sm">
          {t("dashboard.loading")}
        </div>
      </Card>
    );
  }

  return <FlareForecastCard forecast={forecast} hasCycle={hasCycle} />;
}

/**
 * Predictive pre-period flare card.
 *
 * Design: compact, hairline-bordered glass card in the dashboard's
 * Midnight Emerald palette — amber wash for high risk, teal for moderate,
 * emerald for calm. Includes the countdown to the risk window and 2–3
 * proactive actions rather than a wall of text.
 */
export function FlareForecastCard({ forecast, hasCycle }: FlareForecastCardProps) {
  const { t } = useLanguage();

  if (!forecast || !hasCycle) {
    // No cycle history → the forecast needs a first data point. Keep it
    // compact; the CycleStatusWidget next to it owns the logging form.
    return (
      <Card className="w-full min-h-[96px] flex items-center justify-center text-center p-4 border-border/60 bg-muted/30">
        <div className="flex items-center gap-2.5 text-muted-foreground text-sm">
          <HugeiconsIcon icon={Moon02Icon} className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{t("health.forecast.noCycleGuidance")}</span>
        </div>
      </Card>
    );
  }

  const style = LEVEL_STYLE[forecast.level];
  const daysInWindow = forecast.daysUntilWindow === 0;

  return (
    <Card
      className={cn(
        "w-full h-full overflow-hidden transition-all duration-500 backdrop-blur-md",
        style.ring
      )}
    >
      <CardContent className="p-4 space-y-3">
        {/* Header row: level badge + countdown */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <HugeiconsIcon
              icon={daysInWindow ? AlertCircleIcon : CalendarArrowUpIcon}
              className={cn(
                "h-4 w-4",
                forecast.level === "high"
                  ? "text-amber-600 dark:text-amber-400"
                  : forecast.level === "moderate"
                    ? "text-teal-600 dark:text-teal-400"
                    : "text-emerald-600 dark:text-emerald-400"
              )}
              aria-hidden="true"
            />
            <span className="text-sm font-semibold text-foreground">
              {t("health.forecast.title")}
            </span>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide",
                style.badge
              )}
            >
              {t(style.labelKey)}
            </span>
          </div>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <HugeiconsIcon icon={CalendarArrowDownIcon} className="h-3.5 w-3.5" aria-hidden="true" />
            {daysInWindow
              ? t("health.forecast.periodNow")
              : t("health.forecast.periodIn", { days: forecast.daysUntilPeriod })}
          </span>
        </div>

        {/* Risk window line */}
        <p className="text-sm text-muted-foreground leading-relaxed">
          {daysInWindow
            ? t("health.forecast.inWindow", {
                start: forecast.window.start,
                end: forecast.window.end,
              })
            : t("health.forecast.windowAhead", {
                days: forecast.daysUntilWindow,
                start: forecast.window.start,
                end: forecast.window.end,
              })}
        </p>

        {/* Proactive advice */}
        <ul className="space-y-1.5">
          {forecast.advice.slice(0, 3).map((key) => (
            <li key={key} className="flex items-start gap-2 text-sm text-foreground/90">
              <span
                className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                aria-hidden="true"
              />
              {t(ADVICE_KEYS[key])}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
