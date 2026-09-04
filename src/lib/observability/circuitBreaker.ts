/**
 * Tiny three-state circuit breaker.
 *
 * State machine:
 *   closed      → opens after `failureThreshold` consecutive failures
 *   open        → transitions to half-open after `resetMs`
 *   half-open   → one trial request; success closes, failure re-opens
 *
 * Designed for the AI provider boundary: when Google/OpenAI/Anthropic
 * returns 5xx or times out, the breaker opens and `getModel()` resolves
 * to `null`. Route handlers already handle that case (they return
 * `{ offline: true }`), so the user sees a graceful offline state
 * instead of a cascading 502.
 *
 * Multi-instance note: each instance tracks its own breaker. That's
 * fine for our scale — the breaker is a per-process guard, not a
 * global one. Cross-instance behavior is already bounded by the
 * distributed rate limiter.
 */
export type CircuitState = "closed" | "open" | "half-open";

interface BreakerConfig {
  failureThreshold: number;
  resetMs: number;
}

const DEFAULT: BreakerConfig = {
  failureThreshold: 5,
  resetMs: 60_000,
};

class CircuitBreaker {
  private state: CircuitState = "closed";
  private consecutiveFailures = 0;
  private openedAt = 0;
  private config: BreakerConfig;

  constructor(config: Partial<BreakerConfig> = {}) {
    this.config = { ...DEFAULT, ...config };
  }

  /** Returns the current state, advancing open → half-open if resetMs elapsed. */
  getState(): CircuitState {
    if (this.state === "open" && Date.now() - this.openedAt >= this.config.resetMs) {
      this.state = "half-open";
    }
    return this.state;
  }

  /** Returns false when the breaker is open and the call should be short-circuited. */
  allow(): boolean {
    return this.getState() !== "open";
  }

  recordSuccess(): void {
    this.consecutiveFailures = 0;
    this.state = "closed";
  }

  recordFailure(): void {
    this.consecutiveFailures += 1;
    if (
      this.state === "half-open" ||
      this.consecutiveFailures >= this.config.failureThreshold
    ) {
      this.state = "open";
      this.openedAt = Date.now();
    }
  }

  /** Test-only: reset to closed. */
  reset(): void {
    this.state = "closed";
    this.consecutiveFailures = 0;
    this.openedAt = 0;
  }
}

const globalForBreakers = globalThis as unknown as {
  breakers: Map<string, CircuitBreaker> | undefined;
};

function getBreaker(key: string): CircuitBreaker {
  if (!globalForBreakers.breakers) globalForBreakers.breakers = new Map();
  let breaker = globalForBreakers.breakers.get(key);
  if (!breaker) {
    breaker = new CircuitBreaker();
    globalForBreakers.breakers.set(key, breaker);
  }
  return breaker;
}

/**
 * Run `task` under a circuit breaker keyed on `name`. If the breaker is
 * open, resolves to `fallback` without calling `task`. A throw from
 * `task` counts as a failure; a normal return counts as a success.
 */
export async function guarded<T>(
  name: string,
  task: () => Promise<T>,
  fallback: T
): Promise<T> {
  const breaker = getBreaker(name);
  if (!breaker.allow()) return fallback;
  try {
    const value = await task();
    breaker.recordSuccess();
    return value;
  } catch {
    breaker.recordFailure();
    return fallback;
  }
}

/** Read the current state of a named breaker — used by the metrics route. */
export function getBreakerState(name: string): CircuitState {
  return getBreaker(name).getState();
}

/** Explicitly record a success on a named breaker. */
export function recordBreakerSuccess(name: string): void {
  getBreaker(name).recordSuccess();
}

/** Explicitly record a failure on a named breaker. */
export function recordBreakerFailure(name: string): void {
  getBreaker(name).recordFailure();
}

/** Test-only: reset a named breaker. */
export function __resetBreakerForTests(name: string): void {
  getBreaker(name).reset();
}
