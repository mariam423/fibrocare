/**
 * GET /api/ai/articles/generate?topic=<topicId>&language=<en|ar>
 *
 * Returns a verified, patient-friendly article for a curated topic, in
 * the caller's preferred language. The topic id is matched against a
 * closed catalogue so the LLM can never pick its own subject matter.
 * If a post already exists for the (topic, language) pair, it is
 * returned as-is.
 *
 * Doctor Hub calls this on first visit (via the seed endpoint) so the
 * public feed always has content, and per-topic when a user picks a
 * topic from the generator picker. The seed endpoint generates both
 * languages, so this route is a no-op for a (topic, language) pair
 * that already has a row.
 */

import { NextRequest } from "next/server";
import { ensureArticleForTopic, listArticleTopics } from "@/app/pro/doctor-article-actions";
import { listArticleTopicSchema } from "@/app/api/ai/articles/_schema";
import { LOCALE_COOKIE, parseLocale } from "@/lib/locale";
import { checkRateLimitDistributed } from "@/lib/ai/ratelimit";

export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const topicId = url.searchParams.get("topic") ?? url.searchParams.get("topicId");
  if (!topicId) {
    return Response.json(
      { error: "Missing ?topic=<topicId> parameter.", topics: await listArticleTopics() },
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

  // The `language` query param wins over the cookie. Absent that,
  // the cookie (set by the language switcher) is the source of
  // truth — the same value the SSR layout uses for `lang`/`dir`.
  const langParam = url.searchParams.get("language");
  const language: "en" | "ar" =
    langParam === "en" || langParam === "ar"
      ? langParam
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

  // Per-IP budget on top of the per-topic limit: this endpoint is public
  // (patient-facing Doctor Hub) and triggers LLM generation, so bound how
  // much a single client can spend. 30 generates / minute is far beyond
  // any legit sweep over the closed topic catalogue.
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
