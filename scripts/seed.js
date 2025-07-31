const { createTestDataPrisma } = require('../lib/seed-data-prisma');

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
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

main();
