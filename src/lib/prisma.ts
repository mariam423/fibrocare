import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * Lazy Prisma Client singleton.
 *
 * The client is NOT instantiated at module-load time — it is created on first
 * access.  This prevents the build from crashing when `@prisma/client` is
 * imported during Next.js page-data collection but `prisma generate` hasn't
 * run yet, or when `DATABASE_URL` is unavailable (e.g. Vercel build workers).
 *
 * The global cache still prevents multiple instances in dev (hot-reload).
 *
 * When `PRISMA_ACCELERATE_URL` is set we wrap the client with the
 * `@prisma/extension-accelerate` extension so all queries go through
 * Prisma's connection pooler + edge cache. When it is unset, the bare
 * `PrismaClient` is used and behavior is identical to before this
 * upgrade.
 */
function createPrismaClient(): PrismaClient {
  const base = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  });
  if (process.env.PRISMA_ACCELERATE_URL) {
    // Dynamic require keeps the optional dependency out of the bundle
    // when Accelerate is not configured. The extension is a thin wrapper
    // that sends queries to the Accelerate URL instead of the direct one.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { withAccelerate } = require('@prisma/extension-accelerate') as {
      withAccelerate: (client: PrismaClient) => PrismaClient;
    };
    return withAccelerate(base);
  }
  return base;
}

export const prisma =
  globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

/** Adapter name for the metrics route. */
export function getPrismaAdapterName(): 'accelerate' | 'direct' {
  return process.env.PRISMA_ACCELERATE_URL ? 'accelerate' : 'direct';
}
