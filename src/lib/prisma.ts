import { PrismaClient } from '@prisma/client'
import { shouldUseAccelerate } from '@/lib/featureFlags'

/**
 * Global cache to prevent multiple PrismaClient instances during Next.js hot-reloading.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * Prisma Client Singleton.
 *
 * We use the standard Next.js singleton pattern.
 * Connection pooling is handled via the Neon pooled connection string
 * provided in the DATABASE_URL environment variable.
 */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

/**
 * Reports the resolved adapter name.
 */
export function getPrismaAdapterName(): 'accelerate' | 'direct' {
  return shouldUseAccelerate() ? 'accelerate' : 'direct'
}
