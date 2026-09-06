/**
 * Lazy Upstash Redis client.
 *
 * Mirrors the lazy-singleton pattern in `src/lib/prisma.ts`:
 *  - The client is NOT instantiated at module-load — it is created on
 *    first access. This keeps the cold-start cost of the in-process
 *    fallback path unchanged when `UPSTASH_REDIS_REST_URL` is missing.
 *  - The global cache still prevents multiple instances in dev
 *    (Next.js hot-reload).
 *
 * Returns `null` when env vars are missing so callers can fall back
 * without an exception path.
 *
 * The `@upstash/redis` and `@upstash/ratelimit` packages are loaded via
 * `module.createRequire` (the same pattern used in `src/lib/prisma.ts`).
 * This is required because Turbopack does static analysis of `import`
 * statements and fails to resolve these packages in some install
 * topologies (the `package.json` `exports` field, the CJS-only build
 * resolution path of `@upstash/ratelimit@2.0.8`, etc.) even when the
 * packages are installed. `createRequire` hides the require from static
 * analysis and the try/catch turns any runtime failure into a `null`
 * fallback so the in-process adapter takes over.
 *
 * The packages are also listed in `next.config.ts` `serverExternalPackages`
 * as a belt-and-braces guarantee.
 *
 * Tests inject mocks via `__setUpstashModuleForTests()` (mirrors the
 * `__reset*ForTests` pattern in the rate-limit / cache selectors).
 */

export interface RedisLike {
  new (config: { url: string; token: string }): unknown;
}

export interface RatelimitLike {
  new (config: {
    redis: unknown;
    limiter: unknown;
    prefix: string;
    analytics: boolean;
  }): unknown;
  slidingWindow: (limit: number, window: string) => unknown;
}

interface UpstashModuleCache {
  Redis?: RedisLike;
  Ratelimit?: RatelimitLike;
}

const globalForUpstashModules = globalThis as unknown as {
  upstashModules?: UpstashModuleCache;
  /** Test-only injection point — set by `__setUpstashModuleForTests`. */
  upstashTestOverrides?: Partial<UpstashModuleCache>;
};

/**
 * Load an Upstash SDK module by name. Returns `null` if the package
 * cannot be loaded (missing, unresolvable, runtime error).
 *
 * Resolution order:
 *  1. Test override (set via `__setUpstashModuleForTests`).
 *  2. Cached value from a previous successful load in this process.
 *  3. Live `createRequire` of the package by name. The require is
 *     hidden behind `module.createRequire` so Turbopack's static
 *     analysis cannot trace the dependency to the import graph.
 */
export function loadUpstashModule<T>(
  name: "@upstash/redis" | "@upstash/ratelimit"
): T | null {
  if (!globalForUpstashModules.upstashModules) {
    globalForUpstashModules.upstashModules = {};
  }

  // 1. Test override
  const overrides = globalForUpstashModules.upstashTestOverrides as
    | Record<string, unknown>
    | undefined;
  const override = overrides?.[name] as T | undefined;
  if (override) return override;

  // 2. Cached value
  const cache = globalForUpstashModules.upstashModules as Record<string, T | undefined>;
  if (cache[name]) return cache[name] as T;

  // 3. Live load
  try {
    const createRequire = getCreateRequireFactory();
    if (!createRequire) {
      console.warn(
        `[upstash] createRequire is unavailable in this runtime; ` +
          `${name} can only be loaded in Node. Falling back to in-process adapter.`
      );
      return null;
    }
    const localRequire = createRequire(getRequireAnchor());
    const mod = localRequire(name) as T;
    cache[name] = mod;
    return mod;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(
      `[upstash] Optional dependency ${name} could not be loaded (${message}). ` +
        `Falling back to in-process adapter. To enable Upstash, run: ` +
        `npm install ${name}`
    );
    return null;
  }
}

/**
 * Return a Node `createRequire` factory or `null` when the runtime does
 * not expose one (e.g. an edge runtime). See `src/lib/prisma.ts` for the
 * full rationale — the two loaders share the same rules:
 *
 *  1. `process.getBuiltinModule("module")` — plain Node (CJS and ESM),
 *     available since 20.16 / 22.3, so it works under tsx, standalone
 *     Next.js, and serverless Node functions.
 *  2. `globalThis.module.createRequire` — Next.js injects a `module`
 *     global with bundler-aware helpers in its server runtime.
 */
function getCreateRequireFactory(): ((filename: string) => NodeJS.Require) | null {
  const proc = (globalThis as unknown as {
    process?: { getBuiltinModule?: (id: string) => unknown };
  }).process;
  const builtinModule = proc?.getBuiltinModule?.("module") as
    | { createRequire?: (filename: string) => NodeJS.Require }
    | undefined;
  if (typeof builtinModule?.createRequire === "function") {
    return builtinModule.createRequire;
  }
  const nodeModule = (globalThis as unknown as {
    module?: { createRequire?: (filename: string) => NodeJS.Require };
  }).module;
  return nodeModule?.createRequire ?? null;
}

