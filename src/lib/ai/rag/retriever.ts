/**
 * Retrieval module: top-k knowledge chunk selection.
 *
 * Modular by design — the retrieval interface is provider-agnostic:
 *
 *  - VECTOR PROVIDER (when configured): if `EMBEDDINGS_API_KEY` /
 *    `VECTOR_DB_URL` are present, a real vector backend can be plugged into
 *    `vectorRetrieve` below. Not shipped enabled because the app must run
 *    fully offline (PWA promise).
 *
 *  - LOCAL FALLBACK (always available, deterministic): lexical similarity —
 *    IDF-weighted token overlap between the query and each chunk's
 *    keywords/title/content, plus a boost for domains matched by the router.
 *    No network, no keys, no non-determinism; scores are normalized to 0–1.
 */

import { KNOWLEDGE_BASE } from "./knowledge";
import { retrievedChunkSchema, type RetrievedChunk, type RagDomain } from "./types";
import { embed, getChunkVector, cosineSimilarity } from "./embeddings";
import { CHUNK_CATEGORY_INDEX, type KnowledgeCategory } from "./knowledgeBase";

export interface RetrieveOptions {
  /** Router-matched domains — chunks in these domains get a boost. */
  domains?: RagDomain[];
  /** Self-care categories (see knowledgeBase.ts) — same boost semantics. */
  categories?: KnowledgeCategory[];
  /** How many chunks to return (default 3). */
  topK?: number;
  /** Minimum normalized score to include a chunk (default 0.15). */
  minScore?: number;
}

export function isVectorProviderConfigured(): boolean {
  return Boolean(
    process.env.EMBEDDINGS_API_KEY?.trim() && process.env.VECTOR_DB_URL?.trim()
  );
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2);
}

/** Inverse document frequency over the knowledge base — rare terms rank higher. */
function buildIdf(): Map<string, number> {
  const df = new Map<string, number>();
  for (const chunk of KNOWLEDGE_BASE) {
    const seen = new Set(
      tokenize(`${chunk.title} ${chunk.keywords.join(" ")} ${chunk.content}`)
    );
    for (const term of seen) df.set(term, (df.get(term) ?? 0) + 1);
  }
  const idf = new Map<string, number>();
  for (const [term, count] of df) {
    idf.set(term, Math.log((KNOWLEDGE_BASE.length + 1) / (count + 0.5)));
  }
  return idf;
}

const IDF = buildIdf();

/**
 * Deterministic local retrieval. Always available — used directly when no
 * vector provider is configured and as the graceful fallback if a vector
 * backend errors or times out.
 */
export function localRetrieve(query: string, options: RetrieveOptions = {}): RetrievedChunk[] {
  const { domains = [], categories = [], topK = 3, minScore = 0.15 } = options;
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return [];

  const domainSet = new Set(domains);
  const categorySet = new Set(categories);
  const scored = KNOWLEDGE_BASE.map((chunk) => {
    // Each field contributes with a weight: keywords are the strongest signal.
    const fieldTokens = [
      { tokens: tokenize(chunk.keywords.join(" ")), weight: 3 },
      { tokens: tokenize(chunk.title), weight: 2 },
      { tokens: tokenize(chunk.content), weight: 1 },
    ];

    let score = 0;
    let maxPossible = 0;
    for (const field of fieldTokens) {
      const tokenSet = new Set(field.tokens);
      for (const qt of queryTokens) {
        maxPossible += field.weight;
        if (tokenSet.has(qt)) {
          score += field.weight * (1 + (IDF.get(qt) ?? 0));
        }
      }
    }

    // A rare-term match earns weight·(1+IDF), which can legitimately
    // overshoot the naive weight-only budget. Domain/category hints multiply
    // the RAW ratio so they participate in RANKING even when scores
    // saturate; the exposed score is clamped to [0,1] per the schema
    // contract (module docstring + retrievedChunkSchema).
    const rawNormalized = maxPossible > 0 ? score / maxPossible : 0;
    let rankScore = rawNormalized;
    if (domainSet.size > 0 && chunk.domains.some((d) => domainSet.has(d))) {
      rankScore *= 1.5;
    }
    if (
      categorySet.size > 0 &&
      (CHUNK_CATEGORY_INDEX.get(chunk.id) ?? []).some((c) => categorySet.has(c))
    ) {
      rankScore *= 1.5;
    }
    const normalized = Math.min(1, rankScore);

    return { chunk, normalized, rankScore };
  });

  return scored
    .filter((s) => s.normalized >= minScore)
    .sort(
      (a, b) =>
        b.rankScore - a.rankScore ||
        a.chunk.id.localeCompare(b.chunk.id)
    )
    .slice(0, topK)
    .map((s, idx) =>
      retrievedChunkSchema.parse({
        ...s.chunk,
        score: Math.round(s.normalized * 100) / 100,
        citation: idx + 1,
      })
    );
}

/**
 * Provider-agnostic entry point. Vector retrieval plugs in here when keys
 * exist; otherwise (or on any vector failure) the local retriever keeps the
 * pipeline fully functional offline.
 *
 * Hybrid ranking: lexical candidates are re-scored with a bonus-only local
 * embedding term (`lexical + 0.25 · cosine`). The bonus can lift semantically
 * related chunks but never lowers a score, so behavior is a strict refinement
 * of pure lexical retrieval — and it stays 100% offline and deterministic.
 */
const VECTOR_BONUS_WEIGHT = 0.25;

export async function retrieveKnowledge(
  query: string,
  options: RetrieveOptions = {}
): Promise<{ chunks: RetrievedChunk[]; source: "vector" | "local" }> {
  // No external vector backend is wired today. The hybrid below uses our own
  // deterministic embeddings (embeddings.ts) on top of lexical scores; a real
  // provider would replace this behind isVectorProviderConfigured() with a
  // timeout + try/catch falling back to localRetrieve so retrieval can never
  // break the chat.
  void isVectorProviderConfigured;

  const { topK = 3, minScore = 0.15 } = options;
  const pool = localRetrieve(query, {
    ...options,
    topK: Math.max(topK * 2, 6),
    minScore,
  });
  if (pool.length === 0) return { chunks: [], source: "local" };

  const queryVector = embed(query);
  const rescored = pool
    .map((candidate) => {
      const chunkVector = getChunkVector(candidate.id);
      const cosine = chunkVector
        ? Math.max(0, cosineSimilarity(queryVector, chunkVector))
        : 0;
      return { candidate, score: Math.min(1, candidate.score + VECTOR_BONUS_WEIGHT * cosine) };
    })
    .sort(
      (a, b) =>
        b.score - a.score || a.candidate.id.localeCompare(b.candidate.id)
    )
    .slice(0, topK)
    .map((s, idx) =>
      retrievedChunkSchema.parse({
        ...s.candidate,
        score: Math.round(s.score * 100) / 100,
        citation: idx + 1,
      })
    );

  return { chunks: rescored, source: "local" };
}
