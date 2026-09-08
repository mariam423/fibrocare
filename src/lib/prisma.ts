import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'
import { shouldUseAccelerate } from '@/lib/featureFlags'

/**
 * Global cache to prevent multiple PrismaClient instances during Next.js hot-reloading.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: any
}

/**
 * Prisma Client Singleton.
 *
 * This implementation avoids the fragile dynamic `require` logic and uses a
 * standard Singleton pattern. It supports both direct Neon connections
 * (using Neon's native PgBouncer pooling) and Prisma Accelerate.
 */
export const prisma =
  globalForPrisma.prisma ??
  ((() => {
    const client = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query'] : [],
    })

    // If Accelerate is enabled via feature flag and the URL is present,
    // we apply the extension. Note: Neon's native pooling is handled
    // automatically if DATABASE_URL is a pooled connection string.
    if (shouldUseAccelerate()) {
      return client.$extends(withAccelerate())
    }

    return client
  })()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

/**
 * Reports the resolved adapter currently in use.
 */
export function getPrismaAdapterName(): 'accelerate' | 'direct' {
  return shouldUseAccelerate() ? 'accelerate' : 'direct'
}
