// Real Prisma client implementation
import { PrismaClient } from '@prisma/client'

// Singleton pattern for Prisma client
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Get connection pool settings from environment variables
const poolMin = parseInt(process.env.DATABASE_POOL_MIN || '0', 10)
const poolMax = parseInt(process.env.DATABASE_POOL_MAX || '5', 10)

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL + `?connection_limit=${poolMax}&pool_timeout=20`
    }
  }
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Export default for compatibility
export default prisma