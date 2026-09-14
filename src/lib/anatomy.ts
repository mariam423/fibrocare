/**
 * anatomy.ts — shared geometry for the FibroCare body maps.
 *
 * Single source of truth for:
 *  - the anatomical region ids and their 3D anchor points (world units used
 *    by the WebGL viewer),
 *  - the severity hue ramp shared by every renderer,
 *  - the classic 18 fibromyalgia tender points (9 bilateral pairs),
 *  - a projection that maps 3D anchors back to the 0–100 SVG viewBox so the
 *    accessible hotspot overlay lines up with the fallback figure.
 *
 * World coordinate conventions (y-up): the figure stands with soles at y≈0
 * and the crown of the head near y≈3.7; +z faces the viewer. World units are
 * chosen so the whole figure fits a ~0.9 × 3.6 box.
 */

export type BodyRegionId =
  | "neck"
  | "shoulders"
  | "upperArms"
  | "forearms"
  | "elbows"
  | "lowerBack"
  | "ribs"
  | "hips"
  | "lowerAbdomen"
  | "thighs"
  | "knees"
  | "ankles"
  | "joints";

/** 3D anchor point in anatomy world units. */
export type Vec3 = readonly [number, number, number];

/* SVG-fallback mapping: the figure sits in a 0–100 viewBox occupying
   roughly x 31–69 and y 3.2 (crown) to 91.5 (soles). */
const VB_CENTER_X = 50;
const VB_X_RANGE = 19;
const VB_HEAD_TOP = 3.2;
const VB_FEET = 91.5;
const WORLD_CROWN = 3.72;
const WORLD_HALF_WIDTH = 0.46;

export interface SeverityBand {
  /** Inclusive upper bound of this band on the 0–10 scale. */
  max: number;
  /** Core rgb triplet, e.g. `"52,211,153"` (matches the SVG ramp stops). */
  rgb: string;
  /** Opaque hex counterpart used by the WebGL materials. */
  hex: string;
  /** Alpha of the radial-gradient stop used by the SVG fallback. */
  stopAlpha: number;
}

/**
 * Severity 0–10 → hue ramp (emerald → amber → orange → rose). Shared by the
 * SVG fallback and the WebGL glow sprites so both renderers always agree.
 */
export function severityBand(severity: number): SeverityBand {
  const s = Math.max(0, Math.min(10, severity));
  if (s === 0) return { max: 0, rgb: "16,185,129", hex: "#10b981", stopAlpha: 0 };
  if (s <= 3) return { max: 3, rgb: "52,211,153", hex: "#34d399", stopAlpha: 0.55 };
  if (s <= 5) return { max: 5, rgb: "250,204,21", hex: "#facc15", stopAlpha: 0.6 };
  if (s <= 7) return { max: 7, rgb: "251,146,60", hex: "#fb923c", stopAlpha: 0.65 };
  return { max: 10, rgb: "251,113,133", hex: "#fb7185", stopAlpha: 0.7 };
}

/**
 * 3D anchor points per body region — where glow pools sit on the anatomy.
 * Bilateral regions carry one anchor per side.
 */
export const REGION_ANCHORS: Record<BodyRegionId, readonly Vec3[]> = {
  neck: [[0, 3.0, 0.36]],
  shoulders: [
    [-0.35, 2.68, 0.21],
    [0.35, 2.68, 0.21],
  ],
  upperArms: [
    [-0.37, 2.38, 0.14],
    [0.37, 2.38, 0.14],
  ],
  forearms: [
    [-0.42, 1.8, 0.12],
    [0.42, 1.8, 0.12],
  ],
  elbows: [
    [-0.44, 2.18, 0.14],
    [0.44, 2.18, 0.14],
  ],
  lowerBack: [[0, 1.78, 0.34]],
  ribs: [[0, 2.42, 0.32]],
  hips: [[0, 1.12, 0.4]],
  lowerAbdomen: [[0, 1.0, 0.35]],
  thighs: [
    [-0.18, 0.84, 0.18],
    [0.18, 0.84, 0.18],
  ],
  knees: [
    [-0.19, 0.62, 0.16],
    [0.19, 0.62, 0.16],
  ],
  ankles: [
    [-0.14, 0.18, 0.1],
    [0.14, 0.18, 0.1],
  ],
  joints: [[0, 2.35, 0.32]],
};

/* ------------------------------------------------------------------ */
/* Classic 18 fibromyalgia tender points (ACR 1990, 9 bilateral pairs) */
/* ------------------------------------------------------------------ */

export type TenderPointId =
  | "occiput"
  | "lowCervical"
  | "trapezius"
  | "supraspinatus"
  | "secondRib"
  | "epicondyle"
  | "gluteal"
  | "trochanter"
  | "knee";

/** One anchor per side (left, right) for every classic tender point. */
export const TENDER_POINT_ANCHORS: Record<
  TenderPointId,
  readonly [Vec3, Vec3]
> = {
  // Suboccipital muscle insertions at the base of the skull.
  occiput: [
    [-0.14, 3.28, -0.2],
    [0.14, 3.28, -0.2],
  ],
  // C5–C7 transverse processes / interspinous.
  lowCervical: [
    [-0.11, 2.98, -0.22],
    [0.11, 2.98, -0.22],
  ],
  // Upper border midpoint of the trapezius.
  trapezius: [
    [-0.28, 2.76, -0.1],
    [0.28, 2.76, -0.1],
  ],
  // Above the scapular spine, medial border.
  supraspinatus: [
    [-0.3, 2.6, -0.24],
    [0.3, 2.6, -0.24],
  ],
  // Costochondral junction of the 2nd rib.
  secondRib: [
    [-0.24, 2.62, 0.2],
    [0.24, 2.62, 0.2],
  ],
  // 2 cm distal to the lateral epicondyle (elbow).
  epicondyle: [
    [-0.46, 2.18, 0.08],
    [0.46, 2.18, 0.08],
  ],
  // Upper outer quadrant of the gluteal region.
  gluteal: [
    [-0.22, 1.04, -0.28],
    [0.22, 1.04, -0.28],
  ],
  // Posterior to the greater trochanter prominence.
  trochanter: [
    [-0.34, 0.8, 0.16],
    [0.34, 0.8, 0.16],
  ],
  // Medial fat pad, proximal to the knee joint line.
  knee: [
    [-0.16, 0.6, 0.14],
    [0.16, 0.6, 0.14],
  ],
};

/** Pain-map legend groups and the marker color each group carries. */
export type PainGroupId = "mobility" | "joints" | "muscles" | "groups";

export const PAIN_GROUP_COLOR: Record<PainGroupId, string> = {
  mobility: "#2dd4bf",
  joints: "#facc15",
  muscles: "#fb923c",
  groups: "#065f46",
};

/**
 * Project a 3D anchor back to 0–100 SVG viewBox coordinates so the overlay
 * hotspots track the fallback (SVG) figure as well as the WebGL one.
 */
export function viewBoxFromVec3(pos: Vec3): { x: number; y: number } {
  const x = clamp(VB_CENTER_X + (pos[0] / WORLD_HALF_WIDTH) * VB_X_RANGE, 0, 100);
  const y = clamp(VB_HEAD_TOP + (1 - pos[1] / WORLD_CROWN) * (VB_FEET - VB_HEAD_TOP), 0, 100);
  return { x, y };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}