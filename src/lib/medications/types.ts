/**
 * Zod schemas for the Medication & Safety Suite.
 *
 * User-supplied medication lists and adherence logs are validated here
 * before any interaction check or correlation runs.
 */

import { z } from "zod";

export const medicationEntrySchema = z.object({
  id: z.string().min(1),
  name: z
    .string()
    .min(2)
    .max(60)
    .transform((n) => n.trim().toLowerCase()),
  dose: z.string().min(1).max(60),
  timing: z.enum(["morning", "evening", "bedtime"]),
  kind: z.enum(["medication", "supplement"]),
});

export const medicationListSchema = z.array(medicationEntrySchema).max(24);

export const interactionAlertSchema = z.object({
  pair: z.tuple([z.string(), z.string()]),
  severity: z.enum(["critical", "warning", "caution"]),
  effect: z.string().min(1),
  recommendation: z.string().min(1),
});

export const adherencePointSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  takenOnSchedule: z.boolean(),
  morningPain: z.number().min(0).max(10).nullable(),
  sleepQuality: z.number().min(1).max(5).nullable(),
});

export const adherenceSeriesSchema = z.array(adherencePointSchema).max(90);

export const adherenceCorrelationSchema = z.object({
  comparedDays: z.number().int().min(0),
  /** Mean morning pain on adherent days minus non-adherent days (negative = meds help). */
  painDelta: z.number().nullable(),
  /** Mean sleep quality on adherent days minus non-adherent days (positive = meds help). */
  sleepDelta: z.number().nullable(),
  interpretation: z.string().min(1),
});

import type { MedicationEntry, MedicationAlert, AdherencePoint } from "@/types/extended-health";

export type { MedicationEntry, MedicationAlert, AdherencePoint };
