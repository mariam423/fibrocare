import { getServerSession } from "next-auth";
import { streamText } from "ai";
import { authOptions } from "@/lib/auth";
import {
  getModel,
  getProviderDisplayName,
  isAiConfigured,
  isMockMode,
} from "@/lib/ai/provider";
import { mockNarration, mockStreamResponse } from "@/lib/ai/mock";
import { buildHealthSnapshot, getInsightSummaries } from "@/lib/ai/context";
import { buildNarrationPrompt } from "@/lib/ai/prompts";
import { checkFeatureRateLimit } from "@/lib/ai/ratelimit";

export const maxDuration = 45;

/**
 * Personalized narration of the user's detected health patterns.
 * Streams a warm, human explanation of what their data says right now.
 */
export async function POST() {
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

  if (!isMockMode() && !isAiConfigured()) {
    return Response.json({ offline: true });
  }

  const userName = session.user.name ?? "there";
  const [snapshot, insights] = await Promise.all([
    buildHealthSnapshot(session.user.id),
    getInsightSummaries(session.user.id, 30),
  ]);

  if (isMockMode()) {
    console.log(`[ai] insight · mode=mock`);
    return mockStreamResponse(mockNarration(snapshot, insights, userName));
  }

  const model = getModel();
  if (!model) {
    return Response.json({ offline: true });
  }

  const result = streamText({
    model,
    system: buildNarrationPrompt(snapshot, insights, userName),
    prompt: "Explain my health data to me, kindly.",
    maxOutputTokens: 380,
    timeout: 30_000,
    onFinish: async ({ usage }) => {
      console.log(
        `[ai] insight · provider=${getProviderDisplayName()} · in=${usage.inputTokens} out=${usage.outputTokens}`
      );
    },
  });

  return result.toUIMessageStreamResponse();
}
