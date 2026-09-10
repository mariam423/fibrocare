/**
 * GET /api/ai/articles/seed
 *
 * Triggers a one-shot seed of the curated article library. Idempotent:
 * topics that already have a published post are returned as-is, only the
 * missing ones are generated. Doctor Hub calls this on first visit so the
 * feed never shows the empty state.
 *
 * The endpoint is public by design (the Doctor Hub is patient-facing), but
 * seeding runs LLM generation, so it is rate-limited per client IP: 2
 * seeds per hour. The work itself is bounded (closed topic catalogue,
 * persisted + de-duped), the limiter just stops a script from hammering
 * it.
 */

import { NextRequest } from "next/server";
import { seedDoctorArticleLibrary } from "@/app/pro/doctor-article-actions";
import { checkRateLimitDistributed } from "@/lib/ai/ratelimit";

export const maxDuration = 120;

function clientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    "unknown"
  );
}

export async function GET(request: NextRequest) {
  // Per-IP budget: 2 seeds / hour. The seed is idempotent, so a legit
  // client never needs more.
  const { ok, resetAt } = await checkRateLimitDistributed(
    `seed:${clientIp(request)}`,
    2,
    60 * 60 * 1000
  );
  if (!ok) {
    const retryAfter = Math.max(1, Math.ceil((resetAt - Date.now()) / 1000));
    return Response.json(
      { error: "Article library seed was just run — try again later." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  try {
    const result = await seedDoctorArticleLibrary();
    return Response.json({ ok: true, ...result });
  } catch (error) {
    console.error("[ai-articles] seed failed:", error);
    return Response.json(
      { ok: false, error: "Failed to seed the article library." },
      { status: 500 }
    );
  }
}
