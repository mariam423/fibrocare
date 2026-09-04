import type { IDistributedCache } from "./IDistributedCache";
import { InMemoryDistributedCache } from "./InMemoryDistributedCache";
import { UpstashDistributedCache } from "./upstashCache";

/**
 * Returns a configured cache. Selects the distributed (Upstash) adapter
 * when `UPSTASH_REDIS_REST_URL` is set, otherwise the in-process one.
 */
let cached: IDistributedCache | null = null;

export function getCache(): IDistributedCache {
  if (cached) return cached;
  cached =
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
      ? new UpstashDistributedCache()
      : new InMemoryDistributedCache();
  return cached;
}

/** Reset the cached adapter — test-only. */
export function __resetCacheForTests(): void {
  cached = null;
}

export function getCacheName(): "upstash" | "memory" {
  return process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? "upstash"
    : "memory";
}
