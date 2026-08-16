"use client";

import React from "react";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  Loading01Icon,
  Sun01Icon,
  CloudIcon,
  FireIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Magnetic } from "@/components/ui/Magnetic";
import { useHealth } from "@/context/HealthContext";
import { useLanguage } from "@/context/LanguageContext";
import type { TranslationKey } from "@/lib/translations";
import { cn } from "@/lib/utils";

export interface Preset {
  label: string;
  tKey: TranslationKey;
  painLevel: number;
  symptoms: string[];
  icon: IconSvgElement;
}

const PRESETS: Preset[] = [
  { label: "Calm Day", tKey: "logging.presets.calmDay", painLevel: 2, symptoms: [], icon: Sun01Icon },
  {
    label: "Mild Flare",
    tKey: "logging.presets.mildFlare",
    painLevel: 5,
    symptoms: ["fatigue", "stiffness"],
    icon: CloudIcon,
  },
  {
    label: "Severe Flare",
    tKey: "logging.presets.severeFlare",
    painLevel: 8,
    symptoms: ["widespread-pain", "fatigue", "fibro-fog", "headache"],
    icon: FireIcon,
  },
];

interface PresetTone {
  active: string;
  glowDot: string;
}

const TONES: Record<string, PresetTone> = {
  "Calm Day": {
    active:
      "bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/25 shadow-[0_6px_16px_-6px_rgba(16,185,129,0.35)] dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/30",
    glowDot: "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)] dark:bg-emerald-400",
  },
  "Mild Flare": {
    active:
      "bg-amber-500/10 text-amber-700 ring-1 ring-amber-500/25 shadow-[0_6px_16px_-6px_rgba(245,158,11,0.35)] dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/30",
    glowDot: "bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.7)] dark:bg-amber-400",
  },
  "Severe Flare": {
    active:
      "bg-rose-500/10 text-rose-700 ring-1 ring-rose-500/25 shadow-[0_6px_16px_-6px_rgba(244,63,94,0.35)] dark:bg-rose-400/10 dark:text-rose-300 dark:ring-rose-400/30",
    glowDot: "bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.7)] dark:bg-rose-400",
  },
};

interface QuickPresetsProps {
  onSelect: (preset: Preset) => void;
  isLogging?: boolean;
  loggingPreset?: string | null;
}

export function QuickPresets({ onSelect, isLogging = false, loggingPreset = null }: QuickPresetsProps) {
  const { currentPainLevel } = useHealth();
  const { t } = useLanguage();

  return (
    <div
      className="flex w-full flex-col gap-1.5 rounded-2xl border border-border bg-card/60 p-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] backdrop-blur-md sm:flex-row"
      role="group"
      aria-label={t("logging.presets.ariaLabel")}
    >
      {PRESETS.map((preset) => {
        const isActive = currentPainLevel === preset.painLevel;
        const isSavingThis = loggingPreset === preset.label;
        const tone = TONES[preset.label];
        return (
          <Magnetic key={preset.label} strength={0.1} tapScale={0.96} className="flex-1">
          <Button
            variant="ghost"
            onClick={() => onSelect(preset)}
            disabled={isLogging}
            aria-pressed={isActive}
            aria-busy={isSavingThis}
            className={cn(
              "group relative flex w-full items-center justify-center gap-2.5 min-h-14 rounded-xl px-4 text-base font-semibold transition-all duration-300 ease-out",
              "active:scale-[0.97]",
              isActive
                ? tone.active
                : "text-muted-foreground hover:bg-slate-100 hover:text-foreground hover:-translate-y-px dark:hover:bg-slate-800/70"
            )}
          >
            {isSavingThis ? (
              <HugeiconsIcon
                icon={Loading01Icon}
                className="h-5 w-5 animate-spin"
                aria-hidden="true"
              />
            ) : (
              <HugeiconsIcon
                icon={preset.icon}
                className={cn(
                  "h-5 w-5 transition-transform duration-300 group-hover:scale-110",
                  isActive && "drop-shadow-[0_1px_2px_rgba(15,23,42,0.15)]"
                )}
                aria-hidden="true"
              />
            )}
            {t(preset.tKey)}
            {/* Glow indicator: a soft luminous dot that fades in when selected */}
            <span
              data-testid="preset-glow"
              className={cn(
                "absolute end-3 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full transition-all duration-300",
                isActive
                  ? cn("scale-100 opacity-100", tone.glowDot)
                  : "scale-50 opacity-0 bg-muted-foreground/40"
              )}
              aria-hidden="true"
            />
          </Button>
          </Magnetic>
        );
      })}
    </div>
  );
}
