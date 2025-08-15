// Simple test script to verify registration fix
const testRegistrationFix = async () => {
  console.log("Testing registration fix...");
  
  // Test data
  const testUser = {
    email: "testuser@example.com",
    password: "TestPassword123!",
    firstName: "Test",
    lastName: "User",
    role: "agent"
  };
  
  try {
    // Test the registration endpoint
    const response = await fetch("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testUser),
    });
    
    const result = await response.json();
    console.log("Registration response:", result);
    
    if (result.success) {
      console.log("✅ Registration fix is working correctly!");
      return true;
    } else {
      console.log("❌ Registration still has issues:", result.message);
      return false;
    }
  } catch (error) {
    console.error("Error testing registration:", error);
    return false;
  }
};

// Run the test
testRegistrationFix();