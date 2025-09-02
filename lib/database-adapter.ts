/**
 * Database Adapter for Existing Database
 * 
 * This adapter allows the authentication system to work with your existing database
 * regardless of the database type (MySQL, PostgreSQL, MongoDB, etc.)
 */

export interface DatabaseAdapter {
  // User operations
  findUserByEmail(email: string): Promise<any>;
  findUserById(id: string): Promise<any>;
  createUser(userData: any): Promise<any>;
  updateUser(id: string, updates: any): Promise<any>;
  
  // Organization operations (if needed)
  createOrganization?(orgData: any): Promise<any>;
  findOrganizationById?(id: string): Promise<any>;
  
  // Session operations (optional - can use in-memory)
  createSession?(sessionData: any): Promise<any>;
  updateSession?(sessionId: string, updates: any): Promise<any>;
  deleteSession?(sessionId: string): Promise<void>;
  
  // Audit log operations (optional)
  createAuditLog?(logData: any): Promise<any>;
}

// Example adapter for MySQL/PostgreSQL (using your existing connection)
export class SQLDatabaseAdapter implements DatabaseAdapter {
  constructor(private dbConnection: any) {}
  
  async findUserByEmail(email: string): Promise<any> {
    // Adapt this to your database schema
    const query = `
      SELECT id, email, password, first_name, last_name, role, 
             organization_id, is_active, email_verified, two_factor_enabled,
             two_factor_config, is_onboarding_completed, last_login,
             created_at, updated_at
      FROM users 
      WHERE email = ? AND deleted_at IS NULL
    `;
    
    const result = await this.dbConnection.query(query, [email]);
    return result[0] || null;
  }
  
  async findUserById(id: string): Promise<any> {
    const query = `
      SELECT id, email, password, first_name, last_name, role,
             organization_id, is_active, email_verified, two_factor_enabled,
             two_factor_config, is_onboarding_completed, last_login,
             created_at, updated_at
      FROM users 
      WHERE id = ? AND deleted_at IS NULL
    `;
    
    const result = await this.dbConnection.query(query, [id]);
    return result[0] || null;
  }
  
  async createUser(userData: any): Promise<any> {
    const query = `
      INSERT INTO users (
        id, email, password, first_name, last_name, role,
        organization_id, is_active, email_verified, two_factor_enabled,
        is_onboarding_completed, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    
    const values = [
      userData.id || this.generateId(),
      userData.email,
      userData.password,
      userData.firstName,
      userData.lastName,
      userData.role,
      userData.organizationId,
      userData.isActive ?? true,
      userData.emailVerified ?? false,
      userData.twoFactorEnabled ?? false,
      userData.isOnboardingCompleted ?? false,
    ];
    
    await this.dbConnection.query(query, values);
    return this.findUserByEmail(userData.email);
  }
  
  async updateUser(id: string, updates: any): Promise<any> {
    const fields = [];
    const values = [];
    
    // Build dynamic update query
    for (const [key, value] of Object.entries(updates)) {
      const dbField = this.camelToSnake(key);
      fields.push(`${dbField} = ?`);
      values.push(value);
    }
    
    if (fields.length === 0) return this.findUserById(id);
    
    fields.push('updated_at = NOW()');
    values.push(id);
    
    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
    await this.dbConnection.query(query, values);
    
    return this.findUserById(id);
  }
  
  async createOrganization(orgData: any): Promise<any> {
    const query = `
      INSERT INTO organizations (
        id, name, settings, subscription, created_at, updated_at
      ) VALUES (?, ?, ?, ?, NOW(), NOW())
    `;
    
    const values = [
      orgData.id || this.generateId(),
      orgData.name,
      JSON.stringify(orgData.settings || {}),
      JSON.stringify(orgData.subscription || {}),
    ];
    
    await this.dbConnection.query(query, values);
    return { id: values[0], ...orgData };
  }
  
  // Helper methods
  private generateId(): string {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
  
  private camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }
}

// Example adapter for MongoDB
export class MongoDBAdapter implements DatabaseAdapter {
  constructor(private db: any) {}
  
  async findUserByEmail(email: string): Promise<any> {
    return await this.db.collection('users').findOne({ 
      email, 
      deletedAt: { $exists: false } 
    });
  }
  
  async findUserById(id: string): Promise<any> {
    return await this.db.collection('users').findOne({ 
      _id: id, 
      deletedAt: { $exists: false } 
    });
  }
  
  async createUser(userData: any): Promise<any> {
    const user = {
      _id: userData.id || this.generateId(),
      email: userData.email,
      password: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role,
      organizationId: userData.organizationId,
      isActive: userData.isActive ?? true,
      emailVerified: userData.emailVerified ?? false,
      twoFactorEnabled: userData.twoFactorEnabled ?? false,
      isOnboardingCompleted: userData.isOnboardingCompleted ?? false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await this.db.collection('users').insertOne(user);
    return user;
  }
  
  async updateUser(id: string, updates: any): Promise<any> {
    const updateDoc = {
      ...updates,
      updatedAt: new Date(),
    };
    
    await this.db.collection('users').updateOne(
      { _id: id },
      { $set: updateDoc }
    );
    
    return this.findUserById(id);
  }
  
  private generateId(): string {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}

// Configuration function to set your database adapter
let databaseAdapter: DatabaseAdapter;

export function configureDatabaseAdapter(adapter: DatabaseAdapter) {
  databaseAdapter = adapter;
}

export function getDatabaseAdapter(): DatabaseAdapter {
  if (!databaseAdapter) {
    throw new Error('Database adapter not configured. Call configureDatabaseAdapter() first.');
  }
  return databaseAdapter;
}

// Database operation wrappers that use your adapter
export const db = {
  async findUserByEmail(email: string) {
    return getDatabaseAdapter().findUserByEmail(email);
  },
  
  async findById(table: string, id: string) {
    if (table === 'users') {
      return getDatabaseAdapter().findUserById(id);
    }
    throw new Error(`Table ${table} not supported in adapter`);
  },
  
  async create(table: string, data: any) {
    if (table === 'users') {
      return getDatabaseAdapter().createUser(data);
    }
    if (table === 'organizations' && getDatabaseAdapter().createOrganization) {
      return getDatabaseAdapter().createOrganization(data);
    }
    throw new Error(`Table ${table} not supported in adapter`);
  },
  
  async updateById(table: string, id: string, updates: any) {
    if (table === 'users') {
      return getDatabaseAdapter().updateUser(id, updates);
    }
    throw new Error(`Table ${table} not supported in adapter`);
  },
  
  async findMany(table: string, options: any) {
    if (table === 'users' && options.where?.email) {
      const user = await getDatabaseAdapter().findUserByEmail(options.where.email);
      return user ? [user] : [];
    }
    throw new Error(`FindMany operation not supported for ${table}`);
  },
};
