"use client";

/**
 * BodySymptomMap — resources filter map for FibroCare.
 *
 * A medical-grade volumetric body on the shared 3D stage (drag-to-rotate on
 * premium screens; the SVG figure + same buttons on fallback). Tap a body
 * area to filter localized care resources by region.
 *
 * Design: glossy Midnight Emerald silhouette with rim-lit edge, soft severity
 * glows, and crisp luminous touch nodes that match the anatomy beneath them.
 * Fully RTL-safe (logical properties + rtl: variants) and keyboard-accessible
 * (each hotspot is a real button with aria-pressed).
 */

import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { FlameIcon, Activity01Icon, Rotate01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { AnatomicalBody3D } from "@/components/ui/AnatomicalBody3D";
import { REGION_ANCHORS, type BodyRegionId, type Vec3 } from "@/lib/anatomy";
import { useLanguage } from "@/context/LanguageContext";
import { BODY_PARTS, type BodyPartId } from "@/lib/resources/engine";

/** Body-map parts → volumetric regions. Bilateral parts share a central
 *  region on this single-figure silhouette; two hotspots still light one glow. */
const PART_TO_REGION: Record<BodyPartId, { region: BodyRegionId; severity: number }> = {
  neck:       { region: "neck", severity: 4 },
  shoulders:  { region: "shoulders", severity: 4 },
  lowerBack:  { region: "lowerBack", severity: 5 },
  hips:       { region: "hips", severity: 3 },
  knees:      { region: "knees", severity: 4 },
  joints:     { region: "joints", severity: 3 },
};

interface Hotspot {
  id: string;
  part: BodyPartId;
  position: Vec3;
}

/** One button per mapped body position (8 total; bilateral parts get two). */
const HOTSPOTS: Hotspot[] = [
  { id: "neck", part: "neck", position: REGION_ANCHORS.neck[0] },
  { id: "shoulders-0", part: "shoulders", position: REGION_ANCHORS.shoulders[0] },
  { id: "shoulders-1", part: "shoulders", position: REGION_ANCHORS.shoulders[1] },
  { id: "joints", part: "joints", position: REGION_ANCHORS.joints[0] },
  { id: "lowerBack", part: "lowerBack", position: REGION_ANCHORS.lowerBack[0] },
  { id: "hips", part: "hips", position: REGION_ANCHORS.hips[0] },
  { id: "knees-0", part: "knees", position: REGION_ANCHORS.knees[0] },
  { id: "knees-1", part: "knees", position: REGION_ANCHORS.knees[1] },
];

const EMPTY_SELECTED: ReadonlySet<string> = new Set();

export function BodySymptomMap({
  selected,
  onSelect,
}: {
  selected: BodyPartId | null;
  onSelect: (part: BodyPartId | null) => void;
}) {
  const { t } = useLanguage();

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

  // Both hotspots of a bilateral part report pressed when that part is chosen.
  const selectedButtonIds = React.useMemo(() => {
    if (!selected) return EMPTY_SELECTED;
    return new Set(
      HOTSPOTS.filter((spot) => spot.part === selected).map((spot) => spot.id)
    );
  }, [selected]);

  const hotspots = React.useMemo(
    () =>
      HOTSPOTS.map((spot) => ({
        id: spot.id,
        label: t(BODY_PARTS[spot.part].labelKey),
        position: spot.position,
        color: "#10b981",
        activeColor: "#34d399",
      })),
    [t]
  );

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
        {/* Medical-grade body on the shared 3D stage */}
        <div className="relative w-full max-w-[220px] shrink-0 select-none">
          <AnatomicalBody3D
            className="aspect-square w-full"
            severity={severity}
            highlight={selected ? PART_TO_REGION[selected].region : null}
            hotspots={hotspots}
            selected={selectedButtonIds}
            onSelect={(id) => {
              const part = HOTSPOTS.find((spot) => spot.id === id)?.part ?? null;
              onSelect(part && selected === part ? null : part);
            }}
          />

          {/* Rotation affordance */}
          <p className="mt-1 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
            <HugeiconsIcon icon={Rotate01Icon} className="h-3.5 w-3.5" aria-hidden="true" />
            {t("resources.bodyMap.rotateHint")}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {t("resources.bodyMap.tapHint")}
          </p>
        </div>

        {/* Selected region details */}
        <div className="w-full max-w-xs text-sm">
          {selected ? (
            <div className="space-y-3">
              <p className="font-semibold text-foreground">{t(BODY_PARTS[selected].labelKey)}</p>
              {BODY_PARTS[selected].heat && (
                <p className="flex items-center gap-2 rounded-xl border border-orange-500/20 bg-orange-500/10 px-3 py-2 text-orange-700 dark:text-orange-300">
                  <HugeiconsIcon icon={FlameIcon} className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {t("resources.bodyMap.heatHint")}
                </p>
              )}
              {BODY_PARTS[selected].movement && (
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