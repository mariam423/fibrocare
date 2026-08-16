import { getServerSession } from "next-auth";
import { streamText, tool, type ModelMessage } from "ai";
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
import { buildHealthSnapshot } from "@/lib/ai/context";
import { buildCompanionSystemPrompt } from "@/lib/ai/prompts";
import { checkChatRateLimit } from "@/lib/ai/ratelimit";

export const maxDuration = 45;

/**
 * AI Care Companion — streaming chat with live health context.
 *
 * The user's health snapshot is embedded in the system prompt and also
 * exposed as a tool so the model can pull fresher data mid-conversation.
 * When no provider key is configured the route reports `offline` and the
 * UI shows a graceful offline state instead of a broken chat — unless mock
 * mode is active, in which case deterministic, snapshot-grounded replies are
 * streamed over the same UI-message protocol (see `src/lib/ai/mock.ts`).
 *
 * Lives at the AI SDK default path `/api/chat` so the client can use
 * `useChat()` with zero transport config.
 */

/** Pull the latest user text from an array of UI messages (v7 `parts` shape or legacy `content`). */
function extractLastUserText(raw: unknown[]): string {
  for (let i = raw.length - 1; i >= 0; i--) {
    const m = raw[i] as
      | {
          role?: string;
          content?: unknown;
          parts?: Array<{ type?: string; text?: string }>;
        }
      | null;
    if (!m || m.role !== "user") continue;
    if (typeof m.content === "string" && m.content.trim()) return m.content;
    const partsText = (m.parts ?? [])
      .filter((p) => p.type === "text" && typeof p.text === "string")
      .map((p) => p.text as string)
      .join("");
    if (partsText.trim()) return partsText;
  }
  return "";
}

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

  let messages: ModelMessage[];
  let lastUserText = "";
  let pendingMessageId: string | null = null;
  try {
    const body = await req.json();
    const raw = Array.isArray(body?.messages) ? body.messages : [];
    // Bound per-payload token spend: only the last 20 turns travel.
    messages = (raw.slice(-20) as ModelMessage[]).filter(
      (m) =>
        m &&
        typeof m === "object" &&
        (typeof (m as { role?: unknown }).role === "string" ||
          typeof (m as { content?: unknown }).content === "string")
    );
    lastUserText = extractLastUserText(raw);
    pendingMessageId = typeof body?.messageId === "string" ? body.messageId : null;
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const userName = session.user.name ?? "there";

  // Mock mode: deterministic, snapshot-grounded replies — no key required.
  if (isMockMode()) {
    const snapshot = await buildHealthSnapshot(session.user.id);
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

  const snapshot = await buildHealthSnapshot(session.user.id);

  const result = streamText({
    model,
    system: buildCompanionSystemPrompt(snapshot, userName),
    messages,
    maxOutputTokens: 700,
    timeout: 30_000,
    tools: {
      getHealthSnapshot: tool({
        description:
          "Fetch the user's latest health snapshot (current pain, averages, flares, top symptoms, streak, trend) when they ask about their data.",
        // AI SDK v7 renamed `parameters` to `inputSchema`.
        inputSchema: z.object({}),
        execute: async () =>
          JSON.stringify(await buildHealthSnapshot(session.user.id)),
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
