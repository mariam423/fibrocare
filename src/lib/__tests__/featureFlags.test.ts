/**
 * Tests for the centralized feature flag module.
 *
 * Covers:
 *  - Default-off behaviour: every flag returns false with no env vars.
 *  - Truthy / falsy / garbage parsing.
 *  - The combined `shouldUse*` rules (flag + credentials).
 *  - The test reset hook.
 */
import { afterEach, describe, expect, it } from "vitest";

const ORIGINAL_ENV = { ...process.env };
const flagVars = [
  "USE_UPSTASH_CACHE",
  "USE_UPSTASH_RATELIMIT",
  "USE_ACCELERATE",
  "SHADOW_CACHE",
  "SHADOW_RATELIMIT",
];

afterEach(() => {
  // Restore every variable the tests touched so order doesn't matter.
  for (const v of flagVars) {
    if (ORIGINAL_ENV[v] === undefined) delete process.env[v];
    else process.env[v] = ORIGINAL_ENV[v];
  }
  // Drop credentials so the combined-rule tests start from a known state.
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
  delete process.env.PRISMA_ACCELERATE_URL;
});

async function freshFlags() {
  const mod = await import("../featureFlags");
  mod.__resetFeatureFlagsForTests();
  return mod;
}

describe("featureFlags", () => {
  it("all flags are false by default", async () => {
    for (const v of flagVars) delete process.env[v];
    const {
      shouldUseUpstashCache,
      shouldUseUpstashRateLimit,
      shouldUseAccelerate,
      isShadowCacheEnabled,
      isShadowRateLimitEnabled,
    } = await freshFlags();
    expect(shouldUseUpstashCache()).toBe(false);
    expect(shouldUseUpstashRateLimit()).toBe(false);
    expect(shouldUseAccelerate()).toBe(false);
    expect(isShadowCacheEnabled()).toBe(false);
    expect(isShadowRateLimitEnabled()).toBe(false);
  });

  it("parses common truthy strings", async () => {
    for (const v of flagVars) process.env[v] = "1";
    const { shouldUseUpstashCache, isShadowCacheEnabled } = await freshFlags();
    expect(shouldUseUpstashCache()).toBe(false); // no creds yet
    process.env.UPSTASH_REDIS_REST_URL = "https://x.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "t";
    expect(shouldUseUpstashCache()).toBe(true);
    expect(isShadowCacheEnabled()).toBe(true);
  });

  it("parses 'true', 'yes', 'on' (case-insensitive)", async () => {
    for (const v of ["true", "TRUE", "Yes", "ON"]) {
      for (const f of flagVars) process.env[f] = v;
      const { isShadowCacheEnabled } = await freshFlags();
      expect(isShadowCacheEnabled()).toBe(true);
    }
  });

  it("parses common falsy strings", async () => {
    for (const v of ["0", "false", "no", "off", ""]) {
      for (const f of flagVars) process.env[f] = v;
      const { shouldUseUpstashCache, isShadowRateLimitEnabled } =
        await freshFlags();
      expect(shouldUseUpstashCache()).toBe(false);
      expect(isShadowRateLimitEnabled()).toBe(false);
    }
  });

  it("falls back to false on unrecognized values (and warns)", async () => {
    process.env.USE_UPSTASH_CACHE = "maybe";
    const { shouldUseUpstashCache } = await freshFlags();
    expect(shouldUseUpstashCache()).toBe(false);
  });

  it("shouldUseUpstashCache requires both flag and credentials", async () => {
    process.env.USE_UPSTASH_CACHE = "1";
    const { shouldUseUpstashCache } = await freshFlags();
    // No creds — should be false.
    expect(shouldUseUpstashCache()).toBe(false);

    process.env.UPSTASH_REDIS_REST_URL = "https://x.upstash.io";
    expect(shouldUseUpstashCache()).toBe(false); // still no token

    process.env.UPSTASH_REDIS_REST_TOKEN = "t";
    expect(shouldUseUpstashCache()).toBe(true);
  });

  it("shouldUseUpstashRateLimit requires both flag and credentials", async () => {
    process.env.USE_UPSTASH_RATELIMIT = "1";
    const { shouldUseUpstashRateLimit } = await freshFlags();
    expect(shouldUseUpstashRateLimit()).toBe(false);

    process.env.UPSTASH_REDIS_REST_URL = "https://x.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "t";
    expect(shouldUseUpstashRateLimit()).toBe(true);
  });

  it("shouldUseAccelerate requires both flag and URL", async () => {
    process.env.USE_ACCELERATE = "1";
    const { shouldUseAccelerate } = await freshFlags();
    expect(shouldUseAccelerate()).toBe(false);

    process.env.PRISMA_ACCELERATE_URL = "prisma://accelerate";
    expect(shouldUseAccelerate()).toBe(true);
  });

  it("getFlagsSnapshot returns a stable shape", async () => {
    const { getFlagsSnapshot } = await freshFlags();
    const snap = getFlagsSnapshot();
    expect(snap).toEqual({
      useUpstashCache: false,
      useUpstashRateLimit: false,
      useAccelerate: false,
      shadowCache: false,
      shadowRateLimit: false,
    });
  });
});
