/**
 * Zod schemas for the Weather–Symptom Correlation Engine.
 *
 * The engine is deterministic statistics (Pearson correlation over the
 * user's own logged days) — the LLM is never asked to invent a correlation.
 * These schemas validate both the computed analytics and the proactive
 * insights derived from them before they reach the UI.
 */

import { z } from "zod";

/** One weather metric correlated against daily average pain. */
export const weatherCorrelationSchema = z.object({
  metric: z.enum(["humidity", "pressure", "temperature"]),
  /** Pearson r in [-1, 1]; 0 when there is not enough data. */
  coefficient: z.number().min(-1).max(1),
  /** Distinct days that contributed to the calculation. */
  sampleDays: z.number().int().min(0),
  /** |r| < 0.2 negligible · 0.2–0.4 weak · 0.4–0.6 moderate · > 0.6 strong. */
  strength: z.enum(["negligible", "weak", "moderate", "strong"]),
  /** Direction of the relationship for plain-language rendering. */
  direction: z.enum(["pain-increasing", "pain-decreasing", "none"]),
  /** Whether the metric was also correlated against NEXT-day pain (lag-1). */
  lagged: z.boolean(),
});

export type WeatherCorrelation = z.infer<typeof weatherCorrelationSchema>;

/** A proactive, actionable insight derived from current weather + history. */
export const proactiveInsightSchema = z.object({
  id: z.string().min(1),
  /** "high" → act today · "watch" → worth noticing · "info" → context only. */
  severity: z.enum(["high", "watch", "info"]),
  headline: z.string().min(1).max(120),
  detail: z.string().min(1).max(400),
  recommendation: z.string().min(1).max(240),
});

export type ProactiveInsight = z.infer<typeof proactiveInsightSchema>;

/** Full engine output. */
export const weatherSymptomAnalysisSchema = z.object({
  correlations: z.array(weatherCorrelationSchema),
  insights: z.array(proactiveInsightSchema),
  /** How many logged days powered the analysis (0 → all-insights-off). */
  sampleDays: z.number().int().min(0),
  /** Where the weather series came from — surfaced honestly to the user. */
  weatherSource: z.enum(["live", "estimated"]),
});

export type WeatherSymptomAnalysis = z.infer<typeof weatherSymptomAnalysisSchema>;
