/**
 * Rate limiting for AI endpoints.
 *
 * Two layers live here:
 *
 *  1. **In-process sliding window** — `checkRateLimit(key, limit, windowMs)`.
 *     A `Map<string, WindowEntry>` with a 5 000-bucket cap. Synchronous,
 *     zero-dependency, safe for a single instance.
 *
 *  2. **Distributed adapter shim** — `checkRateLimitDistributed(...)`. When
 *     the env-var pair `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`
 *     is set, this routes through the Upstash-backed limiter; otherwise it
 *     delegates to the in-process function and resolves the same shape.
 *
 * The convenience helpers `checkChatRateLimit` (20 req / 60 s per user) and
 * `checkFeatureRateLimit` (10 req / 60 s per user) keep the same
 * signatures and semantics; they now go through the distributed adapter,
 * so multi-instance deployments share the budget.
 */

import { getRateLimiter } from "@/lib/ratelimit/selectAdapter";
import type { RateLimitResult } from "@/lib/ratelimit/IDistributedRateLimiter";

interface WindowEntry {
  timestamps: number[];
  windowStart: number;
}

const windows = new Map<string, WindowEntry>();
const MAX_BUCKETS = 5_000;

/**
 * Sliding window of `limit` requests per `windowMs` per `key`.
 * `windowStart` is the timestamp at which the current window began.
 *
 * Synchronous, in-process. Use `checkRateLimitDistributed` for the
 * env-aware wrapper.
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();

  if (windows.size > MAX_BUCKETS) {
    // Prevent unbounded growth: drop expired buckets.
    for (const [k, w] of windows) {
      if (w.windowStart + windowMs <= now) windows.delete(k);
    }
  }

  let bucket = windows.get(key);
  if (!bucket || bucket.windowStart + windowMs <= now) {
    bucket = { timestamps: [], windowStart: now };
    windows.set(key, bucket);
  }

  const start = now - windowMs;
  const recent = bucket.timestamps.filter((t) => t > start);
  bucket.timestamps = recent;

  const remaining = Math.max(0, limit - recent.length);
  if (recent.length >= limit) {
    return { ok: false, remaining: 0, resetAt: bucket.windowStart + windowMs };
  }

  recent.push(now);
  bucket.timestamps = recent;
  return { ok: true, remaining, resetAt: bucket.windowStart + windowMs };
}

/**
 * Distributed (Upstash-backed when env is set) sliding-window check.
 * Resolves to the same shape as `checkRateLimit`, so route handlers
 * can swap one for the other transparently.
 */
export async function checkRateLimitDistributed(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  return getRateLimiter().check(key, limit, windowMs);
}

/** Companion chat limits: generous per user, per minute. */
export async function checkChatRateLimit(userId: string): Promise<RateLimitResult> {
  return checkRateLimitDistributed(`chat:${userId}`, 20, 60_000);
}

/** One-shot AI features (narration / reflection / questions). */
export async function checkFeatureRateLimit(userId: string): Promise<RateLimitResult> {
  return checkRateLimitDistributed(`feature:${userId}`, 10, 60_000);
}
