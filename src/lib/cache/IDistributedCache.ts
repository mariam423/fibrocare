/**
 * Distributed cache contract.
 *
 * Mirrors the in-process `TtlCache<T>` API in `src/lib/ai/cache.ts` so the
 * existing route handlers can be ported with no call-site rewrites. The
 * distributed adapter is async (it talks to Upstash Redis); the in-process
 * adapter resolves synchronously but still returns a Promise for symmetry.
 */
export interface IDistributedCache {
  get<T>(key: string): Promise<T | undefined>;
  set<T>(key: string, value: T, ttlMs?: number): Promise<void>;
  /**
   * Get-or-compute: returns the cached value if present, otherwise runs
   * `producer`, stores its result, and returns it.
   */
  getOrSet<T>(
    key: string,
    producer: () => Promise<T>,
    ttlMs?: number
  ): Promise<T>;
}
