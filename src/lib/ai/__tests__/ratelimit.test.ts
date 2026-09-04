/**
 * Tests for the existing rate-limit helpers. The async return shape must
 * match the historical sync shape so route handlers can be ported with
 * no call-site rewrites beyond adding `await`.
 */
import { describe, expect, it } from "vitest";
import {
  checkChatRateLimit,
  checkFeatureRateLimit,
  checkRateLimit,
} from "../ratelimit";

describe("ai/ratelimit — legacy sync API", () => {
  it("checkRateLimit returns the expected shape", () => {
    const result = checkRateLimit("test:key", 5, 60_000);
    expect(result).toMatchObject({
      ok: expect.any(Boolean),
      remaining: expect.any(Number),
      resetAt: expect.any(Number),
    });
  });

  it("checkRateLimit blocks after the limit is hit", () => {
    const key = `test:limit:${Date.now()}`;
    for (let i = 0; i < 3; i += 1) {
      const r = checkRateLimit(key, 3, 60_000);
      expect(r.ok).toBe(true);
    }
    const fourth = checkRateLimit(key, 3, 60_000);
    expect(fourth.ok).toBe(false);
    expect(fourth.remaining).toBe(0);
  });
});

describe("ai/ratelimit — distributed (in-memory) API", () => {
  it("checkChatRateLimit returns the expected async shape", async () => {
    const result = await checkChatRateLimit(`user:${Math.random()}`);
    expect(result).toMatchObject({
      ok: expect.any(Boolean),
      remaining: expect.any(Number),
      resetAt: expect.any(Number),
    });
  });

  it("checkFeatureRateLimit returns the expected async shape", async () => {
    const result = await checkFeatureRateLimit(`user:${Math.random()}`);
    expect(result).toMatchObject({
      ok: expect.any(Boolean),
      remaining: expect.any(Number),
      resetAt: expect.any(Number),
    });
  });

  it("checkFeatureRateLimit blocks after the budget is hit", async () => {
    const userId = `user:limit:${Date.now()}`;
    for (let i = 0; i < 10; i += 1) {
      const r = await checkFeatureRateLimit(userId);
      expect(r.ok).toBe(true);
    }
    const eleventh = await checkFeatureRateLimit(userId);
    expect(eleventh.ok).toBe(false);
  });
});
