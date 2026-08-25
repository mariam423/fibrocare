"use client";

import React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Activity01Icon, Clock01Icon } from "@hugeicons/core-free-icons";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DepthCard } from "@/components/ui/DepthCard";
import { useLanguage } from "@/context/LanguageContext";
import type { TranslationKey } from "@/lib/translations";
import { cn } from "@/lib/utils";
import { formatLogDate } from "@/hooks/useDashboard";

interface LogEntry {
  painLevel: number;
  moodTag: string;
  loggedAt: string | Date;
}

function getPainColor(level: number): string {
  if (level <= 3) return "bg-emerald-400";
  if (level <= 6) return "bg-amber-400";
  return "bg-orange-500";
}

function getPainLabel(level: number): TranslationKey {
  if (level <= 2) return "recent.pain.levelLow";
  if (level <= 4) return "recent.pain.levelMild";
  if (level <= 6) return "recent.pain.levelModerate";
  if (level <= 8) return "recent.pain.levelHigh";
  return "recent.pain.levelSevere";
}

const STORED_MOOD_KEYS: Record<string, TranslationKey> = {
  "Good Day": "dashboard.energy.goodDay",
  "Low Energy": "dashboard.energy.lowEnergy",
  "Flare-up": "dashboard.energy.flareUp",
  "Calm Day": "logging.presets.calmDay",
  "Mild Flare": "logging.presets.mildFlare",
  "Severe Flare": "logging.presets.severeFlare",
};

function isToday(date: string | Date): boolean {
  const d = new Date(date);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

interface RecentLogsWidgetProps {
  logs: LogEntry[];
  /** When > 1, lays the log list out as a responsive grid (for full-width sections). */
  columns?: 1 | 2 | 3;
}

export function RecentLogsWidget({ logs, columns = 1 }: RecentLogsWidgetProps) {
  const { t, locale } = useLanguage();
  return (
    <DepthCard tilt={3} delay={0.15} float>
      <Card className="h-full">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2 font-semibold">
            <HugeiconsIcon
              icon={Activity01Icon}
              className="h-5 w-5 text-primary"
              aria-hidden="true"
            />
            <CardTitle className="text-base">{t("recent.title")}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {logs.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">
                {t("recent.empty")}
              </p>
            </div>
          ) : (
            <div
              className={cn(
                columns > 1 ? "grid grid-cols-1 gap-2" : "space-y-2",
                columns >= 2 && "sm:grid-cols-2",
                columns >= 3 && "lg:grid-cols-3"
              )}
            >
              {logs.map((log, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-xl surface-crisp transition-colors hover:bg-muted"
                >
                  {/* Pain level indicator */}
                  <div className="relative">
                    <div
                      className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-bold",
                        getPainColor(log.painLevel)
                      )}
                      aria-label={t("recent.painAria", { level: log.painLevel })}
                    >
                      <bdi>{log.painLevel}</bdi>
                    </div>
                  </div>

                  {/* Log details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground truncate">
                        {STORED_MOOD_KEYS[log.moodTag] ? t(STORED_MOOD_KEYS[log.moodTag]) : log.moodTag}
                      </span>
                      <span
                        className={cn(
                          "text-[10px] font-medium px-1.5 py-0.5 rounded-full tracking-wide",
                          log.painLevel <= 3
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                            : log.painLevel <= 6
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
                              : "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400"
                        )}
                      >
                        {t(getPainLabel(log.painLevel))}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <HugeiconsIcon
                        icon={Clock01Icon}
                        className="h-3 w-3 text-muted-foreground"
                        aria-hidden="true"
                      />
                      <span className="text-xs text-muted-foreground">
                        {formatLogDate(log.loggedAt, locale)}
                      </span>
                      {isToday(log.loggedAt) && (
                        <span className="ms-1 inline-flex items-center gap-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                          <span
                            className="relative flex h-1.5 w-1.5"
                            aria-hidden="true"
                          >
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60 opacity-75" />
                            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                          </span>
                          {t("recent.today")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </DepthCard>
  );
}
