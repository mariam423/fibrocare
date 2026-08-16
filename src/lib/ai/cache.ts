/**
 * Small in-memory TTL cache for LLM responses (cost control).
 *
 * Exact-response caching kills the biggest cost center: repeat calls for the
 * same fingerprint. Keyed by a content hash of the inputs, scoped per user
 * for private data. A Map with TTL + size cap keeps it dependency-free.
 */

export interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const DEFAULT_TTL_MS = 10 * 60 * 1000;
const DEFAULT_MAX_ENTRIES = 200;

export class TtlCache<T> {
  private store = new Map<string, CacheEntry<T>>();
  private ttlMs: number;
  private maxEntries: number;

  constructor(ttlMs = DEFAULT_TTL_MS, maxEntries = DEFAULT_MAX_ENTRIES) {
    this.ttlMs = ttlMs;
    this.maxEntries = maxEntries;
  }

  get(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt <= Date.now()) {
      this.store.delete(key);
      return undefined;
    }
    return entry.data;
  }

  set(key: string, data: T, ttlMs = this.ttlMs): void {
    this.evict();
    this.store.set(key, { data, expiresAt: Date.now() + ttlMs });
  }

  /** Get-or-compute: runs `producer` on a miss and stores the result. */
  async getOrSet(key: string, producer: () => Promise<T>, ttlMs?: number): Promise<T> {
    const cached = this.get(key);
    if (cached !== undefined) return cached;
    const value = await producer();
    this.set(key, value, ttlMs);
    return value;
  }

  private evict(): void {
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (entry.expiresAt <= now) this.store.delete(key);
    }
    if (this.store.size > this.maxEntries) {
      const keys = [...this.store.keys()].slice(0, this.store.size - this.maxEntries);
      for (const key of keys) this.store.delete(key);
    }
  }
}

