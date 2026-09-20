import { getServerSession } from "next-auth";
import {
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  tool,
  type TextStreamPart,
  type ToolSet,
} from "ai";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { privacyLockResponse } from "@/lib/security/privacyPin";
import { requirePermissionResponse } from "@/lib/auth/entitlement";
import {
  getFailoverOrder,
  getModel,
  isAiConfigured,
  isMockMode,
  recordAiFailure,
  recordAiSuccess,
} from "@/lib/ai/provider";
import {
  mockChatReply,
  mockStreamResponse,
} from "@/lib/ai/mock";
import { buildLongTermMemory, buildShortTermMemory } from "@/lib/ai/memory";
import { checkChatRateLimit, checkDailyAndMonthlyBudget } from "@/lib/ai/ratelimit";
import { createGuardrailStreamTransform } from "@/lib/ai/guardrails";
import { assembleCompanionContext } from "@/lib/ai/companion";
import { recordChatAuthFailure } from "@/lib/ai/chatAuthMonitor";

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

function unauthorizedResponse() {
  const authFailure = recordChatAuthFailure();
  if (authFailure.shouldAlert) {
    console.warn(
      `[auth] repeated chat authentication failures detected · count=${authFailure.count} · window=${5}m`
    );
  }

  const response = Response.json(
    { error: "Please sign in first." },
    { status: 401 }
  );

  // Remove stale tokens so the companion's login redirect can establish a
  // fresh session instead of sending the same undecryptable JWT repeatedly.
  for (const name of [
    "next-auth.session-token",
    "__Secure-next-auth.session-token",
  ]) {
    response.headers.append(
      "Set-Cookie",
      `${name}=; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax`
    );
  }

  return response;
}

type StreamProbe =
  | {
      outcome: "ok";
      replay: () => ReadableStream<TextStreamPart<ToolSet>>;
    }
  | {
      outcome: "error";
      error: unknown;
    };

/**
 * Reads the leading parts of a `streamText` result until the first
 * content-bearing part or until the provider errors/ends without output. The
 * probe succeeds on the first content parts so the SSE response commits only
 * once a provider is actually talking; parts already read are buffered and
 * replayed, so nothing is lost.
 */
async function probeUntilFirstContent(
  stream: AsyncIterable<TextStreamPart<ToolSet>>
): Promise<StreamProbe> {
  const buffered: TextStreamPart<ToolSet>[] = [];
  const iterator = stream[Symbol.asyncIterator]();

  for (;;) {
    const { done, value } = await iterator.next();
    if (done) {
      return {
        outcome: "error",
        error: new Error("provider stream ended without content"),
      };
    }
    buffered.push(value);

    if (value.type === "error") {
      return { outcome: "error", error: value.error };
    }
    if (isContentPart(value)) {
      return { outcome: "ok", replay: () => replayFrom(buffered, iterator) };
    }
    if (value.type === "finish" || value.type === "abort") {
      // Ended (or was aborted) before any content: fail over rather than ship
      // an empty turn that the client would silently re-send.
      return {
        outcome: "error",
        error: new Error("provider produced no output"),
      };
    }
  }
}

function isContentPart(part: TextStreamPart<ToolSet>): boolean {
  switch (part.type) {
    case "text-start":
    case "text-delta":
    case "text-end":
    case "reasoning-start":
    case "reasoning-delta":
    case "reasoning-end":
    case "tool-input-start":
    case "tool-input-delta":
    case "tool-input-end":
    case "tool-call":
    case "tool-result":
    case "source":
    case "file":
    case "reasoning-file":
      return true;
    default:
      return false;
  }
}

/** Drains `buffered` first, then the still-open iterator, as a ReadableStream. */
function replayFrom<T>(
  buffered: T[],
  iterator: AsyncIterator<T>
): ReadableStream<T> {
  let index = 0;
  return new ReadableStream<T>({
    async pull(controller) {
      if (index < buffered.length) {
        controller.enqueue(buffered[index++]);
        return;
      }
      const { done, value } = await iterator.next();
      if (done) controller.close();
      else controller.enqueue(value);
    },
  });
}

