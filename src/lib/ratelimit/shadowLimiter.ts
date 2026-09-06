import type {
  IDistributedRateLimiter,
  RateLimitResult,
} from "./IDistributedRateLimiter";
import {
  recordShadowCheck,
  recordShadowMismatch,
} from "@/lib/observability/shadow";

/**
 * Shadow wrapper over two rate limiters.
 *
 * During the pre-cutover validation window the selector returns this
 * wrapper instead of the bare in-process limiter:
 *
 *   - `primary` → the in-process sliding window (authoritative today)
 *   - `shadow`  → the Upstash limiter (authoritative after cutover)
 *
 * Both windows are consumed on every call, but the returned decision is
 * ALWAYS the primary's. Shadow mode is a read-only diagnostic — the
 * Upstash result never 429s a user, it only tells us what *would* have
 * happened after cutover.
 *
 * Mismatch definition (what delays a cutover): the primary allowed a
 * request that the shadow denied. After cutover the same request would
 * return 429 — a behaviour change for a real user. The inverse (primary
 * denies, shadow allows) is benign: after cutover the user would get more
 * headroom, not less.
 */
export class ShadowRateLimiter implements IDistributedRateLimiter {
  private primary: IDistributedRateLimiter;
  private shadow: IDistributedRateLimiter;

  constructor(primary: IDistributedRateLimiter, shadow: IDistributedRateLimiter) {
    this.primary = primary;
    this.shadow = shadow;
  }

  async check(
    key: string,
    limit: number,
    windowMs: number
  ): Promise<RateLimitResult> {
    recordShadowCheck("ratelimit");
    const [primary, shadow] = await Promise.all([
      this.primary.check(key, limit, windowMs),
      this.shadow.check(key, limit, windowMs),
    ]);
    if (primary.ok && !shadow.ok) {
      recordShadowMismatch(
        "ratelimit",
        key,
        `primary (in-process) allowed (remaining ${primary.remaining}) but shadow (Upstash) denied (remaining ${shadow.remaining}) — after cutover this request would get a 429.`
      );
    }
    // The primary's decision is the one that is enforced, always.
    return primary;
  }
}
