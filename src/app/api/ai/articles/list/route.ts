/**
 * GET /api/ai/articles/list?limit=<n>
 *
 * Returns the latest verified doctor articles for the Doctor Hub feed.
 * Public endpoint — Doctor Hub is patient-facing.
 *
 * Caching:
 *  - The DB read is wrapped in `unstable_cache` (60s TTL, see
 *    `listPublishedArticles`), so the DB is hit at most once per
 *    minute per `limit` even under high traffic.
 *  - The HTTP response carries `Cache-Control: s-maxage=60,
 *    stale-while-revalidate=300` so any CDN / Next.js data cache
 *    in front of this route can serve stale-while-revalidate
 *    responses, taking the load off the origin during a refresh
 *    sweep. The `Cache-Control` only applies to shared caches
 *    (`s-maxage`), so the browser still revalidates on every
 *    navigation.
 */

import { NextRequest } from "next/server";
import { listPublishedArticles } from "@/app/pro/doctor-article-actions";

export const maxDuration = 30;

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const limitParam = url.searchParams.get("limit");
  const parsed = Math.max(1, Math.min(24, Number.parseInt(limitParam ?? "12", 10) || 12));
  const result = await listPublishedArticles(parsed);
  return Response.json(result, {
    headers: {
      // Shared-cache TTL matches the in-process `unstable_cache` TTL
      // so any layer (CDN, Next data cache) lines up. Stale-while-
      // revalidate lets us keep serving the previous list while a
      // new one is being computed in the background — Doctor Hub
      // tolerates a slightly stale list, but it cannot tolerate an
      // empty list during a refresh sweep.
      "Cache-Control": "s-maxage=60, stale-while-revalidate=300",
    },
  });
}
