"use client";

import React from "react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface FluidSliderProps {
  value: number[];
  onValueChange: (value: number[]) => void;
}

const LEVEL_COLORS = {
  calm: "bg-teal-500 dark:bg-teal-400",
  moderate: "bg-purple-500 dark:bg-purple-400",
  intense: "bg-orange-500 dark:bg-orange-400",
};

export function FluidSlider({ value, onValueChange }: FluidSliderProps) {
  const level = value[0];

  const tone = level <= 3 ? "calm" : level <= 6 ? "moderate" : "intense";
  const badgeTone = {
    calm: "text-teal-700 bg-teal-100 dark:text-teal-300 dark:bg-teal-900/60",
    moderate:
      "text-purple-700 bg-purple-100 dark:text-purple-300 dark:bg-purple-900/60",
    intense:
      "text-orange-700 bg-orange-100 dark:text-orange-300 dark:bg-orange-900/60",
  }[tone];

  return (
    <div className="space-y-6 w-full max-w-md mx-auto">
      <div className="flex justify-between items-center">
        <span className="text-lg font-medium text-foreground">Pain Level</span>
        <div
          className={cn(
            "text-2xl font-bold px-4 py-1 rounded-full transition-all duration-300",
            badgeTone
          )}
          aria-live="polite"
        >
          {level} / 10
        </div>
      </div>

      <Slider
        value={value}
        max={10}
        step={1}
        aria-label="Pain level"
        onValueChange={(v) => {
          const normalized = Array.isArray(v) ? Array.from(v) : [v];
          onValueChange(normalized);
        }}
        indicatorClassName={LEVEL_COLORS[tone]}
        className="py-4"
      />

      <div className="flex justify-between text-sm text-muted-foreground font-medium px-1">
        <span>Calm</span>
        <span>Moderate</span>
        <span>Intense</span>
      </div>
    </div>
  );
}
