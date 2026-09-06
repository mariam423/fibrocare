import type { IDistributedCache } from "./IDistributedCache";
import {
  recordShadowCheck,
  recordShadowMismatch,
} from "@/lib/observability/shadow";

/**
 * Shadow wrapper over two cache adapters.
 *
 * During the pre-cutover validation window the selector returns this
 * wrapper instead of the bare in-process cache:
 *
 *   - `primary`  → the in-process adapter (the one serving responses today)
 *   - `shadow`   → the Upstash adapter (the one that will serve after cutover)
 *
 * Every operation is forwarded to BOTH adapters, but the response is
 * ALWAYS the primary's — shadow mode is a read-only diagnostic, never a
 * write path. The Upstash store is warmed and read so its behaviour can be
 * compared with the in-process store for the 24h before the operator flips
 * `USE_UPSTASH_CACHE=1`.
 *
 * Mismatch definition (what delays a cutover): the primary served a cached
 * value but the shadow missed. After cutover, Upstash is the primary, so a
 * miss where the in-process store had the value means users would
 * re-compute (DB hit + producer run) where today they hit cache. The
 * inverse (shadow warm, primary cold) is expected on a multi-instance
 * deploy — another instance warmed Upstash — and is not a mismatch.
 */
export class ShadowCache implements IDistributedCache {
  private primary: IDistributedCache;
  private shadow: IDistributedCache;

  constructor(primary: IDistributedCache, shadow: IDistributedCache) {
    this.primary = primary;
    this.shadow = shadow;
  }

  async get<T>(key: string): Promise<T | undefined> {
    recordShadowCheck("cache");
    const [primaryValue, shadowValue] = await Promise.all([
      this.primary.get<T>(key),
      this.shadow.get<T>(key),
    ]);
    if (primaryValue !== undefined && shadowValue === undefined) {
      recordShadowMismatch(
        "cache",
        key,
        "primary (in-process) served a cached value but shadow (Upstash) missed — after cutover this read would re-run the producer."
      );
    }
    // The primary's value is the one that is served, always.
    return primaryValue;
  }

  async set<T>(key: string, value: T, ttlMs?: number): Promise<void> {
    await this.primary.set(key, value, ttlMs);
    // Mirror into the shadow store so the distributed cache is warm at
    // cutover. The shadow never gets to break the primary path: any error
    // in the secondary store is swallowed (the Upstash adapter already
    // logs its own warning on failure).
    try {
      await this.shadow.set(key, value, ttlMs);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(
        `[shadow] cache mirror set failed · key=${key} · ${message}`
      );
    }
  }

  async getOrSet<T>(
    key: string,
    producer: () => Promise<T>,
    ttlMs?: number
  ): Promise<T> {
    // Route through `get`/`set` so the parity metrics and the mirror
    // write stay in one place regardless of the call path.
    const cached = await this.get<T>(key);
    if (cached !== undefined) return cached;
    const value = await producer();
    await this.set(key, value, ttlMs);
    return value;
  }
}
