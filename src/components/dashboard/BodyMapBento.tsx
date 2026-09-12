"use client";

import * as React from "react";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import type { TranslationKey } from "@/lib/translations";
import { useMotionEnabled } from "@/hooks/useMotionEnabled";
import { PerspectiveStage } from "@/components/ui/PerspectiveStage";
import {
  VolumetricBody,
  type BodyRegionId,
} from "@/components/ui/VolumetricBody";
import { cn } from "@/lib/utils";

interface TriggerPoint {
  id: string;
  tKey: string;
  /** Percentage position over the figure container. */
  x: number;
  y: number;
  /** Region lit when this point is selected. */
  region: BodyRegionId;
  /** Depth layer above the surface (px of translateZ). */
  z: number;
}

const TRIGGER_POINTS: TriggerPoint[] = [
  { id: "neck", tKey: "bodyMap.point.neck", x: 50, y: 18, region: "neck", z: 14 },
  { id: "shoulders", tKey: "bodyMap.point.shoulders", x: 50, y: 26, region: "shoulders", z: 16 },
  { id: "upperArms", tKey: "bodyMap.point.upperArms", x: 50, y: 38, region: "upperArms", z: 22 },
  { id: "lowerBack", tKey: "bodyMap.point.lowerBack", x: 50, y: 52, region: "lowerBack", z: 8 },
  { id: "knees", tKey: "bodyMap.point.knees", x: 50, y: 72, region: "knees", z: 14 },
];

type BodyView = "front" | "back";

const PAIN_LEGEND_KEYS = [
  { tKey: "bodyMap.mobility" as const, color: "bg-teal-400", shadow: "shadow-[0_0_6px_rgba(45,212,191,0.5)]" },
  { tKey: "bodyMap.joints" as const, color: "bg-yellow-400", shadow: "shadow-[0_0_6px_rgba(250,204,21,0.5)]" },
  { tKey: "bodyMap.muscles" as const, color: "bg-orange-400", shadow: "shadow-[0_0_6px_rgba(251,146,60,0.5)]" },
  { tKey: "bodyMap.groups" as const, color: "bg-emerald-800", shadow: "shadow-[0_0_6px_rgba(6,95,70,0.5)]" },
];

export function BodyMapBento() {
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();
  const motionEnabled = useMotionEnabled();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [hovered, setHovered] = useState<string | null>(null);
  const [view, setView] = useState<BodyView>("front");

  const toggle = React.useCallback((id: string) => {
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

  // Severity per region: selected points glow strongest.
  const severity = React.useMemo(() => {
    const map: Partial<Record<BodyRegionId, number>> = {};
    for (const point of TRIGGER_POINTS) {
      const isOn = selected.has(point.id);
      const isHovered = hovered === point.id;
      if (isOn || isHovered) {
        map[point.region] = Math.max(map[point.region] ?? 0, isOn ? 8 : 5);
      }
    }
    return map;
  }, [selected, hovered]);

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
        {/* Body map — volumetric figure on a 3D stage */}
        <div className="relative mx-auto w-48 select-none px-2 py-1">
          <PerspectiveStage
            className="aspect-[100/110] w-full"
            resting={{ rotateX: 6, rotateY: view === "front" ? -6 : 6 }}
            flipped={view === "back"}
            tiltDeg={6}
          >
            <VolumetricBody
              backView={view === "back"}
              severity={severity}
              highlight={
                hovered
                  ? TRIGGER_POINTS.find((p) => p.id === hovered)?.region ?? null
                  : null
              }
            />
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
                  aria-label={t(point.tKey as TranslationKey)}
                  aria-pressed={isActive}
                  className={cn(
                    "absolute flex items-center justify-center rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 focus-visible:ring-offset-2",
                    isActive
                      ? "h-6 w-6"
                      : isHovered
                        ? "h-5 w-5"
                        : "h-4 w-4"
                  )}
                  style={{
                    left: `${point.x}%`,
                    top: `${point.y}%`,
                    translateX: "-50%",
                    translateY: "-50%",
                    translateZ: `${point.z}px`,
                  }}
                  whileHover={motionEnabled ? { scale: 1.2 } : undefined}
                  whileTap={motionEnabled ? { scale: 0.9 } : undefined}
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
          </PerspectiveStage>

          {/* Front / Back view toggle */}
          <div
            role="group"
            aria-label={t("bodyMap.viewGroupAria")}
            className="absolute end-0 top-0 flex flex-col gap-1"
          >
            {(["front", "back"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                aria-pressed={view === v}
                className={cn(
                  "rounded-full border px-2 py-0.5 text-[10px] font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 focus-visible:ring-offset-1",
                  view === v
                    ? "border-teal-400/40 bg-teal-500/20 text-teal-200"
                    : "border-border/60 bg-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {t(`bodyMap.${v}` as const)}
              </button>
            ))}
          </div>
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
                {t(point.tKey as TranslationKey)}
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
          {PAIN_LEGEND_KEYS.map((item) => (
            <div key={item.tKey} className="flex items-center gap-1.5">
              <span className={cn("h-2 w-2 rounded-full", item.color, item.shadow)} />
              <span className="text-[11px] text-muted-foreground font-medium">{t(item.tKey)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
