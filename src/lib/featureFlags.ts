/**
 * Centralized feature flags for the distributed infrastructure rollout
 * (Phase L). All flags follow a "default off, opt in per env var" rule
 * so production with no env changes behaves exactly like the pre-L
 * baseline — in-process cache, in-process rate-limiter, direct
 * PrismaClient.
 *
 * Each flag is parsed once on first access and cached for the lifetime
 * of the process. `__resetFeatureFlagsForTests` re-parses on demand.
 *
 * The boolean parser is lenient:
 *   "1" / "true"  / "yes"  / "on"  → true
 *   "0" / "false" / "no"   / "off" → false
 *   undefined / ""                  → false (default off)
 *   anything else                   → false (safe default, logged)
 *
 * Each flag also exposes a `shadow` companion. When `SHADOW_*=1` the
 * primary adapter (still selected by the same rule) runs alongside the
 * secondary adapter, and the secondary's result is logged for parity
 * comparison. The response is always served from the primary — shadow
 * mode is a read-only diagnostic, never a write path.
 */

const TRUE_VALUES = new Set(["1", "true", "yes", "on"]);
const FALSE_VALUES = new Set(["0", "false", "no", "off", ""]);

interface CachedFlags {
  useUpstashCache: boolean;
  useUpstashRateLimit: boolean;
  useAccelerate: boolean;
  shadowCache: boolean;
  shadowRateLimit: boolean;
}

let cached: CachedFlags | null = null;

function parseBool(name: string, defaultValue = false): boolean {
  const raw = process.env[name];
  if (raw === undefined) return defaultValue;
  const lower = raw.toLowerCase();
  if (TRUE_VALUES.has(lower)) return true;
  if (FALSE_VALUES.has(lower)) return false;
  console.warn(
    `[featureFlags] Unrecognized value for ${name}=${raw}; expected 1/0/true/false. Falling back to ${defaultValue}.`
  );
  return defaultValue;
}

function readAll(): CachedFlags {
  return {
    useUpstashCache: parseBool("USE_UPSTASH_CACHE"),
    useUpstashRateLimit: parseBool("USE_UPSTASH_RATELIMIT"),
    useAccelerate: parseBool("USE_ACCELERATE"),
    shadowCache: parseBool("SHADOW_CACHE"),
    shadowRateLimit: parseBool("SHADOW_RATELIMIT"),
  };
}

function flags(): CachedFlags {
  if (!cached) cached = readAll();
  return cached;
}

/** Test-only: re-read env on next access. */
export function __resetFeatureFlagsForTests(): void {
  cached = null;
}

/**
 * Should the cache selector return the Upstash adapter?
 *
 * True only when the user has *both*:
 *  - the Upstash credentials in env, AND
 *  - explicitly opted in via `USE_UPSTASH_CACHE=1`.
 *
 * In every other case the in-process adapter takes over (the safe
 * default). This is the rule the cache selector applies.
 */
export function shouldUseUpstashCache(): boolean {
  const f = flags();
  if (!f.useUpstashCache) return false;
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  );
}

/** Same rule for the rate-limiter selector. */
export function shouldUseUpstashRateLimit(): boolean {
  const f = flags();
  if (!f.useUpstashRateLimit) return false;
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  );
}

/** Should `getPrisma()` apply the Accelerate extension? */
export function shouldUseAccelerate(): boolean {
  const f = flags();
  if (!f.useAccelerate) return false;
  return Boolean(process.env.PRISMA_ACCELERATE_URL);
}

/** Is shadow-cache mode active? */
export function isShadowCacheEnabled(): boolean {
  return flags().shadowCache;
}

/** Is shadow-ratelimit mode active? */
export function isShadowRateLimitEnabled(): boolean {
  return flags().shadowRateLimit;
}

/**
 * Snapshot for the /api/_debug/flags route. The shape is stable so the
 * frontend can render it without parsing strings.
 */
export function getFlagsSnapshot(): Readonly<CachedFlags> {
  return { ...flags() };
}
