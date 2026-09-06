/**
 * Tests for the distributed (Upstash-backed) shadow parity counters.
 *
 * Contract:
 *  - every parity event INCRs the matching `fibrocare:metrics:shadow:*` key
 *  - the INCR is fire-and-forget: an Upstash failure never propagates and
 *    never slows the caller (warn-once per interval, then silence)
 *  - reads return `null` when the remote store is unavailable so the
 *    health route can report `shadowRemote: "local-only"`
 *  - a reachable store returns every counter, with a missing key as 0
 *
 * The fake Redis is injected via `__setRemoteReporterRedisForTests`, which
 * bypasses the real loader entirely (mirrors `__setUpstashModuleForTests`).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  recordRemoteShadowEvent,
  readShadowRemoteCounters,
  __setRemoteReporterRedisForTests,
  __resetRemoteReporterForTests,
} from "../shadowRemote";
import { __resetMetricsForTests } from "@/lib/observability/metrics";
import { __resetShadowReporterForTests } from "@/lib/observability/shadow";

type AnyFn = (...args: never[]) => unknown;

function makeFakeRedis(overrides: { incr?: AnyFn; get?: AnyFn } = {}) {
  return {
    incr: vi.fn(overrides.incr ?? (async () => 1)),
    get: vi.fn(overrides.get ?? (async () => null)),
  };
}

beforeEach(() => {
  __resetRemoteReporterForTests();
  __resetMetricsForTests();
  __resetShadowReporterForTests();
  process.env.UPSTASH_REDIS_REST_URL = "https://fake.upstash.io";
  process.env.UPSTASH_REDIS_REST_TOKEN = "fake-token";
});

afterEach(() => {
  __resetRemoteReporterForTests();
  vi.restoreAllMocks();
});

describe("recordRemoteShadowEvent", () => {
  it("INCRs the namespaced counter for the event", async () => {
    const redis = makeFakeRedis();
    __setRemoteReporterRedisForTests(redis as never);

    recordRemoteShadowEvent("cache", "check");
    // Fire-and-forget: let the tracked promise settle.
    await new Promise((r) => setTimeout(r, 0));

    expect(redis.incr).toHaveBeenCalledWith(
      "fibrocare:metrics:shadow:shadow_cache_check"
    );
  });

  it("maps both surfaces and both kinds to distinct keys", async () => {
    const redis = makeFakeRedis();
    __setRemoteReporterRedisForTests(redis as never);

    recordRemoteShadowEvent("cache", "check");
    recordRemoteShadowEvent("cache", "mismatch");
    recordRemoteShadowEvent("ratelimit", "check");
    recordRemoteShadowEvent("ratelimit", "mismatch");
    await new Promise((r) => setTimeout(r, 0));

    const calledKeys = redis.incr.mock.calls.map((c) => c[0]);
    expect(calledKeys).toEqual([
      "fibrocare:metrics:shadow:shadow_cache_check",
      "fibrocare:metrics:shadow:shadow_cache_mismatch",
      "fibrocare:metrics:shadow:shadow_ratelimit_check",
      "fibrocare:metrics:shadow:shadow_ratelimit_mismatch",
    ]);
  });

  it("does not throw or warn when Upstash INCR fails (fail-open)", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const redis = makeFakeRedis({ incr: async () => { throw new Error("redis down"); } });
    __setRemoteReporterRedisForTests(redis as never);

    expect(() => recordRemoteShadowEvent("cache", "check")).not.toThrow();
    await new Promise((r) => setTimeout(r, 0));
    expect(warnSpy).toHaveBeenCalledTimes(1);

    // Repeated failures inside the warn interval stay silent.
    recordRemoteShadowEvent("cache", "check");
    await new Promise((r) => setTimeout(r, 0));
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  it("is a no-op when credentials are missing", async () => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    // Force a fresh (non-injected) resolution path.
    __resetRemoteReporterForTests();

    const loadSpy = vi.spyOn(await import("@/lib/upstash/client"), "loadUpstashModule");

    expect(() => recordRemoteShadowEvent("cache", "check")).not.toThrow();
    await new Promise((r) => setTimeout(r, 0));
    expect(loadSpy).not.toHaveBeenCalled();
  });
});

describe("readShadowRemoteCounters", () => {
  it("returns all four counters with missing keys as 0", async () => {
    const redis = makeFakeRedis({
      get: async (key: string) => {
        if (key.endsWith("shadow_cache_check")) return "21";
        if (key.endsWith("shadow_ratelimit_check")) return "7";
        return null; // mismatches never happened
      },
    });
    __setRemoteReporterRedisForTests(redis as never);

    const counters = await readShadowRemoteCounters();

    expect(counters).toEqual({
      shadow_cache_check: 21,
      shadow_cache_mismatch: 0,
      shadow_ratelimit_check: 7,
      shadow_ratelimit_mismatch: 0,
    });
  });

  it("returns null when the store is unreachable", async () => {
    const redis = makeFakeRedis({ get: async () => { throw new Error("timeout"); } });
    __setRemoteReporterRedisForTests(redis as never);
    vi.spyOn(console, "warn").mockImplementation(() => {});

    expect(await readShadowRemoteCounters()).toBeNull();
  });

  it("returns null when credentials are missing (local-only mode)", async () => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    __resetRemoteReporterForTests();

    expect(await readShadowRemoteCounters()).toBeNull();
  });

  it("treats a non-numeric stored value as unavailable (null)", async () => {
    const redis = makeFakeRedis({ get: async () => "not-a-number" });
    __setRemoteReporterRedisForTests(redis as never);

    expect(await readShadowRemoteCounters()).toBeNull();
  });
});

describe("integration with the shadow reporters", () => {
  it("recordShadowCheck bumps both the local and the distributed counter", async () => {
    const redis = makeFakeRedis();
    __setRemoteReporterRedisForTests(redis as never);
    const { recordShadowCheck } = await import("@/lib/observability/shadow");
    const metricsMod = await import("@/lib/observability/metrics");

    recordShadowCheck("cache");
    await new Promise((r) => setTimeout(r, 0));

    expect(metricsMod.get("shadow_cache_check")).toBe(1);
    expect(redis.incr).toHaveBeenCalledWith(
      "fibrocare:metrics:shadow:shadow_cache_check"
    );
  });
});
