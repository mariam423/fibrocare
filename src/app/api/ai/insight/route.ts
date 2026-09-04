import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { streamText } from "ai";
import { authOptions } from "@/lib/auth";
import {
  getModel,
  getProviderDisplayName,
  isAiConfigured,
  isMockMode,
  recordAiFailure,
  recordAiSuccess,
} from "@/lib/ai/provider";
import { mockNarration, mockStreamResponse } from "@/lib/ai/mock";
import { getCachedHealthSnapshot, getCachedInsightSummaries } from "@/lib/ai/snapshotCache";
import { buildNarrationPrompt } from "@/lib/ai/prompts";
import { checkFeatureRateLimit } from "@/lib/ai/ratelimit";
import { parseLocale, LOCALE_COOKIE } from "@/lib/locale";
import { translations } from "@/lib/translations";

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

  const { ok, resetAt } = await checkFeatureRateLimit(session.user.id);
  if (!ok) {
    const retryAfter = Math.max(1, Math.ceil((resetAt - Date.now()) / 1000));
    return Response.json(
      { error: "Give the AI a moment — try again shortly." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  if (!isMockMode() && !isAiConfigured()) {
    return Response.json({ offline: true });
  }

  const userName = session.user.name ?? "there";
  const [snapshot, insights] = await Promise.all([
    getCachedHealthSnapshot(session.user.id),
    getCachedInsightSummaries(session.user.id, 30),
  ]);

  if (isMockMode()) {
    console.log(`[ai] insight · mode=mock`);
    const locale = parseLocale((await cookies()).get(LOCALE_COOKIE)?.value);
    const missingLogsFallback = translations[locale]["narration.missingLogsFallback"];
    return mockStreamResponse(mockNarration(snapshot, insights, userName, missingLogsFallback));
  }

  const model = getModel();
  if (!model) {
    return Response.json({ offline: true });
  }

  const result = streamText({
    model,
    system: buildNarrationPrompt(snapshot, insights, userName),
    prompt: "Explain my health data to me, kindly.",
    maxOutputTokens: 768, // Arabic-safe: ~2-3 tokens/word vs English
    // Watchdog timeouts, not a total cap (see /api/chat route): abort only
    // when the first token is late or the stream stalls mid-flight.
    timeout: { firstChunkMs: 20_000, chunkMs: 30_000 },
    maxRetries: 2,
    onFinish: async ({ usage }) => {
      recordAiSuccess();
      console.log(
        `[ai] insight · provider=${getProviderDisplayName()} · in=${usage.inputTokens} out=${usage.outputTokens}`
      );
    },
    onError: ({ error }) => {
      recordAiFailure();
      console.error("[ai] insight · provider stream error", error);
    },
  });

  return result.toUIMessageStreamResponse();
}
