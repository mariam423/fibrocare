/**
 * Per-user, short-TTL cache for the health-snapshot + insight-summary
 * pair. The two functions are the most-called DB queries across the AI
 * feature routes (insight, reflect, questions, and the chat companion's
 * long-term memory all read the same 30-day window). When the user opens
 * the dashboard and triggers 2-3 AI features in quick succession, this
 * cache collapses the duplicate reads into one.
 *
 * The cache is intentionally short (30s by default) because the user's
 * health state is the data — a stale snapshot would feed the prompt with
 * yesterday's pain. 30s is well under typical user dwell time, so they
 * never see a stale value in the same session, but a dashboard refresh
 * storm is absorbed.
 *
 * The cache is opt-in distributed: when `UPSTASH_REDIS_REST_URL` is set
 * the entry lives in Redis (shared across instances and deploys); when it
 * is not, the entry lives in-process behind the same `IDistributedCache`
 * contract. The InMemoryDistributedCache caps itself at a tiny entry
 * count, so a busy server cannot OOM.
 *
 * NOTE: the AI feature endpoints are streaming — the *response* cannot
 * be cached at the route level (a partial stream is not a replayable
 * value). What IS cacheable is the *prompt inputs* (the snapshot the
 * prompt embeds), and that is what this module wraps. The two layers
 * compose: with a 30s snapshot cache, a 60s feature rate limit, and the
 * 3-state circuit breaker, the same prompt fingerprint reads from
 * Upstash on instance B after instance A computed it.
 */

import { getCache } from "@/lib/cache/selectAdapter";
import { buildHealthSnapshot, getInsightSummaries } from "@/lib/ai/context";
import type { HealthSnapshot } from "@/lib/ai/schemas";

/** 30s — under typical user dwell time, well above the burst of a refresh. */
const SNAPSHOT_TTL_MS = 30_000;

function snapshotKey(userId: string): string {
  return `snapshot:v1:u=${userId}`;
}

function insightsKey(userId: string, days: number): string {
  return `insights:v1:u=${userId}:d=${days}`;
}

/**
 * Cached wrapper over `buildHealthSnapshot`. Caches the computed
 * snapshot for `SNAPSHOT_TTL_MS` per user.
 */
export function getCachedHealthSnapshot(userId: string): Promise<HealthSnapshot> {
  return getCache().getOrSet(
    snapshotKey(userId),
    () => buildHealthSnapshot(userId),
    SNAPSHOT_TTL_MS
  );
}

/**
 * Cached wrapper over `getInsightSummaries`. Keyed on `(userId, days)`
 * because the engine returns a different window for the same user.
 */
export function getCachedInsightSummaries(
  userId: string,
  days: number
): ReturnType<typeof getInsightSummaries> {
  return getCache().getOrSet(
    insightsKey(userId, days),
    () => getInsightSummaries(userId, days),
    SNAPSHOT_TTL_MS
  );
}

/** Reset the cache — test-only. */
export function __resetSnapshotCacheForTests(): void {
  // No per-call state; reset propagates through the underlying adapter.
  // Exposed for symmetry with other `__reset*ForTests` helpers.
}
