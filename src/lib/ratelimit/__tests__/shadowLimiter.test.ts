/**
 * Tests for the shadow rate-limiter wrapper.
 *
 * The wrapper's contract:
 *  - every call runs on BOTH limiters
 *  - the primary's decision is always the one enforced
 *  - a primary allow + shadow deny is the only "mismatch" (after cutover
 *    the same request would be 429'd); primary deny + shadow allow is
 *    benign extra headroom and is NOT a mismatch
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { get as metricGet, __resetMetricsForTests } from "@/lib/observability/metrics";
import { __resetShadowReporterForTests } from "@/lib/observability/shadow";
import { ShadowRateLimiter } from "../shadowLimiter";
import type { IDistributedRateLimiter, RateLimitResult } from "../IDistributedRateLimiter";

function makeLimiter(results: RateLimitResult[]): IDistributedRateLimiter {
  const queue = [...results];
  return {
    check: vi.fn(async () => queue.shift() ?? { ok: true, remaining: 1, resetAt: 0 }),
  };
}

afterEach(() => {
  __resetMetricsForTests();
  __resetShadowReporterForTests();
});

describe("ShadowRateLimiter", () => {
  it("serves the primary decision when both limiters agree", async () => {
    const primary = makeLimiter([{ ok: true, remaining: 7, resetAt: 1_700_000_000_000 }]);
    const shadow = makeLimiter([{ ok: true, remaining: 7, resetAt: 1_700_000_000_000 }]);
    const wrapper = new ShadowRateLimiter(primary, shadow);

    const result = await wrapper.check("chat:user1", 20, 60_000);

    expect(result).toEqual({ ok: true, remaining: 7, resetAt: 1_700_000_000_000 });
    expect(metricGet("shadow_ratelimit_check")).toBe(1);
    expect(metricGet("shadow_ratelimit_mismatch")).toBe(0);
  });

  it("flags a mismatch when the primary allows but Upstash would deny", async () => {
    const primary = makeLimiter([{ ok: true, remaining: 2, resetAt: 1_700_000_000_000 }]);
    const shadow = makeLimiter([{ ok: false, remaining: 0, resetAt: 1_700_000_000_000 }]);
    const wrapper = new ShadowRateLimiter(primary, shadow);
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const result = await wrapper.check("chat:user1", 20, 60_000);

    // The in-process decision is enforced (no user-facing 429 in shadow)…
    expect(result.ok).toBe(true);
    // …but the operator is told the same request WOULD 429 after cutover.
    expect(metricGet("shadow_ratelimit_mismatch")).toBe(1);
    expect(warnSpy).toHaveBeenCalledOnce();
    warnSpy.mockRestore();
  });

  it("does NOT flag when the primary denies but Upstash would allow", async () => {
    const primary = makeLimiter([{ ok: false, remaining: 0, resetAt: 1_700_000_000_000 }]);
    const shadow = makeLimiter([{ ok: true, remaining: 9, resetAt: 1_700_000_000_000 }]);
    const wrapper = new ShadowRateLimiter(primary, shadow);

    const result = await wrapper.check("chat:user1", 20, 60_000);

    expect(result.ok).toBe(false);
    // Benign direction: after cutover the user would get MORE headroom.
    expect(metricGet("shadow_ratelimit_mismatch")).toBe(0);
  });

  it("forwards the full (key, limit, window) to both adapters", async () => {
    const primary = makeLimiter([{ ok: true, remaining: 19, resetAt: 1 }]);
    const shadow = makeLimiter([{ ok: true, remaining: 19, resetAt: 1 }]);
    const wrapper = new ShadowRateLimiter(primary, shadow);

    await wrapper.check("feature:user1", 10, 60_000);

    expect(primary.check).toHaveBeenCalledWith("feature:user1", 10, 60_000);
    expect(shadow.check).toHaveBeenCalledWith("feature:user1", 10, 60_000);
  });
});
