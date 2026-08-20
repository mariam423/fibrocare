"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import { useMotionEnabled } from "@/hooks/useMotionEnabled";
import { cn } from "@/lib/utils";

export type SegmentTone = "neutral" | "emerald" | "amber" | "rose";

export interface SegmentedFilterOption {
  value: string;
  label: string;
  tone?: SegmentTone;
}

interface SegmentedFilterProps {
  options: SegmentedFilterOption[];
  value: string;
  onChange: (value: string) => void;
  label: string;
  className?: string;
}

const TONE_ACTIVE: Record<SegmentTone, string> = {
  neutral:
    "bg-primary/10 text-primary ring-1 ring-primary/25 shadow-[0_6px_16px_-6px_rgba(59,107,72,0.35)] dark:bg-primary/15 dark:text-primary dark:ring-primary/30",
  emerald:
    "bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/25 shadow-[0_6px_16px_-6px_rgba(16,185,129,0.35)] dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/30",
  amber:
    "bg-amber-500/10 text-amber-700 ring-1 ring-amber-500/25 shadow-[0_6px_16px_-6px_rgba(245,158,11,0.35)] dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/30",
  rose:
    "bg-rose-500/10 text-rose-700 ring-1 ring-rose-500/25 shadow-[0_6px_16px_-6px_rgba(244,63,94,0.35)] dark:bg-rose-400/10 dark:text-rose-300 dark:ring-rose-400/30",
};

const TONE_DOT: Record<SegmentTone, string> = {
  neutral:
    "bg-primary shadow-[0_0_6px_rgba(59,107,72,0.7)] dark:bg-primary",
  emerald:
    "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)] dark:bg-emerald-400",
  amber:
    "bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.7)] dark:bg-amber-400",
  rose:
    "bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.7)] dark:bg-rose-400",
};

/**
 * Tactile segmented filter — the same segmented-control language as the
 * quick check-in presets: a glass track with per-segment tone tints and a
 * soft glow dot on the active segment.
 */
export function SegmentedFilter({
  options,
  value,
  onChange,
  label,
  className,
}: SegmentedFilterProps) {
  const layoutId = useId();
  const motionEnabled = useMotionEnabled();
  return (
    <div
      className={cn(
        "relative flex w-full flex-col gap-1.5 rounded-2xl border border-border bg-card p-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] backdrop-blur-md sm:w-auto sm:flex-row",
        className
      )}
      role="group"
      aria-label={label}
    >
      {options.map((option) => {
        const tone = option.tone ?? "neutral";
        const isActive = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={isActive}
            className={cn(
              "relative flex flex-1 items-center justify-center gap-2 min-h-11 rounded-xl px-4 text-sm font-semibold whitespace-nowrap",
              "transition-all duration-300 ease-out cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring",
              "active:scale-[0.97]",
              isActive
                ? cn("text-foreground", !motionEnabled && TONE_ACTIVE[tone])
                : "text-muted-foreground hover:bg-slate-100 hover:text-foreground hover:-translate-y-px dark:hover:bg-slate-800/70"
            )}
          >
            {motionEnabled && isActive && (
              <motion.span
                layoutId={layoutId}
                className={cn(
                  "absolute inset-0 rounded-xl",
                  TONE_ACTIVE[tone]
                )}
                transition={{ type: "spring", stiffness: 400, damping: 34 }}
                aria-hidden="true"
              />
            )}
            <span className={cn("relative z-10", isActive && "font-semibold")}>
              {option.label}
            </span>
            <span
              className={cn(
                "absolute end-3 top-1/2 z-10 h-1.5 w-1.5 -translate-y-1/2 rounded-full transition-all duration-300",
                isActive
                  ? cn("scale-100 opacity-100", TONE_DOT[tone])
                  : "scale-50 opacity-0 bg-muted-foreground/40"
              )}
              aria-hidden="true"
            />
          </button>
        );
      })}
    </div>
  );
}
