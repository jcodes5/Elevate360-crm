import { execSync } from 'child_process';

console.log('🚀 Setting up database...');

try {
  // Generate Prisma Client
  console.log('📦 Generating Prisma Client...');
  execSync('npx prisma generate', { stdio: 'inherit' });

  // Push schema to database (creates tables)
  console.log('🗄️  Pushing schema to database...');
  execSync('npx prisma db push', { stdio: 'inherit' });

  console.log('✅ Database setup completed successfully!');
  console.log('');
  console.log('Next steps:');
  console.log('1. Update your DATABASE_URL in .env file');
  console.log('2. Run: npm run db:seed (to add test data)');
  console.log('3. Run: npm run dev (to start the application)');
  
} catch (error) {
  console.error('❌ Database setup failed:', error.message);
  console.log('');
  console.log('Make sure:');
  console.log('1. MySQL is running');
  console.log('2. Database exists');
  console.log('3. DATABASE_URL in .env is correct');
  process.exit(1);
}
