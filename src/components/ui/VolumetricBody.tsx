"use client";

/**
 * VolumetricBody — shared 2.5D body figure for FibroCare's pain maps.
 *
 * A layered SVG silhouette that reads as volumetric rather than flat:
 *  - head as a shaded ellipse with a subtle jaw line
 *  - neck as a trapezoid bridging head and shoulders
 *  - shoulders as curved deltoid caps, not horizontal bars
 *  - torso filled with a vertical light-to-shadow gradient, anatomically
 *    tapered (narrower at the waist, wider at the hips)
 *  - cylindrical limb strokes with lateral light gradients
 *  - knees as joint ellipses
 *  - rim light along the silhouette edge ("glass" 3D border)
 *  - a soft contact shadow anchoring the figure to a floor plane
 *  - severity-driven region glows (emerald → amber → orange → rose)
 *
 * Regions accept a numeric severity 0–10; glow intensity, hue, and a
 * pulsing halo scale with it. Hotspot anchors use the same coordinate
 * space as the silhouette so clickable nodes land exactly on the anatomy.
 * All animation is pure CSS keyframes, so it is GPU-friendly on mobile and
 * silenced by the app's global reduced-motion guards in globals.css.
 * Unique gradient ids per instance avoid SVG id collisions when several
 * figures render on one page.
 */

import * as React from "react";
import { cn } from "@/lib/utils";

export type BodyRegionId =
  | "neck"
  | "shoulders"
  | "upperArms"
  | "elbows"
  | "lowerBack"
  | "hips"
  | "knees"
  | "joints";

