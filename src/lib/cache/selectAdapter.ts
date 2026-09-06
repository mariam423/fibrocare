import type { IDistributedCache } from "./IDistributedCache";
import { InMemoryDistributedCache } from "./InMemoryDistributedCache";
import { UpstashDistributedCache } from "./upstashCache";
import { ShadowCache } from "./shadowCache";
import { isShadowCacheActive, shouldUseUpstashCache } from "@/lib/featureFlags";

/**
 * Returns a configured cache. The selection rule (see `featureFlags.ts`):
 *  1. If `USE_UPSTASH_CACHE=1` AND Upstash env vars are set → Upstash
 *     (the cutover state)
 *  2. Else if `SHADOW_CACHE=1` AND Upstash env vars are set → a shadow
 *     wrapper: the in-process adapter serves every response while the
 *     Upstash adapter runs in parallel and is compared for parity (the
 *     pre-cutover validation state)
 *  3. Otherwise → in-process
 *
 * Default is in-process. The opt-in flag prevents an accidental
 * production cutover when env vars are added but the rollout hasn't
 * been validated yet.
 */
let cached: IDistributedCache | null = null;

export function getCache(): IDistributedCache {
  if (cached) return cached;
  cached = buildCacheAdapter();
  return cached;
}

function buildCacheAdapter(): IDistributedCache {
  if (shouldUseUpstashCache()) return new UpstashDistributedCache();
  if (isShadowCacheActive()) {
    // `isShadowCacheActive()` guarantees Upstash credentials are present,
    // so there is a real secondary adapter to compare against.
    return new ShadowCache(
      new InMemoryDistributedCache(),
      new UpstashDistributedCache()
    );
  }
  return new InMemoryDistributedCache();
}

/** Reset the cached adapter — test-only. */
export function __resetCacheForTests(): void {
  cached = null;
}

export function getCacheName(): "upstash" | "memory" {
  return shouldUseUpstashCache() ? "upstash" : "memory";
}
