import { z } from "zod";

/**
 * Zod contracts for the Direct Doctor Publishing Hub.
 *
 * Three content kinds a verified doctor can publish:
 *  - "article"  — structured patient-education articles
 *  - "research" — research summaries / paper digests (citations encouraged)
 *  - "status"   — short clinical status updates / personal posts
 *
 * Every publishing path (server action + REST route) parses its input
 * through `doctorPostInputSchema` BEFORE sanitization and persistence, so
 * malformed or oversized payloads fail fast with field-level errors
 * instead of reaching Prisma or the AI provider.
 */

export const DOCTOR_POST_KINDS = ["article", "research", "status"] as const;
export type DoctorPostKind = (typeof DOCTOR_POST_KINDS)[number];

export const doctorPostInputSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, "Title must be at least 5 characters.")
    .max(120, "Title is limited to 120 characters."),
  content: z
    .string()
    .trim()
    .min(20, "Content must be at least 20 characters.")
    .max(10000, "Content is limited to 10000 characters."),
  tags: z
    .string()
    .trim()
    .max(200, "Tags are limited to 200 characters.")
    .optional()
    .default(""),
  kind: z.enum(DOCTOR_POST_KINDS).optional().default("article"),
});
export type DoctorPostInput = z.infer<typeof doctorPostInputSchema>;

/** Status updates are short-form content — enforce a tighter ceiling. */
export const STATUS_CONTENT_MAX = 1400;
export const doctorPostRefineSchema = doctorPostInputSchema.superRefine(
  (val, ctx) => {
    if (val.kind === "status" && val.content.length > STATUS_CONTENT_MAX) {
      ctx.addIssue({
        code: "custom",
        path: ["content"],
        message: `Status updates are limited to ${STATUS_CONTENT_MAX} characters.`,
      });
    }
  }
);

/**
 * AI publishing assistant input: doctor's raw clinical notes. Sanitized
 * for prompt injection (defense-in-depth on top of `sanitizeForPrompt`
 * inside the prompt builder) before it reaches the LLM.
 */
export const aiAssistantInputSchema = z.object({
  notes: z
    .string()
    .trim()
    .min(10, "Describe your idea in at least 10 characters.")
    .max(5000, "Notes are limited to 5000 characters."),
});
export type AiAssistantInput = z.infer<typeof aiAssistantInputSchema>;
