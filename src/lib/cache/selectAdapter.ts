import type { IDistributedCache } from "./IDistributedCache";
import { InMemoryDistributedCache } from "./InMemoryDistributedCache";
import { UpstashDistributedCache } from "./upstashCache";
import { shouldUseUpstashCache } from "@/lib/featureFlags";

/**
 * Returns a configured cache. The selection rule (see `featureFlags.ts`):
 *  1. If `USE_UPSTASH_CACHE=1` AND Upstash env vars are set → Upstash
 *  2. Otherwise → in-process
 *
 * Default is in-process. The opt-in flag prevents an accidental
 * production cutover when env vars are added but the rollout hasn't
 * been validated yet.
 */
let cached: IDistributedCache | null = null;

export function getCache(): IDistributedCache {
  if (cached) return cached;
  cached = shouldUseUpstashCache()
    ? new UpstashDistributedCache()
    : new InMemoryDistributedCache();
  return cached;
}

/** Reset the cached adapter — test-only. */
export function __resetCacheForTests(): void {
  cached = null;
}

export function getCacheName(): "upstash" | "memory" {
  return shouldUseUpstashCache() ? "upstash" : "memory";
}
