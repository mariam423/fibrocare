/**
 * GET /api/ai/articles/list?limit=<n>
 *
 * Returns the latest verified doctor articles for the Doctor Hub feed.
 * Public endpoint — Doctor Hub is patient-facing.
 */

import { NextRequest } from "next/server";
import { listPublishedArticles } from "@/app/pro/doctor-article-actions";

export const maxDuration = 30;

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const limitParam = url.searchParams.get("limit");
  const parsed = Math.max(1, Math.min(24, Number.parseInt(limitParam ?? "12", 10) || 12));
  const result = await listPublishedArticles(parsed);
  return Response.json(result);
}
