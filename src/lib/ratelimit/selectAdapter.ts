import type { IDistributedRateLimiter } from "./IDistributedRateLimiter";
import { InMemoryRateLimiter } from "./InMemoryRateLimiter";
import { UpstashRateLimiter } from "./upstashLimiter";
import { ShadowRateLimiter } from "./shadowLimiter";
import {
  isShadowRateLimitActive,
  shouldUseUpstashRateLimit,
} from "@/lib/featureFlags";

/**
 * Returns the configured rate-limiter. The selection rule mirrors the
 * cache selector: opt in via `USE_UPSTASH_RATELIMIT=1`. Default is the
 * in-process adapter so production behaviour is unchanged.
 *
 * During shadow mode (`SHADOW_RATELIMIT=1` + credentials, cutover not yet
 * flipped) the selector returns a shadow wrapper that enforces the
 * in-process decision while running the Upstash limiter in parallel for
 * parity comparison.
 */
let cached: IDistributedRateLimiter | null = null;

export function getRateLimiter(): IDistributedRateLimiter {
  if (cached) return cached;
  cached = buildRateLimiter();
  return cached;
}

function buildRateLimiter(): IDistributedRateLimiter {
  if (shouldUseUpstashRateLimit()) return new UpstashRateLimiter();
  if (isShadowRateLimitActive()) {
    // `isShadowRateLimitActive()` guarantees Upstash credentials are
    // present, so there is a real secondary limiter to compare against.
    return new ShadowRateLimiter(
      new InMemoryRateLimiter(),
      new UpstashRateLimiter()
    );
  }
  return new InMemoryRateLimiter();
}

/** Reset the cached adapter — test-only. */
export function __resetRateLimiterForTests(): void {
  cached = null;
}

/** Adapter name for the metrics route. */
export function getRateLimiterName(): "upstash" | "memory" {
  return shouldUseUpstashRateLimit() ? "upstash" : "memory";
}
