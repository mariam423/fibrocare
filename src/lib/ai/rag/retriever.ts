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

export interface RetrieveOptions {
  /** Router-matched domains — chunks in these domains get a boost. */
  domains?: RagDomain[];
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
  const { domains = [], topK = 3, minScore = 0.15 } = options;
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return [];

  const domainSet = new Set(domains);
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

    let normalized = maxPossible > 0 ? score / maxPossible : 0;
    if (domainSet.size > 0 && chunk.domains.some((d) => domainSet.has(d))) {
      normalized = Math.min(1, normalized * 1.5);
    }

    return { chunk, normalized };
  });

  return scored
    .filter((s) => s.normalized >= minScore)
    .sort((a, b) => b.normalized - a.normalized || a.chunk.id.localeCompare(b.chunk.id))
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
 */
export async function retrieveKnowledge(
  query: string,
  options: RetrieveOptions = {}
): Promise<{ chunks: RetrievedChunk[]; source: "vector" | "local" }> {
  // No vector backend is wired today — the local retriever is the honest,
  // deterministic default. A real provider would be called here behind
  // isVectorProviderConfigured() with a timeout + try/catch falling back to
  // localRetrieve so retrieval can never break the chat.
  void isVectorProviderConfigured;
  return { chunks: localRetrieve(query, options), source: "local" };
}
