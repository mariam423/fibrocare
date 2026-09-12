"use client";

/**
 * VolumetricBody — shared 2.5D body figure for FibroCare's pain maps.
 *
 * A layered SVG silhouette that reads as volumetric rather than flat:
 *  - cylindrical limb strokes with lateral light gradients
 *  - a torso filled with a vertical light-to-shadow gradient
 *  - rim light along the silhouette edge ("glass" 3D border)
 *  - a soft contact shadow + floor reflection anchoring the figure
 *  - severity-driven region glows (emerald → amber → orange → rose)
 *
 * Regions accept a numeric severity 0–10; glow intensity, hue, and a
 * pulsing halo scale with it. All animation is pure CSS keyframes, so it
 * is GPU-friendly on mobile and silenced by the app's global reduced-motion
 * guards in globals.css. Unique gradient ids per instance avoid SVG id
 * collisions when several figures render on one page.
 */

import * as React from "react";
import { cn } from "@/lib/utils";

export type BodyRegionId =
  | "neck"
  | "shoulders"
  | "arms"
  | "lowerBack"
  | "hips"
  | "knees"
  | "joints";

/** Severity 0–10 → hue ramp (emerald → amber → orange → rose). */
function severityHue(severity: number): { stop: string; glow: string } {
  const s = Math.max(0, Math.min(10, severity));
  if (s <= 0) return { stop: "rgba(16,185,129,0)", glow: "transparent" };
  if (s <= 3) return { stop: "rgba(52,211,153,0.55)", glow: "16,185,129" };
  if (s <= 5) return { stop: "rgba(250,204,21,0.6)", glow: "250,204,21" };
  if (s <= 7) return { stop: "rgba(251,146,60,0.65)", glow: "251,146,60" };
  return { stop: "rgba(251,113,133,0.7)", glow: "251,113,133" };
}

export interface VolumetricBodyProps {
  /** Region severity map (0–10). Absent regions are unlit. */
  severity?: Partial<Record<BodyRegionId, number>>;
  /** Highlighted region (stronger ring + halo). */
  highlight?: BodyRegionId | null;
  /** Show the back view (spine, shoulder blades) instead of front. */
  backView?: boolean;
  className?: string;
}

interface RegionSpot {
  cx: number;
  cy: number;
  /** Glow radius in viewBox units. */
  r: number;
}

const REGION_SPOTS: Record<BodyRegionId, RegionSpot> = {
  neck: { cx: 50, cy: 13.5, r: 5.5 },
  shoulders: { cx: 50, cy: 20, r: 11 },
  arms: { cx: 50, cy: 37, r: 9.5 },
  lowerBack: { cx: 50, cy: 47, r: 8.5 },
  hips: { cx: 50, cy: 60, r: 9.5 },
  knees: { cx: 50, cy: 74, r: 7.5 },
  joints: { cx: 50, cy: 55, r: 20 },
};

