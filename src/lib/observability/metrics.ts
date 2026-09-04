/**
 * Tiny in-process metrics counters.
 *
 * The goal is operational visibility, not Prometheus-grade telemetry. We
 * expose:
 *  - per-key counters (rate-limit hits, cache hits, etc.)
 *  - per-key last-timestamp (so the metrics route can compute rates)
 *  - a 60-bucket p95 over the last 5 minutes of DB query durations
 *
 * State lives in a module-scope Map so it survives between requests in
 * the same process. Multi-instance deploys will see per-instance numbers
 * — the metrics route reports the current adapter name so the operator
 * knows how to aggregate.
 */
const counters = new Map<string, number>();
const lastSeen = new Map<string, number>();

const dbLatencyWindow: number[] = [];
const WINDOW_SIZE = 60;

export function inc(key: string, by = 1): void {
  counters.set(key, (counters.get(key) ?? 0) + by);
  lastSeen.set(key, Date.now());
}

export function get(key: string): number {
  return counters.get(key) ?? 0;
}

export function getLastSeen(key: string): number | undefined {
  return lastSeen.get(key);
}

export function recordDbLatency(ms: number): void {
  dbLatencyWindow.push(ms);
  if (dbLatencyWindow.length > WINDOW_SIZE) dbLatencyWindow.shift();
}

export function getDbLatencyP95(): number {
  if (dbLatencyWindow.length === 0) return 0;
  // Cheap p95: sort a copy, take the 95th-percentile element.
  const sorted = [...dbLatencyWindow].sort((a, b) => a - b);
  const idx = Math.min(
    sorted.length - 1,
    Math.floor(sorted.length * 0.95)
  );
  return Math.round(sorted[idx]);
}

export function snapshot(): Record<string, unknown> {
  return {
    counters: Object.fromEntries(counters),
    lastSeen: Object.fromEntries(lastSeen),
    dbLatencyP95Ms: getDbLatencyP95(),
  };
}

/** Reset all counters — test-only. */
export function __resetMetricsForTests(): void {
  counters.clear();
  lastSeen.clear();
  dbLatencyWindow.length = 0;
}
