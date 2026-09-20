import { checkRateLimitDistributed } from "@/lib/ai/ratelimit";

/**
 * Per-user rate-limit gate for `/api/health/*` data routes.
 *
 * Every other sensitive surface (chat, AI features, weather, auth, PIN
 * management) is rate-limited; the raw health-data routes were the last
 * unbounded surface — a valid session could flood writes (cycle logs,
 * symptoms) or reads (correlations) with no cap (OWASP API4: Unrestricted
 * Resource Consumption). 120 req/min per user is far above any legitimate
 * UI flow (each log save / dashboard refresh is a handful of calls) while
 * keeping scripted floods to a round-trip-per-minute crawl.
 *
 * Returns a 429 Response (with `Retry-After`) when the budget is spent,
 * or `null` when the caller may proceed — same contract as
 * `privacyLockResponse`.
 */
export async function healthDataRateLimit(
  userId: string
): Promise<Response | null> {
  const { ok, resetAt } = await checkRateLimitDistributed(
    `health-data:${userId}`,
    120,
    60_000
  );
  if (ok) return null;
  const retryAfter = Math.max(1, Math.ceil((resetAt - Date.now()) / 1000));
  return Response.json(
    { error: "Too many health-data requests — try again shortly." },
    { status: 429, headers: { "Retry-After": String(retryAfter) } }
  );
}
