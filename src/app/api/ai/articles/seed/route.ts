/**
 * POST /api/ai/articles/seed
 *
 * Triggers a one-shot seed of the curated article library. Idempotent:
 * topics that already have a published post are returned as-is, only the
 * missing ones are generated. Doctor Hub calls this on first visit so the
 * feed never shows the empty state.
 *
 * The endpoint requires authentication (session cookie), but seeding runs
 * LLM generation, so it is rate-limited per client IP: 12 seeds / 5 minutes.
 * The limit only guards hammering — the work itself is bounded twice over:
 * the topic catalogue is closed and the seed de-dupes by (topic, language),
 * so a populated library makes every seed a pure DB read (zero LLM calls).
 * The generous budget exists so a fresh deploy self-seeds reliably even
 * when several first visitors (or e2e suites) mount the empty library
 * concurrently and retry.
 */

import { NextRequest } from "next/server";
import { seedDoctorArticleLibrary } from "@/app/pro/doctor-article-actions";
import { checkRateLimitDistributed } from "@/lib/ai/ratelimit";
import {
  SEED_RATE_LIMIT,
  SEED_RATE_WINDOW_MS,
} from "@/app/pro/doctor-article-cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requirePermissionResponse } from "@/lib/auth/entitlement";

export const maxDuration = 120;

function clientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    "unknown"
  );
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "You must be signed in." }, { status: 401 });
  }

  // Article generation burns LLM budget — only verified doctors may
  // trigger it, not any signed-in user.
  const denied = await requirePermissionResponse(session.user.id, "doctor:publish");
  if (denied) return denied;

  // Per-IP budget, imported from the shared cache module so the route
  // and the server action can never drift apart. Pinned by
  // route.test.ts.
  const { ok, resetAt } = await checkRateLimitDistributed(
    `seed:${clientIp(request)}`,
    SEED_RATE_LIMIT,
    SEED_RATE_WINDOW_MS
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
