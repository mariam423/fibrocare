/**
 * AI Companion orchestration — assembles the full context stack for one
 * chat turn in a single, testable place:
 *
 *   [Intent Router] → [Short-Term Window + Long-Term Snapshot]
 *                   → [RAG evidence when the query is medical]
 *                   → [Learned patient facts (encrypted client memory)]
 *                   → [Layered system prompt]
 *
 * The route stays thin; every dependency is injectable so unit tests can
 * run the whole pipeline without Prisma or a model.
 */

import type { ModelMessage } from "ai";
import {
  buildLongTermMemory,
  buildShortTermMemory,
  type LongTermMemory,
  type ShortTermMemory,
} from "@/lib/ai/memory";
import { routeQuery } from "@/lib/ai/rag/router";
import { retrieveKnowledge } from "@/lib/ai/rag/retriever";
import { buildRagContextBlock } from "@/lib/ai/rag/injector";
import type { RagRoute } from "@/lib/ai/rag/types";
import {
  buildCompanionSystemPrompt,
  buildUserMemoryBlock,
} from "@/lib/ai/prompts";
import { userFactsSchema, type UserFacts } from "@/lib/ai/memory/userMemory";

/** Injectable dependencies (defaults hit Prisma / the local retriever). */
export interface CompanionDeps {
  buildLongTermMemory?: (userId: string) => Promise<LongTermMemory>;
  retrieve?: typeof retrieveKnowledge;
}

export interface AssembleCompanionContextInput {
  userId: string;
  userName: string;
  /** Raw UI messages straight from the request body. */
  rawMessages: unknown[];
  /** Unvalidated learned facts sent by the encrypted client memory. */
  userFacts?: unknown;
  /**
   * UI locale ("en" | "ar"). "ar" activates strict Arabic output isolation
   * and localized snapshot labels; omitted/unknown falls back to "en".
   */
  locale?: "en" | "ar";
}

export interface CompanionContext {
  systemPrompt: string;
  messages: ModelMessage[];
  lastUserText: string;
  ragRoute: RagRoute;
  ragChunkCount: number;
  /** Validated facts actually used (null when absent/invalid). */
  userFacts: UserFacts | null;
}

/**
 * Build everything the stream call needs. Retrieval failures degrade to
 * "no RAG block" — the companion must keep answering offline.
 */
export async function assembleCompanionContext(
  input: AssembleCompanionContextInput,
  deps: CompanionDeps = {}
): Promise<CompanionContext> {
  const buildLong = deps.buildLongTermMemory ?? buildLongTermMemory;
  const retrieve = deps.retrieve ?? retrieveKnowledge;

  const shortTerm: ShortTermMemory = buildShortTermMemory(input.rawMessages);
  const longTerm = await buildLong(input.userId);

  // Client memory arrives over the wire — treat it as untrusted data and
  // re-validate with the same strict schema before it touches a prompt.
  const parsedFacts = userFactsSchema.safeParse(input.userFacts);
  const facts: UserFacts | null = parsedFacts.success ? parsedFacts.data : null;

  const route = routeQuery(shortTerm.lastUserText);
  let ragContext = "";
  let ragChunkCount = 0;
  if (route.needsRetrieval && shortTerm.lastUserText) {
    try {
      const { chunks } = await retrieve(shortTerm.lastUserText, {
        domains: route.domains,
        topK: 3,
      });
      ragContext = buildRagContextBlock(chunks);
      ragChunkCount = chunks.length;
    } catch {
      // Retrieval must never break the chat.
      ragContext = "";
      ragChunkCount = 0;
    }
  }

  const systemPrompt = buildCompanionSystemPrompt(
    longTerm,
    input.userName,
    ragContext,
    facts ? buildUserMemoryBlock(facts) : "",
    input.locale === "ar" ? "ar" : "en"
  );

  return {
    systemPrompt,
    messages: shortTerm.messages,
    lastUserText: shortTerm.lastUserText,
    ragRoute: route,
    ragChunkCount,
    userFacts: facts,
  };
}
