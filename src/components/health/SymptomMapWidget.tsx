"use client";

/**
 * SymptomMapWidget — dashboard symptom logging with a smooth 3D pain heatmap.
 *
 * Physical / Cognitive / Mood sliders drive intensity across anatomical
 * zones. Instead of discrete per-region severity blocks, the heatmap blends
 * a radial gradient across each zone so pain reads as a continuous field —
 * the look the user asked for in the reference video: glossy anatomical form,
 * smooth intensity pools, crisp luminous nodes, Midnight Emerald palette.
 *
 * The body sits on a PerspectiveStage (pointer tilt + drag rotation). Quick-log
 * chips post to the symptoms API exactly as before.
 */

import * as React from "react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  BrainIcon,
  HeartIcon,
  ActivityIcon,
  Add01Icon,
} from "@hugeicons/core-free-icons";
import { PerspectiveStage } from "@/components/ui/PerspectiveStage";
import { VolumetricBody, type BodyRegionId } from "@/components/ui/VolumetricBody";
import { useLanguage } from "@/context/LanguageContext";
import type { TranslationKey } from "@/lib/translations";
import { cn } from "@/lib/utils";

interface ZoneHeat {
  regions: BodyRegionId[];
  /** Aggregated intensity 0–10 for the zone, blended from sliders. */
  intensity: number;
}

interface QuickLog {
  id: string;
  symptom: string;
  labelKey: TranslationKey;
  category: string;
}

/** Anatomical zones: each maps slider categories → a set of body regions. */
const ZONES: Array<{
  id: string;
  labelKey: TranslationKey;
  icon: typeof ActivityIcon;
  regions: BodyRegionId[];
}> = [
  {
    id: "physical",
    labelKey: "health.category.physical",
    icon: ActivityIcon,
    regions: ["lowerBack", "ribs", "hips", "thighs", "thighsR", "knees", "kneesR", "ankles", "anklesR", "upperArms", "upperArmsR", "joints"],
  },
  {
    id: "cognitive",
    labelKey: "health.category.cognitive",
    icon: BrainIcon,
    regions: ["neck", "shoulders", "upperArms", "upperArmsR", "forearms", "forearmsR"],
  },
  {
    id: "mood",
    labelKey: "health.category.mood",
    icon: HeartIcon,
    regions: ["upperArms", "upperArmsR", "forearms", "forearmsR", "joints", "shoulders", "hips"],
  },
];

const QUICK_LOGS: QuickLog[] = [
  { id: "brain-fog", symptom: "brain-fog", labelKey: "health.quickLog.brainFog", category: "cognitive" },
  { id: "focus-fatigue", symptom: "focus-fatigue", labelKey: "health.quickLog.focusFatigue", category: "cognitive" },
  { id: "joint-pain", symptom: "joint-pain", labelKey: "health.quickLog.jointPain", category: "physical" },
  { id: "emotional-exhaustion", symptom: "emotional-exhaustion", labelKey: "health.quickLog.emotionalExhaustion", category: "mood" },
];

export function SymptomMapWidget() {
  const { t } = useLanguage();
  const [zoneValues, setZoneValues] = useState<Record<string, number>>({
    physical: 5,
    cognitive: 5,
    mood: 5,
  });

  const handleValueChange = (zoneId: string, value: number | readonly number[]) => {
    const next = Array.isArray(value) ? value : [value];
    setZoneValues((prev) => ({ ...prev, [zoneId]: next[0] }));
  };

  const handleQuickLog = async (log: typeof QUICK_LOGS[0]) => {
    try {
      const zoneIntensity = zoneValues[log.category] ?? 5;
      const res = await fetch("/api/health/symptoms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symptom: log.symptom,
          severity: zoneIntensity,
          category: log.category,
          date: new Date().toISOString().split("T")[0],
        }),
      });
      if (res.ok) {
        // Success feedback could be wired here (toast, etc.)
      }
    } catch (e) {
      console.error("Failed to quick log symptom", e);
    }
  };

  const zones: ZoneHeat[] = ZONES.map((zone) => ({
    ...zone,
    intensity: zoneValues[zone.id] ?? 5,
  }));

  return (
    <Card className="w-full h-full flex flex-col border-teal-200 dark:border-teal-900/30 bg-teal-50/30 dark:bg-teal-950/10">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-teal-800 dark:text-teal-300 flex items-center gap-2">
          <HugeiconsIcon icon={ActivityIcon} className="h-5 w-5" />
          {t("health.symptomMap.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 flex-1">
        {/* Live 3D pain heatmap — smooth intensity pools across zones */}
        <div className="relative mx-auto w-full max-w-[190px] select-none">
          <PerspectiveStage
            className="aspect-[100/125] w-full overflow-visible"
            resting={{ rotateX: 7, rotateY: -7 }}
            tiltDeg={6}
          >
            <VolumetricBody
              severity={{
                lowerBack: zones[0].intensity,
                ribs: zones[0].intensity,
                hips: Math.round((zones[0].intensity + zones[2].intensity) / 2),
                thighs: zones[0].intensity,
                thighsR: zones[0].intensity,
                knees: zones[0].intensity,
                kneesR: zones[0].intensity,
                ankles: Math.max(1, zones[0].intensity - 2),
                anklesR: Math.max(1, zones[0].intensity - 2),
                upperArms: Math.round((zones[1].intensity + zones[2].intensity) / 2),
                upperArmsR: Math.round((zones[1].intensity + zones[2].intensity) / 2),
                forearms: Math.round((zones[1].intensity + zones[2].intensity) / 2),
                forearmsR: Math.round((zones[1].intensity + zones[2].intensity) / 2),
                elbows: Math.round(zones[1].intensity),
                elbowsR: Math.round(zones[1].intensity),
                neck: zones[1].intensity,
                shoulders: Math.round((zones[1].intensity + zones[2].intensity) / 2),
                joints: Math.round((zones[0].intensity + zones[2].intensity) / 2),
              }}
            />
          </PerspectiveStage>
        </div>

        {/* Categorized sliders — each drives a zone intensity */}
        <div className="grid grid-cols-1 gap-4">
          {zones.map((zone) => (
            <div
              key={zone.id}
              className="space-y-2 p-3 rounded-xl bg-white/50 dark:bg-black/20 border border-teal-100 dark:border-teal-900/20"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-base font-medium text-teal-700 dark:text-teal-300">
                  <HugeiconsIcon icon={zone.icon} className="h-4 w-4" />
                  {t(zone.labelKey as TranslationKey)}
                </div>
                <span className="text-base font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-600 dark:bg-teal-900/40 dark:text-teal-400">
                  {zone.intensity} / 10
                </span>
              </div>
              <Slider
                value={[zone.intensity]}
                max={10}
                step={1}
                onValueChange={(v) => handleValueChange(zone.id, v)}
                className="py-2"
              />
            </div>
          ))}
        </div>

        {/* Quick Log Section */}
        <div className="space-y-3">
          <p className="text-base font-semibold uppercase tracking-wider text-teal-600/70 dark:text-teal-400/60">
            {t("health.symptomMap.quickLog")}
          </p>
          <div className="flex flex-wrap gap-2">
            {QUICK_LOGS.map((log) => (
              <Button
                key={log.id}
                variant="outline"
                size="sm"
                onClick={() => handleQuickLog(log)}
                className="text-base h-9 px-3 rounded-full border-teal-200 bg-white/50 dark:bg-teal-900/20 hover:bg-teal-100 dark:hover:bg-teal-800/40 transition-colors"
              >
                <HugeiconsIcon icon={Add01Icon} className="me-1 h-3 w-3" />
                {t(log.labelKey)}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
