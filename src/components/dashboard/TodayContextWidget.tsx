"use client";

import React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ThermometerIcon,
  DropletIcon,
  Sun01Icon,
  CloudIcon,
  FastWindIcon,
} from "@hugeicons/core-free-icons";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DepthCard } from "@/components/ui/DepthCard";
import { useWeather } from "@/hooks/useWeather";
import { useLanguage } from "@/context/LanguageContext";
import type { TranslationKey } from "@/lib/translations";
import type { WeatherData, WeatherTriggerId } from "@/lib/weather";
import { cn } from "@/lib/utils";

/**
 * Priority-ordered status: a falling barometer is the most actionable
 * signal, then absolute low pressure, then temperature/humidity extremes,
 * then high pressure; everything else reads as a calm, comfortable day.
 */
const STATUS_TONE = {
  alert: "text-rose-600 dark:text-rose-400",
  warn: "text-amber-600 dark:text-amber-400",
  calm: "text-emerald-600 dark:text-emerald-400",
} as const;

function getWeatherStatus(
  weather: WeatherData,
  triggers: WeatherTriggerId[],
  t: (key: TranslationKey, params?: Record<string, string | number>) => string
): { label: string; tone: keyof typeof STATUS_TONE; icon: React.ReactNode } {
  const dot = (cls: string) => (
    <span aria-hidden="true" className={cn("h-2 w-2 shrink-0 rounded-full", cls)} />
  );
  if (triggers.includes("pressure-drop")) {
    return {
      label: t("today.status.pressureDrop"),
      tone: "alert",
      icon: dot("bg-rose-400"),
    };
  }
  if (triggers.includes("pressure-low")) {
    return { label: t("today.impact.low"), tone: "warn", icon: dot("bg-orange-400") };
  }
  if (triggers.includes("heat-extreme")) {
    return { label: t("today.trigger.heat"), tone: "warn", icon: dot("bg-amber-400") };
  }
  if (triggers.includes("cold-extreme")) {
    return { label: t("today.trigger.cold"), tone: "warn", icon: dot("bg-sky-400") };
  }
  if (triggers.includes("humidity-high")) {
    return {
      label: t("today.trigger.humidityHigh"),
      tone: "warn",
      icon: dot("bg-amber-400"),
    };
  }
  if (weather.pressure > 1025) {
    return { label: t("today.impact.high"), tone: "warn", icon: dot("bg-amber-400") };
  }
  return { label: t("today.status.stable"), tone: "calm", icon: dot("bg-emerald-400") };
}

function getWeatherIcon(condition: WeatherData["condition"]) {
  switch (condition) {
    case "sunny":
      return Sun01Icon;
    case "cloudy":
      return CloudIcon;
    case "rainy":
      return DropletIcon;
  }
}

export function TodayContextWidget() {
  const { t } = useLanguage();
  const { weather, source, location, triggers, isEstimated } = useWeather();
  // Trigger insights are only meaningful for real conditions — deterministic
  // fallback numbers must never generate medical warnings.
  const live = !isEstimated && source === "live";
  const status = getWeatherStatus(weather, triggers ?? ["calm"], t);
  const WeatherIcon = getWeatherIcon(weather.condition);

  return (
    <DepthCard tilt={4} delay={0.08} float>
      <Card className="h-full">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2 font-semibold">
            <HugeiconsIcon
              icon={WeatherIcon}
              className="h-5 w-5 text-emerald-600 dark:text-emerald-400"
              aria-hidden="true"
            />
            <CardTitle className="text-base">{t("today.title")}</CardTitle>
          </div>
          {source === "live" && location && (
            <p className="text-[11px] font-medium text-muted-foreground">
              {t("today.liveWeather", { location })}
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Weather stats row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center gap-1 p-2.5 rounded-xl bg-muted/60 backdrop-blur-md transition-colors">
              <HugeiconsIcon
                icon={ThermometerIcon}
                className="h-4 w-4 text-orange-500"
                aria-hidden="true"
              />
              {/* Numeric + unit stay LTR inside RTL layouts */}
              <span dir="ltr" className="inline-block text-lg font-bold text-foreground [unicode-bidi:isolate]">
                {weather.temperature}°C
              </span>
              <span className="text-[10px] text-muted-foreground tracking-wide">
                {t("today.temp")}
              </span>
            </div>
            <div className="flex flex-col items-center gap-1 p-2.5 rounded-xl bg-muted/60 backdrop-blur-md transition-colors">
              <HugeiconsIcon
                icon={DropletIcon}
                className="h-4 w-4 text-emerald-500"
                aria-hidden="true"
              />
              <span dir="ltr" className="inline-block text-lg font-bold text-foreground [unicode-bidi:isolate]">
                {weather.humidity}%
              </span>
              <span className="text-[10px] text-muted-foreground tracking-wide">
                {t("today.humidity")}
              </span>
            </div>
            <div className="flex flex-col items-center gap-1 p-2.5 rounded-xl bg-muted/60 backdrop-blur-md transition-colors">
              <HugeiconsIcon
                icon={FastWindIcon}
                className="h-4 w-4 text-violet-500"
                aria-hidden="true"
              />
              <span dir="ltr" className="inline-block text-lg font-bold text-foreground [unicode-bidi:isolate]">
                {weather.pressure}
                <span className="ms-0.5 text-[10px] font-medium text-muted-foreground">hPa</span>
              </span>
              <span className="text-[10px] text-muted-foreground tracking-wide">
                {t("today.pressure")}
              </span>
            </div>
          </div>

          {/* Estimated data → neutral baseline message only; live data →
              the real trigger insight. Direction inherits from the document
              (rtl in Arabic), so the dot lands on the reading side
              automatically; text-start keeps the line flush to that edge. */}
          {live ? (
            <div
              className={cn(
                "flex min-w-0 items-start gap-2 rounded-lg p-2.5 text-start text-xs leading-relaxed",
                "bg-muted/60 border border-border backdrop-blur-md"
              )}
            >
              {status.icon}
              <span className={cn("min-w-0 break-words", STATUS_TONE[status.tone])}>
                {status.label}
              </span>
            </div>
          ) : (
            <div className="flex min-w-0 items-start gap-2 rounded-lg border border-border bg-muted/60 p-2.5 text-start text-xs leading-relaxed text-muted-foreground backdrop-blur-md">
              <span
                aria-hidden="true"
                className="mt-1 h-2 w-2 shrink-0 rounded-full bg-muted-foreground/50"
              />
              <span className="min-w-0 break-words">
                {t("today.triggers.neutral")}
              </span>
            </div>
          )}

          {/* The estimated badge is hidden completely on live data. */}
          {!live && (
            <div className="flex min-w-0 items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-2.5 text-start text-xs italic leading-relaxed text-amber-700 backdrop-blur-md dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-300">
              <span
                aria-hidden="true"
                className="mt-1 h-2 w-2 shrink-0 rounded-full bg-amber-400"
              />
              <span className="min-w-0 break-words">{t("today.estimated")}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </DepthCard>
  );
}
