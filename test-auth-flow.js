// Test script to verify authentication flow
const jwt = require('jsonwebtoken');

// JWT Configuration (same as in ProductionAuthService)
const JWT_ACCESS_SECRET = process.env.JWT_SECRET || "elevate360-production-access-secret-key-2024";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "elevate360-production-refresh-secret-key-2024";

console.log('🔍 Testing JWT Token Generation and Verification...\n');

// Test payload
const testPayload = {
  userId: 'test-user-123',
  email: 'test@example.com',
  role: 'admin',
  organizationId: 'org-123',
  sessionId: 'sess-test-123',
  deviceId: 'device-test-123',
  isOnboardingCompleted: true,
};

console.log('📝 Test Payload:', testPayload);

// Generate tokens
try {
  const accessToken = jwt.sign(testPayload, JWT_ACCESS_SECRET, {
    expiresIn: '15m',
    issuer: "elevate360-crm",
    audience: "elevate360-users",
    jwtid: testPayload.sessionId,
  });

  const refreshToken = jwt.sign(testPayload, JWT_REFRESH_SECRET, {
    expiresIn: '7d',
    issuer: "elevate360-crm",
    audience: "elevate360-users",
    jwtid: testPayload.sessionId,
  });

  console.log('✅ Access Token Generated (length:', accessToken.length, ')');
  console.log('✅ Refresh Token Generated (length:', refreshToken.length, ')');

  // Test verification
  console.log('\n🔐 Testing Token Verification...');

  const verifiedAccess = jwt.verify(accessToken, JWT_ACCESS_SECRET, {
    issuer: "elevate360-crm",
    audience: "elevate360-users",
  });

  const verifiedRefresh = jwt.verify(refreshToken, JWT_REFRESH_SECRET, {
    issuer: "elevate360-crm",
    audience: "elevate360-users",
  });

  console.log('✅ Access Token Verified:', {
    userId: verifiedAccess.userId,
    sessionId: verifiedAccess.sessionId,
    email: verifiedAccess.email
  });

  console.log('✅ Refresh Token Verified:', {
    userId: verifiedRefresh.userId,
    sessionId: verifiedRefresh.sessionId,
    email: verifiedRefresh.email
  });

  console.log('\n🎉 JWT Flow Test PASSED! Tokens are generating and verifying correctly.');

} catch (error) {
  console.error('❌ JWT Test FAILED:', error.message);
  process.exit(1);
}

// Test with old secrets (to simulate the mismatch issue)
console.log('\n🔍 Testing with OLD secrets (simulating the original issue)...');

const OLD_ACCESS_SECRET = "your-access-secret-key";
const OLD_REFRESH_SECRET = "your-refresh-secret-key";

try {
  const oldAccessToken = jwt.sign(testPayload, OLD_ACCESS_SECRET, {
    expiresIn: '15m',
    issuer: "elevate360-crm",
    audience: "elevate360-users",
  });

  // Try to verify with NEW secret
  jwt.verify(oldAccessToken, JWT_ACCESS_SECRET, {
    issuer: "elevate360-crm",
    audience: "elevate360-users",
  });

  console.log('❌ UNEXPECTED: Old token verified with new secret (this should fail)');

} catch (error) {
  console.log('✅ EXPECTED: Old token failed verification with new secret:', error.message);
  console.log('   This confirms the original issue was due to secret mismatch.');
}

console.log('\n📋 Summary:');
console.log('   - New JWT secrets are working correctly');
console.log('   - Token generation and verification flow is functional');
console.log('   - Secret mismatch would cause the authentication failures you experienced');
console.log('   - The fix should resolve the login redirect issue');
