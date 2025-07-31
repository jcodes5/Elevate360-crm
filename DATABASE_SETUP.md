# Database Setup Guide

This guide will help you set up MySQL database for the Elevate360 CRM application.

## Prerequisites

1. **MySQL Server**: Install MySQL 8.0 or higher
2. **Node.js**: Version 18 or higher
3. **Database**: Create a MySQL database for the application

## Quick Setup

### 1. Install MySQL (if not already installed)

**On Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install mysql-server
sudo mysql_secure_installation
```

**On macOS (using Homebrew):**
```bash
brew install mysql
brew services start mysql
```

**On Windows:**
Download and install from [MySQL Official Website](https://dev.mysql.com/downloads/mysql/)

### 2. Create Database

```sql
-- Login to MySQL
mysql -u root -p

-- Create database
CREATE DATABASE elevate360_crm;

-- Create user (optional but recommended)
CREATE USER 'elevate360_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON elevate360_crm.* TO 'elevate360_user'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Configure Environment Variables

Update your `.env` file with your database connection details:

```env
# Database Configuration
DATABASE_URL="mysql://elevate360_user:your_secure_password@localhost:3306/elevate360_crm"

# JWT Secrets (change these in production!)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-this-in-production"
```

### 4. Set Database Mode

To use the real MySQL database instead of the mock database, set:

```env
USE_MOCK_DB=false
```

Or to use mock database for development:

```env
USE_MOCK_DB=true
```

### 5. Setup Database Schema

Run the database setup script:

```bash
npm run db:setup
```

This will:
- Generate Prisma Client
- Create all database tables
- Set up relationships

### 6. Seed Test Data

Add test data to your database:

```bash
npm run db:seed
```

This creates:
- Test organization
- Admin user: `test@example.com` / `password123`
- Manager user: `manager@example.com` / `password123`
- Agent user: `agent@example.com` / `password123`
- Sample contacts

## Database Scripts

| Script | Description |
|--------|-------------|
| `npm run db:setup` | Initial database setup |
| `npm run db:seed` | Add test data |
| `npm run db:studio` | Open Prisma Studio (visual database editor) |
| `npm run db:reset` | Reset database and reseed |
| `npm run db:generate` | Generate Prisma Client |
| `npm run db:migrate` | Create and apply migrations |

## Database Schema

The application uses the following main tables:

- **organizations** - Company/tenant data
- **users** - System users (admin, manager, agent)
- **contacts** - Customer/prospect information
- **deals** - Sales opportunities
- **pipelines** - Sales pipeline stages
- **tasks** - Todo items and activities
- **campaigns** - Marketing campaigns
- **appointments** - Scheduled meetings
- **workflows** - Automation workflows

## Development vs Production

### Development Mode
- Use `USE_MOCK_DB=true` for rapid development without database setup
- Use `USE_MOCK_DB=false` to test with real MySQL

### Production Mode
- Always use `USE_MOCK_DB=false`
- Use environment variables for database credentials
- Enable SSL for database connections
- Use connection pooling for better performance

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Ensure MySQL is running: `sudo systemctl status mysql`
   - Check if port 3306 is open
   - Verify database credentials

2. **Database Doesn't Exist**
   ```sql
   CREATE DATABASE elevate360_crm;
   ```

3. **Permission Denied**
   ```sql
   GRANT ALL PRIVILEGES ON elevate360_crm.* TO 'your_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

4. **Prisma Generate Fails**
   ```bash
   npm install @prisma/client
   npx prisma generate
   ```

### Reset Everything

If you need to start fresh:

```bash
# Reset database
npm run db:reset

# Or manually
npx prisma db push --force-reset
npm run db:seed
```

## Environment Variables Reference

```env
# Required
DATABASE_URL="mysql://username:password@localhost:3306/database_name"

# Optional
USE_MOCK_DB=false
DATABASE_POOL_MIN=0
DATABASE_POOL_MAX=10

# Security (change in production)
JWT_SECRET="your-jwt-secret"
JWT_REFRESH_SECRET="your-refresh-secret"
```

## Next Steps

After setting up the database:

1. Start the development server: `npm run dev`
2. Login with test credentials: `test@example.com` / `password123`
3. Explore the application features
4. Check database content: `npm run db:studio`

## Production Deployment

For production deployment:

1. Use a managed MySQL service (AWS RDS, Google Cloud SQL, etc.)
2. Enable SSL connections
3. Use environment variables for all secrets
4. Set up database backups
5. Configure connection pooling
6. Monitor database performance

## Support

If you encounter issues:

1. Check the console logs for error messages
2. Verify database connection with `npm run db:studio`
3. Ensure all environment variables are set correctly
4. Check that MySQL service is running
