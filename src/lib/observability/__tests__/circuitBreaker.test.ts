import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  __resetBreakerForTests,
  getBreakerState,
  guarded,
  recordBreakerFailure,
  recordBreakerSuccess,
} from "../circuitBreaker";

const TEST_NAME = "test:circuit";

beforeEach(() => {
  __resetBreakerForTests(TEST_NAME);
});

afterEach(() => {
  __resetBreakerForTests(TEST_NAME);
  vi.useRealTimers();
});

describe("CircuitBreaker", () => {
  it("starts in closed state", () => {
    expect(getBreakerState(TEST_NAME)).toBe("closed");
  });

  it("opens after 5 consecutive failures", () => {
    for (let i = 0; i < 5; i += 1) recordBreakerFailure(TEST_NAME);
    expect(getBreakerState(TEST_NAME)).toBe("open");
  });

  it("returns the fallback when open", async () => {
    for (let i = 0; i < 5; i += 1) recordBreakerFailure(TEST_NAME);
    const task = vi.fn(async () => "value");
    const result = await guarded(TEST_NAME, task, "FALLBACK");
    expect(result).toBe("FALLBACK");
    expect(task).not.toHaveBeenCalled();
  });

  it("transitions to half-open after resetMs and accepts a trial", async () => {
    vi.useFakeTimers();
    for (let i = 0; i < 5; i += 1) recordBreakerFailure(TEST_NAME);
    expect(getBreakerState(TEST_NAME)).toBe("open");
    vi.advanceTimersByTime(60_001);
    expect(getBreakerState(TEST_NAME)).toBe("half-open");
    const result = await guarded(TEST_NAME, async () => "trial-ok", "FALLBACK");
    expect(result).toBe("trial-ok");
    expect(getBreakerState(TEST_NAME)).toBe("closed");
  });

  it("re-opens on a half-open failure", async () => {
    vi.useFakeTimers();
    for (let i = 0; i < 5; i += 1) recordBreakerFailure(TEST_NAME);
    vi.advanceTimersByTime(60_001);
    expect(getBreakerState(TEST_NAME)).toBe("half-open");
    await guarded(TEST_NAME, async () => {
      throw new Error("trial fail");
    }, "FALLBACK");
    expect(getBreakerState(TEST_NAME)).toBe("open");
  });

  it("closes when successes outnumber failures", () => {
    recordBreakerFailure(TEST_NAME);
    recordBreakerFailure(TEST_NAME);
    recordBreakerSuccess(TEST_NAME);
    expect(getBreakerState(TEST_NAME)).toBe("closed");
  });

  it("records a success inside guarded()", async () => {
    await guarded(TEST_NAME, async () => "ok", "FALLBACK");
    expect(getBreakerState(TEST_NAME)).toBe("closed");
  });

  it("records a failure inside guarded()", async () => {
    for (let i = 0; i < 4; i += 1) {
      await guarded(
        TEST_NAME,
        async () => {
          throw new Error("nope");
        },
        "FALLBACK"
      );
    }
    // 4 failures, still closed (threshold is 5)
    expect(getBreakerState(TEST_NAME)).toBe("closed");
    await guarded(
      TEST_NAME,
      async () => {
        throw new Error("5th");
      },
      "FALLBACK"
    );
    expect(getBreakerState(TEST_NAME)).toBe("open");
  });
});
