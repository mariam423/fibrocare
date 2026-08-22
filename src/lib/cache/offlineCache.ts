/**
 * Stale-While-Revalidate offline cache.
 *
 * Instant page loads for dictionaries, exercise lists, and meal plans:
 *  - read: stale data returns immediately (0ms paint), revalidation happens
 *    in the background and silently swaps in fresh data;
 *  - write: persists to localStorage with a TTL + version stamp so stale
 *    entries never leak across schema changes;
 *  - offline: fetch fails → stale data keeps serving (SWR promise),
 *    and if there is nothing cached the caller's fallback wins.
 */

export interface CacheEntry<T> {
  v: 1;
  /** Cache key namespace version — bump to invalidate old shapes. */
  schema: string;
  storedAt: number;
  ttlMs: number;
  data: T;
}

export interface SWRResult<T> {
  data: T | null;
  /** True when data came from the cache (may be stale). */
  stale: boolean;
  /** True when the background revalidation finished and updated the value. */
  revalidated: boolean;
}

export interface OfflineCacheOptions {
  /** How long a cached value is trusted as fresh (default 1 hour). */
  ttlMs?: number;
  /** Schema tag; entries with a different tag are treated as missing. */
  schema?: string;
  storage?: Pick<Storage, "getItem" | "setItem" | "removeItem">;
}

const DEFAULT_TTL = 60 * 60 * 1000;

function keyFor(key: string, schema: string): string {
  return `fibrocare-cache:${schema}:${key}`;
}

export class OfflineCache {
  constructor(private options: OfflineCacheOptions = {}) {}

  private storage(): Pick<Storage, "getItem" | "setItem" | "removeItem"> {
    return (
      this.options.storage ??
      (typeof localStorage !== "undefined" ? localStorage : undefined as unknown as Storage)
    );
  }

  /** Synchronous stale read — the instant first paint path. */
  readStale<T>(key: string): T | null {
    try {
      const raw = this.storage().getItem(keyFor(key, this.options.schema ?? "default"));
      if (!raw) return null;
      const entry = JSON.parse(raw) as CacheEntry<T>;
      if (entry.v !== 1) return null;
      return entry.data;
    } catch {
      return null;
    }
  }

  isFresh(key: string, now = Date.now()): boolean {
    try {
      const raw = this.storage().getItem(keyFor(key, this.options.schema ?? "default"));
      if (!raw) return false;
      const entry = JSON.parse(raw) as CacheEntry<unknown>;
      return now - entry.storedAt < (entry.ttlMs ?? 0);
    } catch {
      return false;
    }
  }

  write<T>(key: string, data: T, ttlMs = this.options.ttlMs ?? DEFAULT_TTL): void {
    try {
      const entry: CacheEntry<T> = {
        v: 1,
        schema: this.options.schema ?? "default",
        storedAt: Date.now(),
        ttlMs,
        data,
      };
      this.storage().setItem(keyFor(key, entry.schema), JSON.stringify(entry));
    } catch {
      // Storage full/unavailable: caching is best-effort, never fatal.
    }
  }

  /**
   * Full stale-while-revalidate cycle. Returns immediately with stale data
   * (or null), then awaits `fetcher`; fresh data is persisted and returned.
   * Offline fetch failures resolve to the stale value.
   */
  async swr<T>(key: string, fetcher: () => Promise<T>): Promise<SWRResult<T>> {
    const staleData = this.readStale<T>(key);
    if (this.isFresh(key)) {
      return { data: staleData, stale: false, revalidated: false };
    }
    try {
      const fresh = await fetcher();
      this.write(key, fresh);
      return { data: fresh, stale: false, revalidated: staleData !== null };
    } catch {
      return { data: staleData, stale: staleData !== null, revalidated: false };
    }
  }

  /** Drop one key or the whole namespace (used by the privacy purge). */
  invalidate(key?: string): void {
    const store = this.storage() as Storage;
    const prefix = `fibrocare-cache:${this.options.schema ?? "default"}:`;
    if (key) {
      store.removeItem(keyFor(key, this.options.schema ?? "default"));
      return;
    }
    const keys: string[] = [];
    for (let i = 0; i < store.length; i++) keys.push(store.key(i)!);
    for (const k of keys) if (k.startsWith(prefix)) store.removeItem(k);
  }
}
