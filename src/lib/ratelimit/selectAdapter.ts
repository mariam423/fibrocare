import type { IDistributedRateLimiter } from "./IDistributedRateLimiter";
import { InMemoryRateLimiter } from "./InMemoryRateLimiter";
import { UpstashRateLimiter } from "./upstashLimiter";

/**
 * Returns the configured rate-limiter, picking the distributed (Upstash)
 * adapter when `UPSTASH_REDIS_REST_URL` is set, otherwise the in-process
 * adapter. The decision is cached for the lifetime of the process so we
 * don't re-import the Upstash client on every call.
 */
let cached: IDistributedRateLimiter | null = null;

export function getRateLimiter(): IDistributedRateLimiter {
  if (cached) return cached;
  cached =
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
      ? new UpstashRateLimiter()
      : new InMemoryRateLimiter();
  return cached;
}

/** Reset the cached adapter — test-only. */
export function __resetRateLimiterForTests(): void {
  cached = null;
}

/** Adapter name for the metrics route. */
export function getRateLimiterName(): "upstash" | "memory" {
  return process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? "upstash"
    : "memory";
}
