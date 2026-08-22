import { getServerSession } from "next-auth";
import { streamText, tool } from "ai";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import {
  getModel,
  getProviderDisplayName,
  isAiConfigured,
  isMockMode,
} from "@/lib/ai/provider";
import {
  mockChatReply,
  mockStreamResponse,
} from "@/lib/ai/mock";
import { buildLongTermMemory, buildShortTermMemory } from "@/lib/ai/memory";
import { buildCompanionSystemPrompt } from "@/lib/ai/prompts";
import { routeQuery } from "@/lib/ai/rag/router";
import { retrieveKnowledge } from "@/lib/ai/rag/retriever";
import { buildRagContextBlock } from "@/lib/ai/rag/injector";
import { checkChatRateLimit } from "@/lib/ai/ratelimit";

export const maxDuration = 45;

/**
 * AI Care Companion — streaming chat with a structured Memory Layer.
 *
 * Short-term memory: the thread history the client sends is validated with
 * Zod and compacted (role-filtered, per-message and whole-window character
 * budgets) so long threads never bloat the prompt.
 *
 * Long-term memory: the user's 30-day health snapshot — pain averages, top
 * symptoms, flare trend, streak, patient-reported medications and current
 * weather — is built server-side from Prisma and embedded in the system
 * prompt, and also exposed as a tool for fresher data mid-conversation.
 *
 * When no provider key is configured the route reports `offline` and the
 * UI shows a graceful offline state instead of a broken chat — unless mock
 * mode is active, in which case deterministic, snapshot-grounded replies are
 * streamed over the same UI-message protocol (see `src/lib/ai/mock.ts`).
 *
 * Lives at the AI SDK default path `/api/chat` so the client can use
 * `useChat()` with zero transport config.
 */

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Please sign in first." }, { status: 401 });
  }

  const { ok, resetAt } = checkChatRateLimit(session.user.id);
  if (!ok) {
    return Response.json(
      {
        error:
          "You're chatting a lot right now — take a short break and try again in a minute.",
        resetAt,
      },
      { status: 429 }
    );
  }

  let memory: ReturnType<typeof buildShortTermMemory>;
  let pendingMessageId: string | null = null;
  try {
    const body = await req.json();
    const raw = Array.isArray(body?.messages) ? body.messages : [];
    // Short-term memory: validate + compact the thread (token-bloat guard).
    memory = buildShortTermMemory(raw);
    pendingMessageId = typeof body?.messageId === "string" ? body.messageId : null;
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  const { messages, lastUserText } = memory;

  const userName = session.user.name ?? "there";

  // Mock mode: deterministic, snapshot-grounded replies — no key required.
  if (isMockMode()) {
    const snapshot = await buildLongTermMemory(session.user.id);
    console.log(`[ai] chat · mode=mock`);
    return mockStreamResponse(
      mockChatReply(snapshot, userName, lastUserText || "hi"),
      pendingMessageId
    );
  }

  if (!isAiConfigured()) {
    return Response.json({ offline: true, error: "offline" });
  }

  const model = getModel();
  if (!model) {
    return Response.json({ offline: true, error: "offline" });
  }

  const longTerm = await buildLongTermMemory(session.user.id);

  // RAG: only informational/medical queries hit the knowledge base; casual
  // conversation skips retrieval. Local deterministic retriever — no keys,
  // no network, degrades to an empty block if nothing is relevant.
  const route = routeQuery(lastUserText);
  let ragContext = "";
  if (route.needsRetrieval && lastUserText) {
    try {
      const { chunks } = await retrieveKnowledge(lastUserText, {
        domains: route.domains,
        topK: 3,
      });
      ragContext = buildRagContextBlock(chunks);
      console.log(`[ai] rag · ${route.reason} · ${chunks.length} chunk(s)`);
    } catch (err) {
      console.warn("[ai] rag retrieval failed — continuing without context:", err);
    }
  }

  const result = streamText({
    model,
    system: buildCompanionSystemPrompt(longTerm, userName, ragContext),
    messages,
    maxOutputTokens: 700,
    timeout: 30_000,
    tools: {
      getHealthSnapshot: tool({
        description:
          "Fetch the user's latest health snapshot (current pain, averages, flares, top symptoms, streak, trend, mentioned medications, weather) when they ask about their data.",
        // AI SDK v7 renamed `parameters` to `inputSchema`.
        inputSchema: z.object({}),
        execute: async () =>
          JSON.stringify(await buildLongTermMemory(session.user.id)),
      }),
    },
    onFinish: async ({ usage }) => {
      console.log(
        `[ai] chat · provider=${getProviderDisplayName()} · in=${usage.inputTokens} out=${usage.outputTokens}`
      );
    },
  });

  return result.toUIMessageStreamResponse();
}
