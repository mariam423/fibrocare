/**
 * Zod schemas for the public-facing AI articles API. Kept small and
 * shared between the three routes in this folder.
 */

import { z } from "zod";

export const listArticleTopicSchema = z.object({
  topicId: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[a-z0-9-]+$/i, "Topic id may only contain letters, digits, and dashes."),
});

export type ListArticleTopicInput = z.infer<typeof listArticleTopicSchema>;
