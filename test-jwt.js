const jwt = require('jsonwebtoken');

// Use the same secrets as in the app
const JWT_ACCESS_SECRET = process.env.JWT_SECRET || "elevate360-production-access-secret-key-2024";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "elevate360-production-refresh-secret-key-2024";

// Test user object (similar to what would come from database)
const testUser = {
  id: "cmesmxl080002n9i0xirckdgq",
  email: "jattoovercomer928@gmail.com",
  role: "AGENT",
  organizationId: "org123",
  isOnboardingCompleted: false
};

console.log("🧪 Testing JWT generation and verification...");
console.log("📝 Test user:", testUser);
console.log("🔑 JWT_ACCESS_SECRET length:", JWT_ACCESS_SECRET.length);

// Generate token (same as ProductionAuthService.generateTokens)
const payload = {
  userId: testUser.id,
  email: testUser.email,
  role: testUser.role,
  organizationId: testUser.organizationId,
  isOnboardingCompleted: testUser.isOnboardingCompleted ?? false,
};

console.log("📦 Token payload:", payload);

try {
  // Generate access token
  const accessToken = jwt.sign(payload, JWT_ACCESS_SECRET, {
    expiresIn: "15m",
    issuer: "elevate360-crm",
    audience: "elevate360-users",
    jwtid: "test-session-123",
  });

  console.log("✅ Token generated successfully");
  console.log("🎫 Token length:", accessToken.length);
  console.log("🎫 Token preview:", accessToken.substring(0, 50) + "...");

  // Verify token (same as ProductionAuthService.verifyAccessToken)
  const verified = jwt.verify(accessToken, JWT_ACCESS_SECRET, {
    issuer: "elevate360-crm",
    audience: "elevate360-users",
  });

  console.log("✅ Token verified successfully");
  console.log("🔍 Verified payload:", verified);

} catch (error) {
  console.error("❌ JWT test failed:", error.message);
  console.error("❌ Error details:", error);
}
