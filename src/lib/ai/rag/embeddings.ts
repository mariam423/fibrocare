/**
 * Lightweight local vector embeddings for the knowledge base.
 *
 * Zero-dependency, fully offline, deterministic: each text becomes a sparse
 * bag-of-terms (unigrams + character-trigrams for Arabic robustness)
 * hashed into a fixed-size L2-normalized vector. Cosine similarity then
 * measures semantic-ish overlap that pure keyword matching misses
 * (e.g. "unrefreshing sleep" ↔ "wakes up tired").
 *
 * This is deliberately NOT an API embeddings client — the PWA promise is
 * that retrieval never needs a network or a key. A real embedding provider
 * can later replace `embed()` behind the same interface.
 */

import { KNOWLEDGE_BASE } from "./knowledge";
import { retrievedChunkSchema, type RetrievedChunk } from "./types";
import type { RetrieveOptions } from "./retriever";

/** Vector dimensionality — power of two keeps modulo cheap and even. */
const DIMENSIONS = 256;

/** FNV-1a 32-bit hash — fast, stable across processes, no deps. */
function hash32(term: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < term.length; i++) {
    h ^= term.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function baseTokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

/**
 * All indexing features for a text: lowercased words plus character
 * trigrams of every word (trigrams give Arabic morphology a foothold —
 * كمادات/كمادة share most trigrams).
 */
function features(text: string): string[] {
  const words = baseTokens(text);
  const feats: string[] = [];
  for (const w of words) {
    feats.push(`w:${w}`);
    if (w.length < 3) continue;
    for (let i = 0; i + 3 <= w.length; i++) feats.push(`g:${w.slice(i, i + 3)}`);
  }
  return feats;
}

/** Deterministic embedding: hashed feature counts, L2-normalized. */
export function embed(text: string): Float64Array {
  const vec = new Float64Array(DIMENSIONS);
  const feats = features(text);
  for (const f of feats) {
    const idx = hash32(f) % DIMENSIONS;
    // Hashed terms collide; sign-hashing reduces their systematic bias.
    const sign = (hash32(f) >>> 31) & 1 ? -1 : 1;
    vec[idx] += sign;
  }
  let norm = 0;
  for (let i = 0; i < DIMENSIONS; i++) norm += vec[i] * vec[i];
  norm = Math.sqrt(norm);
  if (norm > 0) for (let i = 0; i < DIMENSIONS; i++) vec[i] /= norm;
  return vec;
}

/** Cosine similarity of two equal-length vectors (inputs are normalized). */
export function cosineSimilarity(a: Float64Array, b: Float64Array): number {
  let dot = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) dot += a[i] * b[i];
  return Math.max(-1, Math.min(1, dot));
}

/* ------------------------------------------------------------------ */
/* Chunk index                                                         */
/* ------------------------------------------------------------------ */

function chunkText(chunk: { title: string; keywords: string[]; content: string }): string {
  return `${chunk.title} ${chunk.keywords.join(" ")} ${chunk.content}`;
}

// Built once at module load — a few dozen chunks × 256 dims is trivially
// cheap and blocks nothing (pure array math well under a millisecond).
const CHUNK_VECTORS = KNOWLEDGE_BASE.map((chunk) => ({
  chunk,
  vector: embed(chunkText(chunk)),
}));

const CHUNK_VECTOR_INDEX = new Map(
  CHUNK_VECTORS.map(({ chunk, vector }) => [chunk.id, vector])
);

/** Precomputed embedding for a knowledge chunk (null if unknown id). */
export function getChunkVector(chunkId: string): Float64Array | null {
  return CHUNK_VECTOR_INDEX.get(chunkId) ?? null;
}

/**
 * Pure vector retrieval over the knowledge base: cosine similarity between
 * the query embedding and every chunk, top-k above `minScore`.
 */
export function vectorRetrieve(
  query: string,
  options: RetrieveOptions = {}
): RetrievedChunk[] {
  const { topK = 3, minScore = 0.05 } = options;
  if (!query.trim()) return [];
  const queryVector = embed(query);

  return CHUNK_VECTORS.map(({ chunk, vector }) => ({
    chunk,
    score: cosineSimilarity(queryVector, vector),
  }))
    .filter((s) => s.score >= minScore)
    .sort((a, b) => b.score - a.score || a.chunk.id.localeCompare(b.chunk.id))
    .slice(0, topK)
    .map((s, idx) =>
      retrievedChunkSchema.parse({
        ...s.chunk,
        score: Math.round(s.score * 100) / 100,
        citation: idx + 1,
      })
    );
}
