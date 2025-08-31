// Script to create a test user with a known password
const { db } = require('./lib/database-config');
const { AuthService } = require('./lib/auth');

async function createTestUser() {
  try {
    console.log("Creating test user...");
    
    // Hash the password
    const password = "password123";
    const hashedPassword = await AuthService.hashPassword(password);
    
    console.log("Hashed password:", hashedPassword);
    
    // Create organization first
    const organization = await db.create("organizations", {
      name: "Test Organization",
      domain: "test.com",
      settings: {},
      subscription: {},
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log("Organization created:", organization.id);
    
    // Create user
    const user = await db.create("users", {
      email: "testuser@example.com",
      firstName: "Test",
      lastName: "User",
      role: "ADMIN",
      password: hashedPassword,
      organizationId: organization.id,
      isActive: true,
      isOnboardingCompleted: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log("User created successfully:");
    console.log("- Email:", user.email);
    console.log("- Password hash:", user.password);
    console.log("- User ID:", user.id);
    
  } catch (error) {
    console.error("Error creating test user:", error);
  }
}

createTestUser();