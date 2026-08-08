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

export interface Symptom {
  id: string;
  label: string;
  icon: IconSvgElement;
}

export const FIBRO_SYMPTOMS: Symptom[] = [
  { id: "widespread-pain", label: "Widespread Pain", icon: Activity01Icon },
  { id: "fatigue", label: "Fatigue", icon: BatteryLowIcon },
  { id: "sleep-problems", label: "Sleep Problems", icon: Moon01Icon },
  { id: "fibro-fog", label: "Fibro Fog", icon: BrainIcon },
  { id: "headache", label: "Headache / Migraine", icon: WaveIcon },
  { id: "tender-points", label: "Tender Points", icon: MapPinIcon },
  { id: "stiffness", label: "Stiffness", icon: FlowConnectionIcon },
  { id: "sensitivity", label: "Light / Noise Sensitivity", icon: SparklesIcon },
];

interface EmojiGridProps {
  selectedSymptoms: string[];
  onToggle: (id: string) => void;
}

export function EmojiGrid({ selectedSymptoms, onToggle }: EmojiGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {FIBRO_SYMPTOMS.map((s) => {
        const isActive = selectedSymptoms.includes(s.id);
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => onToggle(s.id)}
            aria-pressed={isActive}
            aria-label={`${s.label}${isActive ? " (selected)" : ""}`}
            className={cn(
              "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all group",
              "aspect-square text-center",
              isActive
                ? "bg-purple-50 border-purple-400 text-purple-700 shadow-md scale-105"
                : "bg-white border-slate-100 text-slate-500 hover:border-purple-200 hover:bg-purple-50/30"
            )}
          >
            <div className={cn(
              "p-3 rounded-full mb-2 transition-colors",
              isActive ? "bg-purple-200 text-purple-700" : "bg-slate-100 text-slate-400 group-hover:bg-purple-100"
            )}>
              <HugeiconsIcon icon={s.icon} className="h-6 w-6" aria-hidden="true" />
            </div>
            <span className="text-xs font-medium leading-tight">{s.label}</span>
          </button>
        );
      })}
    </div>
  );
}
