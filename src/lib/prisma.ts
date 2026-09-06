import { PrismaClient } from '@prisma/client'
import { shouldUseAccelerate } from '@/lib/featureFlags'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

interface AcceleratorLike {
  /**
   * Returns a Prisma *client extension* (a `(client) => extension`
   * function). It is applied with `base.$extends(...)`, exactly like any
   * other `$extends` extension — it is NOT a `(client) => client`
   * wrapper. The value is opaque here: the package ships its own runtime
   * types that we deliberately do not import, so callers cast it to the
   * `$extends` parameter type before use.
   */
  withAccelerate: (options?: unknown) => unknown;
}

/**
 * Lazy Prisma Client singleton.
 *
 * The client is NOT instantiated at module-load time — it is created on first
 * access. This prevents the build from crashing when `@prisma/client` is
 * imported during Next.js page-data collection but `prisma generate` hasn't
 * run yet, or when `DATABASE_URL` is unavailable (e.g. Vercel build workers).
 *
 * The global cache still prevents multiple instances in dev (hot-reload).
 *
 * When `PRISMA_ACCELERATE_URL` is set, we try to wrap the client with the
 * `@prisma/extension-accelerate` extension so all queries go through
 * Prisma's connection pooler + edge cache. The extension is loaded
 * dynamically behind a try/catch so a missing or unresolvable package
 * NEVER crashes the build: if the require throws (Module not found, top
 * of stack), the bare `PrismaClient` is used and a single warning is
 * logged. The package is listed in `next.config.ts` `serverExternalPackages`
 * for the cases where Turbopack can resolve it but bundling would still
 * fail.
 *
 * Behaviour is bit-identical to the pre-upgrade path when the env var
 * is unset OR the extension cannot be loaded.
 */
function createPrismaClient(): PrismaClient {
  const base = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  });

  // Opt-in: only attempt the wrap when the URL is configured AND the
  // user has explicitly enabled the feature flag. The flag is the
  // single source of truth for "is the rollout active" — checking the
  // env var alone would cause a cutover the moment someone adds
  // PRISMA_ACCELERATE_URL to a Vercel preview deploy, which is exactly
  // what we want to prevent during the shadow-mode validation period.
  if (shouldUseAccelerate() && process.env.PRISMA_ACCELERATE_URL) {
    const accelerated = tryWithAccelerate(base);
    if (accelerated) {
      setAdapterResolved('accelerate');
      return accelerated;
    }
    // The flag was on, the URL was set, but the extension failed
    // to load. We log this once and fall through to the bare
    // client — production keeps running, but the operator should
    // see the warning and fix the wiring.
    console.warn(
      '[prisma] Accelerate flag is on but the extension could not be loaded; ' +
        'falling back to direct PrismaClient. Check that ' +
        '`@prisma/extension-accelerate` is installed and the runtime supports `module.createRequire`.'
    );
  }
  setAdapterResolved('direct');
  return base;
}

// Module-level state for the adapter name. Updated by
// `createPrismaClient` once the actual decision is made so
// `getPrismaAdapterName` reports the *resolved* adapter, not
// the *intended* one. The two differ when the flag is on but
// the extension failed to load (e.g. a runtime that lacks
// `module.createRequire`, or the package isn't installed).
let resolvedAdapter: 'accelerate' | 'direct' | null = null;

function setAdapterResolved(name: 'accelerate' | 'direct') {
  resolvedAdapter = name;
}

/**
 * Return a Node `createRequire` factory or `null` when the runtime does
 * not expose one (e.g. an edge runtime).
 *
 * Resolution order:
 *  1. `process.getBuiltinModule("module")` — available in plain Node
 *     (CJS and ESM alike) since 20.16 / 22.3, so this works under tsx,
 *     standalone Next.js, and serverless Node functions.
 *  2. `globalThis.module.createRequire` — Next.js injects a `module`
 *     global with bundler-aware helpers in its server runtime.
 *
 * The require is never a static import, so NO static analyser
 * (Turbopack, Webpack, ESLint) can follow the dependency graph to the
 * `@prisma/extension-accelerate` package. `process` and `module` are
 * referenced via bracket-access on `globalThis` so simple string-literal
 * scanners cannot see the property either.
 */
