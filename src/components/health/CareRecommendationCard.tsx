"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import { SparklesIcon, AlertCircleIcon, LightbulbIcon } from "@hugeicons/core-free-icons";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

interface Recommendation {
  id: string;
  title: string;
  message: string;
  priority: "low" | "medium" | "high";
  type: string;
}

export function CareRecommendationCard() {
  const { t } = useLanguage();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        const res = await fetch("/api/health/correlations");
        const result = await res.json();
        if (result.success && result.data?.recommendations) {
          setRecommendations(result.data.recommendations);
        }
      } catch (e) {
        console.error("Failed to fetch recommendations", e);
      } finally {
        setLoading(false);
      }
    }
    fetchRecommendations();
  }, []);

  if (loading) {
    return (
      <Card className="w-full h-full min-h-[160px] flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground text-sm">
          {t("dashboard.loading")}
        </div>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card className="w-full h-full min-h-[160px] flex items-center justify-center text-center p-6">
        <div className="text-muted-foreground text-sm">
          {t("health.recommendations.empty")}
        </div>
      </Card>
    );
  }

  // Show only the top recommendation for the dashboard widget
  const topRec = recommendations[0];
  const isHighPriority = topRec.priority === "high";

  return (
    <Card
      className={cn(
        "w-full h-full overflow-hidden transition-all duration-500",
        isHighPriority
          ? "border-orange-300 dark:border-orange-800 shadow-[0_0_15px_rgba(249,115,22,0.2)] ring-1 ring-orange-400/30"
          : "border-teal-200 dark:border-teal-900/30"
      )}
    >
      <CardContent className="p-5 space-y-3">
        <div className="flex items-start gap-3">
          <div className={cn(
            "p-2 rounded-lg shrink-0",
            isHighPriority
              ? "bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400"
              : "bg-teal-100 text-teal-600 dark:bg-teal-900/40 dark:text-teal-400"
          )}>
            <HugeiconsIcon
              icon={isHighPriority ? AlertCircleIcon : LightbulbIcon}
              className="h-5 w-5"
            />
          </div>
          <div className="space-y-1">
            <h3 className={cn(
              "font-bold text-base leading-tight",
              isHighPriority ? "text-orange-800 dark:text-orange-300" : "text-teal-800 dark:text-teal-300"
            )}>
              {topRec.title}
            </h3>
            <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              {topRec.message}
            </p>
          </div>
        </div>

        {isHighPriority && (
          <div className="pt-2">
            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 text-sm font-bold uppercase tracking-wider">
              <HugeiconsIcon icon={SparklesIcon} className="h-3 w-3" />
              {t("health.recommendations.highPriority")}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
