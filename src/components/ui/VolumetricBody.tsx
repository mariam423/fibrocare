"use client";

/**
 * VolumetricBody — medical-grade anatomical silhouette for FibroCare pain maps.
 *
 * A refined 2.5D SVG figure built for clinical readability rather than
 * cartoon abstraction:
 *  - head as a smooth oval with a subtle jaw/sternum axis
 *  - neck as a tapered bridge between head and trapezius
 *  - shoulders as smooth deltoid caps (elliptical, not blobby)
 *  - torso tapered at the waist, wider at the ribs and hips, filled with a
 *    vertical light-to-shadow gradient plus a subtle medial shadow line
 *  - arms as two-segment limbs (upper arm + forearm) with lateral cylinder
 *    shading so each limb reads as rounded, not flat
 *  - forearm→hand fade so the wrist end is soft
 *  - legs as thigh + calf segments with tapering strokes
 *  - knees as joint ellipses, elbows as joint dots
 *  - a subtle sternum/rib suggestion line for anatomical grounding
 *  - rim light ("glass" edge) along the silhouette
 *  - severity-driven region glows (emerald → amber → orange → rose)
 *  - front view + back view (spine + blade suggestion) toggle
 *
 * All severity nodes are pure CSS-animated radial glows, GPU-friendly on
 * mobile and silenced by the app's global reduced-motion guards.
 * Unique gradient ids per instance avoid SVG id collisions when several
 * figures render on one page.
 */

import * as React from "react";
import { cn } from "@/lib/utils";

