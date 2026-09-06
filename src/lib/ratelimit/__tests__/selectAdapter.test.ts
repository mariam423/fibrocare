/**
 * Verifies the adapter selector returns the correct implementation
 * based on env-var presence AND the opt-in feature flag.
 */
import { afterEach, describe, expect, it, vi } from "vitest";

const originalUrl = process.env.UPSTASH_REDIS_REST_URL;
const originalToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const originalCacheFlag = process.env.USE_UPSTASH_CACHE;
const originalRateLimitFlag = process.env.USE_UPSTASH_RATELIMIT;
const originalShadowCache = process.env.SHADOW_CACHE;
const originalShadowRateLimit = process.env.SHADOW_RATELIMIT;

afterEach(() => {
  if (originalUrl === undefined) delete process.env.UPSTASH_REDIS_REST_URL;
  else process.env.UPSTASH_REDIS_REST_URL = originalUrl;
  if (originalToken === undefined) delete process.env.UPSTASH_REDIS_REST_TOKEN;
  else process.env.UPSTASH_REDIS_REST_TOKEN = originalToken;
  if (originalCacheFlag === undefined) delete process.env.USE_UPSTASH_CACHE;
  else process.env.USE_UPSTASH_CACHE = originalCacheFlag;
  if (originalRateLimitFlag === undefined) delete process.env.USE_UPSTASH_RATELIMIT;
  else process.env.USE_UPSTASH_RATELIMIT = originalRateLimitFlag;
  if (originalShadowCache === undefined) delete process.env.SHADOW_CACHE;
  else process.env.SHADOW_CACHE = originalShadowCache;
  if (originalShadowRateLimit === undefined) delete process.env.SHADOW_RATELIMIT;
  else process.env.SHADOW_RATELIMIT = originalShadowRateLimit;
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

  it("returns a ShadowRateLimiter when SHADOW_RATELIMIT is on (cutover not flipped)", async () => {
    process.env.UPSTASH_REDIS_REST_URL = "https://fake.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "fake-token";
    delete process.env.USE_UPSTASH_RATELIMIT;
    process.env.SHADOW_RATELIMIT = "1";
    const { getRateLimiter, getRateLimiterName, __resetRateLimiterForTests } =
      await import("../selectAdapter");
    __resetRateLimiterForTests();
    const adapter = getRateLimiter();
    expect(adapter.constructor.name).toBe("ShadowRateLimiter");
    // The serving adapter is still the in-process one.
    expect(getRateLimiterName()).toBe("memory");
  });

  it("ignores SHADOW_RATELIMIT once the cutover flag is on", async () => {
    process.env.UPSTASH_REDIS_REST_URL = "https://fake.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "fake-token";
    process.env.USE_UPSTASH_RATELIMIT = "1";
    process.env.SHADOW_RATELIMIT = "1";
    const { getRateLimiter, __resetRateLimiterForTests } = await import(
      "../selectAdapter"
    );
    __resetRateLimiterForTests();
    const adapter = getRateLimiter();
    expect(adapter.constructor.name).toBe("UpstashRateLimiter");
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

  it("returns a ShadowCache when SHADOW_CACHE is on (cutover not flipped)", async () => {
    process.env.UPSTASH_REDIS_REST_URL = "https://fake.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "fake-token";
    delete process.env.USE_UPSTASH_CACHE;
    process.env.SHADOW_CACHE = "1";
    const { getCache, getCacheName, __resetCacheForTests } = await import(
      "../../cache/selectAdapter"
    );
    __resetCacheForTests();
    const adapter = getCache();
    expect(adapter.constructor.name).toBe("ShadowCache");
    // The serving adapter is still the in-process one.
    expect(getCacheName()).toBe("memory");
  });

  it("ignores SHADOW_CACHE when the Upstash credentials are missing", async () => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    delete process.env.USE_UPSTASH_CACHE;
    process.env.SHADOW_CACHE = "1";
    const { getCache, __resetCacheForTests } = await import(
      "../../cache/selectAdapter"
    );
    __resetCacheForTests();
    const adapter = getCache();
    expect(adapter.constructor.name).toBe("InMemoryDistributedCache");
  });

  it("ignores SHADOW_CACHE once the cutover flag is on", async () => {
    process.env.UPSTASH_REDIS_REST_URL = "https://fake.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "fake-token";
    process.env.USE_UPSTASH_CACHE = "1";
    process.env.SHADOW_CACHE = "1";
    const { getCache, __resetCacheForTests } = await import(
      "../../cache/selectAdapter"
    );
    __resetCacheForTests();
    const adapter = getCache();
    expect(adapter.constructor.name).toBe("UpstashDistributedCache");
  });
});
