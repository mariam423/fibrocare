import { getServerSession } from "next-auth";
import { generateObject } from "ai";
import { authOptions } from "@/lib/auth";
import {
  getModel,
  getProviderDisplayName,
  isAiConfigured,
  isMockMode,
  recordAiFailure,
  recordAiSuccess,
} from "@/lib/ai/provider";
import { mockDoctorQuestions } from "@/lib/ai/mock";
import { getCachedHealthSnapshot, getCachedInsightSummaries } from "@/lib/ai/snapshotCache";
import { buildDoctorQuestionsPrompt } from "@/lib/ai/prompts";
import {
  doctorQuestionsSchema,
  type DoctorQuestions,
} from "@/lib/ai/schemas";
import { checkFeatureRateLimit } from "@/lib/ai/ratelimit";
import { TtlCache } from "@/lib/ai/cache";
import type { Locale } from "@/lib/translations";

export const maxDuration = 30;

/** Exact-response cache: same data → same questions, no repeat spend. */
const questionsCache = new TtlCache<DoctorQuestions["questions"]>();

/**
 * Structured doctor questions generated from the user's real logs.
 * Returns validated JSON; deterministic summaries keep their own questions
 * as a fallback when the AI is offline.
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Please sign in first." }, { status: 401 });
  }

  // UI locale — whitelisted to the shipped locales (mirrors the chat route);
  // anything but "ar" stays English.
  let locale: Locale = "en";
  try {
    const body = await request.json();
    if (body?.locale === "ar") locale = "ar";
  } catch {
    // Empty/invalid body → English questions.
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
    console.log(`[ai] questions · mode=mock`);
    return Response.json({
      questions: mockDoctorQuestions(snapshot, insights).questions,
    });
  }

  const model = getModel();
  if (!model) {
    return Response.json({ offline: true });
  }

  // Locale is part of the cache key — Arabic and English answers are
  // different artifacts and must never be served cross-locale.
  const cacheKey = `doctor-questions:${session.user.id}:${snapshot.logCount30d}:${snapshot.lastLogAt ?? "none"}:${locale}`;
  const questions = await questionsCache.getOrSet(cacheKey, async () => {
    try {
      const { object, usage } = await generateObject({
        model,
        schema: doctorQuestionsSchema,
        system: buildDoctorQuestionsPrompt(snapshot, insights, userName, locale),
        prompt: "Generate my doctor questions.",
        temperature: 0.2,
        maxOutputTokens: 1024, // Arabic-safe headroom for structured output
      });
      // Double validation at the boundary — never trust the provider blindly.
      const parsed = doctorQuestionsSchema.parse(object);
      recordAiSuccess();
      console.log(
        `[ai] questions · provider=${getProviderDisplayName()} · in=${usage.inputTokens} out=${usage.outputTokens}`
      );
      return parsed.questions;
    } catch (err) {
      recordAiFailure();
      throw err;
    }
  });

  return Response.json({ questions });
}
