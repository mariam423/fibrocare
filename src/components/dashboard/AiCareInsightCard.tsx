"use client";

import { useMemo } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArtificialIntelligence04Icon,
  ThermometerIcon,
  DropletIcon,
  ArrowUp01Icon,
  ArrowDown01Icon,
} from "@hugeicons/core-free-icons";
import {
  buildCareInsight,
  getPainTrend,
  type FlareState,
  type HumidityLevel,
  type PainTrend,
} from "@/lib/careInsightEngine";
import { useSimulatedWeather } from "@/hooks/useSimulatedWeather";
import { useLanguage } from "@/context/LanguageContext";
import type { TranslationKey } from "@/lib/translations";
import { cn } from "@/lib/utils";

const FLARE_LABEL: Record<FlareState, TranslationKey> = {
  calm: "careInsight.flareCalm",
  mild: "careInsight.flareMild",
  severe: "careInsight.flareSevere",
};

const HEAT_TITLE: Record<FlareState, { heat: TranslationKey; plain: TranslationKey }> = {
  severe: { heat: "careInsight.title.severeHeat", plain: "careInsight.title.severe" },
  mild: { heat: "careInsight.title.mildHeat", plain: "careInsight.title.mild" },
  calm: { heat: "careInsight.title.calmHeat", plain: "careInsight.title.calm" },
};

const HEAT_MESSAGE: Record<FlareState, TranslationKey> = {
  severe: "careInsight.heat.severe",
  mild: "careInsight.heat.mild",
  calm: "careInsight.heat.calm",
};

const HUMIDITY_MESSAGE: Record<HumidityLevel, TranslationKey> = {
  humid: "careInsight.humidity.humid",
  dry: "careInsight.humidity.dry",
  moderate: "careInsight.humidity.moderate",
};

const TREND_MESSAGE: Record<PainTrend, TranslationKey> = {
  rising: "careInsight.trend.rising",
  falling: "careInsight.trend.falling",
  stable: "careInsight.trend.stable",
};

const SUGGESTION_KEYS: Record<FlareState, [TranslationKey, TranslationKey, TranslationKey]> = {
  severe: [
    "careInsight.suggest.severe.1",
    "careInsight.suggest.severe.2",
    "careInsight.suggest.severe.3",
  ],
  mild: [
    "careInsight.suggest.mild.1",
    "careInsight.suggest.mild.2",
    "careInsight.suggest.mild.3",
  ],
  calm: [
    "careInsight.suggest.calm.1",
    "careInsight.suggest.calm.2",
    "careInsight.suggest.calm.3",
  ],
};

interface AiCareInsightCardProps {
  painLevel: number;
  weeklyTrend: Array<{ level: number | null }>;
}

const FLARE_TONE: Record<
  FlareState,
  { badge: string; accent: string; glow: string }
> = {
  calm: {
    badge: "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300",
    accent: "text-emerald-600 dark:text-emerald-400",
    glow: "shadow-[0_0_24px_-6px_rgba(16,185,129,0.45)]",
  },
  mild: {
    badge: "bg-violet-500/10 text-violet-700 dark:bg-violet-400/10 dark:text-violet-300",
    accent: "text-violet-600 dark:text-violet-400",
    glow: "shadow-[0_0_24px_-6px_rgba(139,92,246,0.45)]",
  },
  severe: {
    badge: "bg-rose-500/10 text-rose-700 dark:bg-rose-400/10 dark:text-rose-300",
    accent: "text-rose-600 dark:text-rose-400",
    glow: "shadow-[0_0_24px_-6px_rgba(244,63,94,0.5)]",
  },
};

export function AiCareInsightCard({
  painLevel,
  weeklyTrend,
}: AiCareInsightCardProps) {
  const weather = useSimulatedWeather();
  const { t } = useLanguage();
  const trend = useMemo(() => {
    const valid = weeklyTrend.filter((p): p is { level: number } => p.level !== null);
    return getPainTrend(valid);
  }, [weeklyTrend]);
  const insight = useMemo(
    () =>
      buildCareInsight({
        painLevel,
        temperature: weather.temperature,
        humidity: weather.humidity,
        trend,
      }),
    [painLevel, weather.temperature, weather.humidity, trend]
  );
  const tone = FLARE_TONE[insight.flareState];

  // Localized copy: pick keys from the same deterministic states the engine
  // uses, so the card reads natively in Arabic (and the pure engine stays
  // language-neutral for tests and server-side consumers).
  const isHeatFactor = insight.comfort === "hot" || insight.humidity === "humid";
  const titleKey = HEAT_TITLE[insight.flareState][isHeatFactor ? "heat" : "plain"];
  const humidityKey =
    insight.humidity === "humid" && insight.flareState === "severe"
      ? "careInsight.humidity.humidSevere"
      : HUMIDITY_MESSAGE[insight.humidity];
  const message = [
    t(HEAT_MESSAGE[insight.flareState]),
    t(humidityKey),
    t(TREND_MESSAGE[trend]),
  ].join(" ");
  const suggestions = SUGGESTION_KEYS[insight.flareState].map((key) => t(key));

  return (
    <section
      aria-label={t("careInsight.ariaLabel")}
      className="backdrop-blur-md bg-slate-900/80 border border-slate-800 rounded-2xl p-5 mb-6 shadow-[0_8px_32px_rgba(0,0,0,0.37)]"
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 ring-1 ring-primary/20",
            tone.glow
          )}
        >
          <HugeiconsIcon
            icon={ArtificialIntelligence04Icon}
            className={cn("h-5 w-5", tone.accent)}
            aria-hidden="true"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold text-foreground">
              {t("careInsight.title")}
            </h2>
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize",
                tone.badge
              )}
            >
              {t(FLARE_LABEL[insight.flareState])}
            </span>
          </div>
          <p className="mt-1 text-sm leading-relaxed text-foreground">
            {t(titleKey)}
          </p>
        </div>

        <div className="hidden shrink-0 items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2 text-xs text-zinc-400 sm:flex backdrop-blur-md">
          <span className="flex items-center gap-1">
            <HugeiconsIcon
              icon={ThermometerIcon}
              className="h-3.5 w-3.5 text-orange-500"
              aria-hidden="true"
            />
            {weather.temperature}°
          </span>
          <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">•</span>
          <span className="flex items-center gap-1">
            <HugeiconsIcon
              icon={DropletIcon}
              className="h-3.5 w-3.5 text-emerald-500"
              aria-hidden="true"
            />
            {weather.humidity}%
          </span>
          <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">•</span>
          {insight.flareState !== "severe" ? (
            <span className="flex items-center gap-0.5">
              <HugeiconsIcon
                icon={ArrowDown01Icon}
                className="h-3.5 w-3.5 text-emerald-500"
                aria-hidden="true"
              />
              {t("careInsight.easing")}
            </span>
          ) : (
            <span className="flex items-center gap-0.5">
              <HugeiconsIcon
                icon={ArrowUp01Icon}
                className="h-3.5 w-3.5 text-rose-500"
                aria-hidden="true"
              />
              {t("careInsight.watch")}
            </span>
          )}
        </div>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {message}
      </p>

      <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
        {suggestions.map((suggestion, index) => (
          <li
            key={suggestion}
            className="flex items-start gap-2 rounded-xl border border-slate-800 bg-slate-900/80 p-3 text-xs leading-relaxed text-white backdrop-blur-md"
          >
            <span
              className={cn(
                "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold",
                tone.badge
              )}
            >
              {index + 1}
            </span>
            <span>{suggestion}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
