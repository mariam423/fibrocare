/**
 * Tests for the Upstash adapter. We mock `@upstash/ratelimit` so the
 * adapter logic can be exercised without a real Redis.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// ── Mocks ──────────────────────────────────────────────────────────────
// The Upstash SDK is mocked at the module boundary; we control the
// return value of `Ratelimit.slidingWindow` and the constructed
// `Ratelimit` instance.

const limitMock = vi.fn();
const slidingWindowMock = vi.fn(() => ({ __algo: "slidingWindow" }));
const RatelimitMock = vi.fn().mockImplementation(function () {
  return { limit: limitMock };
});

vi.mock("@upstash/ratelimit", () => {
  // The real export is `class Ratelimit { static slidingWindow(...) {} }`.
  // The class itself needs to be constructable AND have a static method.
  class FakeRatelimit {
    limit = limitMock;
  }
  (FakeRatelimit as unknown as { slidingWindow: typeof slidingWindowMock }).slidingWindow =
    slidingWindowMock;
  return { Ratelimit: FakeRatelimit };
});

// We exercise the adapter through `selectAdapter`, which inspects
// `process.env.UPSTASH_REDIS_REST_URL`.
const originalUrl = process.env.UPSTASH_REDIS_REST_URL;
const originalToken = process.env.UPSTASH_REDIS_REST_TOKEN;

beforeEach(() => {
  process.env.UPSTASH_REDIS_REST_URL = "https://fake.upstash.io";
  process.env.UPSTASH_REDIS_REST_TOKEN = "fake-token";
  limitMock.mockReset();
  slidingWindowMock.mockClear();
  RatelimitMock.mockClear();
});

afterEach(() => {
  if (originalUrl === undefined) delete process.env.UPSTASH_REDIS_REST_URL;
  else process.env.UPSTASH_REDIS_REST_URL = originalUrl;
  if (originalToken === undefined) delete process.env.UPSTASH_REDIS_REST_TOKEN;
  else process.env.UPSTASH_REDIS_REST_TOKEN = originalToken;
  vi.resetModules();
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
