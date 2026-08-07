"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHealth } from "@/context/HealthContext";
import { cn } from "@/lib/utils";

export interface Preset {
  label: string;
  painLevel: number;
  symptoms: string[];
  emoji: string;
}

const PRESETS: Preset[] = [
  { label: "Calm Day", painLevel: 2, symptoms: [], emoji: "☀️" },
  {
    label: "Mild Flare",
    painLevel: 5,
    symptoms: ["fatigue", "stiffness"],
    emoji: "⛅",
  },
  {
    label: "Severe Flare",
    painLevel: 8,
    symptoms: ["widespread-pain", "fatigue", "fibro-fog", "headache"],
    emoji: "⛈️",
  },
];

interface QuickPresetsProps {
  onSelect: (preset: Preset) => void;
  isLogging?: boolean;
  loggingPreset?: string | null;
}

export function QuickPresets({ onSelect, isLogging = false, loggingPreset = null }: QuickPresetsProps) {
  const { currentPainLevel } = useHealth();

  return (
    <div
      className="flex flex-wrap gap-3 mb-8"
      role="group"
      aria-label="Quick check-in presets"
    >
      {PRESETS.map((preset) => {
        const isActive = currentPainLevel === preset.painLevel;
        const isSavingThis = loggingPreset === preset.label;
        return (
          <Button
            key={preset.label}
            variant="outline"
            onClick={() => onSelect(preset)}
            disabled={isLogging}
            aria-pressed={isActive}
            aria-busy={isSavingThis}
            className={cn(
              "flex items-center gap-2 px-6 py-6 text-lg transition-all rounded-full",
              isActive
                ? "bg-purple-100 border-purple-400 text-purple-700 ring-2 ring-purple-300 dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-800"
                : "bg-card border-border hover:bg-muted"
            )}
          >
            {isSavingThis ? (
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            ) : (
              <span className="text-xl" aria-hidden="true">
                {preset.emoji}
              </span>
            )}
            {preset.label}
          </Button>
        );
      })}
    </div>
  );
}
