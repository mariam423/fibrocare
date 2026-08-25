"use client";

/**
 * AI Rescue Recommendation.
 *
 * Reads the user's current pain level from HealthContext, live (or offline
 * deterministic) weather from useWeather, and remaining spoons from the
 * shared `fibrocare:spoons` storage slot, then generates a quiet,
 * single-action calming tip via the pure rescue engine. Every string is a
 * translation key, so the card is fully localized in EN and AR and mirrors
 * cleanly under RTL (logical spacing + <bdi>-isolated numbers).
 */

import React, { useMemo, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { AiBrain01Icon, SparklesIcon } from "@hugeicons/core-free-icons";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DepthCard } from "@/components/ui/DepthCard";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { useHealth } from "@/context/HealthContext";
import { useWeather } from "@/hooks/useWeather";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { generateRescueRecommendation } from "@/lib/rescue/engine";

export function AiRescueCard() {
  const { t } = useLanguage();
  const { currentPainLevel } = useHealth();
  const weather = useWeather();
  // Shared storage slot so the toolkit stays in sync with any other spoon
  // tracker; defaults to a neutral 6 when nothing has been logged yet.
  const [spoons, setSpoons] = useLocalStorage<number>("fibrocare:spoons", 6);

  const [pressed, setPressed] = useState(false);
  const [variant, setVariant] = useState(0);

  const recommendation = useMemo(
    () =>
      generateRescueRecommendation({
        painLevel: currentPainLevel,
        spoonsRemaining: spoons,
        weatherTriggers: weather.triggers,
        variant,
      }),
    [currentPainLevel, spoons, weather.triggers, variant]
  );

  const handleGenerate = () => {
    setVariant((v) => v + 1);
    setPressed(true);
  };

  return (
    <DepthCard tilt={2}>
      <Card className="h-full shadow-depth-sm backdrop-blur-xl border border-emerald-500/20 bg-white/70 dark:bg-slate-900/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HugeiconsIcon icon={AiBrain01Icon} className="h-5 w-5 text-primary" aria-hidden="true" />
            {t("rescue.title")}
          </CardTitle>
          <CardDescription>{t("rescue.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Context: pain (HealthContext) · spoons (shared slot) · weather */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-border/60 bg-muted/30 p-3 text-sm">
              <p className="text-xs text-muted-foreground">{t("rescue.context.pain")}</p>
              <p className="font-semibold">
                <bdi>{currentPainLevel}</bdi>/10
              </p>
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/30 p-3 text-sm">
              <p className="text-xs text-muted-foreground">{t("rescue.context.spoons")}</p>
              <input
                type="range"
                min={0}
                max={12}
                value={spoons}
                onChange={(e) => setSpoons(Number(e.target.value))}
                aria-label={t("rescue.spoonsLabel")}
                className="mt-1 w-full accent-primary"
              />
              <p className="font-semibold">
                <bdi>{spoons}</bdi>/12
              </p>
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/30 p-3 text-sm">
              <p className="text-xs text-muted-foreground">{t("rescue.context.weather")}</p>
              <p className="font-semibold">
                <bdi>{weather.weather.temperature}°</bdi> · <bdi>{weather.weather.humidity}%</bdi> ·{" "}
                <bdi>{weather.weather.pressure}</bdi> hPa
              </p>
              {weather.isEstimated && (
                <p className="text-xs text-muted-foreground">{t("rescue.context.estimate")}</p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={handleGenerate}
              className="rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] active:bg-emerald-500/10"
            >
              <HugeiconsIcon icon={SparklesIcon} className="me-1 h-4 w-4" aria-hidden="true" />
              {pressed ? t("rescue.regenerate") : t("rescue.generate")}
            </Button>
          </div>

          {pressed && (
            <div
              className="space-y-2 rounded-xl border border-primary/30 bg-primary/5 p-4"
              aria-live="polite"
            >
              <p className="text-sm italic text-foreground/90">{t(recommendation.tipKey)}</p>
              <p className="text-sm font-semibold text-primary">{t(recommendation.actionKey)}</p>
              <p className="text-xs text-muted-foreground">{t(recommendation.whyKey)}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </DepthCard>
  );
}
