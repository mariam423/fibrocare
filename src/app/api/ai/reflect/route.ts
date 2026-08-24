import { getServerSession } from "next-auth";
import { streamText } from "ai";
import { authOptions } from "@/lib/auth";
import {
  getModel,
  getProviderDisplayName,
  isAiConfigured,
  isMockMode,
} from "@/lib/ai/provider";
import { mockReflection, mockStreamResponse } from "@/lib/ai/mock";
import { buildHealthSnapshot } from "@/lib/ai/context";
import { buildReflectionPrompt } from "@/lib/ai/prompts";
import { checkFeatureRateLimit } from "@/lib/ai/ratelimit";

export const maxDuration = 45;

/** Empathetic reflection on a user's journal note (streamed). */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Please sign in first." }, { status: 401 });
  }

  const { ok } = checkFeatureRateLimit(session.user.id);
  if (!ok) {
    return Response.json(
      { error: "Give the AI a moment — try again shortly." },
      { status: 429 }
    );
  }

  let note = "";
  try {
    const body = await req.json();
    note = typeof body?.note === "string" ? body.note.trim() : "";
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  if (note.length < 5 || note.length > 2000) {
    return Response.json(
      { error: "Please write a note between 5 and 2000 characters." },
      { status: 400 }
    );
  }

  if (!isMockMode() && !isAiConfigured()) {
    return Response.json({ offline: true });
  }

  const userName = session.user.name ?? "there";
  const snapshot = await buildHealthSnapshot(session.user.id);

  if (isMockMode()) {
    console.log(`[ai] reflect · mode=mock`);
    return mockStreamResponse(mockReflection(note, snapshot, userName));
  }

  const model = getModel();
  if (!model) {
    return Response.json({ offline: true });
  }

  const result = streamText({
    model,
    system: buildReflectionPrompt(note, snapshot, userName),
    prompt: "Reflect on this journal note with warmth and specificity.",
    maxOutputTokens: 768, // Arabic-safe: ~2-3 tokens/word vs English
    timeout: 30_000,
    onFinish: async ({ usage }) => {
      console.log(
        `[ai] reflect · provider=${getProviderDisplayName()} · in=${usage.inputTokens} out=${usage.outputTokens}`
      );
    },
  });

  return result.toUIMessageStreamResponse();
}