/** Severity 0–10 → hue ramp (emerald → amber → orange → rose). */
function severityHue(severity: number): { stop: string; glow: string } {
  const s = Math.max(0, Math.min(10, severity));
  if (s === 0) return { stop: "rgba(16,185,129,0)", glow: "transparent" };
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

/**
 * Pin-point anchors for each clickable pain region, in viewBox units
 * (0–100 landscape; figure stands in a 100-tall frame). These line up
 * with the actual anatomy drawn below so both the glow pools and the
 * floating hotspot nodes are visually correct.
 */
const REGION_SPOTS: Record<BodyRegionId, { cx: number; cy: number; r: number }> = {
  neck:       { cx: 50, cy: 17.5, r: 5 },
  shoulders:  { cx: 50, cy: 25.5, r: 13 },
  upperArms:  { cx: 50, cy: 36, r: 9.5 },
  elbows:     { cx: 50, cy: 48, r: 5.5 },
  lowerBack:  { cx: 50, cy: 52, r: 8 },
  hips:       { cx: 50, cy: 62, r: 9.5 },
  knees:      { cx: 50, cy: 78, r: 7 },
  joints:     { cx: 50, cy: 46, r: 20 },
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
    [uid],
  );

  const litRegions = (Object.keys(REGION_SPOTS) as BodyRegionId[]).filter(
    (region) => (severity[region] ?? 0) > 0,
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
          <stop offset="0%" stopColor="rgba(94,234,212,0.28)" />
          <stop offset="30%" stopColor="rgba(19,78,74,0.5)" />
          <stop offset="100%" stopColor="rgba(6,45,42,0.64)" />
        </linearGradient>

        {/* Lateral cylinder shading for limbs (light wraps the form) */}
        <linearGradient id={id("limbL")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(13,63,60,0.72)" />
          <stop offset="55%" stopColor="rgba(45,212,191,0.4)" />
          <stop offset="100%" stopColor="rgba(13,63,60,0.72)" />
        </linearGradient>
        <linearGradient id={id("limbR")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(13,63,60,0.72)" />
          <stop offset="55%" stopColor="rgba(45,212,191,0.4)" />
          <stop offset="100%" stopColor="rgba(13,63,60,0.72)" />
        </linearGradient>

        {/* Head: spherical shading */}
        <radialGradient id={id("head")} cx="38%" cy="30%" r="80%">
          <stop offset="0%" stopColor="rgba(153,246,228,0.5)" />
          <stop offset="100%" stopColor="rgba(15,64,60,0.6)" />
        </radialGradient>

        {/* Ambient floor glow */}
        <radialGradient id={id("floor")} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(45,212,191,0.14)" />
          <stop offset="70%" stopColor="rgba(45,212,191,0.04)" />
          <stop offset="100%" stopColor="rgba(45,212,191,0)" />
        </radialGradient>

        {/* Per-region severity glows */}
        {litRegions.map((region) => {
          const hue = severityHue(severity[region] ?? 0);
          return (
            <radialGradient key={region} id={id(`glow-${region}`)} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={hue.stop} />
              <stop offset="45%" stopColor={`rgba(${hue.glow},0.26)`} />
              <stop offset="100%" stopColor={`rgba(${hue.glow},0)`} />
            </radialGradient>
          );
        })}
      </defs>

      {/* Contact shadow anchoring the figure to a floor plane */}
      <ellipse cx="50" cy="96" rx="15" ry="2.4" fill="rgba(2,12,10,0.34)" />
      {/* Ambient floor glow */}
      <ellipse cx="50" cy="92" rx="28" ry="6.5" fill={`url(#${id("floor")})`} />

      {/* Limbs first so the torso overlaps them cleanly */}
      <g fill="none" strokeLinecap="round">
        {/* Arms: deltoid → elbow → forearm → hand */
        /* Left arm — starts at left shoulder cap, drapes down */}
        <path
          d="M31,27 C28,31 26,37 24.5,42 C23.5,46 22.8,50 22.2,54"
          stroke={`url(#${id("limbL")})`}
          strokeWidth="5.4"
        />
        {/* Right arm */}
        <path
          d="M69,27 C72,31 74,37 75.5,42 C76.5,46 77.2,50 77.8,54"
          stroke={`url(#${id("limbR")})`}
          strokeWidth="5.4"
        />

        {/* Forearms — slightly thinner, continuing the line */}
        <path
          d="M22.2,54 C21.8,58 21.4,62 21.2,66"
          stroke={`url(#${id("limbL")})`}
          strokeWidth="4.2"
        />
        <path
          d="M77.8,54 C78.2,58 78.6,62 78.8,66"
          stroke={`url(#${id("limbR")})`}
          strokeWidth="4.2"
        />

        {/* Legs: thigh into calf, tapered */}
        <path
          d="M43.5,64 C43,68 42.2,72 41.8,76"
          stroke={`url(#${id("limbL")})`}
          strokeWidth="8.4"
        />
        <path
          d="M41.8,76 C41.4,80 40.8,85 40.4,90"
          stroke={`url(#${id("limbL")})`}
          strokeWidth="6.2"
        />
        <path
          d="M56.5,64 C57,68 57.8,72 58.2,76"
          stroke={`url(#${id("limbR")})`}
          strokeWidth="8.4"
        />
        <path
          d="M58.2,76 C58.6,80 59.2,85 59.6,90"
          stroke={`url(#${id("limbR")})`}
          strokeWidth="6.2"
        />
      </g>

      {/* Head & neck */}
      <rect x="46.4" y="13" width="7.2" height="5" rx="2.6" fill="rgba(19,78,74,0.52)" />
      <ellipse cx="50" cy="8" rx="5.2" ry="5.8" fill={`url(#${id("head")})`} />
      {/* Jaw hint for anatomical grounding */}
      <path
        d="M45.6,10 C46,11.2 48,11.6 50,11.4 C52,11.6 54,11.2 54.4,10"
        fill="none"
        stroke="rgba(153,246,228,0.12)"
        strokeWidth="0.4"
      />

      {/* Torso — anatomically tapered: narrower waist, wider hips/shoulders */}
      <path
        d="M44.5,17
           C41,18.5 34,20 31,22.5
           C28.6,24.6 27.8,28 28,31.5
           C28.3,36 29.2,40.5 29.8,44
           C30.4,47.5 31.8,51 34,53.5
           C35.8,55.5 36.6,57 36.6,59
           C36.6,60.2 37.4,61 38.8,61
           L45,61
           C46.5,61 47.4,60.2 47.6,59
           L50,55
           L52.4,59
           C52.6,60.2 53.5,61 55,61
           L61.2,61
           C62.6,61 63.4,60.2 63.4,59
           C63.4,57 64.2,55.5 66,53.5
           C68.2,51 69.6,47.5 70.2,44
           C70.8,40.5 71.7,36 72,31.5
           C72.2,28 71.4,24.6 69,22.5
           C66,20 59,18.5 55.5,17
           C53.5,16.4 51.5,16.2 50,16.2
           C48.5,16.2 46.5,16.4 44.5,17 Z"
        fill={`url(#${id("bodyFill")})`}
      />

      {/* Anatomy lines: front (clavicles, sternum) or back (spine, blades) */}
      <g fill="none" stroke="rgba(153,246,228,0.14)" strokeWidth="0.5" strokeLinecap="round">
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
            {/* clavicle lines */}
            <path d="M36.5,22.5 C40.5,21 46,20.8 49.5,22" />
            <path d="M63.5,22.5 C59.5,21 54,20.8 50.5,22" />
            {/* upper sternum hint */}
            <path d="M47,29.5 C48.5,30.2 51.5,30.2 53,29.5" />
            <path d="M46.8,34 C48.4,34.6 51.6,34.6 53.2,34" />
            {/* sternum line */}
            <path d="M50,23.5 L50,44" strokeDasharray="0.4 1.1" />
            {/* costal arc hints */}
            <path d="M46.5,38 C48,38.6 52,38.6 53.5,38" />
            <path d="M47.2,42 C48.4,42.6 51.6,42.6 52.8,42" />
          </>
        )}
        {/* Joint markers: knees + elbows */}
        <circle cx="41.4" cy="75.4" r="2.1" strokeOpacity="0.5" />
        <circle cx="58.6" cy="75.4" r="2.1" strokeOpacity="0.5" />
        <circle cx="23.4" cy="50" r="1.7" strokeOpacity="0.45" />
        <circle cx="76.6" cy="50" r="1.7" strokeOpacity="0.45" />
        {/* Shoulder joint caps */}
        <circle cx="31" cy="27" r="2.2" strokeOpacity="0.4" />
        <circle cx="69" cy="27" r="2.2" strokeOpacity="0.4" />
      </g>

      {/* Glass rim light along the silhouette edge */}
      <path
        d="M44.5,17
           C41,18.5 34,20 31,22.5
           C28.6,24.6 27.8,28 28,31.5
           C28.3,36 29.2,40.5 29.8,44
           C30.4,47.5 31.8,51 34,53.5
           C35.8,55.5 36.6,57 36.6,59
           C36.6,60.2 37.4,61 38.8,61
           L45,61
           C46.5,61 47.4,60.2 47.6,59
           L50,55
           L52.4,59
           C52.6,60.2 53.5,61 55,61
           L61.2,61
           C62.6,61 63.4,60.2 63.4,59
           C63.4,57 64.2,55.5 66,53.5
           C68.2,51 69.6,47.5 70.2,44
           C70.8,40.5 71.7,36 72,31.5
           C72.2,28 71.4,24.6 69,22.5
           C66,20 59,18.5 55.5,17
           C53.5,16.4 51.5,16.2 50,16.2
           C48.5,16.2 46.5,16.4 44.5,17 Z"
        fill="none"
        stroke="rgba(153,246,228,0.26)"
        strokeWidth="0.5"
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
          r={REGION_SPOTS[highlight].r * 0.5}
          fill="none"
          stroke="rgba(153,246,228,0.82)"
          strokeWidth="0.7"
          strokeDasharray="2 1.4"
          className="motion-safe:animate-[spin_14s_linear_infinite]"
          style={{ transformOrigin: `${REGION_SPOTS[highlight].cx}px ${REGION_SPOTS[highlight].cy}px` }}
        />
      )}
    </svg>
  );
}
