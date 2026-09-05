/**
 * Tests for the Upstash adapter.
 *
 * The Upstash SDK is loaded via `module.createRequire` in
 * `src/lib/upstash/client.ts` to hide it from Turbopack's static
 * analysis. We can't `vi.mock("@upstash/ratelimit", ...)` anymore —
 * vitest's `vi.mock` patches the ESM module registry, not Node's CJS
 * `require`. Instead, we inject the fake class through the public
 * `__setUpstashModuleForTests` hook.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// ── Mocks ──────────────────────────────────────────────────────────────
const limitMock = vi.fn();
const slidingWindowMock = vi.fn(() => ({ __algo: "slidingWindow" }));

beforeEach(async () => {
  process.env.UPSTASH_REDIS_REST_URL = "https://fake.upstash.io";
  process.env.UPSTASH_REDIS_REST_TOKEN = "fake-token";
  limitMock.mockReset();
  slidingWindowMock.mockClear();

  // Build the fake Ratelimit class and inject it through the test hook.
  // The loader returns the same instance for every call within the test.
  class FakeRatelimit {
    limit = limitMock;
  }
  (FakeRatelimit as unknown as { slidingWindow: typeof slidingWindowMock }).slidingWindow =
    slidingWindowMock;

  const clientModule = await import("../client");
  clientModule.__setUpstashModuleForTests("@upstash/redis", class FakeRedis {});
  clientModule.__setUpstashModuleForTests("@upstash/ratelimit", FakeRatelimit);
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

describe("UpstashRateLimiter", () => {
  it("returns ok=true on success", async () => {
    limitMock.mockResolvedValueOnce({
      success: true,
      limit: 20,
      remaining: 19,
      reset: 1_700_000_000_000,
      pending: Promise.resolve(),
    });
    const { UpstashRateLimiter } = await import("../../ratelimit/upstashLimiter");
    const adapter = new UpstashRateLimiter();
    const result = await adapter.check("chat:user1", 20, 60_000);
    expect(result.ok).toBe(true);
    expect(result.remaining).toBe(19);
    expect(result.resetAt).toBe(1_700_000_000_000);
  });

  it("returns ok=false when the SDK reports deny", async () => {
    limitMock.mockResolvedValueOnce({
      success: false,
      limit: 10,
      remaining: 0,
      reset: 1_700_000_060_000,
      pending: Promise.resolve(),
    });
    const { UpstashRateLimiter } = await import("../../ratelimit/upstashLimiter");
    const adapter = new UpstashRateLimiter();
    const result = await adapter.check("feature:user1", 10, 60_000);
    expect(result.ok).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("falls back to allow on Upstash error (defense in depth)", async () => {
    limitMock.mockRejectedValueOnce(new Error("network down"));
    const { UpstashRateLimiter } = await import("../../ratelimit/upstashLimiter");
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const adapter = new UpstashRateLimiter();
    const result = await adapter.check("chat:user1", 20, 60_000);
    expect(result.ok).toBe(true);
    expect(result.remaining).toBe(20);
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});
