# 🗄️ Integrating Authentication with Your Existing Database

## Overview

The new authentication system is database-agnostic and can work with any database system (MySQL, PostgreSQL, MongoDB, etc.) through the database adapter pattern.

## 🔧 Required Database Schema

Your database needs these user-related fields. Adapt the field names to match your existing schema:

### Users Table/Collection
```sql
-- For SQL databases (MySQL/PostgreSQL)
CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  role ENUM('admin', 'manager', 'agent') DEFAULT 'agent',
  organization_id VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  email_verified BOOLEAN DEFAULT FALSE,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  two_factor_config TEXT, -- JSON string for 2FA settings
  is_onboarding_completed BOOLEAN DEFAULT FALSE,
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
);
```

```javascript
// For MongoDB
{
  _id: "user_id",
  email: "user@example.com",
  password: "hashed_password",
  firstName: "John",
  lastName: "Doe",
  role: "agent", // admin, manager, agent
  organizationId: "org_id",
  isActive: true,
  emailVerified: false,
  twoFactorEnabled: false,
  twoFactorConfig: {}, // 2FA settings object
  isOnboardingCompleted: false,
  lastLogin: null,
  createdAt: Date,
  updatedAt: Date,
  deletedAt: null
}
```

### Organizations Table/Collection (Optional)
```sql
-- For SQL databases
CREATE TABLE organizations (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  settings TEXT, -- JSON string
  subscription TEXT, -- JSON string
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## 🔌 Integration Steps

### 1. Create Your Database Adapter

```typescript
// lib/your-database-adapter.ts
import { SQLDatabaseAdapter } from '@/lib/database-adapter';
import yourDatabaseConnection from './your-db-connection';

export const yourDbAdapter = new SQLDatabaseAdapter(yourDatabaseConnection);

// Or for custom adapter:
export class YourCustomAdapter implements DatabaseAdapter {
  async findUserByEmail(email: string) {
    // Your implementation
    return await yourDb.users.findByEmail(email);
  }
  
  async findUserById(id: string) {
    // Your implementation
    return await yourDb.users.findById(id);
  }
  
  // ... implement other required methods
}
```

### 2. Configure the Adapter

```typescript
// lib/database-config.ts
import { configureDatabaseAdapter } from '@/lib/database-adapter';
import { yourDbAdapter } from './your-database-adapter';

// Configure the adapter at app startup
configureDatabaseAdapter(yourDbAdapter);

// Export the configured db instance
export { db } from '@/lib/database-adapter';
```

### 3. Update Existing Database Fields

If your existing schema has different field names, you can map them in your adapter:

```typescript
// Example: Mapping existing schema to authentication system
export class YourSchemaAdapter implements DatabaseAdapter {
  async findUserByEmail(email: string) {
    const user = await yourDb.query(
      'SELECT user_id as id, email_address as email, password_hash as password, ...'
    );
    
    // Map your fields to expected format
    return {
      id: user.user_id,
      email: user.email_address,
      password: user.password_hash,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.user_role.toLowerCase(),
      organizationId: user.company_id,
      isActive: user.status === 'active',
      emailVerified: user.email_confirmed,
      twoFactorEnabled: user.has_2fa,
      isOnboardingCompleted: user.setup_complete,
      // ... map other fields
    };
  }
}
```

## 🚀 Quick Setup

### For SQL Databases (MySQL/PostgreSQL)

1. **Install your database driver** (if not already installed):
```bash
npm install mysql2  # For MySQL
# or
npm install pg      # For PostgreSQL
```

2. **Create adapter**:
```typescript
// lib/database-config.ts
import mysql from 'mysql2/promise';
import { SQLDatabaseAdapter, configureDatabaseAdapter } from '@/lib/database-adapter';

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const adapter = new SQLDatabaseAdapter(connection);
configureDatabaseAdapter(adapter);

export { db } from '@/lib/database-adapter';
```

### For MongoDB

1. **Install MongoDB driver**:
```bash
npm install mongodb
```

2. **Create adapter**:
```typescript
// lib/database-config.ts
import { MongoClient } from 'mongodb';
import { MongoDBAdapter, configureDatabaseAdapter } from '@/lib/database-adapter';

const client = new MongoClient(process.env.MONGODB_URL);
await client.connect();
const database = client.db('your_database_name');

const adapter = new MongoDBAdapter(database);
configureDatabaseAdapter(adapter);

export { db } from '@/lib/database-adapter';
```

## 🔄 Migration from Existing Auth

If you have existing users, here's how to migrate:

### 1. Password Migration
```typescript
// Migrate existing password hashes
import { ProductionAuthService } from '@/lib/auth-production';

async function migrateUserPasswords() {
  const users = await yourDb.getAllUsers();
  
  for (const user of users) {
    if (user.password && !user.password.startsWith('$2b$')) {
      // Re-hash with bcrypt if using different hash
      const newHash = await ProductionAuthService.hashPassword(user.plainPassword);
      await yourDb.updateUser(user.id, { password: newHash });
    }
  }
}
```

### 2. Add Missing Fields
```sql
-- Add new authentication fields to existing table
ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN two_factor_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN two_factor_config TEXT;
ALTER TABLE users ADD COLUMN is_onboarding_completed BOOLEAN DEFAULT TRUE; -- Existing users
```

## 🔧 Environment Variables

Update your `.env` file:

```bash
# Your existing database connection
DATABASE_URL="your-existing-database-url"
DB_HOST="localhost"
DB_USER="your_db_user"
DB_PASSWORD="your_db_password"
DB_NAME="your_database_name"

# Authentication secrets (generate new ones)
JWT_SECRET="your-secure-jwt-secret-32-chars-minimum"
JWT_REFRESH_SECRET="your-secure-refresh-secret-32-chars-minimum"

# Optional features
REQUIRE_EMAIL_VERIFICATION="false"  # Set true when SMTP is configured
ENABLE_2FA="true"
RATE_LIMIT_ENABLED="true"

# Email configuration (optional)
SMTP_HOST="your-smtp-host"
SMTP_PORT="587"
SMTP_USER="your-smtp-username"
SMTP_PASSWORD="your-smtp-password"
SMTP_FROM="noreply@yourdomain.com"
```

## ✅ Testing the Integration

Run the setup script to validate your configuration:

```bash
npm run auth:setup
```

This will:
- ✅ Check environment variables
- ✅ Validate JWT secrets
- ✅ Test database connection
- ✅ Verify user schema compatibility
- ✅ Generate secure secrets if needed

## 🎯 What You Get

With your existing database, you now have:

- **🔐 Production-ready authentication** with JWT tokens
- **⚡ Real-time session management** via WebSocket
- **🛡️ Two-factor authentication** with TOTP
- **📧 Email verification** system
- **🔒 Advanced security** (rate limiting, account lockout)
- **📊 Session analytics** and monitoring
- **👥 Multi-device management**
- **🔍 Comprehensive audit logging**

Your existing data remains untouched - the system only adds authentication capabilities on top of your current setup!
