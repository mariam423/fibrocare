import { describe, expect, it } from "vitest";
import { OfflineCache } from "./offlineCache";

function memoryStorage() {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => data.set(k, v),
    removeItem: (k: string) => data.delete(k),
    key: (i: number) => [...data.keys()][i] ?? null,
    get length() {
      return data.size;
    },
  };
}

describe("OfflineCache", () => {
  it("round-trips values through write/readStale", () => {
    const cache = new OfflineCache({ storage: memoryStorage(), schema: "exercises" });
    cache.write("list", [{ id: "cat-cow" }]);
    expect(cache.readStale("list")).toEqual([{ id: "cat-cow" }]);
  });

  it("respects TTL for freshness", () => {
    const cache = new OfflineCache({ storage: memoryStorage(), ttlMs: 1000 });
    cache.write("k", "v");
    expect(cache.isFresh("k")).toBe(true);
    expect(cache.isFresh("k", Date.now() + 5000)).toBe(false);
  });

  it("treats entries from a different schema version as missing", () => {
    const storage = memoryStorage();
    new OfflineCache({ storage, schema: "v1" }).write("k", "old");
    expect(new OfflineCache({ storage, schema: "v2" }).readStale("k")).toBeNull();
  });

  it("swr serves fresh data without calling the fetcher again", async () => {
    const cache = new OfflineCache({ storage: memoryStorage() });
    cache.write("k", "fresh");
    let calls = 0;
    const result = await cache.swr("k", async () => {
      calls++;
      return "newer";
    });
    expect(calls).toBe(0);
    expect(result).toEqual({ data: "fresh", stale: false, revalidated: false });
  });

  it("swr revalidates stale data in the background", async () => {
    const cache = new OfflineCache({ storage: memoryStorage(), ttlMs: 0 });
    cache.write("k", "stale-value");
    const result = await cache.swr("k", async () => "fresh-value");
    expect(result).toEqual({ data: "fresh-value", stale: false, revalidated: true });
    expect(cache.readStale("k")).toBe("fresh-value");
  });

  it("swr falls back to stale data when the fetcher fails (offline)", async () => {
    const cache = new OfflineCache({ storage: memoryStorage(), ttlMs: 0 });
    cache.write("k", "offline-value");
    const result = await cache.swr("k", async () => {
      throw new Error("offline");
    });
    expect(result).toEqual({ data: "offline-value", stale: true, revalidated: false });
  });

  it("swr returns null data when offline with nothing cached", async () => {
    const cache = new OfflineCache({ storage: memoryStorage() });
    const result = await cache.swr("missing", async () => {
      throw new Error("offline");
    });
    expect(result).toEqual({ data: null, stale: false, revalidated: false });
  });

  it("invalidate drops a single key or the whole namespace", () => {
    const storage = memoryStorage();
    const cache = new OfflineCache({ storage, schema: "ns" });
    cache.write("a", 1);
    cache.write("b", 2);
    cache.invalidate("a");
    expect(cache.readStale("a")).toBeNull();
    expect(cache.readStale("b")).toBe(2);
    cache.invalidate();
    expect(cache.readStale("b")).toBeNull();
  });

  it("never throws when storage is unavailable", () => {
    const broken = {
      getItem: () => {
        throw new Error("quota");
      },
      setItem: () => {
        throw new Error("quota");
      },
      removeItem: () => {
        throw new Error("quota");
      },
    };
    const cache = new OfflineCache({ storage: broken });
    expect(() => cache.write("k", "v")).not.toThrow();
    expect(cache.readStale("k")).toBeNull();
  });
});
