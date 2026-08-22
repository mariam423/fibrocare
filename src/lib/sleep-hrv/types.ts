/**
 * Zod schemas for the Sleep Architecture & HRV module.
 */

import { z } from "zod";

export const sleepNightSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  hoursSlept: z.number().min(0).max(24),
  deepSleepPct: z.number().min(0).max(100).nullable(),
  awakenings: z.number().int().min(0).max(60),
  hrvMs: z.number().min(0).max(500).nullable(),
  restingHr: z.number().min(30).max(220).nullable(),
  steps: z.number().int().min(0).max(100_000).nullable(),
  selfReportedRest: z.number().int().min(1).max(5),
});

export const sleepAnalysisSchema = z.object({
  date: z.string(),
  /** Deep sleep verdict against age norm (~13–23% is typical for adults). */
  deepSleepStatus: z.enum(["low", "normal", "high", "unknown"]),
  /** Heuristic flag for alpha–delta intrusion pattern (non-restorative sleep). */
  alphaDeltaPattern: z.enum(["likely", "possible", "unlikely", "insufficient-data"]),
  /** Pearson r between deep sleep % and HRV across the series (if enough data). */
  deepHrvCorrelation: z.number().min(-1).max(1).nullable(),
  fogRisk: z.object({
    score: z.number().min(0).max(10),
    level: z.enum(["low", "moderate", "high"]),
    guidance: z.string().min(1),
  }),
});

export const wearablePayloadSchema = z.object({
  source: z.enum(["apple-health", "google-fit", "manual", "mock"]),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  restingHr: z.number().min(30).max(220),
  steps: z.number().int().min(0).max(100_000),
  hrvMs: z.number().min(0).max(500),
  deepSleepPct: z.number().min(0).max(100).nullable(),
});
