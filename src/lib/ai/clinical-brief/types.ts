/**
 * Zod schemas for the 1-Page AI Clinical Executive Brief.
 *
 * A concise, clinically phrased summary a specialist can scan in a minute:
 * flare frequency, top triggers, symptom velocity, functional capacity,
 * medication mentions, and suggested discussion points. All numbers come
 * from deterministic analytics over the patient's real 30-day logs — the
 * LLM (when present) only polishes phrasing against these schemas.
 */

import { z } from "zod";

export const clinicalBriefSchema = z.object({
  generatedAt: z.string(),
  periodDays: z.number().int().min(7).max(90),
  headline: z.string().min(1).max(200),
  flareFrequency: z.object({
    flareDays: z.number().int().min(0),
    perMonth: z.number().min(0),
    trend: z.enum(["rising", "stable", "falling", "insufficient-data"]),
  }),
  painProfile: z.object({
    average: z.number().min(0).max(10).nullable(),
    average7d: z.number().min(0).max(10).nullable(),
    peak: z.number().min(0).max(10).nullable(),
    velocity: z.enum(["improving", "stable", "worsening", "insufficient-data"]),
    /** Change in 7-day average vs the prior period, in points. */
    velocityDelta: z.number().min(-10).max(10).nullable(),
  }),
  topTriggers: z
    .array(
      z.object({
        factor: z.string().min(1),
        evidence: z.string().min(1).max(240),
      })
    )
    .max(5),
  symptomProfile: z.object({
    mostReported: z.array(z.string()).max(6),
    distinctCount: z.number().int().min(0),
  }),
  functionalCapacity: z.object({
    loggingStreakDays: z.number().int().min(0),
    loggingAdherencePct: z.number().min(0).max(100),
    moodPattern: z.string().min(1).max(160),
  }),
  patientReportedMedications: z.array(z.string()).max(8),
  redFlags: z.array(z.string().min(1).max(240)).max(4),
  suggestedDiscussionPoints: z.array(z.string().min(1).max(200)).min(1).max(5),
  dataCaveat: z.string().min(1),
});

export type ClinicalBrief = z.infer<typeof clinicalBriefSchema>;
