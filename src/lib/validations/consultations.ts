import { z } from "zod";

/**
 * Zod contracts for the Consultations & Symptom Structuring hub.
 *
 * Every server action under `/dashboard/consultations` parses its input
 * through one of these schemas BEFORE sanitization and persistence, so
 * malformed or oversized payloads fail fast with field-level errors
 * instead of reaching Prisma or the AI provider.
 */

/** Free-text symptom description the patient pastes into the structurer. */
export const symptomIntakeSchema = z.object({
  raw: z
    .string()
    .trim()
    .min(10, "Describe your symptoms in at least 10 characters.")
    .max(4000, "Keep the description under 4000 characters."),
  /** Persist parsed symptoms to the health log as part of the intake. */
  persist: z.boolean().default(false),
});
export type SymptomIntakeInput = z.infer<typeof symptomIntakeSchema>;

/** One symptom entry the structurer extracted from the free text. */
export const structuredSymptomSchema = z.object({
  symptom: z.string().min(1).max(120),
  severity: z.number().int().min(1).max(10),
  category: z.enum(["PHYSICAL", "COGNITIVE", "MOOD"]),
  area: z.enum(["PELVIC", "LOWER_BACK", "WIDESPREAD", "JOINTS", "OTHER"]).optional(),
});
export type StructuredSymptom = z.infer<typeof structuredSymptomSchema>;

/** Submission of structured symptoms (optionally logged) + a message to the doctor. */
export const symptomSubmissionSchema = z.object({
  consultationId: z.string().cuid().optional(),
  symptoms: z.array(structuredSymptomSchema).max(12).default([]),
  message: z
    .string()
    .trim()
    .max(5000, "Messages are limited to 5000 characters.")
    .optional(),
  persist: z.boolean().default(false),
});
export type SymptomSubmissionInput = z.infer<typeof symptomSubmissionSchema>;

/** Secure message sent inside a consultation thread. */
export const consultationMessageSchema = z.object({
  consultationId: z.string().cuid(),
  content: z
    .string()
    .trim()
    .min(1, "Message cannot be empty.")
    .max(5000, "Messages are limited to 5000 characters."),
});
export type ConsultationMessageInput = z.infer<typeof consultationMessageSchema>;
