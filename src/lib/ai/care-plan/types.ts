/**
 * Zod schemas for the Generative Adaptive Daily Care Plan.
 *
 * The plan is computed deterministically from the user's Spoon Theory
 * check-in and pain level (the "Energy Budget"), then — when a provider key
 * exists — optionally re-phrased/enriched by the LLM against these same
 * schemas. Offline, the deterministic plan stands on its own.
 */

import { z } from "zod";

export const PLAN_BLOCK_TYPES = [
  "gentle-movement",
  "rest",
  "hydration",
  "sensory-management",
  "mindful-break",
] as const;

export const planBlockSchema = z.object({
  id: z.string().min(1),
  type: z.enum(PLAN_BLOCK_TYPES),
  /** Morning / midday / afternoon / evening. */
  timeOfDay: z.enum(["morning", "midday", "afternoon", "evening"]),
  title: z.string().min(1).max(80),
  detail: z.string().min(1).max(240),
  /** Rough effort in spoons this block is budgeted to spend (0–3). */
  spoonCost: z.number().min(0).max(3),
  minutes: z.number().int().min(1).max(60),
});

export type PlanBlock = z.infer<typeof planBlockSchema>;

export const energyBudgetSchema = z.object({
  /** Total spoons the user says they woke up with (1–12). */
  totalSpoons: z.number().int().min(1).max(12),
  /** Spoons already spent today (0–12). */
  spentSpoons: z.number().int().min(0).max(12),
  /** What the plan may actually spend, after the pain adjustment. */
  availableSpoons: z.number().int().min(0).max(12),
  /** Pain level the budget was adjusted for, 0–10. */
  adjustedForPain: z.number().min(0).max(10),
  rationale: z.string().min(1).max(300),
});

export type EnergyBudget = z.infer<typeof energyBudgetSchema>;

export const carePlanSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  budget: energyBudgetSchema,
  blocks: z.array(planBlockSchema).min(1).max(8),
  /** One-line summary the card can render as its header. */
  summary: z.string().min(1).max(160),
  safetyNote: z.string().min(1).max(240),
});

export type CarePlan = z.infer<typeof carePlanSchema>;
