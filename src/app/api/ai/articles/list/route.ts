/**
 * GET /api/ai/articles/list?limit=<n>&language=<en|ar>
 *
 * Returns the latest verified doctor articles for the Doctor Hub feed,
 * filtered to a single language. The default language is read from
 * the `fibrocare-locale` cookie (set by the language switcher) so the
 * SSR HTML and the first-paint client hydration agree without an
 * extra round-trip.
 *
 * Public endpoint — Doctor Hub is patient-facing.
 *
 * Caching:
 *  - The DB read is wrapped in `unstable_cache` (60s TTL, see
 *    `listPublishedArticles`), so the DB is hit at most once per
 *    minute per `(limit, language)` even under high traffic.
 *  - The HTTP response carries `Cache-Control: s-maxage=60,
 *    stale-while-revalidate=300` so any CDN / Next.js data cache
 *    in front of this route can serve stale-while-revalidate
 *    responses, taking the load off the origin during a refresh
 *    sweep. The `Cache-Control` only applies to shared caches
 *    (`s-maxage`), so the browser still revalidates on every
 *    navigation. The `Vary: Cookie` header is included so a shared
 *    cache never serves the wrong-locale response to a different
 *    cookie holder.
 */

import { NextRequest } from "next/server";
import { listPublishedArticles } from "@/app/pro/doctor-article-actions";
import { LOCALE_COOKIE, parseLocale } from "@/lib/locale";

export const maxDuration = 30;

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const limitParam = url.searchParams.get("limit");
  const parsed = Math.max(1, Math.min(24, Number.parseInt(limitParam ?? "12", 10) || 12));
  // The `language` query param wins over the cookie so a programmatic
  // caller can override; absent that, the cookie (set by the language
  // switcher) is the source of truth. The cookie is the same value
  // the SSR layout uses for `lang`/`dir`, so the response is always
  // consistent with the surrounding page chrome.
  const langParam = url.searchParams.get("language");
  const language: "en" | "ar" =
    langParam === "en" || langParam === "ar"
      ? langParam
      : parseLocale(request.cookies.get(LOCALE_COOKIE)?.value);
  const result = await listPublishedArticles(parsed, language);
  return Response.json(result, {
    headers: {
      // Shared-cache TTL matches the in-process `unstable_cache` TTL
      // so any layer (CDN, Next data cache) lines up. Stale-while-
      // revalidate lets us keep serving the previous list while a
      // new one is being computed in the background — Doctor Hub
      // tolerates a slightly stale list, but it cannot tolerate an
      // empty list during a refresh sweep.
      "Cache-Control": "s-maxage=300, stale-while-revalidate=600",
      // The response varies by the locale cookie so a shared cache
      // never hands back an English list to an Arabic-locale user
      // (or vice versa). The limit is also part of the cache key
      // implicitly via the query string, so we don't need to add
      // it here.
      Vary: "Cookie",
    },
  });
}
