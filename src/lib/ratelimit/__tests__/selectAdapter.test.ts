/**
 * Verifies the adapter selector returns the correct implementation
 * based on env-var presence AND the opt-in feature flag.
 */
import { afterEach, describe, expect, it, vi } from "vitest";

const originalUrl = process.env.UPSTASH_REDIS_REST_URL;
const originalToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const originalCacheFlag = process.env.USE_UPSTASH_CACHE;
const originalRateLimitFlag = process.env.USE_UPSTASH_RATELIMIT;

afterEach(() => {
  if (originalUrl === undefined) delete process.env.UPSTASH_REDIS_REST_URL;
  else process.env.UPSTASH_REDIS_REST_URL = originalUrl;
  if (originalToken === undefined) delete process.env.UPSTASH_REDIS_REST_TOKEN;
  else process.env.UPSTASH_REDIS_REST_TOKEN = originalToken;
  if (originalCacheFlag === undefined) delete process.env.USE_UPSTASH_CACHE;
  else process.env.USE_UPSTASH_CACHE = originalCacheFlag;
  if (originalRateLimitFlag === undefined) delete process.env.USE_UPSTASH_RATELIMIT;
  else process.env.USE_UPSTASH_RATELIMIT = originalRateLimitFlag;
  vi.resetModules();
});

describe("rate-limiter adapter selection", () => {
  it("returns InMemoryRateLimiter when env is unset", async () => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    delete process.env.USE_UPSTASH_RATELIMIT;
    const { getRateLimiter, getRateLimiterName, __resetRateLimiterForTests } =
      await import("../selectAdapter");
    __resetRateLimiterForTests();
    const adapter = getRateLimiter();
    expect(adapter.constructor.name).toBe("InMemoryRateLimiter");
    expect(getRateLimiterName()).toBe("memory");
  });

  it("returns InMemoryRateLimiter when env is set but flag is off", async () => {
    process.env.UPSTASH_REDIS_REST_URL = "https://fake.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "fake-token";
    delete process.env.USE_UPSTASH_RATELIMIT;
    const { getRateLimiter, getRateLimiterName, __resetRateLimiterForTests } =
      await import("../selectAdapter");
    __resetRateLimiterForTests();
    const adapter = getRateLimiter();
    expect(adapter.constructor.name).toBe("InMemoryRateLimiter");
    expect(getRateLimiterName()).toBe("memory");
  });

  it("returns UpstashRateLimiter when env is set AND flag is on", async () => {
    process.env.UPSTASH_REDIS_REST_URL = "https://fake.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "fake-token";
    process.env.USE_UPSTASH_RATELIMIT = "1";
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
    delete process.env.USE_UPSTASH_CACHE;
    const { getCache, getCacheName, __resetCacheForTests } =
      await import("../../cache/selectAdapter");
    __resetCacheForTests();
    const adapter = getCache();
    expect(adapter.constructor.name).toBe("InMemoryDistributedCache");
    expect(getCacheName()).toBe("memory");
  });

  it("returns InMemoryDistributedCache when env is set but flag is off", async () => {
    process.env.UPSTASH_REDIS_REST_URL = "https://fake.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "fake-token";
    delete process.env.USE_UPSTASH_CACHE;
    const { getCache, getCacheName, __resetCacheForTests } =
      await import("../../cache/selectAdapter");
    __resetCacheForTests();
    const adapter = getCache();
    expect(adapter.constructor.name).toBe("InMemoryDistributedCache");
    expect(getCacheName()).toBe("memory");
  });
});
