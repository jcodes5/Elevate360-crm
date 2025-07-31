// Database configuration - switch between mock and real database
import { db as mockDb } from "./database"

// Environment variable to control which database to use
// Default to false since Prisma is now installed
const USE_MOCK_DB = process.env.USE_MOCK_DB === 'true'

console.log(`Using ${USE_MOCK_DB ? 'Mock' : 'Prisma'} database`)

// Conditionally import Prisma only if needed and available
let prismaDb: any = null
if (!USE_MOCK_DB) {
  try {
    const prismaModule = require("./database-prisma")
    prismaDb = prismaModule.db
    console.log('Prisma database loaded successfully')
  } catch (error) {
    console.warn('Prisma database not available, falling back to mock database:', error.message)
    // Fall back to mock if Prisma is not available
    prismaDb = mockDb
  }
}

// Export the appropriate database instance
export const db = USE_MOCK_DB ? mockDb : (prismaDb || mockDb)

// Export mock database for specific use cases
export { mockDb }

// Export prismaDb conditionally
export const prismaDatabase = prismaDb
