"use client";

import React from "react";
import { Activity, BatteryLow, MoonStar, Brain, Waves, MapPin, Spline, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Symptom {
  id: string;
  label: string;
  icon: React.ElementType;
}

export const FIBRO_SYMPTOMS: Symptom[] = [
  { id: "widespread-pain", label: "Widespread Pain", icon: Activity },
  { id: "fatigue", label: "Fatigue", icon: BatteryLow },
  { id: "sleep-problems", label: "Sleep Problems", icon: MoonStar },
  { id: "fibro-fog", label: "Fibro Fog", icon: Brain },
  { id: "headache", label: "Headache / Migraine", icon: Waves },
  { id: "tender-points", label: "Tender Points", icon: MapPin },
  { id: "stiffness", label: "Stiffness", icon: Spline },
  { id: "sensitivity", label: "Light / Noise Sensitivity", icon: Lightbulb },
];

interface EmojiGridProps {
  selectedSymptoms: string[];
  onToggle: (id: string) => void;
}

export function EmojiGrid({ selectedSymptoms, onToggle }: EmojiGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {FIBRO_SYMPTOMS.map((s) => {
        const Icon = s.icon;
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
              <Icon className="h-6 w-6" />
            </div>
            <span className="text-xs font-medium leading-tight">{s.label}</span>
          </button>
        );
      })}
    </div>
  );
}
