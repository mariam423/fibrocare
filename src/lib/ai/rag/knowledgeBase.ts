/**
 * Categorized index for the Fibromyalgia Knowledge Base.
 *
 * This module is the CATEGORY LAYER over the curated clinical chunks in
 * `knowledge.ts`. It intentionally holds NO duplicate clinical text — a
 * single source of truth keeps provenance auditable and prevents the two
 * views from drifting apart.
 *
 * The brief's four self-care categories map onto the flat chunk list:
 *
 *   - flare_management   : somatic micro-movements, sensory reduction,
 *                          warm therapy during flares (+ trigger awareness)
 *   - pain_and_stiffness : moist warm heat therapy; cold packs / ice are
 *                          contraindicated for fibromyalgia muscle pain
 *   - sleep_architecture : deep-sleep restoration, non-restorative fatigue
 *   - pacing_and_energy  : spoon theory, low-energy daily planning
 *
 * Chunks outside these four (diagnostic criteria, medications, general
 * management) remain fully retrievable through the domain router — they are
 * simply not part of the self-care category taxonomy.
 */

import { KNOWLEDGE_BASE } from "./knowledge";
import type { KnowledgeChunk } from "./types";

export const KB_CATEGORIES = [
  "flare_management",
  "pain_and_stiffness",
  "sleep_architecture",
  "pacing_and_energy",
] as const;

export type KnowledgeCategory = (typeof KB_CATEGORIES)[number];

/** Chunk id → self-care categories. Ids are validated against the KB. */
const CHUNK_CATEGORIES: Readonly<
  Record<string, readonly KnowledgeCategory[]>
> = {
  "flare-management": ["flare_management"],
  "weather-triggers": ["flare_management"],
  "warm-compress-heat-therapy": ["pain_and_stiffness", "flare_management"],
  "somatic-exercise-protocols": [
    "flare_management",
    "pain_and_stiffness",
  ],
  "sleep-hygiene": ["sleep_architecture"],
  "sleep-architecture-fibromyalgia": ["sleep_architecture"],
  "pacing-spoon-theory": ["pacing_and_energy"],
  "cognitive-symptoms-fibro-fog": ["pacing_and_energy"],
};

/** O(1) lookup used by the retriever's category boost. */
export const CHUNK_CATEGORY_INDEX: ReadonlyMap<string, readonly KnowledgeCategory[]> =
  new Map(Object.entries(CHUNK_CATEGORIES));

/** All categories a chunk belongs to (empty when it is outside the taxonomy). */
export function categoriesForChunk(
  chunkId: string
): readonly KnowledgeCategory[] {
  return CHUNK_CATEGORY_INDEX.get(chunkId) ?? [];
}

/** Chunks of one category, in knowledge-base order. Empty when unknown. */
export function chunksByCategory(category: KnowledgeCategory): KnowledgeChunk[] {
  return KNOWLEDGE_BASE.filter((chunk) =>
    categoriesForChunk(chunk.id).includes(category)
  );
}
