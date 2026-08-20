"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import {
  Activity01Icon,
  BatteryLowIcon,
  Moon01Icon,
  BrainIcon,
  WaveIcon,
  MapPinIcon,
  FlowConnectionIcon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import type { TranslationKey } from "@/lib/translations";

export interface Symptom {
  id: string;
  tKey: TranslationKey;
  icon: IconSvgElement;
}

export const FIBRO_SYMPTOMS: Symptom[] = [
  { id: "widespread-pain", tKey: "logging.symptoms.widespreadPain", icon: Activity01Icon },
  { id: "fatigue", tKey: "logging.symptoms.fatigue", icon: BatteryLowIcon },
  { id: "sleep-problems", tKey: "logging.symptoms.sleepProblems", icon: Moon01Icon },
  { id: "fibro-fog", tKey: "logging.symptoms.fibroFog", icon: BrainIcon },
  { id: "headache", tKey: "logging.symptoms.headache", icon: WaveIcon },
  { id: "tender-points", tKey: "logging.symptoms.tenderPoints", icon: MapPinIcon },
  { id: "stiffness", tKey: "logging.symptoms.stiffness", icon: FlowConnectionIcon },
  { id: "sensitivity", tKey: "logging.symptoms.sensitivity", icon: SparklesIcon },
];

interface EmojiGridProps {
  selectedSymptoms: string[];
  onToggle: (id: string) => void;
}

export function EmojiGrid({ selectedSymptoms, onToggle }: EmojiGridProps) {
  const { t } = useLanguage();
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {FIBRO_SYMPTOMS.map((s) => {
        const isActive = selectedSymptoms.includes(s.id);
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => onToggle(s.id)}
            aria-pressed={isActive}
            aria-label={`${t(s.tKey)}${isActive ? t("logging.symptoms.selected") : ""}`}
            className={cn(
              "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 group",
              "aspect-square text-center cursor-pointer",
              "active:scale-[0.96]",
              isActive
                ? "bg-primary/10 border-primary/60 text-primary shadow-depth-md scale-105 dark:bg-primary/20 dark:border-primary/50"
                : "border border-border bg-card text-muted-foreground backdrop-blur-md hover:border-emerald-400/30 hover:bg-primary/5 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]"
            )}
          >
            <div className={cn(
              "icon-badge flex h-14 w-14 items-center justify-center rounded-full transition-all duration-300",
              isActive
                ? "ring-1 ring-primary/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_2px_10px_rgba(15,23,42,0.08)]"
                : "opacity-90 group-hover:opacity-100"
            )}>
              <HugeiconsIcon icon={s.icon} className="h-6 w-6" aria-hidden="true" />
            </div>
            <span className="text-xs font-medium leading-tight">{t(s.tKey)}</span>
          </button>
        );
      })}
    </div>
  );
}
