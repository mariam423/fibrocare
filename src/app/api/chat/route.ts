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
import { checkChatRateLimit } from "@/lib/ai/ratelimit";
import { createGuardrailStreamTransform } from "@/lib/ai/guardrails";
import { assembleCompanionContext } from "@/lib/ai/companion";

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
  let clientFacts: unknown = undefined;
  let rawMessages: unknown[] = [];
  // UI locale — whitelisted to the two shipped locales; anything but "ar"
  // keeps the legacy English prompt path untouched.
  let locale: "en" | "ar" = "en";
  try {
    const body = await req.json();
    rawMessages = Array.isArray(body?.messages) ? body.messages : [];
    // Short-term memory: validate + compact the thread (token-bloat guard).
    memory = buildShortTermMemory(rawMessages);
    pendingMessageId = typeof body?.messageId === "string" ? body.messageId : null;
    if (body?.locale === "ar") locale = "ar";
    clientFacts = body?.userFacts;
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const userName = session.user.name ?? "there";

  // Mock mode: deterministic, snapshot-grounded replies — no key required.
  if (isMockMode()) {
    const snapshot = await buildLongTermMemory(session.user.id);
    console.log(`[ai] chat · mode=mock`);
    return mockStreamResponse(
      mockChatReply(snapshot, userName, memory.lastUserText || "hi"),
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

  // Orchestration (companion.ts): intent router → memory layers → RAG →
  // learned patient facts → layered system prompt.
  const context = await assembleCompanionContext({
    userId: session.user.id,
    userName,
    rawMessages,
    userFacts: clientFacts,
    locale,
  });

  if (context.ragChunkCount > 0) {
    console.log(`[ai] rag · ${context.ragRoute.reason} · ${context.ragChunkCount} chunk(s)`);
  }

  const result = streamText({
    model,
    system: context.systemPrompt,
    messages: context.messages,
    // Truncation guard: Arabic tokenizes at ~2–3 tokens/word (vs ~1.3 for
    // English), and some provider tiers reason verbosely before answering.
    // 1536 leaves full headroom above the ~180-word persona budget while
    // still bounding cost; the prompt (not this cap) controls length.
    maxOutputTokens: 2048,
    timeout: 30_000,
    tools: {
      getHealthSnapshot: tool({
        description:
          "Fetch the user's latest health snapshot (the newest log entry with its pain level, severity, symptoms and note, plus current pain, averages, flares, top symptoms, streak, trend, mentioned medications, weather) when they ask about their data.",
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

  // Layer 4 — medical guardrails: stream through the warm-therapy
  // sanitizer so cold-pack/ice slips are rewritten to "كمادات دافئة /
  // حمام دافئ" (warm compress / warm bath) without breaking the protocol.
  // Arabic streams additionally run the lexical leak sanitizer, which
  // repairs isolated foreign words ("logged", "streak", "aumento", "/zen")
  // into the approved Arabic glossary.
  const base = result.toUIMessageStreamResponse();
  const guarded = base.body?.pipeThrough(
    createGuardrailStreamTransform({ arabicLeaks: locale === "ar" })
  );
  if (!guarded) return base;
  return new Response(guarded, {
    status: base.status,
    statusText: base.statusText,
    headers: base.headers,
  });
}
