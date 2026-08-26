/**
 * Zod schemas for doctor publishing AI outputs.
 *
 * These validate structured responses from the Doctor AI Publishing
 * Assistant — which takes raw clinical notes and formats them into
 * evidence-backed patient guidance articles.
 */

import { z } from "zod";

/** Structured article output from the AI publishing assistant. */
export const doctorArticleSchema = z.object({
  title: z
    .string()
    .min(5)
    .max(120)
    .describe("A clear, patient-friendly article title"),
  content: z
    .string()
    .min(50)
    .describe(
      "Well-structured article content in Markdown format with headings, paragraphs, and evidence-based guidance"
    ),
  tags: z
    .array(z.string().min(1))
    .max(5)
    .describe("Relevant topic tags (e.g., sleep, pain management, exercise)"),
  summary: z
    .string()
    .min(10)
    .max(200)
    .describe("A brief one-paragraph summary of the article for previews"),
});

export type DoctorArticle = z.infer<typeof doctorArticleSchema>;

/** Structured clinical summary for the doctor's consultation view. */
export const clinicalSummarySchema = z.object({
  overview: z
    .string()
    .min(10)
    .describe(
      "A 2-3 sentence clinical overview of the patient's recent health status"
    ),
  painSummary: z
    .string()
    .describe("Summary of pain levels, trends, and flare patterns over 30 days"),
  medicationSummary: z
    .string()
    .describe("Summary of medications mentioned, adherence, and any concerns"),
  symptomSummary: z
    .string()
    .describe("Summary of reported symptoms and their frequency"),
  keyConcerns: z
    .array(z.string().min(1))
    .max(5)
    .describe("Top clinical concerns the doctor should be aware of"),
  suggestedFocus: z
    .string()
    .describe("Recommended topics to address in the consultation"),
});

export type ClinicalSummary = z.infer<typeof clinicalSummarySchema>;

/** AI-suggested response draft for the doctor. */
export const doctorResponseDraftSchema = z.object({
  draft: z
    .string()
    .min(20)
    .describe(
      "A professional, empathetic draft response to the patient's message"
    ),
  keyPoints: z
    .array(z.string().min(1))
    .max(4)
    .describe("Key points addressed in the response"),
  followUpQuestions: z
    .array(z.string().min(1))
    .max(3)
    .describe("Suggested follow-up questions for the doctor to consider"),
});

export type DoctorResponseDraft = z.infer<typeof doctorResponseDraftSchema>;

/** Patient symptom structuring output. */
export const symptomStructureSchema = z.object({
  structuredMessage: z
    .string()
    .min(20)
    .describe(
      "A clear, professional message summarizing the patient's symptoms, history, and concerns"
    ),
  categories: z
    .array(
      z.object({
        label: z.string().describe("Category label (e.g., Pain, Sleep, Mood)"),
        details: z.string().describe("Relevant details in this category"),
      })
    )
    .max(5)
    .describe("Organized symptom categories"),
  suggestedQuestions: z
    .array(z.string().min(1))
    .max(4)
    .describe("Questions the patient might want to ask their doctor"),
});

export type SymptomStructure = z.infer<typeof symptomStructureSchema>;
