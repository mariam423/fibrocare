"use client";

import * as React from "react";
import { useLanguage } from "@/context/LanguageContext";
import type { TranslationKey } from "@/lib/translations";
import {
  PAIN_GROUP_COLOR,
  TENDER_POINT_ANCHORS,
  type BodyRegionId,
  type PainGroupId,
  type TenderPointId,
} from "@/lib/anatomy";
import { AnatomicalBody3D } from "@/components/ui/AnatomicalBody3D";
import { cn } from "@/lib/utils";

/**
 * The classic 18 fibromyalgia tender points (ACR 1990) as 9 bilateral pairs.
 * Each pair toggles as one control but renders two interactive markers (one
 * per side) so the pain nodes land on the actual anatomy.
 */
const TENDER_POINTS: ReadonlyArray<{
  id: TenderPointId;
  tKey: string;
  region: BodyRegionId;
  group: PainGroupId;
}> = [
  // Suboccipital muscle insertions at the base of the skull.
  { id: "occiput", tKey: "bodyMap.point.occiput", region: "neck", group: "muscles" },
  // C5–C7 transverse processes / interspinous.
  { id: "lowCervical", tKey: "bodyMap.point.lowCervical", region: "neck", group: "joints" },
  // Upper border midpoint of the trapezius.
  { id: "trapezius", tKey: "bodyMap.point.trapezius", region: "shoulders", group: "muscles" },
  // Above the scapular spine, medial border.
  { id: "supraspinatus", tKey: "bodyMap.point.supraspinatus", region: "shoulders", group: "muscles" },
  // Costochondral junction of the 2nd rib.
  { id: "secondRib", tKey: "bodyMap.point.secondRib", region: "ribs", group: "joints" },
  // 2 cm distal to the lateral epicondyle (elbow).
  { id: "epicondyle", tKey: "bodyMap.point.epicondyle", region: "elbows", group: "joints" },
  // Upper outer quadrant of the gluteal region.
  { id: "gluteal", tKey: "bodyMap.point.gluteal", region: "hips", group: "muscles" },
  // Posterior to the greater trochanter prominence.
  { id: "trochanter", tKey: "bodyMap.point.trochanter", region: "hips", group: "mobility" },
  // Medial fat pad, proximal to the knee joint line.
  { id: "knee", tKey: "bodyMap.point.knees", region: "knees", group: "joints" },
];

/** Both side suffixes; a single toggle state controls each bilateral pair. */
const SIDES = ["-l", "-r"] as const;

const PAIN_LEGEND_KEYS = [
  { tKey: "bodyMap.mobility" as const, color: "bg-teal-400", shadow: "shadow-[0_0_6px_rgba(45,212,191,0.5)]" },
  { tKey: "bodyMap.joints" as const, color: "bg-yellow-400", shadow: "shadow-[0_0_6px_rgba(250,204,21,0.5)]" },
  { tKey: "bodyMap.muscles" as const, color: "bg-orange-400", shadow: "shadow-[0_0_6px_rgba(251,146,60,0.5)]" },
  { tKey: "bodyMap.groups" as const, color: "bg-emerald-800", shadow: "shadow-[0_0_6px_rgba(6,95,70,0.5)]" },
];

type BodyView = "front" | "back";

export function BodyMapBento() {
  const { t } = useLanguage();
  const [selected, setSelected] = React.useState<Set<TenderPointId>>(new Set());
  const [hoveredBtn, setHoveredBtn] = React.useState<string | null>(null);
  const [view, setView] = React.useState<BodyView>("front");

  const pairId = React.useCallback((btnId: string): TenderPointId => {
    return btnId.replace(/[-][lr]$/, "") as TenderPointId;
  }, []);

  const toggle = React.useCallback(
    (btnId: string) => {
      const id = pairId(btnId);
      setSelected((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    },
    [pairId]
  );

  const setHover = React.useCallback((btnId: string | null) => {
    setHoveredBtn(btnId);
  }, []);

  // One button per side; the whole pair lights when its point is toggled.
  const hotspots = React.useMemo(
    () =>
      TENDER_POINTS.flatMap((point) =>
        SIDES.map((side, idx) => {
          const anchor = TENDER_POINT_ANCHORS[point.id][idx];
          return {
            id: `${point.id}${side}`,
            label: t(point.tKey as TranslationKey),
            position: anchor,
            color: PAIN_GROUP_COLOR[point.group],
            activeColor: "#5eead4",
          };
        })
      ),
    [t]
  );

  const selectedButtonIds = React.useMemo(() => {
    const set = new Set<string>();
    for (const id of selected) SIDES.forEach((side) => set.add(`${id}${side}`));
    return set;
  }, [selected]);

  const hoveredPoint = hoveredBtn ? pairId(hoveredBtn) : null;
  const activePoints = TENDER_POINTS.filter((point) => selected.has(point.id));

  // Severity per region: a selected point glows strongest, hovered points
  // medium. Both sides light because regions are bilateral.
  const severity = React.useMemo(() => {
    const map: Partial<Record<BodyRegionId, number>> = {};
    for (const point of TENDER_POINTS) {
      if (selected.has(point.id)) {
        map[point.region] = Math.max(map[point.region] ?? 0, 8);
      } else if (hoveredPoint === point.id) {
        map[point.region] = Math.max(map[point.region] ?? 0, 5);
      }
    }
    return map;
  }, [selected, hoveredPoint]);

  const highlight = React.useMemo(
    () => TENDER_POINTS.find((point) => point.id === hoveredPoint)?.region ?? null,
    [hoveredPoint]
  );

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
        {/* Body map — 3D anatomical viewer with interactive tender points */}
        <div className="relative mx-auto w-48 select-none px-2 py-1">
          <AnatomicalBody3D
            className="aspect-square w-full"
            severity={severity}
            highlight={highlight}
            backView={view === "back"}
            hotspots={hotspots}
            selected={selectedButtonIds}
            onSelect={toggle}
            onHover={setHover}
          />

          {/* Front / Back view toggle */}
          <div
            role="group"
            aria-label={t("bodyMap.viewGroupAria")}
            className="absolute end-0 top-0 z-20 flex flex-col gap-1"
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
              <span
                key={point.id}
                className="inline-flex items-center gap-1 rounded-full border border-teal-500/20 bg-teal-500/10 px-2.5 py-0.5 text-xs font-medium text-teal-300"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-teal-400" />
                {t(point.tKey as TranslationKey)}
              </span>
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