// Script to register a test user with a known password
const bcrypt = require('bcryptjs');

async function registerTestUser() {
  try {
    console.log("Registering test user...");
    
    // The data we'll send to the registration endpoint
    const userData = {
      email: "testuser@example.com",
      password: "Password123!",
      firstName: "Test",
      lastName: "User",
      role: "admin",
      organizationName: "Test Organization"
    };
    
    console.log("User data to be sent:", userData);
    
    // Hash the password the same way the AuthService does it
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    console.log("Expected hash:", hashedPassword);
    
    console.log("\nTo register this user, send a POST request to /api/auth/register with this JSON body:");
    console.log(JSON.stringify(userData, null, 2));
    
    console.log("\nOr use this curl command:");
    console.log(`curl -X POST http://localhost:3000/api/auth/register \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(userData)}'`);
    
  } catch (error) {
    console.error("Error:", error);
  }
}

registerTestUser();