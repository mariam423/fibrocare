/**
 * Zod schemas for structured AI outputs.
 *
 * Every schema-validated response is parsed twice: the provider generates
 * against the schema (provider-native JSON mode) and we parse again at the
 * boundary before the data touches the UI.
 */

import { z } from "zod";

/** Empathetic journal reflection derived from a user's free-form note. */
export const reflectionSchema = z.object({
  headline: z
    .string()
    .min(1)
    .max(90)
    .describe("A warm, one-line summary of what the note conveys"),
  empathy: z
    .string()
    .min(1)
    .describe(
      "Acknowledge the SPECIFIC situation in the note, in your own words. No clichés."
    ),
  patterns: z
    .array(z.string().min(1))
    .max(3)
    .describe("Gentle observations about possible triggers or correlations"),
  gentleSuggestion: z
    .string()
    .min(1)
    .describe("One concrete, low-effort next step for today or tomorrow"),
  safetyNote: z
    .string()
    .min(1)
    .describe(
      "One line: if the note mentions crisis or worsening symptoms, suggest contacting their care team / emergency services. Otherwise a brief self-care reminder."
    ),
});

export type AiReflection = z.infer<typeof reflectionSchema>;

/** Questions generated for the user's next doctor appointment. */
export const doctorQuestionsSchema = z.object({
  questions: z
    .array(
      z.object({
        question: z
          .string()
          .min(1)
          .describe("A specific question the patient can ask their doctor"),
        reason: z
          .string()
          .min(1)
          .describe(
            "One short sentence explaining which log data prompted this question"
          ),
      })
    )
    .min(1)
    .max(6),
});

export type DoctorQuestions = z.infer<typeof doctorQuestionsSchema>;

/** Structured health snapshot served to the companion via a tool call. */
export const healthSnapshotSchema = z.object({
  currentPain: z.number().min(0).max(10).nullable(),
  avgPain7d: z.number().nullable(),
  avgPain30d: z.number().nullable(),
  flareDays30d: z.number().int().min(0),
  logCount30d: z.number().int().min(0),
  topSymptoms: z.array(z.string()),
  streakDays: z.number().int().min(0),
  mood: z.string().nullable(),
  lastLogAt: z.string().nullable(),
  trend: z.enum(["rising", "stable", "falling"]).nullable(),
  /**
   * The newest raw log entry verbatim — pain level, severity bucket, its own
   * note excerpt, and the symptoms logged that same day. This is what lets
   * the companion react to "where the user is right now" (e.g. a 10/10
   * severe flare this morning) instead of only 30-day aggregates. Optional
   * + nullable so every existing snapshot constructor stays valid.
   */
  latestLog: z
    .object({
      painLevel: z.number().min(0).max(10),
      moodTag: z.string().nullable(),
      severity: z.enum(["low", "moderate", "severe"]),
      loggedAt: z.string(),
      ageHours: z.number().min(0),
      noteExcerpt: z.string().nullable(),
      symptoms: z.array(z.string()),
    })
    .nullable()
    .optional(),
});

export type HealthSnapshot = z.infer<typeof healthSnapshotSchema>;
