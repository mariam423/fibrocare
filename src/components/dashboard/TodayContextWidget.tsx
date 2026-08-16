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
import type { WeatherData } from "@/lib/weather";
import { cn } from "@/lib/utils";

function getBarometricImpact(
  pressure: number,
  t: (key: TranslationKey, params?: Record<string, string | number>) => string
): {
  label: string;
  color: string;
  icon: React.ReactNode;
} {
  if (pressure < 1010) {
    return {
      label: t("today.impact.low"),
      color: "text-orange-600 dark:text-orange-400",
      icon: <span className="h-2 w-2 rounded-full bg-orange-400" />,
    };
  }
  if (pressure > 1025) {
    return {
      label: t("today.impact.high"),
      color: "text-amber-600 dark:text-amber-400",
      icon: <span className="h-2 w-2 rounded-full bg-amber-400" />,
    };
  }
  return {
    label: t("today.impact.normal"),
    color: "text-emerald-600 dark:text-emerald-400",
    icon: <span className="h-2 w-2 rounded-full bg-emerald-400" />,
  };
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
  const { weather, source, location } = useWeather();
  const impact = getBarometricImpact(weather.pressure, t);
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
            <div className="flex flex-col items-center gap-1 p-2.5 rounded-xl border border-border bg-card/70 backdrop-blur-sm transition-colors dark:border-white/10 dark:bg-background/40 dark:backdrop-blur-xl">
              <HugeiconsIcon
                icon={ThermometerIcon}
                className="h-4 w-4 text-orange-500"
                aria-hidden="true"
              />
              <span className="text-lg font-bold text-foreground">
                {weather.temperature}°
              </span>
              <span className="text-[10px] text-muted-foreground tracking-wide">
                {t("today.temp")}
              </span>
            </div>
            <div className="flex flex-col items-center gap-1 p-2.5 rounded-xl border border-border bg-card/70 backdrop-blur-sm transition-colors dark:border-white/10 dark:bg-background/40 dark:backdrop-blur-xl">
              <HugeiconsIcon
                icon={DropletIcon}
                className="h-4 w-4 text-emerald-500"
                aria-hidden="true"
              />
              <span className="text-lg font-bold text-foreground">
                {weather.humidity}%
              </span>
              <span className="text-[10px] text-muted-foreground tracking-wide">
                {t("today.humidity")}
              </span>
            </div>
            <div className="flex flex-col items-center gap-1 p-2.5 rounded-xl border border-border bg-card/70 backdrop-blur-sm transition-colors dark:border-white/10 dark:bg-background/40 dark:backdrop-blur-xl">
              <HugeiconsIcon
                icon={FastWindIcon}
                className="h-4 w-4 text-violet-500"
                aria-hidden="true"
              />
              <span className="text-lg font-bold text-foreground">
                {weather.pressure}
              </span>
              <span className="text-[10px] text-muted-foreground tracking-wide">
                {t("today.pressure")}
              </span>
            </div>
          </div>

          {/* Barometric impact note */}
          <div
            className={cn(
              "flex items-start gap-2 rounded-lg p-2.5 text-xs leading-relaxed",
              "bg-card/70 border border-border dark:bg-background/40 dark:border-white/10 dark:backdrop-blur-xl"
            )}
          >
            {impact.icon}
            <span className={impact.color}>{impact.label}</span>
          </div>

          {source === "fallback" && (
            <p className="text-[11px] italic text-muted-foreground">
              {t("today.estimated")}
            </p>
          )}
        </CardContent>
      </Card>
    </DepthCard>
  );
}
