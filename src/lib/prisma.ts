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
 */
function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  })
}

export const prisma =
  globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
