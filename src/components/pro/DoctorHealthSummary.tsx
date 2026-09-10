"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/context/LanguageContext";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  AlertCircle01Icon,
  Activity01Icon,
  Brain01Icon,
  Smile01Icon,
  Loading01Icon
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

interface HealthAlert {
  id: string;
  message: string;
  severity: string;
}

interface Hotspot {
  area: string;
  severity: number;
}

interface HealthSummaryData {
  currentPhase: string;
  alerts: HealthAlert[];
  topHotspots: Hotspot[];
  summary: {
    physicalAvg: number;
    cognitiveAvg: number;
    moodAvg: number;
  };
}

interface DoctorHealthSummaryProps {
  patientId: string;
}

export function DoctorHealthSummary({ patientId }: DoctorHealthSummaryProps) {
  const { t } = useLanguage();
  const [data, setData] = useState<HealthSummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSummary() {
      try {
        setLoading(true);
        const response = await fetch(`/api/health/patient/${patientId}/correlations`);

        if (response.status === 401 || response.status === 403) {
          setError("No access");
          setLoading(false);
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to fetch health summary");
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    if (patientId) {
      fetchSummary();
    }
  }, [patientId]);

  if (loading) {
    return (
      <Card className="w-full border-muted-foreground/20">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-6 w-32 bg-muted animate-pulse rounded" />
            <div className="h-6 w-20 bg-muted animate-pulse rounded-full" />
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div className="h-20 bg-muted/50 animate-pulse rounded-lg" />
            <div className="grid grid-cols-3 gap-2">
              <div className="h-12 bg-muted/50 animate-pulse rounded-lg" />
              <div className="h-12 bg-muted/50 animate-pulse rounded-lg" />
              <div className="h-12 bg-muted/50 animate-pulse rounded-lg" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full border-destructive/20 bg-destructive/5">
        <CardContent className="p-4 flex items-center gap-3 text-destructive text-sm">
          <HugeiconsIcon icon={AlertCircle01Icon} className="h-4 w-4" />
          <span>{error}</span>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const phaseColors = {
    LUTEAL: "bg-amber-100 text-amber-700 border-amber-200",
    FOLLICULAR: "bg-teal-100 text-teal-700 border-teal-200",
    OVULATION: "bg-purple-100 text-purple-700 border-purple-200",
    MENSTRUAL: "bg-rose-100 text-rose-700 border-rose-200",
    UNKNOWN: "bg-muted text-muted-foreground border-border",
  } as const;

  const currentPhase = data.currentPhase.toUpperCase();
  const phaseColorClass = phaseColors[currentPhase as keyof typeof phaseColors] || phaseColors.UNKNOWN;

  return (
    <Card className="w-full border-muted-foreground/20 overflow-hidden">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold tracking-tight">
            {t("health.doctorSummaryTitle", "Analytical Health Summary")}
          </CardTitle>
          <Badge variant="outline" className={cn("font-medium px-2 py-0.5", phaseColorClass)}>
            {t(`health.phase.${currentPhase.toLowerCase()}`, currentPhase)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-4">
        {/* Correlation Alerts */}
        {data.alerts.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-amber-600">
              <HugeiconsIcon icon={AlertCircle01Icon} className="h-3 w-3" />
              <span>{t("health.correlationAlerts", "Correlation Alerts")}</span>
            </div>
            <div className="grid gap-2">
              {data.alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="p-2 rounded-lg bg-amber-50 border border-amber-100 text-sm text-amber-900"
                >
                  {alert.message}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hotspots & Metrics */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Top Hotspots */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              {t("health.topHotspots", "Top Hotspots")}
            </p>
            <div className="flex flex-wrap gap-2">
              {data.topHotspots.length > 0 ? (
                data.topHotspots.map((spot) => (
                  <Badge
                    key={spot.area}
                    variant="secondary"
                    className="text-[13px] font-normal"
                  >
                    {t(`health.area.${spot.area.toLowerCase()}`, spot.area)}: {spot.severity}
                  </Badge>
                ))
              ) : (
                <p className="text-xs text-muted-foreground italic">No hotspot data</p>
              )}
            </div>
          </div>

          {/* Category Averages */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              {t("health.categoryAverages", "Category Averages")}
            </p>
            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col items-center p-2 rounded-lg bg-muted/50 border border-border">
                <HugeiconsIcon icon={Activity01Icon} className="h-3 w-3 mb-1 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground uppercase">{t("health.physical", "Phys")}</span>
                <span className="text-sm font-bold">{data.summary.physicalAvg}</span>
              </div>
              <div className="flex flex-col items-center p-2 rounded-lg bg-muted/50 border border-border">
                <HugeiconsIcon icon={Brain01Icon} className="h-3 w-3 mb-1 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground uppercase">{t("health.cognitive", "Cogn")}</span>
                <span className="text-sm font-bold">{data.summary.cognitiveAvg}</span>
              </div>
              <div className="flex flex-col items-center p-2 rounded-lg bg-muted/50 border border-border">
                <HugeiconsIcon icon={Smile01Icon} className="h-3 w-3 mb-1 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground uppercase">{t("health.mood", "Mood")}</span>
                <span className="text-sm font-bold">{data.summary.moodAvg}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
