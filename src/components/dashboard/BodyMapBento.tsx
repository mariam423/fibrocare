"use client";

import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import type { TranslationKey } from "@/lib/translations";
import { cn } from "@/lib/utils";

interface TriggerPoint {
  id: string;
  tKey: TranslationKey;
  /** SVG cx/cy positions (percentage-based for responsiveness) */
  x: number;
  y: number;
}

const TRIGGER_POINTS: TriggerPoint[] = [
  { id: "neck", tKey: "bodyMap.point.neck", x: 50, y: 18 },
  { id: "shoulders", tKey: "bodyMap.point.shoulders", x: 50, y: 26 },
  { id: "arms", tKey: "bodyMap.point.arms", x: 50, y: 38 },
  { id: "lowerBack", tKey: "bodyMap.point.lowerBack", x: 50, y: 52 },
  { id: "knees", tKey: "bodyMap.point.knees", x: 50, y: 72 },
];

function BodySilhouette() {
  return (
    <svg
      viewBox="0 0 100 100"
      className="w-full h-full"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="bodyGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(20,184,166,0.08)" />
          <stop offset="100%" stopColor="rgba(20,184,166,0)" />
        </radialGradient>
      </defs>
      {/* Background glow */}
      <ellipse cx="50" cy="50" rx="40" ry="48" fill="url(#bodyGlow)" />
      {/* Head */}
      <circle cx="50" cy="8" r="6" fill="currentColor" className="text-teal-900/60" />
      {/* Neck */}
      <rect x="47" y="14" width="6" height="5" rx="2" fill="currentColor" className="text-teal-900/50" />
      {/* Torso */}
      <path
        d="M38 19 C38 19 36 22 35 28 L34 42 C34 46 38 50 42 52 L42 58 L38 70 L42 70 L46 58 L50 58 L54 58 L58 70 L62 70 L58 58 L58 52 C62 50 66 46 66 42 L65 28 C64 22 62 19 62 19 Z"
        fill="currentColor"
        className="text-teal-900/60"
      />
      {/* Arms */}
      <path
        d="M35 28 L22 40 L20 48 L24 48 L30 38 L34 30"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        className="text-teal-900/50"
      />
      <path
        d="M65 28 L78 40 L80 48 L76 48 L70 38 L66 30"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        className="text-teal-900/50"
      />
      {/* Legs */}
      <path
        d="M42 58 L40 72 L38 88 L44 88 L46 72 L50 72"
        fill="none"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        className="text-teal-900/50"
      />
      <path
        d="M58 58 L60 72 L62 88 L56 88 L54 72 L50 72"
        fill="none"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        className="text-teal-900/50"
      />
    </svg>
  );
}

const PAIN_LEGEND = [
  { label: "Mobility", color: "bg-teal-400", shadow: "shadow-[0_0_6px_rgba(45,212,191,0.5)]" },
  { label: "Joints", color: "bg-yellow-400", shadow: "shadow-[0_0_6px_rgba(250,204,21,0.5)]" },
  { label: "Muscles", color: "bg-orange-400", shadow: "shadow-[0_0_6px_rgba(251,146,60,0.5)]" },
  { label: "Groups", color: "bg-emerald-800", shadow: "shadow-[0_0_6px_rgba(6,95,70,0.5)]" },
];

export function BodyMapBento() {
  const { t } = useLanguage();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [hovered, setHovered] = useState<string | null>(null);

  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const activePoints = TRIGGER_POINTS.filter((p) => selected.has(p.id));

  return (
    <div className="flex flex-1 flex-col p-6">
      <div className="mb-3">
        <h3 className="text-base font-semibold text-card-foreground">
          {t("bodyMap.title")}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t("bodyMap.subtitle")}
        </p>
      </div>
      <div className="flex flex-1 flex-col justify-between space-y-4">
          {/* Body map */}
          <div className="relative mx-auto w-44 h-64 select-none px-2 py-1">
            <BodySilhouette />
            {/* Trigger point dots */}
            {TRIGGER_POINTS.map((point) => {
              const isActive = selected.has(point.id);
              const isHovered = hovered === point.id;
              return (
                <motion.button
                  key={point.id}
                  type="button"
                  onClick={() => toggle(point.id)}
                  onMouseEnter={() => setHovered(point.id)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered(point.id)}
                  onBlur={() => setHovered(null)}
                  aria-label={t(point.tKey)}
                  aria-pressed={isActive}
                  className={cn(
                    "absolute flex items-center justify-center -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 focus-visible:ring-offset-2",
                    isActive
                      ? "h-6 w-6"
                      : isHovered
                        ? "h-5 w-5"
                        : "h-4 w-4"
                  )}
                  style={{ left: `${point.x}%`, top: `${point.y}%` }}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {/* Glow ring */}
                  {(isActive || isHovered) && (
                    <motion.span
                      className={cn(
                        "absolute inset-0 rounded-full",
                        isActive
                          ? "bg-teal-400/50"
                          : "bg-teal-400/30"
                      )}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 2.2, opacity: 1 }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  )}
                  {/* Core dot */}
                  <span
                    className={cn(
                      "relative z-10 h-full w-full rounded-full transition-colors duration-200",
                      isActive
                        ? "bg-teal-300 shadow-[0_0_14px_rgba(45,212,191,0.7)]"
                        : isHovered
                          ? "bg-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.5)]"
                          : "bg-teal-600/60"
                    )}
                  />
                </motion.button>
              );
            })}
          </div>

          {/* Active points list */}
          {activePoints.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {activePoints.map((point) => (
                <motion.span
                  key={point.id}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="inline-flex items-center gap-1 rounded-full border border-teal-500/20 bg-teal-500/10 px-2.5 py-0.5 text-xs font-medium text-teal-300"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-400" />
                  {t(point.tKey)}
                </motion.span>
              ))}
            </div>
          )}

          {activePoints.length === 0 && (
            <p className="text-xs text-center text-muted-foreground py-1">
              {t("bodyMap.emptyHint")}
            </p>
          )}

          {/* Pain legend */}
          <div className="flex items-center justify-center gap-4 pt-1">
            {PAIN_LEGEND.map((item) => (
              <div key={item.label} className="flex items-center gap-1.5">
                <span className={cn("h-2 w-2 rounded-full", item.color, item.shadow)} />
                <span className="text-[11px] text-muted-foreground font-medium">{item.label}</span>
              </div>
            ))}
          </div>
      </div>
    </div>
  );
}
