"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  BrainIcon,
  HeartIcon,
  ActivityIcon,
  PlusIcon
} from "@hugeicons/core-free-icons";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

interface CategoryLog {
  id: string;
  label: string;
  icon: any;
  value: number;
}

const CATEGORIES: CategoryLog[] = [
  { id: "PHYSICAL", label: "Physical", icon: ActivityIcon, value: 5 },
  { id: "COGNITIVE", label: "Cognitive", icon: BrainIcon, value: 5 },
  { id: "MOOD", label: "Mood", icon: HeartIcon, value: 5 },
];

const QUICK_LOGS = [
  { id: "brain-fog", label: "Brain Fog", category: "COGNITIVE" },
  { id: "focus-fatigue", label: "Focus Fatigue", category: "COGNITIVE" },
  { id: "joint-pain", label: "Joint Pain", category: "PHYSICAL" },
  { id: "emotional-exhaustion", label: "Emotional Exhaustion", category: "MOOD" },
];

export function SymptomMapWidget() {
  const { t } = useLanguage();
  const [categoryValues, setCategoryValues] = useState<Record<string, number>>({
    PHYSICAL: 5,
    COGNITIVE: 5,
    MOOD: 5,
  });

  const handleValueChange = (catId: string, value: number[]) => {
    setCategoryValues(prev => ({ ...prev, [catId]: value[0] }));
  };

  const handleQuickLog = async (log: typeof QUICK_LOGS[0]) => {
    try {
      const res = await fetch("/api/health/symptoms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symptom: log.label,
          severity: categoryValues[log.category],
          category: log.category,
          date: new Date().toISOString().split("T")[0],
        }),
      });
      if (res.ok) {
        // Toast or feedback could be added here
      }
    } catch (e) {
      console.error("Failed to quick log symptom", e);
    }
  };

  return (
    <Card className="w-full h-full flex flex-col border-teal-200 dark:border-teal-900/30 bg-teal-50/30 dark:bg-teal-950/10">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-teal-800 dark:text-teal-300 flex items-center gap-2">
          <HugeiconsIcon icon={ActivityIcon} className="h-5 w-5" />
          {t("health.symptomMap.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 flex-1">
        {/* Categorized Sliders */}
        <div className="grid grid-cols-1 gap-4">
          {CATEGORIES.map((cat) => (
            <div key={cat.id} className="space-y-2 p-3 rounded-xl bg-white/50 dark:bg-black/20 border border-teal-100 dark:border-teal-900/20">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-base font-medium text-teal-700 dark:text-teal-300">
                  <HugeiconsIcon icon={cat.icon} className="h-4 w-4" />
                  {t(`health.category.${cat.id.toLowerCase()}`)}
                </div>
                <span className="text-base font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-600 dark:bg-teal-900/40 dark:text-teal-400">
                  {categoryValues[cat.id]} / 10
                </span>
              </div>
              <Slider
                value={[categoryValues[cat.id]]}
                max={10}
                step={1}
                onValueChange={(v) => handleValueChange(cat.id, v)}
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
                <HugeiconsIcon icon={PlusIcon} className="me-1 h-3 w-3" />
                {log.label}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
