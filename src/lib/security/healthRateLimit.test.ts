import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/ai/ratelimit", () => ({
  checkRateLimitDistributed: vi.fn(),
}));

import { healthDataRateLimit } from "./healthRateLimit";
import { checkRateLimitDistributed } from "@/lib/ai/ratelimit";

const mockedLimiter = vi.mocked(checkRateLimitDistributed);

/** Contract shape from `IDistributedRateLimiter.RateLimitResult`. */
function limiterResult(
  overrides: Partial<{ ok: boolean; remaining: number; resetAt: number }> = {}
) {
  return {
    ok: true,
    remaining: 119,
    resetAt: Date.now() + 60_000,
    ...overrides,
  };
}

describe("healthDataRateLimit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns null (allowed) and consumes one slot on the per-user key", async () => {
    mockedLimiter.mockResolvedValueOnce(limiterResult());

    const res = await healthDataRateLimit("user-1");

    expect(res).toBeNull();
    expect(mockedLimiter).toHaveBeenCalledOnce();
    expect(mockedLimiter).toHaveBeenCalledWith("health-data:user-1", 120, 60_000);
  });

  it("returns a 429 with Retry-After when the per-user budget is spent", async () => {
    // resetAt 30s in the future → Retry-After must be 30 (ceil, not floor).
    const resetAt = Date.now() + 30_000;
    mockedLimiter.mockResolvedValueOnce(limiterResult({ ok: false, remaining: 0, resetAt }));

    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    try {
      const res = await healthDataRateLimit("user-1");

      expect(res).not.toBeNull();
      expect(res!.status).toBe(429);
      expect(res!.headers.get("Retry-After")).toBe("30");

      const body = await res!.json();
      expect(body).toEqual({
        error: "Too many health-data requests — try again shortly.",
      });
      expect(consoleError).not.toHaveBeenCalled();
    } finally {
      consoleError.mockRestore();
    }
  });

  it("rounds Retry-After up and floors it at 1 second", async () => {
    // resetAt 250ms in the future → ceil(0.25) = 1, never "0" or negative.
    const resetAt = Date.now() + 250;
    mockedLimiter.mockResolvedValueOnce(
      limiterResult({ ok: false, remaining: 0, resetAt })
    );

    const res = await healthDataRateLimit("user-1");

    expect(res!.status).toBe(429);
    expect(res!.headers.get("Retry-After")).toBe("1");
  });

  it("keys each user independently", async () => {
    mockedLimiter.mockResolvedValue(limiterResult());

    await healthDataRateLimit("user-A");
    await healthDataRateLimit("user-B");

    expect(mockedLimiter).toHaveBeenCalledTimes(2);
    expect(mockedLimiter).toHaveBeenNthCalledWith(
      1,
      "health-data:user-A",
      120,
      60_000
    );
    expect(mockedLimiter).toHaveBeenNthCalledWith(
      2,
      "health-data:user-B",
      120,
      60_000
    );
  });
});
