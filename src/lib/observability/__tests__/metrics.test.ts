import { describe, expect, it, beforeEach } from "vitest";
import {
  __resetMetricsForTests,
  get,
  getDbLatencyP95,
  inc,
  recordDbLatency,
  snapshot,
} from "../metrics";

beforeEach(() => {
  __resetMetricsForTests();
});

describe("metrics", () => {
  it("starts at zero for unknown keys", () => {
    expect(get("nope")).toBe(0);
  });

  it("increments a counter and reads it back", () => {
    inc("chat_429");
    inc("chat_429");
    inc("chat_429", 3);
    expect(get("chat_429")).toBe(5);
  });

  it("computes dbLatency p95 over the recorded window", () => {
    for (let i = 1; i <= 20; i += 1) recordDbLatency(i);
    // 95th percentile of 1..20 is 20 (sorted ascending, idx = floor(20*0.95) = 19).
    expect(getDbLatencyP95()).toBe(20);
  });

  it("snapshot exposes counters and latency", () => {
    inc("a", 1);
    inc("b", 2);
    recordDbLatency(42);
    const s = snapshot() as {
      counters: Record<string, number>;
      dbLatencyP95Ms: number;
    };
    expect(s.counters).toEqual({ a: 1, b: 2 });
    expect(s.dbLatencyP95Ms).toBeGreaterThan(0);
  });
});