/**
 * Anchor path for `createRequire`.
 *
 * Must be a real path whose parent chain reaches `node_modules`.
 * `__filename` is NOT reliable here: Next dev (Turbopack) rewrites it to
 * a virtual in-memory path (e.g. `/ROOT/src/lib/upstash/client.ts`) from
 * which Node cannot resolve any package. `process.cwd()` is the real
 * project root in dev and the standalone/serverless output root in prod
 * (both contain `node_modules`), so anchor resolution there.
 */
function getRequireAnchor(): string {
  return `${process.cwd()}/runtime-probe.cjs`;
}

/**
 * Test-only: inject a mock module so the loader returns it instead of
 * calling `createRequire`. Mirrors the `__reset*ForTests` pattern in
 * other selectors. Always pair with `__resetUpstashModulesForTests()`
 * in `afterEach`.
 */
export function __setUpstashModuleForTests(
  name: "@upstash/redis" | "@upstash/ratelimit",
  mod: unknown
): void {
  if (!globalForUpstashModules.upstashTestOverrides) {
    globalForUpstashModules.upstashTestOverrides = {};
  }
  (globalForUpstashModules.upstashTestOverrides as Record<string, unknown>)[name] = mod;
}

/**
 * Test-only: clear all module caches and overrides so the next call
 * to `loadUpstashModule` does a live load.
 */
export function __resetUpstashModulesForTests(): void {
  globalForUpstashModules.upstashModules = undefined;
  globalForUpstashModules.upstashTestOverrides = undefined;
  globalForUpstash.upstash = undefined;
}

type UpstashClientBundle = {
  redis: unknown;
  /** Pre-built rate limiters keyed by `${prefix}:${limit}:${windowMs}`. */
  limiters: Map<string, unknown>;
};

/**
 * Extract a constructor from a loaded SDK module.
 *
 * The real packages are CJS modules shaped as *namespaces* —
 * `@upstash/redis` exports `{ Redis, SearchIndex, ... }` and
 * `@upstash/ratelimit` exports `{ Ratelimit, Analytics, ... }` — so the
 * constructor is `mod[prop]`. Unit tests inject the constructor itself
 * (via `__setUpstashModuleForTests`), so a bare function is passed
 * through unchanged. This keeps both the live require path and the test
 * injection path working.
 */
function unwrapModuleCtor(mod: unknown, prop: string): unknown {
  if (typeof mod === "function") return mod;
  const namespace = mod as Record<string, unknown> | undefined;
  if (namespace && typeof namespace[prop] === "function") return namespace[prop];
  const viaDefault = (namespace?.default as Record<string, unknown> | undefined);
  if (viaDefault && typeof viaDefault[prop] === "function") {
    return viaDefault[prop];
  }
  return undefined;
}

const globalForUpstash = globalThis as unknown as {
  upstash: UpstashClientBundle | undefined;
};

export function getUpstashClient(): UpstashClientBundle | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }

  if (globalForUpstash.upstash) return globalForUpstash.upstash;

  const RedisCtor = unwrapModuleCtor(
    loadUpstashModule("@upstash/redis"),
    "Redis"
  ) as RedisLike | undefined;
  if (!RedisCtor) return null;

  const redis = new RedisCtor({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  const bundle: UpstashClientBundle = { redis, limiters: new Map() };
  if (process.env.NODE_ENV !== "production") globalForUpstash.upstash = bundle;
  return bundle;
}

/**
 * Format a window length in milliseconds to the Upstash `Duration` string
 * the SDK accepts (`"30 s"`, `"5 m"`, `"1 h"`, `"1 d"`). Sub-second windows
 * are not supported by `Ratelimit.slidingWindow`, so callers must request
 * at least 1 000 ms.
 */
function formatWindow(windowMs: number): `${number} ${"s" | "m" | "h" | "d"}` {
  if (windowMs >= 86_400_000) {
    return `${Math.max(1, Math.round(windowMs / 86_400_000))} d`;
  }
  if (windowMs >= 3_600_000) {
    return `${Math.max(1, Math.round(windowMs / 3_600_000))} h`;
  }
  if (windowMs >= 60_000) {
    return `${Math.max(1, Math.round(windowMs / 60_000))} m`;
  }
  return `${Math.max(1, Math.round(windowMs / 1000))} s`;
}

/**
 * Build (or fetch from the bundle cache) a `Ratelimit` for the given
 * `(prefix, limit, windowMs)` triple. The Upstash SDK builds the
 * sliding-window algorithm at construction time, so a new (limit, window)
 * needs a new `Ratelimit` instance — the bundle caches them.
 */
export function getUpstashRatelimit(
  prefix: string,
  limit: number,
  windowMs: number
): unknown | null {
  const bundle = getUpstashClient();
  if (!bundle) return null;
  const key = `${prefix}:${limit}:${windowMs}`;
  const cached = bundle.limiters.get(key);
  if (cached) return cached;

  const RatelimitCtor = unwrapModuleCtor(
    loadUpstashModule("@upstash/ratelimit"),
    "Ratelimit"
  ) as RatelimitLike | undefined;
  if (!RatelimitCtor) return null;

  const limiter = new RatelimitCtor({
    redis: bundle.redis,
    limiter: RatelimitCtor.slidingWindow(limit, formatWindow(windowMs)),
    prefix: `fibrocare:${prefix}`,
    analytics: false,
  });
  bundle.limiters.set(key, limiter);
  return limiter;
}
