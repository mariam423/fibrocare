/**
 * Zod schemas for the RAG pipeline.
 *
 * Everything that crosses a module boundary inside the RAG layer is
 * schema-validated: knowledge chunks at definition time, retrieval results
 * before prompt injection, and router decisions before retrieval is skipped.
 */

import { z } from "zod";

/** Clinical topic domains the knowledge base covers (used by the router). */
export const RAG_DOMAINS = [
  "diagnosis",
  "flares",
  "exercise",
  "sleep",
  "medications",
  "pacing",
  "mental-health",
  "complementary",
] as const;

export type RagDomain = (typeof RAG_DOMAINS)[number];

/** A curated, immutable chunk of clinical knowledge with provenance. */
export const knowledgeChunkSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  /** Short human citation, e.g. "FibroCare clinical summary of ACR criteria". */
  source: z.string().min(1),
  domains: z.array(z.enum(RAG_DOMAINS)).min(1),
  keywords: z.array(z.string()).min(1),
  /** Plain-language, conservative summary. No dosage or prescriptive advice. */
  content: z.string().min(50).max(2000),
});

export type KnowledgeChunk = z.infer<typeof knowledgeChunkSchema>;

/** A retrieved chunk with its relevance score and assigned citation number. */
export const retrievedChunkSchema = knowledgeChunkSchema.extend({
  score: z.number().min(0).max(1),
  citation: z.number().int().min(1),
});

export type RetrievedChunk = z.infer<typeof retrievedChunkSchema>;

/** Router decision for a single user query. */
export const ragRouteSchema = z.object({
  needsRetrieval: z.boolean(),
  /** Domains the query plausibly touches — used to boost retrieval. */
  domains: z.array(z.enum(RAG_DOMAINS)),
  /** Brief reason, logged for observability. */
  reason: z.string(),
});

export type RagRoute = z.infer<typeof ragRouteSchema>;
