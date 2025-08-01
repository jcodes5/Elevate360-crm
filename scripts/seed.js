// Use ts-node to execute the TypeScript seed function with proper configuration
require('ts-node').register({
  project: './tsconfig.seed.json'
});
const { createTestDataPrisma } = require('../lib/seed-data-prisma.ts');

async function main() {
  console.log('🌱 Seeding database...');
  
  try {
    await createTestDataPrisma();
    console.log('✅ Database seeded successfully!');
    console.log('');
    console.log('Test accounts created:');
    console.log('- Admin: test@example.com / password123');
    console.log('- Manager: manager@example.com / password123');
    console.log('- Agent: agent@example.com / password123');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

main();