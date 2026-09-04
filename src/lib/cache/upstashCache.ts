import { getUpstashClient } from "@/lib/upstash/client";
import type { IDistributedCache } from "./IDistributedCache";

/**
 * Upstash-backed cache.
 *
 * Wraps `redis.get` / `redis.set` (the Upstash SDK already serializes
 * JSON for us). TTL is set on `set` via the SDK's `EX` option, so callers
 * can pass `ttlMs` directly.
 *
 * On any Upstash error the adapter falls back to a miss (for `get`) or a
 * silent success (for `set`) — a degraded cache is a perf loss, not a
 * correctness loss.
 */
export class UpstashDistributedCache implements IDistributedCache {
  private prefix = "fibrocare:cache:";

  async get<T>(key: string): Promise<T | undefined> {
    const client = getUpstashClient();
    if (!client) return undefined;
    try {
      const value = await client.redis.get<T>(this.prefix + key);
      return value ?? undefined;
    } catch (error) {
      console.warn(
        `[cache] Upstash get error · key=${key} · ${(error as Error)?.message ?? "unknown"}`
      );
      return undefined;
    }
  }

  async set<T>(key: string, value: T, ttlMs?: number): Promise<void> {
    const client = getUpstashClient();
    if (!client) return;
    try {
      const ttlSeconds =
        ttlMs && ttlMs > 0 ? Math.max(1, Math.ceil(ttlMs / 1000)) : undefined;
      if (ttlSeconds) {
        await client.redis.set(this.prefix + key, value, { ex: ttlSeconds });
      } else {
        await client.redis.set(this.prefix + key, value);
      }
    } catch (error) {
      console.warn(
        `[cache] Upstash set error · key=${key} · ${(error as Error)?.message ?? "unknown"}`
      );
    }
  }

  async getOrSet<T>(
    key: string,
    producer: () => Promise<T>,
    ttlMs?: number
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== undefined) return cached;
    const value = await producer();
    await this.set(key, value, ttlMs);
    return value;
  }
}
