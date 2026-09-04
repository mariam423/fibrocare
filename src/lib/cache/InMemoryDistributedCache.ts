import { TtlCache } from "@/lib/ai/cache";
import type { IDistributedCache } from "./IDistributedCache";

/**
 * In-process adapter that re-uses the existing `TtlCache` (Map-backed, with
 * TTL + size cap) from `src/lib/ai/cache.ts`. The Promise wrapper is a
 * no-op for the same reason as `InMemoryRateLimiter` — every call resolves
 * synchronously.
 *
 * We deliberately do NOT share a single global `TtlCache` between adapters:
 * each instance is owned by the call site so the eviction policy stays
 * scoped to the consumer (e.g. chat fingerprint cache is small, article
 * list cache is large).
 */
export class InMemoryDistributedCache implements IDistributedCache {
  private store: TtlCache<unknown>;

  constructor(ttlMs?: number, maxEntries?: number) {
    this.store = new TtlCache<unknown>(ttlMs, maxEntries);
  }

  async get<T>(key: string): Promise<T | undefined> {
    return this.store.get(key) as T | undefined;
  }

  async set<T>(key: string, value: T, ttlMs?: number): Promise<void> {
    this.store.set(key, value as unknown, ttlMs);
  }

  async getOrSet<T>(
    key: string,
    producer: () => Promise<T>,
    ttlMs?: number
  ): Promise<T> {
    return this.store.getOrSet(key, producer, ttlMs) as Promise<T>;
  }
}
