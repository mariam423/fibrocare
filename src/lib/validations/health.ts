import { z } from "zod";

/** Base object (no cross-field refine) so a patchable variant can be
 *  derived with .partial() — Zod v4 forbids .partial() on schemas that
 *  already carry refinements. */
const CycleLogObjectSchema = z.object({
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  phase: z.enum(["MENSTRUAL", "FOLLICULAR", "OVULATORY", "LUTEAL"]),
  overallSeverity: z.number().int().min(1).max(10).default(5),
  // Bound free-text notes before they reach the database (the route
  // sanitizes content; this caps size so oversized payloads fail fast).
  notes: z.string().max(2000).optional(),
});

export const CycleLogSchema = CycleLogObjectSchema.refine(
  data => !data.endDate || data.endDate >= data.startDate,
  {
    message: "End date must be after start date",
    path: ["endDate"]
  }
);

/** Patch shape for flexible date editing (Point 1): a subset of the create
 *  shape so an existing cycle's dates / phase / severity can be corrected
 *  without requiring the full create payload. The same cross-field rule is
 *  applied only when both dates are present. */
export const CycleLogPatchSchema = CycleLogObjectSchema.partial().refine(
  data => !data.startDate || !data.endDate || data.endDate >= data.startDate,
  {
    message: "End date must be after start date",
    path: ["endDate"]
  }
);

/** Daily granular trackable (MenstrualLog) — the 15-point suite entry. */
export const MenstrualLogSchema = z.object({
  cycleId: z.string().min(1),
  /** Local calendar date the entry describes (YYYY-MM-DD). */
  logDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "logDate must be a YYYY-MM-DD string"),
  // Point 2 — flow intensity & clots.
  flowIntensity: z.enum(["SPOTTING", "LIGHT", "MEDIUM", "HEAVY"]).optional().nullable(),
  hasClots: z.boolean().optional().default(false),
  flowColor: z.string().max(20).optional().nullable(),
  // Point 3 — fibro-somatic symptoms (0-10).
  crampsSeverity: z.number().int().min(0).max(10).optional().default(0),
  headacheSeverity: z.number().int().min(0).max(10).optional().default(0),
  breastTenderness: z.number().int().min(0).max(10).optional().default(0),
  bloatingSeverity: z.number().int().min(0).max(10).optional().default(0),
  // Point 4 — GI / inflammatory flags.
  giDiarrhea: z.boolean().optional().default(false),
  giConstipation: z.boolean().optional().default(false),
  hormonalAcne: z.boolean().optional().default(false),
  // Point 5 — ovulation & fertility signatures.
  cervicalMucus: z.enum(["DRY", "STICKY", "CREAMY", "WATERY", "EGG_WHITE"]).optional().nullable(),
  opkResult: z.enum(["NEGATIVE", "POSITIVE", "NOT_USED"]).optional().nullable(),
  // Point 6 — mood & emotional sharpness (0-10).
  tearfulness: z.number().int().min(0).max(10).optional().default(0),
  anxietyLevel: z.number().int().min(0).max(10).optional().default(0),
  moodVolatility: z.number().int().min(0).max(10).optional().default(0),
  // Point 7 — daily bio-energy (1-10).
  energyLevel: z.number().int().min(1).max(10).optional().default(5),
  // Point 8 — neuro-hormonal libido (1-10).
  libidoLevel: z.number().int().min(1).max(10).optional().default(5),
  // Point 14 — sensory overload (Allodynia / Hyperacusis).
  lightSensitivity: z.enum(["NONE", "MILD", "MODERATE", "SEVERE"]).optional().default("NONE"),
  soundSensitivity: z.enum(["NONE", "MILD", "MODERATE", "SEVERE"]).optional().default("NONE"),
  notes: z.string().max(2000).optional().nullable(),
});

