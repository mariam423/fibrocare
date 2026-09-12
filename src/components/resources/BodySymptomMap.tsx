"use client";

/**
 * Interactive Body-Symptom Map — volumetric 3D edition.
 *
 * A layered, rim-lit body figure sits on a PerspectiveStage (pointer tilt +
 * drag-to-rotate). Tap-to-select hotspots float above the surface on
 * translateZ and glow by region profile: joint/muscle regions warm amber
 * (heat therapy match), movement regions glow emerald. Fully RTL-safe
 * (absolute hotspot positions mirror automatically) and keyboard-accessible
 * (each hotspot is a real button with aria-pressed).
 */

import * as React from "react";
import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { FlameIcon, Activity01Icon, Rotate01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { PerspectiveStage } from "@/components/ui/PerspectiveStage";
import {
  VolumetricBody,
  type BodyRegionId,
} from "@/components/ui/VolumetricBody";
import { useLanguage } from "@/context/LanguageContext";
import { useMotionEnabled } from "@/hooks/useMotionEnabled";
import { cn } from "@/lib/utils";
import { BODY_PARTS, type BodyPartId } from "@/lib/resources/engine";

/** Body-map parts → volumetric regions with a gentle ambient severity. */
const PART_TO_REGION: Record<BodyPartId, { region: BodyRegionId; severity: number }> = {
  neck: { region: "neck", severity: 4 },
  shoulders: { region: "shoulders", severity: 4 },
  lowerBack: { region: "lowerBack", severity: 5 },
  hips: { region: "hips", severity: 3 },
  knees: { region: "knees", severity: 4 },
  joints: { region: "joints", severity: 3 },
};

interface Hotspot {
  part: BodyPartId;
  /** Percentage position over the silhouette container. */
  left: number;
  top: number;
  /** Depth layer above the body surface (px of translateZ). */
  z: number;
}

const HOTSPOTS: Hotspot[] = [
  { part: "neck", left: 50, top: 17, z: 14 },
  { part: "shoulders", left: 30, top: 23.5, z: 18 },
  { part: "shoulders", left: 70, top: 23.5, z: 18 },
  { part: "joints", left: 13, top: 40, z: 24 },
  { part: "joints", left: 87, top: 40, z: 24 },
  { part: "lowerBack", left: 50, top: 42, z: 8 },
  { part: "hips", left: 50, top: 54, z: 10 },
  { part: "knees", left: 32, top: 78, z: 16 },
  { part: "knees", left: 68, top: 78, z: 16 },
];

export function BodySymptomMap({
  selected,
  onSelect,
}: {
  selected: BodyPartId | null;
  onSelect: (part: BodyPartId | null) => void;
}) {
  const { t } = useLanguage();
  const motionEnabled = useMotionEnabled();
  const profile = selected ? BODY_PARTS[selected] : null;

  const severity = React.useMemo(() => {
    const map: Partial<Record<BodyRegionId, number>> = {};
    for (const spot of HOTSPOTS) {
      const { region, severity: s } = PART_TO_REGION[spot.part];
      map[region] = Math.max(map[region] ?? 0, s);
    }
    if (selected) {
      const { region } = PART_TO_REGION[selected];
      map[region] = Math.min(10, (map[region] ?? 4) + 3);
    }
    return map;
  }, [selected]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!motionEnabled) return;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      onSelect(selected ?? "neck");
    }
  };

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
        {/* Volumetric body on a 3D stage */}
        <div className="relative w-full max-w-[240px] shrink-0 select-none">
          <PerspectiveStage
            className="aspect-[200/320] w-full"
            resting={{ rotateX: 6, rotateY: -8 }}
            tiltDeg={7}
          >
            {/* Depth halo behind the figure */}
            <div
              aria-hidden="true"
              className="absolute inset-x-6 top-4 -z-10 h-[85%] rounded-[50%] bg-teal-400/10 blur-2xl"
            />
            <VolumetricBody
              severity={severity}
              highlight={
                selected ? PART_TO_REGION[selected].region : null
              }
            />

            {/* Floating hotspots — real buttons hovering above the surface */}
            {HOTSPOTS.map((spot, idx) => {
              const isActive = selected === spot.part;
              return (
                <motion.button
                  key={`${spot.part}-${idx}`}
                  type="button"
                  onClick={() => onSelect(isActive ? null : spot.part)}
                  onKeyDown={handleKeyDown}
                  aria-pressed={isActive}
                  aria-label={t(BODY_PARTS[spot.part].labelKey)}
                  className="group absolute"
                  style={{
                    left: `${spot.left}%`,
                    top: `${spot.top}%`,
                    translateX: "-50%",
                    translateY: "-50%",
                    translateZ: `${spot.z}px`,
                  }}
                  whileHover={motionEnabled ? { scale: 1.15 } : undefined}
                  whileTap={motionEnabled ? { scale: 0.92 } : undefined}
                >
                  <span
                    className={cn(
                      "block h-6 w-6 rounded-full border transition-all duration-300",
                      isActive
                        ? "scale-110 border-emerald-200 bg-emerald-400/90 shadow-[0_0_20px_rgba(16,185,129,0.65)]"
                        : "border-emerald-300/60 bg-emerald-500/30 shadow-[0_2px_10px_rgba(2,12,10,0.35)] hover:scale-110 hover:bg-emerald-500/55"
                    )}
                  />
                  {/* Specular top-light on the node */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-1 top-0.5 h-1.5 rounded-full bg-white/45 blur-[2px]"
                  />
                  <span className="pointer-events-none absolute top-full start-1/2 mt-1 -translate-x-1/2 whitespace-nowrap rounded-full border border-border/60 bg-background/90 px-1.5 py-0.5 text-[10px] font-medium text-foreground opacity-0 shadow-sm transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100 rtl:translate-x-1/2">
                    {t(BODY_PARTS[spot.part].labelKey)}
                  </span>
                </motion.button>
              );
            })}
          </PerspectiveStage>

          {/* Rotation affordance */}
          <p className="mt-1 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
            <HugeiconsIcon icon={Rotate01Icon} className="h-3.5 w-3.5" aria-hidden="true" />
            {t("resources.bodyMap.rotateHint")}
          </p>
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
