// Database configuration - switch between mock and real database
import { db as mockDb } from "./database"
import { db as prismaDb } from "./database-prisma"

// Environment variable to control which database to use
const USE_MOCK_DB = process.env.USE_MOCK_DB === 'true'

console.log(`Using ${USE_MOCK_DB ? 'Mock' : 'Prisma'} database`)

// Export the appropriate database instance
export const db = USE_MOCK_DB ? mockDb : prismaDb

// Export both for specific use cases
export { mockDb, prismaDb }
