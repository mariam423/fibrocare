"use client";

/**
 * Interactive Body-Symptom Map.
 *
 * A stylized body silhouette with tap-to-select hotspots (Neck, Shoulders,
 * Lower Back, Hips, Knees, Joints). Selecting a region filters the resource
 * feed and surfaces localized heat/movement therapy hints. Fully RTL-safe
 * (absolute hotspot positions mirror automatically) and keyboard-accessible
 * (each hotspot is a real button with aria-pressed).
 */

import React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { FlameIcon, Activity01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";
import { BODY_PARTS, type BodyPartId } from "@/lib/resources/engine";

interface Hotspot {
  part: BodyPartId;
  /** Percentage position over the silhouette container. */
  left: number;
  top: number;
}

const HOTSPOTS: Hotspot[] = [
  { part: "neck", left: 50, top: 17 },
  { part: "shoulders", left: 30, top: 23.5 },
  { part: "shoulders", left: 70, top: 23.5 },
  { part: "joints", left: 13, top: 40 },
  { part: "joints", left: 87, top: 40 },
  { part: "lowerBack", left: 50, top: 42 },
  { part: "hips", left: 50, top: 54 },
  { part: "knees", left: 32, top: 78 },
  { part: "knees", left: 68, top: 78 },
];

export function BodySymptomMap({
  selected,
  onSelect,
}: {
  selected: BodyPartId | null;
  onSelect: (part: BodyPartId | null) => void;
}) {
  const { t } = useLanguage();
  const profile = selected ? BODY_PARTS[selected] : null;

  return (
    <div className="w-full rounded-2xl border border-emerald-500/20 bg-white/70 shadow-lg shadow-emerald-950/20 backdrop-blur-xl dark:bg-slate-900/60">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">{t("resources.bodyMap.title")}</h2>
          <p className="text-sm text-muted-foreground">{t("resources.bodyMap.subtitle")}</p>
        </div>
        {selected && (
          <Button
            size="sm"
            variant="outline"
            className="rounded-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            onClick={() => onSelect(null)}
          >
            {t("resources.bodyMap.clear")}
          </Button>
        )}
      </div>

      <div className="flex flex-col items-center gap-4 px-5 py-5 sm:flex-row sm:justify-center sm:gap-10">
        {/* Silhouette with hotspots */}
        <div className="relative aspect-[200/320] w-full max-w-[220px] shrink-0 select-none">
          <svg
            viewBox="0 0 200 320"
            className="absolute inset-0 h-full w-full"
            aria-hidden="true"
          >
            {/* Front-facing silhouette, soft emerald strokes */}
            <g fill="rgba(16,185,129,0.06)" stroke="rgba(16,185,129,0.4)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="100" cy="30" r="19" />
              <rect x="92" y="47" width="16" height="14" rx="5" />
              <path d="M84 62 C58 72 50 100 52 132 L52 168 C52 184 148 184 148 168 L148 132 C150 100 142 72 116 62 Z" />
              <path d="M52 84 L26 128 L21 172" fill="none" />
              <path d="M148 84 L174 128 L179 172" fill="none" />
              <path d="M64 182 L62 252 L68 292" fill="none" />
              <path d="M136 182 L138 252 L132 292" fill="none" />
            </g>
          </svg>

          {HOTSPOTS.map((spot, idx) => {
            const isActive = selected === spot.part;
            return (
              <button
                key={`${spot.part}-${idx}`}
                type="button"
                onClick={() => onSelect(isActive ? null : spot.part)}
                aria-pressed={isActive}
                aria-label={t(BODY_PARTS[spot.part].labelKey)}
                className="group absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${spot.left}%`, top: `${spot.top}%` }}
              >
                <span
                  className={cn(
                    "block h-6 w-6 rounded-full border transition-all duration-200",
                    isActive
                      ? "scale-110 border-emerald-300 bg-emerald-500/80 shadow-[0_0_14px_rgba(16,185,129,0.5)]"
                      : "border-emerald-400/50 bg-emerald-500/25 hover:scale-110 hover:bg-emerald-500/50"
                  )}
                />
                <span className="pointer-events-none absolute top-full start-1/2 mt-1 -translate-x-1/2 whitespace-nowrap rounded-full border border-border/60 bg-background/90 px-1.5 py-0.5 text-[10px] font-medium text-foreground opacity-0 shadow-sm transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100 rtl:translate-x-1/2">
                  {t(BODY_PARTS[spot.part].labelKey)}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected region details */}
        <div className="w-full max-w-xs text-sm">
          {profile ? (
            <div className="space-y-3">
              <p className="font-semibold text-foreground">{t(profile.labelKey)}</p>
              {profile.heat && (
                <p className="flex items-center gap-2 rounded-xl border border-orange-500/20 bg-orange-500/10 px-3 py-2 text-orange-700 dark:text-orange-300">
                  <HugeiconsIcon icon={FlameIcon} className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {t("resources.bodyMap.heatHint")}
                </p>
              )}
              {profile.movement && (
                <p className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-emerald-700 dark:text-emerald-300">
                  <HugeiconsIcon icon={Activity01Icon} className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {t("resources.bodyMap.movementHint")}
                </p>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground">{t("resources.bodyMap.subtitle")}</p>
          )}
        </div>
      </div>
    </div>
  );
}