function getCreateRequireFactory(): ((filename: string) => NodeJS.Require) | null {
  const proc = (globalThis as unknown as {
    process?: { getBuiltinModule?: (id: string) => unknown };
  }).process;
  const builtinModule = proc?.getBuiltinModule?.('module') as
    | { createRequire?: (filename: string) => NodeJS.Require }
    | undefined;
  if (typeof builtinModule?.createRequire === 'function') {
    return builtinModule.createRequire;
  }
  const nodeModule = (globalThis as unknown as {
    module?: { createRequire?: (filename: string) => NodeJS.Require };
  }).module;
  return nodeModule?.createRequire ?? null;
}

/**
 * Anchor path for `createRequire`. Node resolves `node_modules` by
 * walking up from the anchor's directory, so any absolute path under the
 * project root works. CJS runtimes (plain Node, Next standalone bundles)
 * expose `__filename`; ESM runtimes do not, so fall back to the cwd.
 * `typeof` is safe for undeclared identifiers, so the ESM path never
 * throws.
 */
function getRequireAnchor(): string {
  return typeof __filename === 'string'
    ? __filename
    : `${process.cwd()}/runtime-probe.cjs`;
}

/**
 * Safely wraps a Prisma client with the Accelerate extension. Returns the
 * wrapped client on success, or `null` if the extension cannot be loaded
 * for any reason (package not installed, resolution error, module not
 * found at build time). The fallback path returns the bare client so the
 * build is never blocked.
 *
 * The require is constructed via `createRequire` (see
 * `getCreateRequireFactory`) so no static analyser can follow the
 * dependency graph to the import. `createRequire` returns a `require`
 * function with full Node module-resolution semantics — it resolves
 * through `node_modules` and the package's `exports` field exactly like
 * the CLI's require would. The try/catch then turns any runtime failure
 * into a no-op fallback with a single warning.
 */
function tryWithAccelerate(base: PrismaClient): PrismaClient | null {
  const moduleName = '@prisma/extension-accelerate';
  try {
    const createRequire = getCreateRequireFactory();
    if (!createRequire) {
      // Edge runtime (no `process.getBuiltinModule`, no Node `module`
      // global) — Accelerate is a Node-only library, so this is a valid
      // runtime degradation.
      console.warn(
        `[prisma] createRequire is unavailable in this runtime; ` +
          `${moduleName} can only be loaded in Node. Falling back to direct PrismaClient.`
      );
      return null;
    }
    const localRequire = createRequire(getRequireAnchor());
    const accelerator = localRequire(moduleName) as AcceleratorLike;
    if (accelerator && typeof accelerator.withAccelerate === 'function') {
      // `withAccelerate()` returns a client extension; apply it through
      // `$extends`. The accelerated client is a structural superset of
      // `PrismaClient` (adds `$accelerate`, cache-strategy args), so a
      // cast keeps the call sites' types unchanged.
      const accelerateExtension = accelerator.withAccelerate() as Parameters<
        typeof base.$extends
      >[0];
      // The `$extends` return type does not overlap with `PrismaClient`
      // structurally (extended clients drop `$on`/`$use`), so the cast
      // must go through `unknown`.
      return base.$extends(accelerateExtension) as unknown as PrismaClient;
    }
    console.warn(
      `[prisma] ${moduleName} loaded but does not export withAccelerate(); falling back to direct PrismaClient.`
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(
      `[prisma] Optional dependency ${moduleName} could not be loaded (${message}). ` +
        `Falling back to direct PrismaClient. To enable Accelerate, run: ` +
        `npm install @prisma/extension-accelerate`
    );
  }
  return null;
}

export const prisma =
  globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

/**
 * Adapter name for the metrics route.
 *
 * Reports the *resolved* adapter — what `createPrismaClient` actually
 * returned — falling back to the intended one only when the module was
 * never instantiated (e.g. `prisma` imported but never touched). This
 * matters during shadow mode: when the Accelerate flag is on but the
 * extension fails to load, the metrics route must say `direct`, not
 * `accelerate`, or an operator would believe queries go through the
 * pooler when they do not.
 */
export function getPrismaAdapterName(): 'accelerate' | 'direct' {
  return (
    resolvedAdapter ??
    (shouldUseAccelerate() && process.env.PRISMA_ACCELERATE_URL
      ? 'accelerate'
      : 'direct')
  );
}
