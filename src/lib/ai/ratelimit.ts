/**
 * Minimal in-memory sliding-window rate limiter for AI endpoints.
 *
 * Protects the model budget without adding a Redis dependency for a local /
 * small deployment. Production with many users should swap this for an
 * edge/Redis limiter (Upstash) behind the same interface.
 */

interface WindowEntry {
  timestamps: number[];
  windowStart: number;
}

const windows = new Map<string, WindowEntry>();
const MAX_BUCKETS = 5_000;

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Sliding window of `limit` requests per `windowMs` per `key`.
 * `windowStart` is the timestamp at which the current window began.
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

/** Companion chat limits: generous per user, per minute. */
export function checkChatRateLimit(userId: string) {
  return checkRateLimit(`chat:${userId}`, 20, 60_000);
}

/** One-shot AI features (narration / reflection / questions). */
export function checkFeatureRateLimit(userId: string) {
  return checkRateLimit(`feature:${userId}`, 10, 60_000);
}
