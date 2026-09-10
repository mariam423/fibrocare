/**
 * POST /api/ai/articles/generate
 *
 * Returns a verified, patient-friendly article for a curated topic, in
 * the caller's preferred language. Requires authentication — only
 * signed-in users may trigger generation.
 *
 * The topic id is matched against a closed catalogue so the LLM can
 * never pick its own subject matter. If a post already exists for the
 * (topic, language) pair, it is returned as-is.
 */

import { NextRequest } from "next/server";
import { ensureArticleForTopic, listArticleTopics } from "@/app/pro/doctor-article-actions";
import { listArticleTopicSchema } from "@/app/api/ai/articles/_schema";
import { LOCALE_COOKIE, parseLocale } from "@/lib/locale";
import { checkRateLimitDistributed } from "@/lib/ai/ratelimit";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requirePermissionResponse } from "@/lib/auth/entitlement";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "You must be signed in." }, { status: 401 });
  }

  // Generation burns LLM budget — only verified doctors may trigger it.
  const denied = await requirePermissionResponse(session.user.id, "doctor:publish");
  if (denied) return denied;

  const body = await request.json().catch(() => ({}));
  const topicId = (body.topicId ?? body.topic) as string | undefined;
  if (!topicId) {
    return Response.json(
      { error: "Missing topicId in request body.", topics: await listArticleTopics() },
      { status: 400 }
    );
  }

  const parsed = listArticleTopicSchema.safeParse({ topicId });
  if (!parsed.success) {
    return Response.json(
      { error: "Unknown topic.", topics: await listArticleTopics() },
      { status: 400 }
    );
  }

  // The `language` body param wins over the cookie. Absent that,
  // the cookie (set by the language switcher) is the source of
  // truth — the same value the SSR layout uses for `lang`/`dir`.
  const bodyLang = body.language;
  const language: "en" | "ar" =
    bodyLang === "en" || bodyLang === "ar"
      ? bodyLang
      : parseLocale(request.cookies.get(LOCALE_COOKIE)?.value);

  // Coarse cross-instance rate limit: prevent two clients from racing
  // on the same (topic, language) LLM generation. `ensureArticleForTopic`
  // is DB-idempotent so a second concurrent caller just reads the row
  // the first one wrote — the limit exists to keep the provider budget
  // honest, not for correctness. 1 request per 10s per (topic, language).
  const { ok, resetAt } = await checkRateLimitDistributed(
    `generate:${parsed.data.topicId}:${language}`,
    1,
    10_000
  );
  if (!ok) {
    const retryAfter = Math.max(1, Math.ceil((resetAt - Date.now()) / 1000));
    return Response.json(
      { error: "An article for this topic was just generated — try again shortly." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  // Per-IP budget on top of the per-topic limit: this endpoint triggers
  // LLM generation, so bound how much a single client can spend.
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    "unknown";
  const ipLimit = await checkRateLimitDistributed(`generate-ip:${ip}`, 30, 60_000);
  if (!ipLimit.ok) {
    const retryAfter = Math.max(1, Math.ceil((ipLimit.resetAt - Date.now()) / 1000));
    return Response.json(
      { error: "Too many article generations — try again shortly." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  const result = await ensureArticleForTopic(parsed.data.topicId, language);
  if (!result.success) {
    return Response.json({ error: result.error }, { status: 500 });
  }
  return Response.json({ article: result.data });
}