export async function POST(req: Request) {
  let session;
  try {
    session = await getServerSession(authOptions);
  } catch (error) {
    console.error("[auth] chat session could not be decoded", error);
    return unauthorizedResponse();
  }

  if (!session?.user?.id) {
    return unauthorizedResponse();
  }

  // Privacy lock: a configured PIN hides the user's health data. The
  // companion builds its memory from that data server-side, so the lock
  // must hold here too — a valid session cookie alone is not enough.
  const privacyBlocked = await privacyLockResponse(session.user.id);
  if (privacyBlocked) return privacyBlocked;

  // Server-side entitlement: the AI companion is a Pro feature. The
  // client may show it optimistically, but the route enforces it.
  const denied = await requirePermissionResponse(session.user.id, "ai:companion");
  if (denied) return denied;

  const { ok, resetAt } = await checkChatRateLimit(session.user.id);
  if (!ok) {
    const retryAfter = Math.max(1, Math.ceil((resetAt - Date.now()) / 1000));
    return Response.json(
      {
        error:
          "You're chatting a lot right now — take a short break and try again in a minute.",
        resetAt,
      },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  // Daily + monthly usage budget (caps total AI spend across the day/month)
  const budget = await checkDailyAndMonthlyBudget(session.user.id);
  if (!budget.ok) {
    return Response.json(
      { error: budget.error },
      { status: 429, headers: budget.resetAt ? { "Retry-After": String(Math.max(1, Math.ceil((budget.resetAt - Date.now()) / 1000))) } : {} }
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

  // In-route first-content failover. `streamText()` resolves synchronously —
  // the provider call runs detached inside the returned stream, so provider
  // errors arrive as `error` stream parts, never as a rejected await. The
  // legacy `streamTextWithFailover` can't see those (its try/catch is dead),
  // and the SDK's own retry backoff (default maxRetries: 2 = 2s + 4s sleeps
  // on 429/5xx) freezes the stream with no text before any failure surfaces.
  // Instead: fail fast (maxRetries: 0) and probe each provider's leading
  // stream parts until the first content or an error, transparently moving
  // to the next provider before any bytes reach the client.
  const failoverOrder = getFailoverOrder();
  let lastError: unknown = null;

  for (const provider of failoverOrder) {
    const providerModel = getModel(provider);
    if (!providerModel) continue;

    try {
      const result = await streamText({
        system: context.systemPrompt,
        messages: context.messages,
        maxOutputTokens: 2048,
        timeout: { firstChunkMs: 20_000, chunkMs: 30_000 },
        maxRetries: 0,
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
        onError: ({ error }) => {
          console.error("[ai] chat · provider stream error", error);
          recordAiFailure(provider);
        },
        onFinish: async ({ usage }) => {
          recordAiSuccess(provider);
          console.log(
            `[ai] chat · provider=${provider} · in=${usage.inputTokens} out=${usage.outputTokens}`
          );
        },
        model: providerModel,
      });

      const probe = await probeUntilFirstContent(result.stream);
      if (probe.outcome !== "ok") {
        lastError = probe.error;
        recordAiFailure(provider);
        console.error(
          "[ai] chat · provider failed before first content",
          provider,
          probe.error
        );
        continue;
      }

      // Layer 4 — medical guardrails: stream through the warm-therapy
      // sanitizer so cold-pack/ice slips are rewritten to "كمادات دافئة /
      // حمام دافئ" (warm compress / warm bath) without breaking the protocol.
      // Arabic streams additionally run the lexical leak sanitizer, which
      // repairs isolated foreign words ("logged", "streak", "aumento", "/zen")
      // into the approved Arabic glossary.
      const base = createUIMessageStreamResponse({
        stream: toUIMessageStream({
          stream: probe.replay(),
          onError: (error) => {
            console.error("[ai] chat · provider stream error", error);
            recordAiFailure(provider);
            return "The AI provider hit an error mid-reply. Please try again.";
          },
        }),
      });
      const guarded = base.body?.pipeThrough(
        createGuardrailStreamTransform({ arabicLeaks: locale === "ar" })
      );
      if (!guarded) return base;
      return new Response(guarded, {
        status: base.status,
        statusText: base.statusText,
        headers: base.headers,
      });
    } catch (error) {
      // Synchronous/rejected provider setup — bad key, invalid model, abort.
      lastError = error;
      recordAiFailure(provider);
      console.error("[ai] chat · provider setup error", error);
    }
  }

  console.error("[ai] chat · all providers failed", lastError);
  return Response.json(
    { error: "The AI provider is unavailable right now." },
    { status: 502 }
  );
}
