/**
 * Tests for the shadow cache wrapper.
 *
 * The wrapper's contract:
 *  - every call runs on BOTH adapters
 *  - the primary's result is always the one served
 *  - a primary hit + shadow miss is the only "mismatch" (the shadow store
 *    is colder than the store that will serve after cutover)
 *  - the shadow store can never break the primary path
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { get as metricGet, __resetMetricsForTests } from "@/lib/observability/metrics";
import { __resetShadowReporterForTests } from "@/lib/observability/shadow";
import { ShadowCache } from "../shadowCache";
import type { IDistributedCache } from "../IDistributedCache";

/** Tiny fake cache: an in-memory store with the IDistributedCache shape. */
class FakeCache implements IDistributedCache {
  private store = new Map<string, unknown>();
  private ttls = new Map<string, number | undefined>();
  getSpy = vi.fn(async (key: string): Promise<unknown> => this.store.get(key));
  setSpy = vi.fn(async (key: string, value: unknown, ttlMs?: number) => {
    this.store.set(key, value);
    this.ttls.set(key, ttlMs);
  });
  getOrSetSpy = vi.fn(
    async (
      key: string,
      producer: () => Promise<unknown>,
      ttlMs?: number
    ): Promise<unknown> => {
      const hit = this.store.get(key);
      if (hit !== undefined) return hit;
      const value = await producer();
      this.store.set(key, value);
      this.ttls.set(key, ttlMs);
      return value;
    }
  );

  async get<T>(key: string): Promise<T | undefined> {
    return (await this.getSpy(key)) as T | undefined;
  }
  async set<T>(key: string, value: T, ttlMs?: number): Promise<void> {
    await this.setSpy(key, value, ttlMs);
  }
  async getOrSet<T>(
    key: string,
    producer: () => Promise<T>,
    ttlMs?: number
  ): Promise<T> {
    return (await this.getOrSetSpy(key, producer, ttlMs)) as T;
  }
}

afterEach(() => {
  __resetMetricsForTests();
  __resetShadowReporterForTests();
});

describe("ShadowCache", () => {
  it("serves the primary value when both stores agree", async () => {
    const primary = new FakeCache();
    const shadow = new FakeCache();
    await primary.set("k1", "from-memory");
    await shadow.set("k1", "from-memory");
    const wrapper = new ShadowCache(primary, shadow);

    const value = await wrapper.get<string>("k1");

    expect(value).toBe("from-memory");
    // Both adapters were consulted…
    expect(primary.getSpy).toHaveBeenCalledWith("k1");
    expect(shadow.getSpy).toHaveBeenCalledWith("k1");
    // …and there is no mismatch.
    expect(metricGet("shadow_cache_check")).toBe(1);
    expect(metricGet("shadow_cache_mismatch")).toBe(0);
  });

  it("reports a mismatch when the primary is warm but the shadow missed", async () => {
    const primary = new FakeCache();
    const shadow = new FakeCache();
    await primary.set("k1", "warm-in-memory"); // shadow never got it
    const wrapper = new ShadowCache(primary, shadow);
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const value = await wrapper.get<string>("k1");

    // The primary's value is still served…
    expect(value).toBe("warm-in-memory");
    // …but the divergence is recorded for the operator.
    expect(metricGet("shadow_cache_mismatch")).toBe(1);
    expect(warnSpy).toHaveBeenCalledOnce();
    warnSpy.mockRestore();
  });

  it("does NOT count a shadow-warm / primary-cold read as a mismatch", async () => {
    const primary = new FakeCache();
    const shadow = new FakeCache();
    await shadow.set("k1", "warm-in-upstash"); // another instance warmed it
    const wrapper = new ShadowCache(primary, shadow);

    const value = await wrapper.get<string>("k1");

    // Cold primary = miss, so the caller recomputes (correct pre-cutover
    // behaviour) and nothing is flagged.
    expect(value).toBeUndefined();
    expect(metricGet("shadow_cache_mismatch")).toBe(0);
  });

  it("getOrSet runs the producer once, then mirrors the value to the shadow", async () => {
    const primary = new FakeCache();
    const shadow = new FakeCache();
    const wrapper = new ShadowCache(primary, shadow);
    const producer = vi.fn(async () => ({ pain: 3 }));

    const first = await wrapper.getOrSet("k1", producer, 30_000);
    const second = await wrapper.getOrSet("k1", producer, 30_000);

    expect(first).toEqual({ pain: 3 });
    expect(second).toEqual({ pain: 3 });
    expect(producer).toHaveBeenCalledTimes(1);
    // The entry is present in BOTH stores so the shadow is warm at cutover.
    expect(await primary.get("k1")).toEqual({ pain: 3 });
    expect(await shadow.get("k1")).toEqual({ pain: 3 });
  });

  it("a throwing shadow store never breaks the primary write", async () => {
    const primary = new FakeCache();
    const throwingShadow = {
      async get<T>() {
        return undefined as T | undefined;
      },
      async set() {
        throw new Error("upstash down");
      },
      async getOrSet<T>(key: string, producer: () => Promise<T>) {
        return producer();
      },
    } satisfies IDistributedCache;
    const wrapper = new ShadowCache(primary, throwingShadow);

    await expect(wrapper.set("k1", "value", 30_000)).resolves.toBeUndefined();
    expect(await primary.get("k1")).toBe("value");
  });

  it("mirror sets are forwarded with the TTL", async () => {
    const primary = new FakeCache();
    const shadow = new FakeCache();
    const wrapper = new ShadowCache(primary, shadow);

    await wrapper.set("k1", "v", 45_000);

    expect(shadow.setSpy).toHaveBeenCalledWith("k1", "v", 45_000);
  });
});
