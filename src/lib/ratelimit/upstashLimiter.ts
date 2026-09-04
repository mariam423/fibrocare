import { getUpstashRatelimit } from "@/lib/upstash/client";
import type {
  IDistributedRateLimiter,
  RateLimitResult,
} from "./IDistributedRateLimiter";

/**
 * Upstash-backed rate limiter.
 *
 * Uses `@upstash/ratelimit`'s `slidingWindow` algorithm. The SDK is
 * constructed with the actual `(limit, windowMs)` per call, so this
 * adapter builds (and caches) one `Ratelimit` instance per triple.
 *
 * On any Upstash error (network, 5xx), the adapter FALLS BACK to a
 * permissive response — the rationale is that rate limiting is a
 * defense-in-depth tool; if the distributed store is unavailable, the
 * downstream LLM cost is bounded by the provider key, and the AI route
 * still has its per-user check. Logging the failure keeps the incident
 * observable.
 */
export class UpstashRateLimiter implements IDistributedRateLimiter {
  async check(
    key: string,
    limit: number,
    windowMs: number
  ): Promise<RateLimitResult> {
    const limiter = getUpstashRatelimit("default", limit, windowMs);
    if (!limiter) {
      // Misconfigured: no env vars. Should not be reachable because
      // `selectAdapter` only instantiates this class when env is set.
      return { ok: true, remaining: limit, resetAt: Date.now() + windowMs };
    }

    try {
      const { success, remaining, reset } = await limiter.limit(key);
      return {
        ok: success,
        remaining,
        resetAt: reset,
      };
    } catch (error) {
      // Don't take the route down when Redis is degraded.
      console.warn(
        `[ratelimit] Upstash error, allowing request · key=${key} · ${(error as Error)?.message ?? "unknown"}`
      );
      return { ok: true, remaining: limit, resetAt: Date.now() + windowMs };
    }
  }
}
