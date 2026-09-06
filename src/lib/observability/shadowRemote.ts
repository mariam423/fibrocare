/**
 * Distributed shadow-parity counters (Upstash INCR).
 *
 * The in-process counters in `metrics.ts` are per-process: on Vercel every
 * route is its own serverless function, so `/api/health` can never see the
 * `shadow_*` counters that `/api/weather` and the AI routes increment. That
 * makes the 24h shadow window effectively unobservable on serverless.
 *
 * Fix: mirror every parity event into Upstash with `INCR`. Two rules keep
 * this free and safe:
 *
 *  1. Fire-and-forget — the INCR is never awaited on the request path. The
 *     promise is tracked (unref'd timers / `waitUntil` where available) so
 *     serverless won't freeze the function before it fires, but callers
 *     never wait for it and a failure cannot slow anything down.
 *  2. Fail-open — every error is swallowed after a rate-limited warning.
 *     Observability must never break the primary adapter path.
 *
 * Reads are explicit: `/api/health` calls `readShadowRemoteCounters()` and
 * merges the result over its local snapshot, so the operator sees the
 * aggregate across every instance and route that served shadow traffic.
 *
 * Tests inject a fake Redis via `__setRemoteReporterRedisForTests()`
 * (mirrors `__setUpstashModuleForTests` in `upstash/client.ts`).
 */
import { loadUpstashModule } from "@/lib/upstash/client";

/** Minimal shape of the `Redis` client this module needs. */
interface RemoteRedisLike {
  incr(key: string): Promise<number>;
  get(key: string): Promise<string | null>;
}

interface RemoteReporterState {
  redis: RemoteRedisLike | null;
  loadAttempted: boolean;
  /** Last time a warning was logged (warn at most once per interval). */
  lastWarnAt: number;
}

const WARN_INTERVAL_MS = 60_000;

const globalForShadowRemote = globalThis as unknown as {
  __shadowRemoteState?: RemoteReporterState;
};

function getState(): RemoteReporterState {
  if (!globalForShadowRemote.__shadowRemoteState) {
    globalForShadowRemote.__shadowRemoteState = {
      redis: null,
      loadAttempted: false,
      lastWarnAt: 0,
    };
  }
  return globalForShadowRemote.__shadowRemoteState;
}

/**
 * Resolve the Redis client lazily on first use. Returns `null` when
 * credentials are missing or the SDK cannot load — the callers treat that
 * exactly like any other failure (skip, don't crash).
 */
function getRemoteRedis(): RemoteRedisLike | null {
  const state = getState();
  if (state.redis) return state.redis;
  if (state.loadAttempted) return null;
  state.loadAttempted = true;

  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  try {
    const mod = loadUpstashModule("@upstash/redis") as unknown;
    const ctor =
      typeof mod === "function"
        ? mod
        : (mod as { Redis?: unknown } | null)?.Redis;
    if (typeof ctor !== "function") return null;
    const redis = new (ctor as new (config: { url: string; token: string }) => unknown)({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    }) as RemoteRedisLike;
    state.redis = redis;
    return redis;
  } catch (error) {
    warnOnce(`redis client init failed: ${describe(error)}`);
    return null;
  }
}

function describe(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function warnOnce(message: string): void {
  const state = getState();
  const now = Date.now();
  if (now - state.lastWarnAt < WARN_INTERVAL_MS) return;
  state.lastWarnAt = now;
  console.warn(`[shadow] remote counters unavailable — ${message}`);
}

/**
 * Track a fire-and-forget promise so the runtime doesn't kill the isolate
 * before the INCR leaves the process. Uses `after()` from `next/server`
 * when available (route handlers), falling back to unref'd timers.
 */
function trackPromise(p: Promise<void>): void {
  const tracked = p.catch(() => {});
  try {
    // Lazy require keeps `next/server` out of the unit-test graph and out
    // of non-Next runtimes (scripts, plain Node).
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const nextServer = require("next/server") as {
      after?: (cb: () => unknown | Promise<unknown>) => void;
    };
    if (typeof nextServer.after === "function") {
      nextServer.after(() => tracked);
      return;
    }
  } catch {
    // Not in a Next runtime — fall through to the timer fallback.
  }
  const timer = setTimeout(() => {}, 0);
  // Node allows unref so short-lived scripts don't hang on the timer.
  (timer as unknown as { unref?: () => void }).unref?.();
  void tracked.finally(() => clearTimeout(timer));
}

/** Upstash key namespace for the distributed parity counters. */
const KEY_PREFIX = "fibrocare:metrics:shadow";

function counterKey(counter: string): string {
  return `${KEY_PREFIX}:${counter}`;
}

/** INCR one distributed counter; never throws, never awaits. */
function remoteIncr(counter: string): void {
  const redis = getRemoteRedis();
  if (!redis) return;
  const p = redis
    .incr(counterKey(counter))
    .then(() => undefined)
    .catch((error: unknown) => warnOnce(`INCR failed: ${describe(error)}`));
  trackPromise(p);
}

/** Read one distributed counter; returns `null` on any failure. */
async function remoteGet(counter: string): Promise<number | null> {
  const redis = getRemoteRedis();
  if (!redis) return null;
  try {
    const raw = await redis.get(counterKey(counter));
    if (raw === null || raw === undefined) return 0;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
  } catch (error) {
    warnOnce(`GET failed: ${describe(error)}`);
    return null;
  }
}

/** The four parity counters the shadow wrappers produce. */
const PARITY_COUNTERS = [
  "shadow_cache_check",
  "shadow_cache_mismatch",
  "shadow_ratelimit_check",
  "shadow_ratelimit_mismatch",
] as const;

export type ShadowParityCounters = Partial<Record<(typeof PARITY_COUNTERS)[number], number>>;

/**
 * Record one shadow parity event into the distributed counters.
 * Called by `recordShadowCheck` / `recordShadowMismatch`.
 */
export function recordRemoteShadowEvent(
  surface: "cache" | "ratelimit",
  kind: "check" | "mismatch"
): void {
  remoteIncr(`shadow_${surface}_${kind}`);
}

/**
 * Read the distributed parity counters for `/api/health`.
 *
 * Returns `null` when the remote store is unavailable (no credentials,
 * SDK load failure, network error) so the caller knows the numbers are
 * *local-only*, not zero. A missing key reads as `0` — it genuinely has
 * no events yet.
 */
export async function readShadowRemoteCounters(): Promise<ShadowParityCounters | null> {
  const redis = getRemoteRedis();
  if (!redis) return null;
  const results = await Promise.all(PARITY_COUNTERS.map((c) => remoteGet(c)));
  const out: ShadowParityCounters = {};
  let any = false;
  for (let i = 0; i < PARITY_COUNTERS.length; i++) {
    const value = results[i];
    if (value === null) return null;
    out[PARITY_COUNTERS[i]] = value;
    if (value > 0) any = true;
  }
  // Even an all-zero read is meaningful (shadow ran, nothing happened
  // yet) — but return it only when the store was reachable.
  void any;
  return out;
}

/** Test-only: inject a fake Redis (or `null` to disable). */
export function __setRemoteReporterRedisForTests(redis: RemoteRedisLike | null): void {
  const state = getState();
  state.redis = redis;
  state.loadAttempted = true;
}

/** Test-only: reset all module state. */
export function __resetRemoteReporterForTests(): void {
  globalForShadowRemote.__shadowRemoteState = undefined;
}
