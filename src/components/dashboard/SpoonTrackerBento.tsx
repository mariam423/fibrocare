"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  MinusSignCircleIcon,
  PlusSignCircleIcon,
  Undo02Icon,
} from "@hugeicons/core-free-icons";
import { useLanguage } from "@/context/LanguageContext";
import type { TranslationKey } from "@/lib/translations";
import { cn } from "@/lib/utils";

const SPOON_PRESETS: Array<{
  label: string;
  tKey: TranslationKey;
  delta: number;
}> = [
  { label: "Shower", tKey: "spoonTracker.preset.shower", delta: -1 },
  { label: "Short Walk", tKey: "spoonTracker.preset.walk", delta: -2 },
  { label: "Cooking", tKey: "spoonTracker.preset.cooking", delta: -2 },
  { label: "Groceries", tKey: "spoonTracker.preset.groceries", delta: -3 },
  { label: "Rest", tKey: "spoonTracker.preset.rest", delta: 2 },
  { label: "Nap", tKey: "spoonTracker.preset.nap", delta: 3 },
];

const MAX_SPOONS = 12;

function SpoonIcon({ active }: { active: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn(
        "h-5 w-5 transition-all duration-300",
        active
          ? "text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.5)]"
          : "text-slate-400/60"
      )}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 2C8 2 5 5 5 9c0 3 2 5 4 6v5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-5c2-1 4-3 4-6 0-4-3-7-7-7z" />
      <line x1="10" y1="22" x2="14" y2="22" />
    </svg>
  );
}

export function SpoonTrackerBento() {
  const { t } = useLanguage();
  const [spoons, setSpoons] = useState(MAX_SPOONS);
  const [history, setHistory] = useState<number[]>([MAX_SPOONS]);

  const applyDelta = useCallback(
    (delta: number) => {
      setSpoons((prev) => {
        const next = Math.max(0, Math.min(MAX_SPOONS, prev + delta));
        if (next !== prev) {
          setHistory((h) => [...h, next]);
        }
        return next;
      });
    },
    []
  );

  const undo = useCallback(() => {
    setHistory((h) => {
      if (h.length <= 1) return h;
      const next = h[h.length - 2];
      setSpoons(next);
      return h.slice(0, -1);
    });
  }, []);

  const percentage = Math.round((spoons / MAX_SPOONS) * 100);

  return (
    <div className="p-6">
        <div className="mb-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-100">
              {t("spoonTracker.title")}
            </h3>
            <button
              type="button"
              onClick={undo}
              disabled={history.length <= 1}
              aria-label={t("spoonTracker.undoAria")}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <HugeiconsIcon icon={Undo02Icon} className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <p className="text-sm text-slate-400">
            {t("spoonTracker.subtitle")}
          </p>
        </div>
        <div className="space-y-5">
          {/* Spoon visual grid */}
          <div className="flex items-center gap-1.5 flex-wrap" role="img" aria-label={t("spoonTracker.aria", { current: spoons, max: MAX_SPOONS })}>
            {Array.from({ length: MAX_SPOONS }).map((_, i) => (
              <motion.div
                key={i}
                initial={false}
                animate={{
                  scale: i < spoons ? 1 : 0.85,
                  opacity: i < spoons ? 1 : 0.3,
                }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
              >
                <SpoonIcon active={i < spoons} />
              </motion.div>
            ))}
          </div>

          {/* Counter bar */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => applyDelta(-1)}
              disabled={spoons === 0}
              aria-label={t("spoonTracker.removeAria")}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-100 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-all active:scale-95"
            >
              <HugeiconsIcon icon={MinusSignCircleIcon} className="h-4 w-4" aria-hidden="true" />
            </button>
            <div className="flex-1">
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  className={cn(
                    "h-full rounded-full transition-colors duration-300",
                    percentage > 50
                      ? "bg-emerald-500"
                      : percentage > 20
                        ? "bg-amber-500"
                        : "bg-rose-500"
                  )}
                  initial={false}
                  animate={{ width: `${percentage}%` }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              </div>
            </div>
            <span className="text-sm font-semibold tabular-nums min-w-[3ch] text-center text-slate-100">
              {spoons}
            </span>
            <button
              type="button"
              onClick={() => applyDelta(1)}
              disabled={spoons === MAX_SPOONS}
              aria-label={t("spoonTracker.addAria")}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-100 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-all active:scale-95"
            >
              <HugeiconsIcon icon={PlusSignCircleIcon} className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {/* Quick presets */}
          <div className="grid grid-cols-3 gap-2">
            <AnimatePresence>
              {SPOON_PRESETS.map((preset) => (
                <motion.button
                  key={preset.label}
                  type="button"
                  onClick={() => applyDelta(preset.delta)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-xl px-2 py-2.5 text-xs font-medium transition-all duration-200 overflow-hidden",
                    preset.delta > 0
                      ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                      : "border border-white/10 bg-white/5 text-slate-400 hover:bg-white/10"
                  )}
                >
                  <span className="text-[11px] opacity-70 leading-none">
                    {preset.delta > 0 ? "+" : ""}
                    {preset.delta}
                  </span>
                  <span className="text-[11px] leading-tight truncate w-full text-center">{t(preset.tKey)}</span>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
  );
}
