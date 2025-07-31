// Prisma client stub - Prisma not installed
console.warn('Prisma client stub loaded - @prisma/client not available')

// Mock PrismaClient interface
export const prisma = {
  $connect: async () => {
    throw new Error('Prisma client not available. Please install @prisma/client or use mock database.')
  },
  $disconnect: async () => {
    throw new Error('Prisma client not available. Please install @prisma/client or use mock database.')
  },
  // Add other Prisma methods as needed
}

// Make it available globally for compatibility
const globalForPrisma = globalThis as unknown as {
  prisma: typeof prisma | undefined
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