export function VolumetricBody({
  severity = {},
  highlight = null,
  backView = false,
  className,
}: VolumetricBodyProps) {
  const uid = React.useId();
  const id = React.useCallback(
    (name: string) => `${name}-${uid.replace(/[^a-zA-Z0-9]/g, "")}`,
    [uid]
  );

  const litRegions = (Object.keys(REGION_SPOTS) as BodyRegionId[]).filter(
    (region) => (severity[region] ?? 0) > 0
  );

  return (
    <svg
      viewBox="0 0 100 100"
      className={cn("h-full w-full overflow-visible", className)}
      aria-hidden="true"
    >
      <defs>
        {/* Vertical body shading: lit chest → shadowed legs */}
        <linearGradient id={id("bodyFill")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(94,234,212,0.30)" />
          <stop offset="32%" stopColor="rgba(19,78,74,0.52)" />
          <stop offset="100%" stopColor="rgba(6,45,42,0.66)" />
        </linearGradient>
        {/* Lateral cylinder shading for limbs (light wraps the form) */}
        <linearGradient id={id("limbL")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(13,63,60,0.72)" />
          <stop offset="55%" stopColor="rgba(45,212,191,0.42)" />
          <stop offset="100%" stopColor="rgba(13,63,60,0.72)" />
        </linearGradient>
        <linearGradient id={id("limbR")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(13,63,60,0.72)" />
          <stop offset="55%" stopColor="rgba(45,212,191,0.42)" />
          <stop offset="100%" stopColor="rgba(13,63,60,0.72)" />
        </linearGradient>
        {/* Head: spherical shading */}
        <radialGradient id={id("head")} cx="38%" cy="30%" r="80%">
          <stop offset="0%" stopColor="rgba(153,246,228,0.55)" />
          <stop offset="100%" stopColor="rgba(15,64,60,0.62)" />
        </radialGradient>
        {/* Ambient floor glow */}
        <radialGradient id={id("floor")} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(45,212,191,0.16)" />
          <stop offset="70%" stopColor="rgba(45,212,191,0.05)" />
          <stop offset="100%" stopColor="rgba(45,212,191,0)" />
        </radialGradient>
        {/* Per-region severity glows */}
        {litRegions.map((region) => {
          const hue = severityHue(severity[region] ?? 0);
          return (
            <radialGradient key={region} id={id(`glow-${region}`)} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={hue.stop} />
              <stop offset="45%" stopColor={`rgba(${hue.glow},0.28)`} />
              <stop offset="100%" stopColor={`rgba(${hue.glow},0)`} />
            </radialGradient>
          );
        })}
      </defs>

      {/* Contact shadow anchoring the figure to a floor plane */}
      <ellipse cx="50" cy="96" rx="16" ry="2.6" fill="rgba(2,12,10,0.35)" />
      {/* Ambient floor glow */}
      <ellipse cx="50" cy="92" rx="30" ry="7" fill={`url(#${id("floor")})`} />

      {/* Limbs first so the torso overlaps them cleanly */}
      <g fill="none" strokeLinecap="round">
        {/* Arms: deltoid → elbow → hand */}
        <path d="M31.5,25 C28,29 26,35 24.5,41 C23.5,45.5 22.5,49.5 21.5,53" stroke={`url(#${id("limbL")})`} strokeWidth="5.6" />
        <path d="M68.5,25 C72,29 74,35 75.5,41 C76.5,45.5 77.5,49.5 78.5,53" stroke={`url(#${id("limbR")})`} strokeWidth="5.6" />
        {/* Legs: thigh into calf, tapered */}
        <path d="M43.5,62 C43,67 42,71 41.5,74" stroke={`url(#${id("limbL")})`} strokeWidth="8.8" />
        <path d="M41.5,74 C41,78 40.4,84 40.2,90" stroke={`url(#${id("limbL")})`} strokeWidth="6.4" />
        <path d="M56.5,62 C57,67 58,71 58.5,74" stroke={`url(#${id("limbR")})`} strokeWidth="8.8" />
        <path d="M58.5,74 C59,78 59.6,84 59.8,90" stroke={`url(#${id("limbR")})`} strokeWidth="6.4" />
      </g>

      {/* Head & neck */}
      <rect x="46.5" y="11.5" width="7" height="5" rx="2.4" fill="rgba(19,78,74,0.55)" />
      <ellipse cx="50" cy="7.5" rx="5.4" ry="6" fill={`url(#${id("head")})`} />

      {/* Torso */}
      <path
        d="M44,14 C40,16 34,17.5 31,20.5 C28.5,23 27.8,27 28.2,31.5 C28.7,37 29.8,42 30.3,46 C30.8,50 32,54 34,57 C35.5,59.5 36,61 36,63 C36,64.5 37,65.5 38.5,65.5 L45,65.5 C47,65.5 48,64.5 48.5,63 L50,59 L51.5,63 C52,64.5 53,65.5 55,65.5 L61.5,65.5 C63,65.5 64,64.5 64,63 C64,61 64.5,59.5 66,57 C68,54 69.2,50 69.7,46 C70.2,42 71.3,37 71.8,31.5 C72.2,27 71.5,23 69,20.5 C66,17.5 60,16 56,14 C54,13.4 52,13.2 50,13.2 C48,13.2 46,13.4 44,14 Z"
        fill={`url(#${id("bodyFill")})`}
      />

      {/* Anatomy lines: front (clavicles, sternum) or back (spine, blades) */}
      <g fill="none" stroke="rgba(153,246,228,0.16)" strokeWidth="0.5" strokeLinecap="round">
        {backView ? (
          <>
            <path d="M50,19 L50,58" strokeDasharray="1.6 1.2" />
            <path d="M38.5,26.5 C42,23.8 46.5,23.6 49,26" />
            <path d="M61.5,26.5 C58,23.8 53.5,23.6 51,26" />
            <path d="M46.5,30 C45.5,38 46,48 47.4,56" />
            <path d="M53.5,30 C54.5,38 54,48 52.6,56" />
            <path d="M43,60.5 C45,63.2 48,63.6 49.5,62.2" />
            <path d="M57,60.5 C55,63.2 52,63.6 50.5,62.2" />
          </>
        ) : (
          <>
            <path d="M36.5,22.5 C40.5,21 46,20.8 49.5,22" />
            <path d="M63.5,22.5 C59.5,21 54,20.8 50.5,22" />
            <path d="M37,29.5 C41,32 46,32.4 49.5,30.4" />
            <path d="M63,29.5 C59,32 54,32.4 50.5,30.4" />
            <path d="M50,23.5 L50,44" strokeDasharray="0.4 1.1" />
            <path d="M46.5,33 C48,33.6 52,33.6 53.5,33" />
            <path d="M46.8,38 C48.2,38.6 51.8,38.6 53.2,38" />
            <path d="M47.4,43 C48.6,43.6 51.4,43.6 52.6,43" />
          </>
        )}
        {/* Joint markers: knees + elbows */}
        <circle cx="41.4" cy="73.6" r="2.1" strokeOpacity="0.5" />
        <circle cx="58.6" cy="73.6" r="2.1" strokeOpacity="0.5" />
        <circle cx="24.4" cy="41.2" r="1.7" strokeOpacity="0.4" />
        <circle cx="75.6" cy="41.2" r="1.7" strokeOpacity="0.4" />
      </g>

      {/* Glass rim light along the silhouette edge */}
      <path
        d="M44,14 C40,16 34,17.5 31,20.5 C28.5,23 27.8,27 28.2,31.5 C28.7,37 29.8,42 30.3,46 C30.8,50 32,54 34,57 C35.5,59.5 36,61 36,63 C36,64.5 37,65.5 38.5,65.5 L45,65.5 C47,65.5 48,64.5 48.5,63 L50,59 L51.5,63 C52,64.5 53,65.5 55,65.5 L61.5,65.5 C63,65.5 64,64.5 64,63 C64,61 64.5,59.5 66,57 C68,54 69.2,50 69.7,46 C70.2,42 71.3,37 71.8,31.5 C72.2,27 71.5,23 69,20.5 C66,17.5 60,16 56,14 C54,13.4 52,13.2 50,13.2 C48,13.2 46,13.4 44,14 Z"
        fill="none"
        stroke="rgba(153,246,228,0.28)"
        strokeWidth="0.55"
      />

      {/* Severity glows — soft radial light pools per region */}
      <g className="motion-safe:animate-none">
        {litRegions.map((region) => {
          const spot = REGION_SPOTS[region];
          const s = severity[region] ?? 0;
          const scale = 0.8 + (s / 10) * 0.5;
          return (
            <ellipse
              key={region}
              cx={spot.cx}
              cy={spot.cy}
              rx={spot.r * scale}
              ry={spot.r * scale * 0.8}
              fill={`url(#${id(`glow-${region}`)})`}
              className="body-glow-pulse"
              style={{ ["--fc-glow-max" as string]: (0.5 + (s / 10) * 0.5).toFixed(2) }}
            />
          );
        })}
      </g>

      {/* Highlight ring for the selected region */}
      {highlight && (severity[highlight] ?? 0) > 0 && (
        <circle
          cx={REGION_SPOTS[highlight].cx}
          cy={REGION_SPOTS[highlight].cy}
          r={REGION_SPOTS[highlight].r * 0.55}
          fill="none"
          stroke="rgba(153,246,228,0.85)"
          strokeWidth="0.7"
          strokeDasharray="2 1.4"
          className="motion-safe:animate-[spin_14s_linear_infinite]"
          style={{ transformOrigin: `${REGION_SPOTS[highlight].cx}px ${REGION_SPOTS[highlight].cy}px` }}
        />
      )}
    </svg>
  );
}
