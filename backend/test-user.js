// Test script to create a test user
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestUser() {
  try {
    const user = await prisma.user.create({
      data: {
        email: 'test@partner.com',
        passwordHash: '$2b$10$LVcyHaBzfGesKRFpIg0AEeY/RerTWUX4HQ7MTC/D2h/1UFkYui/HG', // password123
        role: 'PARTNER',
        isActive: true,
        firstName: 'Test',
        lastName: 'Partner',
        company: 'Test Company',
      },
    });

    console.log('✅ Test user created:');
    console.log(JSON.stringify(user, null, 2));
    console.log('\nLogin credentials:');
    console.log('  Email: test@partner.com');
    console.log('  Password: password123');
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('ℹ️  Test user already exists');
    } else {
      console.error('❌ Error:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
