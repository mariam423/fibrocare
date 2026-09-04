/**
 * Zod schemas for the AI Dynamic Article Generator.
 *
 * The generator emits a structured article that the server action then
 * persists to the DoctorPost table. Validation here is the front line of
 * defence against model hallucination: it enforces length, requires tags,
 * and makes sure a summary exists.
 */

import { z } from "zod";

export const generatedArticleSchema = z.object({
  title: z
    .string()
    .min(10)
    .max(140)
    .describe("Patient-friendly article title"),
  content: z
    .string()
    .min(200)
    .describe(
      "Markdown article body with ## headings, bullet points, and a closing disclaimer."
    ),
  tags: z
    .array(z.string().min(1).max(24))
    .min(1)
    .max(5)
    .describe("Short topic tags (e.g., sleep, pain, exercise)"),
  summary: z
    .string()
    .min(30)
    .max(280)
    .describe("One-paragraph preview shown on the article card."),
});

export type GeneratedArticle = z.infer<typeof generatedArticleSchema>;

/** Response envelope returned by the public-facing server action. */
export const generatedArticleResultSchema = z.object({
  postId: z.string(),
  topicId: z.string(),
  slug: z.string(),
  /// Language the article was generated in. The library passes this
  /// through to the card so the lang attribute on the rendered
  /// article is always consistent with the body.
  language: z.enum(["en", "ar"]),
  title: z.string(),
  content: z.string(),
  summary: z.string(),
  tags: z.array(z.string()),
  authorName: z.string(),
  authorTitle: z.string(),
  authorityLabel: z.string(),
  reference: z.string(),
  readingMinutes: z.number().int().min(1).max(15),
  createdAt: z.string(),
});

export type GeneratedArticleResult = z.infer<typeof generatedArticleResultSchema>;
