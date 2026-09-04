import { checkRateLimit } from "@/lib/ai/ratelimit";
import type { IDistributedRateLimiter, RateLimitResult } from "./IDistributedRateLimiter";

/**
 * In-process adapter that re-uses the existing sliding-window implementation
 * in `src/lib/ai/ratelimit.ts`. The Promise wrapper is a no-op — the call
 * resolves on the same microtask — so there is no `await` cost in the hot
 * path versus the current synchronous call site.
 */
export class InMemoryRateLimiter implements IDistributedRateLimiter {
  async check(
    key: string,
    limit: number,
    windowMs: number
  ): Promise<RateLimitResult> {
    return checkRateLimit(key, limit, windowMs);
  }
}
