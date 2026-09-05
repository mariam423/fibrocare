import type { IDistributedRateLimiter } from "./IDistributedRateLimiter";
import { InMemoryRateLimiter } from "./InMemoryRateLimiter";
import { UpstashRateLimiter } from "./upstashLimiter";
import { shouldUseUpstashRateLimit } from "@/lib/featureFlags";

/**
 * Returns the configured rate-limiter. The selection rule mirrors the
 * cache selector: opt in via `USE_UPSTASH_RATELIMIT=1`. Default is the
 * in-process adapter so production behaviour is unchanged.
 */
let cached: IDistributedRateLimiter | null = null;

export function getRateLimiter(): IDistributedRateLimiter {
  if (cached) return cached;
  cached = shouldUseUpstashRateLimit()
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
  return shouldUseUpstashRateLimit() ? "upstash" : "memory";
}
