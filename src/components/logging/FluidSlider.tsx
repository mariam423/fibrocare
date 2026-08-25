"use client";

import React from "react";
import { Slider } from "@/components/ui/slider";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

interface FluidSliderProps {
  value: number[];
  onValueChange: (value: number[]) => void;
}

const LEVEL_COLORS = {
  calm: "bg-emerald-600 dark:bg-emerald-400",
  moderate: "bg-[#8F83B8] dark:bg-[#A79ACF]",
  intense: "bg-orange-500 dark:bg-orange-400",
};

export function FluidSlider({ value, onValueChange }: FluidSliderProps) {
  const { t } = useLanguage();
  const level = value[0];

  const tone = level <= 3 ? "calm" : level <= 6 ? "moderate" : "intense";
  const badgeTone = {
    calm: "text-emerald-700 bg-emerald-500/12 ring-1 ring-emerald-600/20 backdrop-blur-sm dark:text-emerald-300 dark:bg-emerald-400/10 dark:ring-emerald-300/25",
    moderate:
      "text-[#6E6599] bg-[#8F83B8]/12 ring-1 ring-[#8F83B8]/25 backdrop-blur-sm dark:text-[#B9AEE0] dark:bg-[#A79ACF]/10 dark:ring-[#A79ACF]/25",
    intense:
      "text-orange-700 bg-orange-500/12 ring-1 ring-orange-600/20 backdrop-blur-sm dark:text-orange-300 dark:bg-orange-400/10 dark:ring-orange-300/25",
  }[tone];

  return (
    <div className="space-y-6 w-full max-w-md mx-auto rounded-2xl border border-border bg-card backdrop-blur-md shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-6">
      <div className="flex justify-between items-center">
        <span className="text-lg font-medium text-foreground">{t("logging.slider.label")}</span>
        <div
          className={cn(
            "text-2xl font-bold px-4 py-1 rounded-full transition-all duration-300 shadow-sm",
            badgeTone
          )}
          aria-live="polite"
        >
          <bdi>{level} / 10</bdi>
        </div>
      </div>

      <Slider
        value={value}
        max={10}
        step={1}
        aria-label={t("logging.slider.ariaLabel")}
        onValueChange={(v) => {
          const normalized = Array.isArray(v) ? Array.from(v) : [v];
          onValueChange(normalized);
        }}
        indicatorClassName={LEVEL_COLORS[tone]}
        className="py-4"
      />

      <div className="flex justify-between text-sm text-muted-foreground font-medium px-1">
        <span>{t("logging.slider.calm")}</span>
        <span>{t("logging.slider.moderate")}</span>
        <span>{t("logging.slider.intense")}</span>
      </div>
    </div>
  );
}
