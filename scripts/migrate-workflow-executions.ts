#!/usr/bin/env node
/**
 * Script to run workflow executions migration
 * 
 * This script applies the database migration for workflow executions.
 */

import { exec } from 'child_process'
import { promisify } from 'util'

const execPromise = promisify(exec)

async function runMigration() {
  try {
    console.log('Running Prisma migration for workflow executions...')
    
    // Run the Prisma migration
    const { stdout, stderr } = await execPromise('npx prisma migrate dev --name workflow_executions')
    
    if (stdout) {
      console.log('Migration output:', stdout)
    }
    
    if (stderr) {
      console.error('Migration errors:', stderr)
    }
    
    console.log('Migration completed successfully!')
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

// Run the migration if this file is executed directly
if (require.main === module) {
  runMigration()
}