// Test script to verify real user registration works correctly
const testRealUserRegistration = async () => {
  console.log("Testing real user registration...");
  
  // Test data
  const testUser = {
    email: "realuser@example.com",
    password: "SecurePass123!",
    firstName: "Real",
    lastName: "User",
    role: "agent",
    organizationName: "Real User Organization"
  };
  
  try {
    // Test the enhanced registration endpoint (recommended)
    console.log("Testing registration endpoint...");
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
      console.log("✅ Registration is working correctly!");
      console.log("User created with ID:", result.data.user.id);
      console.log("Organization created with ID:", result.data.user.organizationId);
    } else {
      console.log("❌ Enhanced registration failed:", result.message);
    }
    
    // Test the basic registration endpoint
    console.log("\nTesting second registration with different email...");
    const basicResponse = await fetch("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...testUser,
        email: "realuser2@example.com" // Use different email to avoid conflict
      }),
    });
    
    const basicResult = await basicResponse.json();
    console.log("Basic registration response:", basicResult);
    
    if (basicResult.success) {
      console.log("✅ Basic registration is working correctly!");
      console.log("User created with ID:", basicResult.data.user.id);
      console.log("Organization created with ID:", basicResult.data.user.organizationId);
    } else {
      console.log("❌ Basic registration failed:", basicResult.message);
    }
    
    return true;
  } catch (error) {
    console.error("Error testing registration:", error);
    return false;
  }
};

// Run the test
testRealUserRegistration();
