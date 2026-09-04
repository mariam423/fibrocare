/**
 * Lazy Upstash Redis client.
 *
 * Mirrors the lazy-singleton pattern in `src/lib/prisma.ts`:
 *  - The client is NOT instantiated at module-load — it is created on
 *    first access. This keeps the cold-start cost of the in-process
 *    fallback path unchanged when `UPSTASH_REDIS_REST_URL` is missing.
 *  - The global cache still prevents multiple instances in dev
 *    (Next.js hot-reload).
 *
 * Returns `null` when env vars are missing so callers can fall back
 * without an exception path.
 */
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

type UpstashClientBundle = {
  redis: Redis;
  /** Pre-built rate limiters keyed by `${prefix}:${limit}:${windowMs}`. */
  limiters: Map<string, Ratelimit>;
};

const globalForUpstash = globalThis as unknown as {
  upstash: UpstashClientBundle | undefined;
};

export function getUpstashClient(): UpstashClientBundle | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }

  if (globalForUpstash.upstash) return globalForUpstash.upstash;

  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  const bundle: UpstashClientBundle = { redis, limiters: new Map() };
  if (process.env.NODE_ENV !== "production") globalForUpstash.upstash = bundle;
  return bundle;
}

/**
 * Format a window length in milliseconds to the Upstash `Duration` string
 * the SDK accepts (`"30 s"`, `"5 m"`, `"1 h"`, `"1 d"`). Sub-second windows
 * are not supported by `Ratelimit.slidingWindow`, so callers must request
 * at least 1 000 ms.
 */
function formatWindow(windowMs: number): `${number} ${"s" | "m" | "h" | "d"}` {
  if (windowMs >= 86_400_000) {
    return `${Math.max(1, Math.round(windowMs / 86_400_000))} d`;
  }
  if (windowMs >= 3_600_000) {
    return `${Math.max(1, Math.round(windowMs / 3_600_000))} h`;
  }
  if (windowMs >= 60_000) {
    return `${Math.max(1, Math.round(windowMs / 60_000))} m`;
  }
  return `${Math.max(1, Math.round(windowMs / 1000))} s`;
}

/**
 * Build (or fetch from the bundle cache) a `Ratelimit` for the given
 * `(prefix, limit, windowMs)` triple. The Upstash SDK builds the
 * sliding-window algorithm at construction time, so a new (limit, window)
 * needs a new `Ratelimit` instance — the bundle caches them.
 */
export function getUpstashRatelimit(
  prefix: string,
  limit: number,
  windowMs: number
): Ratelimit | null {
  const bundle = getUpstashClient();
  if (!bundle) return null;
  const key = `${prefix}:${limit}:${windowMs}`;
  const cached = bundle.limiters.get(key);
  if (cached) return cached;
  const limiter = new Ratelimit({
    redis: bundle.redis,
    limiter: Ratelimit.slidingWindow(limit, formatWindow(windowMs)),
    prefix: `fibrocare:${prefix}`,
    analytics: false,
  });
  bundle.limiters.set(key, limiter);
  return limiter;
}
