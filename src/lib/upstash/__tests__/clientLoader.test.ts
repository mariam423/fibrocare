/**
 * Regression test for the live SDK loader path.
 *
 * The real packages resolve as *namespaces* — `@upstash/redis` exports
 * `{ Redis, ... }` and `@upstash/ratelimit` exports `{ Ratelimit, ... }`
 * — so `getUpstashClient` / `getUpstashRatelimit` must unwrap the named
 * constructor. This only became reachable once `createRequire` resolved
 * from a real path (see `getRequireAnchor`); before that, module loading
 * always failed and the adapters silently ran permissive in-process
 * behaviour.
 *
 * Tests inject namespace-shaped modules through the same
 * `__setUpstashModuleForTests` hook the unit tests use, mirroring what a
 * live `require()` returns.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const slidingWindowMock = vi.fn(() => ({ __algo: "slidingWindow" }));

beforeEach(async () => {
  process.env.UPSTASH_REDIS_REST_URL = "https://fake.upstash.io";
  process.env.UPSTASH_REDIS_REST_TOKEN = "fake-token";

  // Namespace-shaped modules, exactly like the real packages.
  class FakeRedis {
    config: { url: string; token: string };
    constructor(config: { url: string; token: string }) {
      this.config = config;
    }
  }
  class FakeRatelimit {
    config: { redis: unknown; limiter: unknown; prefix: string };
    constructor(config: {
      redis: unknown;
      limiter: unknown;
      prefix: string;
      analytics: boolean;
    }) {
      this.config = config;
    }
  }
  (FakeRatelimit as unknown as { slidingWindow: typeof slidingWindowMock }).slidingWindow =
    slidingWindowMock;

  const clientModule = await import("../client");
  clientModule.__setUpstashModuleForTests("@upstash/redis", { Redis: FakeRedis });
  clientModule.__setUpstashModuleForTests("@upstash/ratelimit", {
    Ratelimit: FakeRatelimit,
  });
});

const originalUrl = process.env.UPSTASH_REDIS_REST_URL;
const originalToken = process.env.UPSTASH_REDIS_REST_TOKEN;

afterEach(async () => {
  if (originalUrl === undefined) delete process.env.UPSTASH_REDIS_REST_URL;
  else process.env.UPSTASH_REDIS_REST_URL = originalUrl;
  if (originalToken === undefined) delete process.env.UPSTASH_REDIS_REST_TOKEN;
  else process.env.UPSTASH_REDIS_REST_TOKEN = originalToken;
  const clientModule = await import("../client");
  clientModule.__resetUpstashModulesForTests();
});

describe("Upstash SDK loader (real namespace shape)", () => {
  it("unwraps the Redis constructor from the module namespace", async () => {
    const { getUpstashClient } = await import("../client");
    const bundle = getUpstashClient();

    expect(bundle).not.toBeNull();
    const redis = bundle!.redis as { config?: { url: string; token: string } };
    expect(redis.config?.url).toBe("https://fake.upstash.io");
    expect(redis.config?.token).toBe("fake-token");
  });

  it("unwraps the Ratelimit constructor and keeps its static slidingWindow", async () => {
    const { getUpstashRatelimit } = await import("../client");
    const limiter = getUpstashRatelimit("default", 20, 60_000);

    expect(limiter).not.toBeNull();
    const config = (limiter as { config?: { prefix: string; limiter: unknown } }).config;
    expect(config?.prefix).toBe("fibrocare:default");
    expect(config?.limiter).toEqual({ __algo: "slidingWindow" });
    expect(slidingWindowMock).toHaveBeenCalledWith(20, "1 m");
  });

  it("passes a directly-injected constructor through unchanged", async () => {
    const clientModule = await import("../client");
    class DirectFakeRedis {
      config: unknown;
      constructor(config: unknown) {
        this.config = config;
      }
    }
    // Reset overrides, then inject the constructor directly (the shape the
    // older unit tests use).
    clientModule.__resetUpstashModulesForTests();
    clientModule.__setUpstashModuleForTests("@upstash/redis", DirectFakeRedis);
    const bundle = clientModule.getUpstashClient();
    expect(bundle?.redis).toBeInstanceOf(DirectFakeRedis);
  });
});
