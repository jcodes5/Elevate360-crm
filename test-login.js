// Script to test login with a known user
const bcrypt = require('bcryptjs');

async function testLogin() {
  try {
    console.log("Testing login...");
    
    // The login data we'll send to the login endpoint
    const loginData = {
      email: "testuser@example.com",
      password: "Password123!"
    };
    
    console.log("Login data to be sent:", loginData);
    
    console.log("\nTo test login, send a POST request to /api/auth/login with this JSON body:");
    console.log(JSON.stringify(loginData, null, 2));
    
    console.log("\nOr use this curl command:");
    console.log(`curl -X POST http://localhost:3000/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(loginData)}'`);
    
  } catch (error) {
    console.error("Error:", error);
  }
}

testLogin();