export const SymptomLogSchema = z.object({
  // Cap the symptom label (the server action path caps at 60; this is the
  // shared API ceiling) so nothing oversized reaches the unique index key.
  symptom: z.string().min(3).max(120),
  severity: z.number().int().min(1).max(10).default(5),
  category: z.enum(["PHYSICAL", "COGNITIVE", "MOOD"]),
  area: z.enum(["PELVIC", "LOWER_BACK", "WIDESPREAD", "JOINTS", "OTHER"]).optional(),
  // The whole app buckets symptoms by UTC YYYY-MM-DD string keys
  // (insight engine, correlations ranges) — enforce the exact format.
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must be a YYYY-MM-DD string"),
});

export const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"] as const;
export const MEAL_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export const MealItemInputSchema = z.object({
  // Food/ingredient name — the primary correlation key; bound before it
  // reaches the database so nothing oversized hits the plain-text matcher.
  name: z.string().trim().min(1, "Food name is required").max(120),
  // Optional serving note ("1 cup", "small bowl") — never trusted as data.
  // An empty/blank string is normalized to `undefined` so nothing empty is
  // persisted.
  amount: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string().trim().max(80).optional()
  ),
});

export const MealLogInputSchema = z.object({
  // Same UTC YYYY-MM-DD bucket convention as SymptomLog.date.
  date: z.string().regex(MEAL_DATE_RE, "date must be a YYYY-MM-DD string"),
  mealType: z.enum(MEAL_TYPES),
  // ISO timestamp of when the meal was eaten (defaults to now server-side).
  eatenAt: z.coerce.date().optional(),
  // Pre-meal energy/fatigue: 0 (very low) – 4 (full).
  energyBefore: z.number().int().min(0).max(4).default(2),
  // Free-text notes — length-capped here, sanitized + encrypted server-side.
  notes: z.string().max(2000).optional(),
  items: z.array(MealItemInputSchema).min(1, "Add at least one food").max(30),
});

export const TriggerFoodInputSchema = z.object({
  // Food/ingredient name — normalized (trim + lowercase) for the
  // case-insensitive per-user unique constraint.
  name: z.string().trim().min(1, "Trigger name is required").max(120),
  // 1 (mild) – 5 (severe) remembered reaction intensity.
  severity: z.number().int().min(1).max(5).default(3),
  // Personal reaction note — length-capped here, encrypted server-side.
  reactionNote: z.string().max(2000).optional(),
});

export type MealItemInput = z.infer<typeof MealItemInputSchema>;
export type MealLogInput = z.infer<typeof MealLogInputSchema>;
export type TriggerFoodInput = z.infer<typeof TriggerFoodInputSchema>;
export type CycleLogInput = z.infer<typeof CycleLogSchema>;
export type CycleLogPatchInput = z.infer<typeof CycleLogPatchSchema>;
export type MenstrualLogInput = z.infer<typeof MenstrualLogSchema>;
export type SymptomLogInput = z.infer<typeof SymptomLogSchema>;

/** Fog Shield coping tools — which module the patient reached for. */
export const FOG_COPING_TOOLS = [
  "BREATH",
  "DUMP",
  "MICROTASK",
  "SOS",
  "NONE",
] as const;

/** Cap on situational trigger labels persisted per episode. */
export const FOG_TRIGGERS_MAX = 12;

/**
 * Fibro-fog / cognitive-fatigue episode log (Fog Shield). `intensity` is
 * self-reported 1 (mild haze) – 10 (overwhelmed); `triggers` are short
 * situational labels; `brainDumpText` is free text capped here and then
 * sanitized + encrypted server-side; `copingToolUsed` records the grounding
 * module reached for. Triggers are bounded so no oversized array reaches the
 * TEXT[] column.
 */
export const FogLogInputSchema = z.object({
  intensity: z.number().int().min(1).max(10).default(5),
  triggers: z
    .array(z.string().trim().min(1).max(40))
    .max(FOG_TRIGGERS_MAX)
    .default([]),
  brainDumpText: z.string().max(4000).optional(),
  copingToolUsed: z.enum(FOG_COPING_TOOLS).default("NONE"),
});

export type FogLogInput = z.infer<typeof FogLogInputSchema>;