export type BodyRegionId =
  | "neck"
  | "shoulders"
  | "upperArms"
  | "forearms"
  | "elbows"
  | "lowerBack"
  | "ribs"
  | "hips"
  | "thighs"
  | "knees"
  | "ankles"
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
  neck:       { cx: 50, cy: 18, r: 5 },
  shoulders:  { cx: 50, cy: 26, r: 13 },
  upperArms:  { cx: 31, cy: 32, r: 9 },
  upperArmsR: { cx: 69, cy: 32, r: 9 },
  forearms:   { cx: 25, cy: 48, r: 8 },
  forearmsR:  { cx: 75, cy: 48, r: 8 },
  elbows:     { cx: 28, cy: 42, r: 5.5 },
  elbowsR:    { cx: 72, cy: 42, r: 5.5 },
  lowerBack:  { cx: 50, cy: 52, r: 7.5 },
  ribs:       { cx: 50, cy: 38, r: 9 },
  hips:       { cx: 50, cy: 63, r: 10 },
  thighs:     { cx: 42, cy: 72, r: 8.5 },
  thighsR:    { cx: 58, cy: 72, r: 8.5 },
  knees:      { cx: 42, cy: 80, r: 7 },
  kneesR:     { cx: 58, cy: 80, r: 7 },
  ankles:     { cx: 42, cy: 90, r: 5 },
  anklesR:    { cx: 58, cy: 90, r: 5 },
  joints:     { cx: 50, cy: 50, r: 18 },
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
        {/* Body shading: lit upper chest → shadowed lower legs */}
        <linearGradient id={id("bodyFill")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(94,234,212,0.26)" />
          <stop offset="28%" stopColor="rgba(19,78,74,0.48)" />
          <stop offset="100%" stopColor="rgba(6,45,42,0.62)" />
        </linearGradient>

        {/* Lateral cylinder shading — light wraps each limb form */}
        <linearGradient id={id("limbUpperL")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(13,63,60,0.7)" />
          <stop offset="50%" stopColor="rgba(45,212,191,0.42)" />
          <stop offset="100%" stopColor="rgba(13,63,60,0.7)" />
        </linearGradient>
        <linearGradient id={id("limbUpperR")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(13,63,60,0.7)" />
          <stop offset="50%" stopColor="rgba(45,212,191,0.42)" />
          <stop offset="100%" stopColor="rgba(13,63,60,0.7)" />
        </linearGradient>
        <linearGradient id={id("limbLowerL")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(13,63,60,0.68)" />
          <stop offset="50%" stopColor="rgba(45,212,191,0.38)" />
          <stop offset="100%" stopColor="rgba(13,63,60,0.68)" />
        </linearGradient>
        <linearGradient id={id("limbLowerR")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(13,63,60,0.68)" />
          <stop offset="50%" stopColor="rgba(45,212,191,0.38)" />
          <stop offset="100%" stopColor="rgba(13,63,60,0.68)" />
        </linearGradient>

        {/* Head: spherical shading with a subtle top highlight */}
        <radialGradient id={id("head")} cx="38%" cy="30%" r="80%">
          <stop offset="0%" stopColor="rgba(153,246,228,0.48)" />
          <stop offset="100%" stopColor="rgba(15,64,60,0.58)" />
        </radialGradient>

        {/* Torso medial shadow: subtle vertical line for anatomical depth */}
        <linearGradient id={id("torsoMedial")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(2,12,10,0)" />
          <stop offset="48%" stopColor="rgba(2,12,10,0.12)" />
          <stop offset="52%" stopColor="rgba(2,12,10,0.12)" />
          <stop offset="100%" stopColor="rgba(2,12,10,0)" />
        </linearGradient>

        {/* Ambient floor glow */}
        <radialGradient id={id("floor")} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(45,212,191,0.13)" />
          <stop offset="70%" stopColor="rgba(45,212,191,0.04)" />
          <stop offset="100%" stopColor="rgba(45,212,191,0)" />
        </radialGradient>

        {/* Per-region severity glows */}
        {litRegions.map((region) => {
          const hue = severityHue(severity[region] ?? 0);
          return (
            <radialGradient key={region} id={id(`glow-${region}`)} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={hue.stop} />
              <stop offset="42%" stopColor={`rgba(${hue.glow},0.24)`} />
              <stop offset="100%" stopColor={`rgba(${hue.glow},0)`} />
            </radialGradient>
          );
        })}
      </defs>

      {/* Contact shadow anchoring the figure to a floor plane */}
      <ellipse cx="50" cy="96" rx="14" ry="2.2" fill="rgba(2,12,10,0.32)" />
      {/* Ambient floor glow */}
      <ellipse cx="50" cy="92" rx="26" ry="6" fill={`url(#${id("floor")})`} />

      {/* Lower limbs first so the torso overlaps cleanly */}
      <g fill="none" strokeLinecap="round">
        {/* Left leg: thigh then calf */}
        <path
          d="M43.2,65 C42.6,70 42,74 41.6,77"
          stroke={`url(#${id("limbUpperL")})`}
          strokeWidth="8.4"
        />
        <path
          d="M41.6,77 C41.2,81 40.6,85 40.2,90"
          stroke={`url(#${id("limbLowerL")})`}
          strokeWidth="6.2"
        />
        {/* Right leg */}
        <path
          d="M56.8,65 C57.4,70 58,74 58.4,77"
          stroke={`url(#${id("limbUpperR")})`}
          strokeWidth="8.4"
        />
        <path
          d="M58.4,77 C58.8,81 59.4,85 59.8,90"
          stroke={`url(#${id("limbLowerR")})`}
          strokeWidth="6.2"
        />
      </g>

      {/* Arms: two-segment limbs for anatomical realism */}
      <g fill="none" strokeLinecap="round">
        {/* Left upper arm: deltoid cap → elbow */}
        <path
          d="M31.4,27 C29,30 27,34 26,38"
          stroke={`url(#${id("limbUpperL")})`}
          strokeWidth="5.2"
        />
        {/* Left forearm: elbow → wrist, slightly thinner */}
        <path
          d="M26,38 C25,41 24.2,44 23.8,47"
          stroke={`url(#${id("limbLowerL")})`}
          strokeWidth="4.2"
        />
        {/* Right upper arm */}
        <path
          d="M68.6,27 C71,30 73,34 74,38"
          stroke={`url(#${id("limbUpperR")})`}
          strokeWidth="5.2"
        />
        {/* Right forearm */}
        <path
          d="M74,38 C75,41 75.8,44 76.2,47"
          stroke={`url(#${id("limbLowerR")})`}
          strokeWidth="4.2"
        />
      </g>

      {/* Hands: soft fade ellipses at the wrist ends */}
      <ellipse cx="23.4" cy="47.5" rx="2" ry="2.4" fill="rgba(13,63,60,0.5)" />
      <ellipse cx="76.6" cy="47.5" rx="2" ry="2.4" fill="rgba(13,63,60,0.5)" />

      {/* Head & neck */}
      <rect x="46.4" y="13.2" width="7.2" height="5" rx="2.6" fill="rgba(19,78,74,0.5)" />
      <ellipse cx="50" cy="8.2" rx="5.2" ry="5.8" fill={`url(#${id("head")})`} />
      {/* Jaw/sternum axis hint */}
      <path
        d="M45.6,10 C46,11.2 48,11.6 50,11.4 C52,11.6 54,11.2 54.4,10"
        fill="none"
        stroke="rgba(153,246,228,0.1)"
        strokeWidth="0.4"
      />

      {/* Torso — anatomically tapered: wider at ribs/hips, narrower at waist */}
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

      {/* Torso medial shadow line (subtle anatomical depth) */}
      <path
        d="M50,19 L50,58"
        stroke={`url(#${id("torsoMedial")})`}
        strokeWidth="1.4"
        fill="none"
      />

      {/* Anatomy lines: front (clavicles, sternum, ribs) or back (spine, blades) */}
      <g fill="none" stroke="rgba(153,246,228,0.13)" strokeWidth="0.5" strokeLinecap="round">
        {backView ? (
          <>
            {/* spine */}
            <path d="M50,19 L50,58" strokeDasharray="1.6 1.2" />
            {/* shoulder blades */}
            <path d="M38.5,26.5 C42,23.8 46.5,23.6 49,26" />
            <path d="M61.5,26.5 C58,23.8 53.5,23.6 51,26" />
            {/* latissimus suggestion */}
            <path d="M46.5,30 C45.5,38 46,48 47.4,56" />
            <path d="M53.5,30 C54.5,38 54,48 52.6,56" />
            {/* pelvic crest */}
            <path d="M43,60.5 C45,63.2 48,63.6 49.5,62.2" />
            <path d="M57,60.5 C55,63.2 52,63.6 50.5,62.2" />
          </>
        ) : (
          <>
            {/* clavicle lines */}
            <path d="M36.5,22.5 C40.5,21 46,20.8 49.5,22" />
            <path d="M63.5,22.5 C59.5,21 54,20.8 50.5,22" />
            {/* upper sternum */}
            <path d="M47,29.5 C48.5,30.2 51.5,30.2 53,29.5" />
            {/* sternum line */}
            <path d="M50,23.5 L50,44" strokeDasharray="0.4 1.1" />
            {/* costal arc hints */}
            <path d="M46.5,38 C48,38.6 52,38.6 53.5,38" />
            <path d="M47.2,42 C48.4,42.6 51.6,42.6 52.8,42" />
          </>
        )}

        {/* Joint markers */}
        {/* Shoulder caps */}
        <circle cx="31.4" cy="27" r="2.2" strokeOpacity="0.4" />
        <circle cx="68.6" cy="27" r="2.2" strokeOpacity="0.4" />
        {/* Elbows */}
        <circle cx="26" cy="38" r="1.7" strokeOpacity="0.45" />
        <circle cx="74" cy="38" r="1.7" strokeOpacity="0.45" />
        {/* Knees */}
        <circle cx="41.6" cy="77" r="2.1" strokeOpacity="0.5" />
        <circle cx="58.4" cy="77" r="2.1" strokeOpacity="0.5" />
        {/* Ankles */}
        <circle cx="40.2" cy="90" r="1.6" strokeOpacity="0.4" />
        <circle cx="59.8" cy="90" r="1.6" strokeOpacity="0.4" />
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
        stroke="rgba(153,246,228,0.24)"
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
          stroke="rgba(153,246,228,0.8)"
          strokeWidth="0.7"
          strokeDasharray="2 1.4"
          className="motion-safe:animate-[spin_14s_linear_infinite]"
          style={{ transformOrigin: `${REGION_SPOTS[highlight].cx}px ${REGION_SPOTS[highlight].cy}px` }}
        />
      )}
    </svg>
  );
}
