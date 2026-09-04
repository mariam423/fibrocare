/**
 * Tests for the Upstash cache adapter. We mock `@upstash/redis` to a
 * fake in-memory store so the test runs without a real Redis.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// ── In-memory fake of the parts of @upstash/redis we exercise ────────
const fakeStore = new Map<string, { value: unknown; expiresAt?: number }>();

const getMock = vi.fn(async (key: string) => {
  const entry = fakeStore.get(key);
  if (!entry) return null;
  if (entry.expiresAt && entry.expiresAt <= Date.now()) {
    fakeStore.delete(key);
    return null;
  }
  return entry.value;
});

const setMock = vi.fn(async (key: string, value: unknown, opts?: { ex?: number }) => {
  fakeStore.set(key, {
    value,
    expiresAt: opts?.ex ? Date.now() + opts.ex * 1000 : undefined,
  });
  return "OK";
});

vi.mock("@upstash/redis", () => {
  class FakeRedis {
    get = getMock;
    set = setMock;
  }
  return { Redis: FakeRedis };
});

const originalUrl = process.env.UPSTASH_REDIS_REST_URL;
const originalToken = process.env.UPSTASH_REDIS_REST_TOKEN;

beforeEach(() => {
  process.env.UPSTASH_REDIS_REST_URL = "https://fake.upstash.io";
  process.env.UPSTASH_REDIS_REST_TOKEN = "fake-token";
  fakeStore.clear();
  getMock.mockClear();
  setMock.mockClear();
});

afterEach(() => {
  if (originalUrl === undefined) delete process.env.UPSTASH_REDIS_REST_URL;
  else process.env.UPSTASH_REDIS_REST_URL = originalUrl;
  if (originalToken === undefined) delete process.env.UPSTASH_REDIS_REST_TOKEN;
  else process.env.UPSTASH_REDIS_REST_TOKEN = originalToken;
  vi.resetModules();
});

describe("UpstashDistributedCache", () => {
  it("returns undefined on cache miss", async () => {
    const { UpstashDistributedCache } = await import("../../cache/upstashCache");
    const cache = new UpstashDistributedCache();
    const value = await cache.get("absent");
    expect(value).toBeUndefined();
  });

  it("stores and retrieves a value with the prefix", async () => {
    const { UpstashDistributedCache } = await import("../../cache/upstashCache");
    const cache = new UpstashDistributedCache();
    await cache.set("foo", { bar: 1 }, 30_000);
    const value = await cache.get<{ bar: number }>("foo");
    expect(value).toEqual({ bar: 1 });
    // The underlying set call must have used the prefix.
    expect(setMock).toHaveBeenCalledWith("fibrocare:cache:foo", { bar: 1 }, {
      ex: 30,
    });
  });

  it("getOrSet runs the producer on miss and caches the result", async () => {
    const { UpstashDistributedCache } = await import("../../cache/upstashCache");
    const cache = new UpstashDistributedCache();
    const producer = vi.fn(async () => 42);
    const first = await cache.getOrSet("k", producer, 60_000);
    const second = await cache.getOrSet("k", producer, 60_000);
    expect(first).toBe(42);
    expect(second).toBe(42);
    expect(producer).toHaveBeenCalledTimes(1);
  });

  it("falls back silently on Upstash set error", async () => {
    setMock.mockRejectedValueOnce(new Error("redis down"));
    const { UpstashDistributedCache } = await import("../../cache/upstashCache");
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const cache = new UpstashDistributedCache();
    await expect(cache.set("k", 1)).resolves.toBeUndefined();
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});
