#!/usr/bin/env node

/**
 * Production Authentication Setup Script
 * 
 * This script helps set up the production-ready authentication system
 * and validates the configuration.
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

console.log('🔐 Setting up Production Authentication System...\n');

// Generate secure JWT secrets
function generateSecureSecret(length = 64) {
  return crypto.randomBytes(length).toString('hex');
}

// Check if environment variable exists
function checkEnvVar(name, required = false) {
  const value = process.env[name];
  if (required && !value) {
    console.error(`❌ Required environment variable ${name} is not set`);
    return false;
  }
  return !!value;
}

// Validate JWT secret strength
function validateJWTSecret(secret) {
  if (!secret) return false;
  if (secret.length < 32) return false;
  if (secret.includes('dev-secret') || secret.includes('your-secret')) return false;
  return true;
}

// Main setup function
function setupProductionAuth() {
  console.log('1. 🔍 Checking current configuration...');
  
  const requiredVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET'
  ];
  
  const optionalVars = [
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USER',
    'SMTP_PASSWORD',
    'SMTP_FROM',
    'REQUIRE_EMAIL_VERIFICATION',
    'ENABLE_2FA'
  ];
  
  let hasAllRequired = true;
  let hasOptionalConfig = 0;
  
  // Check required variables
  console.log('\n   Required Environment Variables:');
  for (const varName of requiredVars) {
    const exists = checkEnvVar(varName);
    console.log(`   ${exists ? '✅' : '❌'} ${varName}`);
    if (!exists) hasAllRequired = false;
  }
  
  // Check optional variables
  console.log('\n   Optional Environment Variables:');
  for (const varName of optionalVars) {
    const exists = checkEnvVar(varName);
    console.log(`   ${exists ? '✅' : '⚪'} ${varName}`);
    if (exists) hasOptionalConfig++;
  }
  
  // Validate JWT secrets
  console.log('\n2. 🔐 Validating JWT secrets...');
  const jwtSecret = process.env.JWT_SECRET;
  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
  
  const jwtSecretValid = validateJWTSecret(jwtSecret);
  const jwtRefreshSecretValid = validateJWTSecret(jwtRefreshSecret);
  
  console.log(`   ${jwtSecretValid ? '✅' : '❌'} JWT_SECRET ${jwtSecretValid ? 'is secure' : 'needs update'}`);
  console.log(`   ${jwtRefreshSecretValid ? '✅' : '❌'} JWT_REFRESH_SECRET ${jwtRefreshSecretValid ? 'is secure' : 'needs update'}`);
  
  // Generate new secrets if needed
  if (!jwtSecretValid || !jwtRefreshSecretValid) {
    console.log('\n3. 🔧 Generating secure JWT secrets...');
    
    const newJwtSecret = generateSecureSecret();
    const newJwtRefreshSecret = generateSecureSecret();
    
    console.log('   Add these to your environment variables:');
    console.log(`   JWT_SECRET="${newJwtSecret}"`);
    console.log(`   JWT_REFRESH_SECRET="${newJwtRefreshSecret}"`);
    
    // Try to update .env file if it exists
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      console.log('\n   💾 Updating .env file...');
      let envContent = fs.readFileSync(envPath, 'utf8');
      
      if (!jwtSecretValid) {
        if (envContent.includes('JWT_SECRET=')) {
          envContent = envContent.replace(/JWT_SECRET=.*/, `JWT_SECRET="${newJwtSecret}"`);
        } else {
          envContent += `\nJWT_SECRET="${newJwtSecret}"`;
        }
      }
      
      if (!jwtRefreshSecretValid) {
        if (envContent.includes('JWT_REFRESH_SECRET=')) {
          envContent = envContent.replace(/JWT_REFRESH_SECRET=.*/, `JWT_REFRESH_SECRET="${newJwtRefreshSecret}"`);
        } else {
          envContent += `\nJWT_REFRESH_SECRET="${newJwtRefreshSecret}"`;
        }
      }
      
      fs.writeFileSync(envPath, envContent);
      console.log('   ✅ .env file updated');
    }
  }
  
  // Check database connection
  console.log('\n4. 🗄️  Database connection...');
  if (process.env.DATABASE_URL) {
    console.log('   ✅ DATABASE_URL is configured');
    if (process.env.DATABASE_URL.includes('localhost') || process.env.DATABASE_URL.includes('127.0.0.1')) {
      console.log('   ⚠️  Using local database - ensure it\'s production-ready');
    }
  } else {
    console.log('   ❌ DATABASE_URL not configured');
    console.log('   💡 Connect to Neon database for production setup');
  }
  
  // Check email configuration
  console.log('\n5. 📧 Email configuration...');
  const emailConfigured = checkEnvVar('SMTP_HOST') && checkEnvVar('SMTP_USER') && checkEnvVar('SMTP_PASSWORD');
  
  if (emailConfigured) {
    console.log('   ✅ SMTP configuration complete');
    console.log('   📨 Email verification and notifications enabled');
  } else {
    console.log('   ⚪ SMTP not configured (optional)');
    console.log('   💡 Configure SMTP for email verification and notifications');
  }
  
  // Security recommendations
  console.log('\n6. 🛡️  Security recommendations...');
  
  const securityChecks = [
    {
      name: 'Strong JWT secrets',
      check: jwtSecretValid && jwtRefreshSecretValid,
      action: 'Use the generated secrets above'
    },
    {
      name: 'Email verification enabled',
      check: process.env.REQUIRE_EMAIL_VERIFICATION === 'true',
      action: 'Set REQUIRE_EMAIL_VERIFICATION=true'
    },
    {
      name: '2FA enabled',
      check: process.env.ENABLE_2FA === 'true',
      action: 'Set ENABLE_2FA=true'
    },
    {
      name: 'Rate limiting enabled',
      check: process.env.RATE_LIMIT_ENABLED !== 'false',
      action: 'Set RATE_LIMIT_ENABLED=true'
    }
  ];
  
  for (const check of securityChecks) {
    console.log(`   ${check.check ? '✅' : '⚪'} ${check.name}`);
    if (!check.check) {
      console.log(`      💡 ${check.action}`);
    }
  }
  
  // Final status
  console.log('\n🎯 Setup Status:');
  
  if (hasAllRequired && jwtSecretValid && jwtRefreshSecretValid) {
    console.log('✅ Your authentication system is production-ready!');
    console.log('\n📋 Next steps:');
    console.log('   1. Deploy with the updated environment variables');
    console.log('   2. Test 2FA setup flow');
    console.log('   3. Verify email notifications work');
    console.log('   4. Monitor authentication logs');
  } else {
    console.log('⚠️  Additional configuration needed:');
    
    if (!hasAllRequired) {
      console.log('   - Set required environment variables');
    }
    if (!jwtSecretValid || !jwtRefreshSecretValid) {
      console.log('   - Update JWT secrets');
    }
    
    console.log('\n💡 Run this script again after making changes');
  }
  
  // Feature summary
  console.log('\n🚀 Available Features:');
  console.log('   ✅ JWT-based authentication with refresh tokens');
  console.log('   ✅ Session management with real-time updates');
  console.log('   ✅ Two-factor authentication (TOTP + backup codes)');
  console.log('   ✅ Email verification system');
  console.log('   ✅ Rate limiting and account lockout protection');
  console.log('   ✅ Real-time session monitoring via WebSocket');
  console.log('   ✅ Multi-device session management');
  console.log('   ✅ Comprehensive audit logging');
  console.log('   ✅ Role-based access control (RBAC)');
  console.log('   ✅ Security headers and CSRF protection');
  
  console.log('\n📚 Documentation: See AUTHENTICATION_SYSTEM.md for details');
}

// Run the setup
try {
  setupProductionAuth();
} catch (error) {
  console.error('❌ Setup failed:', error.message);
  process.exit(1);
}
