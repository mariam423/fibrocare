"use client";

/**
 * VolumetricBody — medical-grade anatomical silhouette for FibroCare pain maps.
 *
 * A refined 2.5D SVG figure built for clinical readability rather than
 * cartoon abstraction:
 *  - head as a smooth oval with a subtle jaw/sternum axis
 *  - neck as a tapered bridge between head and trapezius
 *  - shoulders as deltoid caps; arms hang close to the ribcage in two
 *    segments (upper arm + forearm) with lateral cylinder shading
 *  - torso tapered at the waist, wider at the ribs and hips, filled with a
 *    vertical light-to-shadow gradient plus a subtle medial shadow line
 *  - legs emerge from the pelvic corners as thigh + calf curves with
 *    tapering strokes, ending in soft feet
 *  - knees as joint ellipses, elbows as joint dots, shoulder/ankle marks
 *  - sternum/rib hint (front) and spine/scapula hint (back) for
 *    anatomical grounding
 *  - rim light ("glass" edge) along the silhouette
 *  - severity-driven region glows (emerald → amber → orange → rose)
 *  - front view + back view (spine + blade suggestion) toggle
 *
 * Severity nodes are pure CSS-animated radial glows, GPU-friendly on mobile
 * and silenced by the app's global reduced-motion guards. Bilateral regions
 * (shoulders, arms, legs) receive symmetric glow pools so pain reads on both
 * sides of the silhouette. Unique gradient ids per instance avoid SVG id
 * collisions when several figures render on one page.
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
 * Glow pools for each pain region in viewBox units (0–100 frame; the figure
 * stands in a 100-tall frame). Bilateral regions carry one pool per side so
 * the light pools land on the actual anatomy — shoulders, arms, legs — while
 * axial regions stay central.
 */
const REGION_POOLS: Record<
  BodyRegionId,
  ReadonlyArray<{ cx: number; cy: number; r: number }>
