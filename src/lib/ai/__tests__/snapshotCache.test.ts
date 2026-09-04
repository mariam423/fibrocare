/**
 * Tests for the per-user snapshot/insights cache wrappers.
 *
 * These wrap the two highest-volume DB reads in the AI feature surface
 * (buildHealthSnapshot + getInsightSummaries) behind a 30s per-user cache
 * that routes through the same `IDistributedCache` selector as the LLM
 * cache. The tests prove:
 *   1. The first call invokes the underlying builder exactly once.
 *   2. The second call within the TTL hits the cache, not the builder.
 *   3. The cache key is per-user (no cross-user leak).
 *
 * The real builders are stubbed — we are testing the cache *wrapper*,
 * not the snapshot content. The stub returns a sentinel object so we can
 * tell cache hits from cache misses.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/ai/context", () => ({
  buildHealthSnapshot: vi.fn(async (userId: string) => ({
    __stub: "snapshot",
    userId,
  })),
  getInsightSummaries: vi.fn(async (userId: string, days: number) => ({
    __stub: "insights",
    userId,
    days,
  })),
}));

import {
  getCachedHealthSnapshot,
  getCachedInsightSummaries,
} from "../snapshotCache";
import { buildHealthSnapshot, getInsightSummaries } from "../context";
import { __resetCacheForTests } from "@/lib/cache/selectAdapter";

describe("ai/snapshotCache — per-user short-TTL cache", () => {
  beforeEach(() => {
    __resetCacheForTests();
    vi.mocked(buildHealthSnapshot).mockClear();
    vi.mocked(getInsightSummaries).mockClear();
  });

  it("caches the snapshot — second call does not re-invoke the builder", async () => {
    const a = await getCachedHealthSnapshot("user-A");
    const b = await getCachedHealthSnapshot("user-A");
    expect(a).toEqual(b);
    expect(buildHealthSnapshot).toHaveBeenCalledTimes(1);
  });

  it("caches insights with the (userId, days) key", async () => {
    await getCachedInsightSummaries("user-A", 30);
    await getCachedInsightSummaries("user-A", 30);
    await getCachedInsightSummaries("user-A", 7); // different days → miss
    expect(getInsightSummaries).toHaveBeenCalledTimes(2);
  });

  it("per-user keys — user B does not see user A's snapshot", async () => {
    const a = await getCachedHealthSnapshot("user-A");
    const b = await getCachedHealthSnapshot("user-B");
    expect(a).not.toBe(b);
    expect((a as unknown as { userId: string }).userId).toBe("user-A");
    expect((b as unknown as { userId: string }).userId).toBe("user-B");
    expect(buildHealthSnapshot).toHaveBeenCalledTimes(2);
  });
});
