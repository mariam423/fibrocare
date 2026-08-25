"use client";

import React, { useState, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
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

type BodyView = "front" | "back";

function BodySilhouette({ view }: { view: BodyView }) {
  const isFront = view === "front";
  return (
    <svg
      viewBox="0 0 100 100"
      className="w-full h-full"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="bodyGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(20,184,166,0.10)" />
          <stop offset="65%" stopColor="rgba(20,184,166,0.04)" />
          <stop offset="100%" stopColor="rgba(20,184,166,0)" />
        </radialGradient>
        {/* Skin-like vertical shading: lit shoulders, shaded lower body */}
        <linearGradient id="bodyFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(45,212,191,0.34)" />
          <stop offset="35%" stopColor="rgba(19,78,74,0.55)" />
          <stop offset="100%" stopColor="rgba(19,64,62,0.62)" />
        </linearGradient>
        {/* Lateral shading gradients for a 2.5D cylinder feel */}
        <linearGradient id="limbFillL" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(19,78,74,0.62)" />
          <stop offset="100%" stopColor="rgba(45,212,191,0.30)" />
        </linearGradient>
        <linearGradient id="limbFillR" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(45,212,191,0.30)" />
          <stop offset="100%" stopColor="rgba(19,78,74,0.62)" />
        </linearGradient>
        <radialGradient id="headFill" cx="38%" cy="32%" r="75%">
          <stop offset="0%" stopColor="rgba(94,234,212,0.42)" />
          <stop offset="100%" stopColor="rgba(19,78,74,0.60)" />
        </radialGradient>
      </defs>

      {/* Ambient glow behind the figure */}
      <ellipse cx="50" cy="50" rx="42" ry="48" fill="url(#bodyGlow)" />

      {/* Limbs drawn first so the torso overlaps them cleanly */}
      <g strokeLinecap="round" fill="none">
        {/* Arms: deltoid → elbow → hand */}
        <path d="M31.5,25 C28,29 26,35 24.5,41 C23.5,45.5 22.5,49.5 21.5,53" stroke="url(#limbFillL)" strokeWidth="5.4" />
        <path d="M68.5,25 C72,29 74,35 75.5,41 C76.5,45.5 77.5,49.5 78.5,53" stroke="url(#limbFillR)" strokeWidth="5.4" />
        {/* Legs: thigh (heavier) into calf (tapered) */}
        <path d="M43.5,62 C43,67 42,71 41.5,74" stroke="url(#limbFillL)" strokeWidth="8.6" />
        <path d="M41.5,74 C41,78 40.4,84 40.2,90" stroke="url(#limbFillL)" strokeWidth="6.4" />
        <path d="M56.5,62 C57,67 58,71 58.5,74" stroke="url(#limbFillR)" strokeWidth="8.6" />
        <path d="M58.5,74 C59,78 59.6,84 59.8,90" stroke="url(#limbFillR)" strokeWidth="6.4" />
      </g>

      {/* Head & neck */}
      <rect x="46.5" y="11.5" width="7" height="5" rx="2.4" fill="rgba(19,78,74,0.5)" />
      <ellipse cx="50" cy="7.5" rx="5.4" ry="6" fill="url(#headFill)" />

      {/* Torso: shoulders → waist → hips, with crotch notch */}
      <path
        d="M44,14 C40,16 34,17.5 31,20.5 C28.5,23 27.8,27 28.2,31.5 C28.7,37 29.8,42 30.3,46 C30.8,50 32,54 34,57 C35.5,59.5 36,61 36,63 C36,64.5 37,65.5 38.5,65.5 L45,65.5 C47,65.5 48,64.5 48.5,63 L50,59 L51.5,63 C52,64.5 53,65.5 55,65.5 L61.5,65.5 C63,65.5 64,64.5 64,63 C64,61 64.5,59.5 66,57 C68,54 69.2,50 69.7,46 C70.2,42 71.3,37 71.8,31.5 C72.2,27 71.5,23 69,20.5 C66,17.5 60,16 56,14 C54,13.4 52,13.2 50,13.2 C48,13.2 46,13.4 44,14 Z"
        fill="url(#bodyFill)"
      />
      {/* Rim light along the silhouette for the glass 2.5D edge */}
      <path
        d="M44,14 C40,16 34,17.5 31,20.5 C28.5,23 27.8,27 28.2,31.5 C28.7,37 29.8,42 30.3,46 C30.8,50 32,54 34,57 C35.5,59.5 36,61 36,63 C36,64.5 37,65.5 38.5,65.5 L45,65.5 C47,65.5 48,64.5 48.5,63 L50,59 L51.5,63 C52,64.5 53,65.5 55,65.5 L61.5,65.5 C63,65.5 64,64.5 64,63 C64,61 64.5,59.5 66,57 C68,54 69.2,50 69.7,46 C70.2,42 71.3,37 71.8,31.5 C72.2,27 71.5,23 69,20.5 C66,17.5 60,16 56,14 C54,13.4 52,13.2 50,13.2 C48,13.2 46,13.4 44,14 Z"
        fill="none"
        stroke="rgba(153,246,228,0.22)"
        strokeWidth="0.5"
      />

      {/* Muscle / joint definition lines */}
      <g fill="none" stroke="rgba(153,246,228,0.16)" strokeWidth="0.5" strokeLinecap="round">
        {isFront ? (
          <>
            {/* Clavicles */}
            <path d="M36.5,22.5 C40.5,21 46,20.8 49.5,22" />
            <path d="M63.5,22.5 C59.5,21 54,20.8 50.5,22" />
            {/* Pectoral under-curve */}
            <path d="M37,29.5 C41,32 46,32.4 49.5,30.4" />
            <path d="M63,29.5 C59,32 54,32.4 50.5,30.4" />
            {/* Sternum + abdominal creases */}
            <path d="M50,23.5 L50,44" strokeDasharray="0.4 1.1" />
            <path d="M46.5,33 C48,33.6 52,33.6 53.5,33" />
            <path d="M46.8,38 C48.2,38.6 51.8,38.6 53.2,38" />
            <path d="M47.4,43 C48.6,43.6 51.4,43.6 52.6,43" />
          </>
        ) : (
          <>
            {/* Spine */}
            <path d="M50,19 L50,58" strokeDasharray="1.6 1.2" />
            {/* Shoulder blades */}
            <path d="M38.5,26.5 C42,23.8 46.5,23.6 49,26" />
            <path d="M61.5,26.5 C58,23.8 53.5,23.6 51,26" />
            {/* Erector spinae */}
            <path d="M46.5,30 C45.5,38 46,48 47.4,56" />
            <path d="M53.5,30 C54.5,38 54,48 52.6,56" />
            {/* Gluteal hint */}
            <path d="M43,60.5 C45,63.2 48,63.6 49.5,62.2" />
            <path d="M57,60.5 C55,63.2 52,63.6 50.5,62.2" />
          </>
        )}
        {/* Joint markers: knees */}
        <circle cx="41.4" cy="73.6" r="2.1" strokeOpacity="0.5" />
        <circle cx="58.6" cy="73.6" r="2.1" strokeOpacity="0.5" />
        {/* Joint markers: elbows */}
        <circle cx="24.4" cy="41.2" r="1.7" strokeOpacity="0.4" />
        <circle cx="75.6" cy="41.2" r="1.7" strokeOpacity="0.4" />
      </g>
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
  const reduceMotion = useReducedMotion();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [hovered, setHovered] = useState<string | null>(null);
  const [view, setView] = useState<BodyView>("front");

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
            <BodySilhouette view={view} />
            {/* Front / Back view toggle */}
            <div
              role="group"
              aria-label="Body view"
              className="absolute end-0 top-0 flex flex-col gap-1"
            >
              {(["front", "back"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setView(v)}
                  aria-pressed={view === v}
                  className={cn(
                    "rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 focus-visible:ring-offset-1",
                    view === v
                      ? "border-teal-400/40 bg-teal-500/20 text-teal-200"
                      : "border-border/60 bg-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  {v}
                </button>
              ))}
            </div>
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
                  {/* Radiant halo — gently pulses when active */}
                  {(isActive || isHovered) && (
                    <motion.span
                      className={cn(
                        "absolute inset-0 rounded-full",
                        isActive ? "bg-teal-400/40" : "bg-teal-400/25"
                      )}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={
                        isActive && !reduceMotion
                          ? { scale: [1.5, 2.6, 1.5], opacity: [0.55, 0, 0.55] }
                          : { scale: isActive ? 2.2 : 1.8, opacity: 0.8 }
                      }
                      transition={
                        isActive && !reduceMotion
                          ? { duration: 2.2, repeat: Infinity, ease: "easeOut" }
                          : { duration: 0.5, ease: "easeOut" }
                      }
                    />
                  )}
                  {/* Inner corona ring for active points */}
                  {isActive && (
                    <motion.span
                      className="absolute inset-0 rounded-full border border-teal-300/70"
                      initial={{ scale: 1, opacity: 0.9 }}
                      animate={
                        reduceMotion
                          ? { scale: 1.4, opacity: 0.7 }
                          : { scale: [1.1, 1.9, 1.1], opacity: [0.8, 0.15, 0.8] }
                      }
                      transition={
                        reduceMotion
                          ? { duration: 0.4 }
                          : { duration: 1.8, repeat: Infinity, ease: "easeInOut" }
                      }
                    />
                  )}
                  {/* Core dot with a luminous center */}
                  <span
                    className={cn(
                      "relative z-10 h-full w-full rounded-full transition-colors duration-200",
                      isActive
                        ? "bg-gradient-to-br from-teal-200 via-teal-300 to-teal-500 shadow-[0_0_16px_rgba(45,212,191,0.75)]"
                        : isHovered
                          ? "bg-gradient-to-br from-teal-300 to-teal-600 shadow-[0_0_10px_rgba(45,212,191,0.5)]"
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