> = {
  neck:      [{ cx: 50, cy: 16.8, r: 4.6 }],
  shoulders: [{ cx: 35, cy: 21.5, r: 7 }, { cx: 65, cy: 21.5, r: 7 }],
  upperArms: [{ cx: 34.4, cy: 29.5, r: 6.3 }, { cx: 65.6, cy: 29.5, r: 6.3 }],
  forearms:  [{ cx: 32, cy: 42, r: 5.3 }, { cx: 68, cy: 42, r: 5.3 }],
  elbows:    [{ cx: 33, cy: 37, r: 4.2 }, { cx: 67, cy: 37, r: 4.2 }],
  lowerBack: [{ cx: 50, cy: 46, r: 8 }],
  ribs:      [{ cx: 50, cy: 35, r: 8.6 }],
  hips:      [{ cx: 50, cy: 50.5, r: 8.4 }],
  thighs:    [{ cx: 44.3, cy: 61, r: 6.6 }, { cx: 55.7, cy: 61, r: 6.6 }],
  knees:     [{ cx: 43.4, cy: 74, r: 5.8 }, { cx: 56.6, cy: 74, r: 5.8 }],
  ankles:    [{ cx: 42.2, cy: 87.5, r: 4.4 }, { cx: 57.8, cy: 87.5, r: 4.4 }],
  joints:    [{ cx: 50, cy: 41, r: 9 }],
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

  const litRegions = (Object.keys(REGION_POOLS) as BodyRegionId[]).filter(
    (region) => (severity[region] ?? 0) > 0,
  );

  const torsoPath = React.useMemo(
    () =>
      "M50,17.4" +
      "C52.7,17.9 55.6,18.7 58.2,19.8" +
      "C60.8,20.9 63.2,22.6 64.5,24.4" +
      "C65.8,26.2 65.9,28.4 65.1,30.4" +
      "C64.3,32.6 62.9,34.8 62.3,37" +
      "C61.7,39.4 61.1,41.6 61.2,43.8" +
      "C61.3,46 62.6,47.9 64,49.4" +
      "C65,50.5 65.7,51.9 65.4,53.1" +
      "C65.1,54.2 63.7,54.6 62.1,54.5" +
      "L56.7,54.2" +
      "C55.1,54.1 53.6,53.6 52.8,52.2" +
      "L50,48.8" +
      "L47.2,52.2" +
      "C46.4,53.6 44.9,54.1 43.3,54.2" +
      "L37.9,54.5" +
      "C36.3,54.6 34.9,54.2 34.6,53.1" +
      "C34.3,51.9 35,50.5 36,49.4" +
      "C37.4,47.9 38.7,46 38.8,43.8" +
      "C38.9,41.6 38.3,39.4 37.7,37" +
      "C37.1,34.8 35.7,32.6 34.9,30.4" +
      "C34.1,28.4 34.2,26.2 35.5,24.4" +
      "C36.8,22.6 39.2,20.9 41.8,19.8" +
      "C44.4,18.7 47.3,17.9 50,17.4Z",
    [],
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
      <ellipse cx="50" cy="96" rx="15" ry="2.2" fill="rgba(2,12,10,0.32)" />
      {/* Ambient floor glow */}
      <ellipse cx="50" cy="92" rx="26" ry="6" fill={`url(#${id("floor")})`} />

      {/* Lower limbs first so the torso overlaps cleanly */}
      <g fill="none" strokeLinecap="round">
        {/* Left leg: thigh then calf */}
        <path
          d="M44.5,49.8 C44.2,57 43.8,65 43.4,73.5"
          stroke={`url(#${id("limbUpperL")})`}
          strokeWidth="7.6"
        />
        <path
          d="M43.4,73.5 C43,78 42.6,83 42.2,88"
          stroke={`url(#${id("limbLowerL")})`}
          strokeWidth="6"
        />
        {/* Right leg */}
        <path
          d="M55.5,49.8 C55.8,57 56.2,65 56.6,73.5"
          stroke={`url(#${id("limbUpperR")})`}
          strokeWidth="7.6"
        />
        <path
          d="M56.6,73.5 C57,78 57.4,83 57.8,88"
          stroke={`url(#${id("limbLowerR")})`}
          strokeWidth="6"
        />
      </g>

      {/* Feet — soft tapering stumps under each ankle */}
      <g fill="rgba(13,63,60,0.55)">
        <ellipse cx="42.6" cy="90.3" rx="3.3" ry="1.25" />
        <ellipse cx="57.4" cy="90.3" rx="3.3" ry="1.25" />
      </g>

      {/* Arms: two-segment limbs for anatomical realism */}
      <g fill="none" strokeLinecap="round">
        {/* Left upper arm: deltoid cap → elbow */}
        <path
          d="M35.2,20.8 C34.6,25.4 33.8,30.4 33,37"
          stroke={`url(#${id("limbUpperL")})`}
          strokeWidth="5.2"
        />
        {/* Left forearm: elbow → wrist, slightly thinner */}
        <path
          d="M33,37 C32.6,40 32.1,43.4 31.6,46.4"
          stroke={`url(#${id("limbLowerL")})`}
          strokeWidth="4.3"
        />
        {/* Right upper arm */}
        <path
          d="M64.8,20.8 C65.4,25.4 66.2,30.4 67,37"
          stroke={`url(#${id("limbUpperR")})`}
          strokeWidth="5.2"
        />
        {/* Right forearm */}
        <path
          d="M67,37 C67.4,40 67.9,43.4 68.4,46.4"
          stroke={`url(#${id("limbLowerR")})`}
          strokeWidth="4.3"
        />
      </g>

      {/* Hands: soft fade ellipses at the wrist ends */}
      <ellipse cx="31.2" cy="47.6" rx="2" ry="2.5" fill="rgba(13,63,60,0.5)" />
      <ellipse cx="68.8" cy="47.6" rx="2" ry="2.5" fill="rgba(13,63,60,0.5)" />

      {/* Head & neck */}
      <rect x="46.6" y="13.6" width="6.8" height="4.2" rx="2.8" fill="rgba(19,78,74,0.5)" />
      <ellipse cx="50" cy="8.6" rx="4.6" ry="5.4" fill={`url(#${id("head")})`} />
      {/* Jaw hint */}
      <path
        d="M45.8,10.4 C46.2,11.6 48,12 50,11.8 C52,12 53.8,11.6 54.2,10.4"
        fill="none"
        stroke="rgba(153,246,228,0.1)"
        strokeWidth="0.4"
      />

      {/* Torso — anatomically tapered: deltoid caps, ribcage, waist, pelvis */}
      <path d={torsoPath} fill={`url(#${id("bodyFill")})`} />

      {/* Torso medial shadow line (subtle anatomical depth) */}
      <path
        d="M50,18.4 L50,47"
        stroke={`url(#${id("torsoMedial")})`}
        strokeWidth="1.4"
        fill="none"
      />

      {/* Anatomy lines: front (clavicles, sternum, ribs) or back (spine, blades) */}
      <g fill="none" stroke="rgba(153,246,228,0.13)" strokeWidth="0.5" strokeLinecap="round">
        {backView ? (
          <>
            {/* spine */}
            <path d="M50,18.8 L50,47.2" strokeDasharray="1.6 1.2" />
            {/* shoulder blades */}
            <path d="M39.5,32 C42.5,29.6 46,29.8 48.6,32.2" />
            <path d="M60.5,32 C57.5,29.6 54,29.8 51.4,32.2" />
            {/* latissimus suggestion */}
            <path d="M45.4,34 C44.2,40.5 44.6,45.5 46,48.5" />
            <path d="M54.6,34 C55.8,40.5 55.4,45.5 54,48.5" />
            {/* posterior pelvic crest */}
            <path d="M44.2,50.6 C46,52.4 48.6,52.8 49.8,51.4" />
            <path d="M55.8,50.6 C54,52.4 51.4,52.8 50.2,51.4" />
          </>
        ) : (
          <>
            {/* clavicle lines */}
            <path d="M37.6,21 C42.5,19.2 47,19 50,19.8" />
            <path d="M62.4,21 C57.5,19.2 53,19 50,19.8" />
            {/* sternum line */}
            <path d="M50,20.2 L50,39.5" strokeDasharray="0.4 1.1" />
            {/* costal arc hints */}
            <path d="M46.8,33.5 C48.4,34.3 51.6,34.3 53.2,33.5" />
            <path d="M47.4,37.6 C48.6,38.4 51.4,38.4 52.6,37.6" />
            {/* iliac crest hints */}
            <path d="M44.2,45 C46,46.3 48.4,46.6 49.8,46" />
            <path d="M55.8,45 C54,46.3 51.6,46.6 50.2,46" />
          </>
        )}

        {/* Joint markers */}
        {/* Shoulder caps */}
        <circle cx="35.2" cy="20.8" r="2.2" strokeOpacity="0.4" />
        <circle cx="64.8" cy="20.8" r="2.2" strokeOpacity="0.4" />
        {/* Elbows */}
        <circle cx="33" cy="37" r="1.7" strokeOpacity="0.45" />
        <circle cx="67" cy="37" r="1.7" strokeOpacity="0.45" />
        {/* Knees */}
        <circle cx="43.4" cy="73.5" r="2.1" strokeOpacity="0.5" />
        <circle cx="56.6" cy="73.5" r="2.1" strokeOpacity="0.5" />
        {/* Ankles */}
        <circle cx="42.2" cy="88" r="1.6" strokeOpacity="0.4" />
        <circle cx="57.8" cy="88" r="1.6" strokeOpacity="0.4" />
      </g>

      {/* Glass rim light along the silhouette edge */}
      <path
        d={torsoPath}
        fill="none"
        stroke="rgba(153,246,228,0.24)"
        strokeWidth="0.5"
      />

      {/* Severity glows — soft radial light pools per region (bilateral pairs
          for the arms and legs so pain reads symmetrically) */}
      <g className="motion-safe:animate-none">
        {litRegions.map((region) => {
          const s = severity[region] ?? 0;
          const scale = 0.8 + (s / 10) * 0.5;
          const glowMax = (0.5 + (s / 10) * 0.5).toFixed(2);
          return REGION_POOLS[region].map((spot, poolIdx) => (
            <ellipse
              key={`${region}-${poolIdx}`}
              cx={spot.cx}
              cy={spot.cy}
              rx={spot.r * scale}
              ry={spot.r * scale * 0.8}
              fill={`url(#${id(`glow-${region}`)})`}
              className="body-glow-pulse"
              style={{ ["--fc-glow-max" as string]: glowMax }}
            />
          ));
        })}
      </g>

      {/* Highlight ring for the selected region */}
      {highlight && (severity[highlight] ?? 0) > 0 && (
        <g>
          {REGION_POOLS[highlight].map((spot, poolIdx) => (
            <circle
              key={`${highlight}-${poolIdx}`}
              cx={spot.cx}
              cy={spot.cy}
              r={spot.r * 0.5}
              fill="none"
              stroke="rgba(153,246,228,0.8)"
              strokeWidth="0.7"
              strokeDasharray="2 1.4"
              className="motion-safe:animate-[spin_14s_linear_infinite]"
              style={{ transformOrigin: `${spot.cx}px ${spot.cy}px` }}
            />
          ))}
        </g>
      )}
    </svg>
  );
}