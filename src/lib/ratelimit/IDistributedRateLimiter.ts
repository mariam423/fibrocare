/**
 * Distributed rate-limiter contract.
 *
 * The contract is async because the distributed adapter (Upstash) must make
 * a network round-trip. The in-process adapter still returns a
 * `Promise<RateLimitResult>` so the two are swappable, but it resolves on
 * the same microtask the call was made (no `await` cost in the hot path).
 *
 * Returning a structured `RateLimitResult` mirrors the existing in-process
 * `checkRateLimit` shape (`src/lib/ai/ratelimit.ts`) so route handlers can
 * drop the new adapter in without touching their 429 logic.
 */
export interface RateLimitResult {
  ok: boolean;
  /** Remaining requests in the current window. */
  remaining: number;
  /** Epoch-millisecond timestamp at which the current window resets. */
  resetAt: number;
}

export interface IDistributedRateLimiter {
  /**
   * Check (and atomically consume) one slot in the sliding window for
   * `key`. `limit` is the maximum number of requests allowed per
   * `windowMs` milliseconds.
   */
  check(key: string, limit: number, windowMs: number): Promise<RateLimitResult>;
}
