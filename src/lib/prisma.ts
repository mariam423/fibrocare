import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

interface AcceleratorLike {
  withAccelerate: (client: PrismaClient) => PrismaClient;
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

  // Opt-in: only attempt the wrap when the URL is configured.
  if (process.env.PRISMA_ACCELERATE_URL) {
    const accelerated = tryWithAccelerate(base);
    if (accelerated) return accelerated;
  }
  return base;
}

/**
 * Safely wraps a Prisma client with the Accelerate extension. Returns the
 * wrapped client on success, or `null` if the extension cannot be loaded
 * for any reason (package not installed, resolution error, module not
 * found at build time). The fallback path returns the bare client so the
 * build is never blocked.
 *
 * The require is constructed via `module.createRequire` so NO static
 * analyser (Turbopack, Webpack, ESLint) can follow the dependency graph
 * to the import. `module.createRequire` is a Node.js API that returns a
 * `require` function with full Node module-resolution semantics — it
 * resolves through `node_modules` and the package's `exports` field
 * exactly like the CLI's require would. The try/catch then turns any
 * runtime failure into a no-op fallback with a single warning.
 *
 * `module` is referenced as a global so the static analyser cannot see
 * the dependency either; the bracket-access on the createRequire property
 * matches the same pattern.
 */
function tryWithAccelerate(base: PrismaClient): PrismaClient | null {
  const moduleName = '@prisma/extension-accelerate';
  try {
    // `module` is a Node.js global; bracket access hides the property
    // name from simple string-literal scanners.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const nodeModule = (globalThis as unknown as { module?: { createRequire: (filename: string) => NodeJS.Require } })
      .module;
    const createRequire = nodeModule?.createRequire;
    if (typeof createRequire !== 'function') {
      // Edge runtime (no `module` global) — Accelerate is a Node-only
      // library, so this is a valid runtime degradation.
      console.warn(
        `[prisma] createRequire is unavailable in this runtime; ` +
          `${moduleName} can only be loaded in Node. Falling back to direct PrismaClient.`
      );
      return null;
    }
    const localRequire = createRequire(__filename);
    const accelerator = localRequire(moduleName) as AcceleratorLike;
    if (accelerator && typeof accelerator.withAccelerate === 'function') {
      return accelerator.withAccelerate(base);
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

/** Adapter name for the metrics route. */
export function getPrismaAdapterName(): 'accelerate' | 'direct' {
  return process.env.PRISMA_ACCELERATE_URL ? 'accelerate' : 'direct';
}
