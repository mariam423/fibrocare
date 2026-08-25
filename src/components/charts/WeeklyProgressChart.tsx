"use client";

import { useMemo } from "react";
import { useReducedMotion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { HugeiconsIcon } from "@hugeicons/react";
import { ChartLineIcon } from "@hugeicons/core-free-icons";
import type { PainTrendPoint } from "@/lib/types";
import { useLanguage } from "@/context/LanguageContext";
import type { TranslationKey } from "@/lib/translations";
import { cn } from "@/lib/utils";

interface WeeklyProgressChartProps {
  data: PainTrendPoint[];
}

function formatDayName(d: Date, locale: string): string {
  return d.toLocaleDateString(locale === "ar" ? "ar" : "en-US", {
    weekday: "short",
  });
}

function buildWeek(data: PainTrendPoint[], locale: string) {
  const levelByDate = new Map(data.map((d) => [d.date, d.level]));
  const result: { day: string; level: number | null }[] = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(d.getDate()).padStart(2, "0")}`;
    result.push({
      day: formatDayName(d, locale),
      level: levelByDate.has(key) ? (levelByDate.get(key) as number) : null,
    });
  }
  return result;
}

const LEVEL_LABEL: Record<string, TranslationKey> = {
  low: "recent.pain.levelLow",
  moderate: "recent.pain.levelModerate",
  high: "recent.pain.levelHigh",
};

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number | null }>;
  label?: string;
}) {
  const { t } = useLanguage();
  if (!active || !payload?.length) return null;
  const value = payload[0].value;
  if (value === null || value === undefined) return null;

  const level =
    value <= 3 ? "low" : value <= 6 ? "moderate" : "high";
  const levelColor =
    level === "low"
      ? "text-emerald-600 dark:text-emerald-400"
      : level === "moderate"
        ? "text-purple-600 dark:text-purple-400"
        : "text-orange-600 dark:text-orange-400";

  return (
    <div className="glass-surface rounded-xl border border-border px-4 py-3 shadow-beautiful-md">
      <p className="text-xs font-semibold text-muted-foreground mb-1">{label}</p>
      <p className="text-lg font-bold text-foreground">
        <bdi>{value}</bdi><span className="text-xs font-normal text-muted-foreground ms-0.5">{t("chart.painLevel")}</span>
      </p>
      <p className={cn("text-xs font-medium mt-0.5", levelColor)}>
        {t(LEVEL_LABEL[level])} {t("logging.slider.label")}
      </p>
    </div>
  );
}

/**
 * Weekly pain progress, styled with the app's semantic chart tokens
 * (soothing lavender) so it adapts to light/dark automatically.
 *
 * Accessibility: the SVG chart is described via role="img" + aria-label
 * (range summary), and the area draw animation is disabled under
 * `prefers-reduced-motion`. In RTL the time axis is reversed so the oldest
 * day reads right-to-left, matching the document direction.
 */
export function WeeklyProgressChart({ data }: WeeklyProgressChartProps) {
  const { t, locale, dir } = useLanguage();
  const reducedMotion = useReducedMotion();
  const chartData = useMemo(() => buildWeek(data, locale), [data, locale]);

  const summary = useMemo(() => {
    const filled = chartData.filter(
      (d): d is { day: string; level: number } => d.level !== null
    );
    if (filled.length === 0) return null;
    const levels = filled.map((d) => d.level);
    const avg = levels.reduce((a, b) => a + b, 0) / levels.length;
    return {
      text: t("chart.summary", {
        max: Math.max(...levels),
        min: Math.min(...levels),
      }),
      avg: Math.round(avg * 10) / 10,
    };
  }, [chartData, t]);

  if (chartData.every((d) => d.level === null)) {
    return (
      <div
        className="flex h-40 flex-col items-center justify-center space-y-2 text-center text-muted-foreground"
        aria-live="polite"
      >
        <HugeiconsIcon icon={ChartLineIcon} className="h-8 w-8 opacity-60" aria-hidden="true" />
        <p className="text-sm font-medium">{t("chart.emptyTitle")}</p>
        <p className="text-xs">{t("chart.emptyHint")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div
        className="h-52 w-full"
        role="img"
        aria-label={t("chart.aria", { text: summary?.text ?? "" })}
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="weeklyPainFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--border)"
            />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              reversed={dir === "rtl"}
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              dy={10}
            />
            <YAxis
              domain={[0, 10]}
              axisLine={false}
              tickLine={false}
              orientation={dir === "rtl" ? "right" : "left"}
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            />
            <Tooltip
              cursor={{ stroke: "var(--border)", strokeDasharray: "3 3" }}
              content={<CustomTooltip />}
            />
            {summary && (
              <ReferenceLine
                y={summary.avg}
                stroke="var(--chart-2)"
                strokeDasharray="6 4"
                strokeWidth={1.5}
                label={{
                  value: t("chart.avgLabel", { avg: summary.avg }),
                  position: "insideTopRight",
                  fontSize: 10,
                  fill: "var(--muted-foreground)",
                }}
              />
            )}
            <Area
              type="monotone"
              dataKey="level"
              stroke="var(--chart-1)"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#weeklyPainFill)"
              connectNulls
              isAnimationActive={!reducedMotion}
              dot={{ r: 2.5, strokeWidth: 0, fill: "var(--chart-1)" }}
              activeDot={{ r: 5, strokeWidth: 0, fill: "var(--chart-1)" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      {summary && (
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--chart-1)]" />
            <span>{t("chart.legendPain")}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-0 w-4 border-t-2 border-dashed border-[var(--chart-2)]" />
            <span>{t("chart.legendAverage")}</span>
          </div>
        </div>
      )}
    </div>
  );
}
