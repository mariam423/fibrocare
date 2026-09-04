/**
 * Verifies the adapter selector returns the correct implementation
 * based on env-var presence.
 */
import { afterEach, describe, expect, it, vi } from "vitest";

const originalUrl = process.env.UPSTASH_REDIS_REST_URL;
const originalToken = process.env.UPSTASH_REDIS_REST_TOKEN;

afterEach(() => {
  if (originalUrl === undefined) delete process.env.UPSTASH_REDIS_REST_URL;
  else process.env.UPSTASH_REDIS_REST_URL = originalUrl;
  if (originalToken === undefined) delete process.env.UPSTASH_REDIS_REST_TOKEN;
  else process.env.UPSTASH_REDIS_REST_TOKEN = originalToken;
  vi.resetModules();
});

describe("rate-limiter adapter selection", () => {
  it("returns InMemoryRateLimiter when env is unset", async () => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    const { getRateLimiter, getRateLimiterName, __resetRateLimiterForTests } =
      await import("../selectAdapter");
    __resetRateLimiterForTests();
    const adapter = getRateLimiter();
    expect(adapter.constructor.name).toBe("InMemoryRateLimiter");
    expect(getRateLimiterName()).toBe("memory");
  });

  it("returns UpstashRateLimiter when both env vars are set", async () => {
    process.env.UPSTASH_REDIS_REST_URL = "https://fake.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "fake-token";
    // Mock the Upstash SDK so the module load does not fail in CI.
    vi.doMock("@upstash/ratelimit", () => {
      const Ctor = vi.fn().mockImplementation(() => ({}));
      return {
        Ratelimit: Object.assign(Ctor, {
          slidingWindow: () => ({}),
        }),
      };
    });
    vi.doMock("@upstash/redis", () => ({
      Redis: vi.fn().mockImplementation(() => ({})),
    }));
    const { getRateLimiter, getRateLimiterName, __resetRateLimiterForTests } =
      await import("../selectAdapter");
    __resetRateLimiterForTests();
    const adapter = getRateLimiter();
    expect(adapter.constructor.name).toBe("UpstashRateLimiter");
    expect(getRateLimiterName()).toBe("upstash");
  });
});

describe("cache adapter selection", () => {
  it("returns InMemoryDistributedCache when env is unset", async () => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    const { getCache, getCacheName, __resetCacheForTests } =
      await import("../../cache/selectAdapter");
    __resetCacheForTests();
    const adapter = getCache();
    expect(adapter.constructor.name).toBe("InMemoryDistributedCache");
    expect(getCacheName()).toBe("memory");
  });
});
