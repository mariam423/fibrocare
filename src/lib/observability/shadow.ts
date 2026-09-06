/**
 * Shadow-mode parity reporting.
 *
 * Shadow mode (the 24h validation window before cutover) runs the
 * distributed adapter — Upstash cache / rate limiter — in *parallel* with
 * the in-process primary and compares the two outcomes. The response is
 * ALWAYS served from the primary; the shadow only produces diagnostics.
 *
 * Every shadow call bumps a `shadow_*_check` counter (visible via the
 * `/api/health` metrics snapshot). A *mismatch* bumps `shadow_*_mismatch`
 * and logs at most one warning per (surface, key) so a busy server cannot
 * flood the log with repeated mismatches on the same key. The counters are
 * what the operator reads after the 24h window: a mismatch rate that is
 * persistently > 0 (or worse, climbing) is a reason to delay cutover.
 */
import { inc } from "./metrics";
import { recordRemoteShadowEvent } from "./shadowRemote";

const MAX_WARNED_KEYS = 200;
const warned = new Set<string>();

export type ShadowSurface = "cache" | "ratelimit";

function counterName(surface: ShadowSurface, kind: "check" | "mismatch"): string {
  return `shadow_${surface}_${kind}`;
}

/** Record that one shadowed call ran on the secondary adapter. */
export function recordShadowCheck(surface: ShadowSurface): void {
  inc(counterName(surface, "check"));
  // Distributed mirror (fire-and-forget INCR) so serverless deploys where
  // every route is its own process can still aggregate parity data.
  recordRemoteShadowEvent(surface, "check");
}

/**
 * Record a parity mismatch and warn once per (surface, key).
 *
 * `detail` explains what the mismatch means after cutover so the warning
 * is actionable on its own.
 */
export function recordShadowMismatch(
  surface: ShadowSurface,
  key: string,
  detail: string
): void {
  inc(counterName(surface, "mismatch"));
  recordRemoteShadowEvent(surface, "mismatch");
  if (warned.size >= MAX_WARNED_KEYS) return;
  const id = `${surface}:${key}`;
  if (warned.has(id)) return;
  warned.add(id);
  console.warn(`[shadow] ${surface} parity mismatch · ${id} · ${detail}`);
}

/** Test-only: clear the warn-once set. */
export function __resetShadowReporterForTests(): void {
  warned.clear();
}
