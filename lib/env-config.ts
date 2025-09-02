import { z } from "zod";

// Environment schema validation
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1, "Database URL is required"),
  
  // JWT Secrets
  JWT_SECRET: z.string().min(32, "JWT Secret must be at least 32 characters"),
  JWT_REFRESH_SECRET: z.string().min(32, "JWT Refresh Secret must be at least 32 characters"),
  
  // Environment
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  
  // App Configuration
  NEXTAUTH_URL: z.string().url().optional(),
  NEXTAUTH_SECRET: z.string().min(32).optional(),
  
  // Email Configuration (optional but recommended for production)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(Number).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_FROM: z.string().email().optional(),
  
  // Optional Features
  REQUIRE_EMAIL_VERIFICATION: z.string().transform(val => val === "true").default("false"),
  ENABLE_2FA: z.string().transform(val => val === "true").default("false"),
  
  // Security
  RATE_LIMIT_ENABLED: z.string().transform(val => val === "true").default("true"),
  SESSION_TIMEOUT_MINUTES: z.string().transform(Number).default("15"),
  
  // External Services
  REDIS_URL: z.string().optional(),
  SENTRY_DSN: z.string().optional(),
  
  // Upload/Storage
  UPLOAD_MAX_SIZE: z.string().transform(Number).default("5242880"), // 5MB
  ALLOWED_FILE_TYPES: z.string().default("image/jpeg,image/png,image/gif,application/pdf"),
  
  // API Rate Limiting
  API_RATE_LIMIT_REQUESTS: z.string().transform(Number).default("100"),
  API_RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default("900000"), // 15 minutes
  
  // Logging
  LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info"),
  ENABLE_REQUEST_LOGGING: z.string().transform(val => val === "true").default("false"),
});

// Parse and validate environment variables
function parseEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      console.error("❌ Environment validation failed:");
      missingVars.forEach(msg => console.error(`  - ${msg}`));
      
      if (process.env.NODE_ENV === "production") {
        process.exit(1);
      } else {
        console.warn("⚠️  Running in development mode with missing environment variables");
        return envSchema.parse({
          ...process.env,
          // Provide defaults for development
          JWT_SECRET: "dev-secret-key-that-should-be-changed-in-production-and-be-at-least-32-chars",
          JWT_REFRESH_SECRET: "dev-refresh-secret-key-that-should-be-changed-in-production-and-be-at-least-32-chars",
          DATABASE_URL: process.env.DATABASE_URL || "mysql://user:password@localhost:3306/crm_dev",
        });
      }
    }
    throw error;
  }
}

// Export validated environment configuration
export const env = parseEnv();

// Environment-specific configurations
export const config = {
  isDevelopment: env.NODE_ENV === "development",
  isProduction: env.NODE_ENV === "production",
  isTest: env.NODE_ENV === "test",
  
  // Database
  database: {
    url: env.DATABASE_URL,
  },
  
  // Authentication
  auth: {
    jwtSecret: env.JWT_SECRET,
    jwtRefreshSecret: env.JWT_REFRESH_SECRET,
    sessionTimeoutMinutes: env.SESSION_TIMEOUT_MINUTES,
    requireEmailVerification: env.REQUIRE_EMAIL_VERIFICATION,
    enable2FA: env.ENABLE_2FA,
  },
  
  // Security
  security: {
    rateLimitEnabled: env.RATE_LIMIT_ENABLED,
    apiRateLimit: {
      requests: env.API_RATE_LIMIT_REQUESTS,
      windowMs: env.API_RATE_LIMIT_WINDOW_MS,
    },
  },
  
  // Email
  email: {
    smtp: {
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      user: env.SMTP_USER,
      password: env.SMTP_PASSWORD,
      from: env.SMTP_FROM,
    },
    enabled: !!(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASSWORD),
  },
  
  // File Upload
  upload: {
    maxSize: env.UPLOAD_MAX_SIZE,
    allowedTypes: env.ALLOWED_FILE_TYPES.split(",").map(type => type.trim()),
  },
  
  // Logging
  logging: {
    level: env.LOG_LEVEL,
    enableRequestLogging: env.ENABLE_REQUEST_LOGGING,
  },
  
  // External Services
  external: {
    redisUrl: env.REDIS_URL,
    sentryDsn: env.SENTRY_DSN,
  },
} as const;

// Runtime configuration validator
export function validateRuntimeConfig() {
  const issues: string[] = [];
  
  if (config.isProduction) {
    // Production-specific validations
    if (config.auth.jwtSecret.includes("dev-secret")) {
      issues.push("JWT_SECRET should be changed from development default");
    }
    
    if (config.auth.jwtRefreshSecret.includes("dev-refresh-secret")) {
      issues.push("JWT_REFRESH_SECRET should be changed from development default");
    }
    
    if (!config.email.enabled && config.auth.requireEmailVerification) {
      issues.push("Email verification is enabled but SMTP is not configured");
    }
    
    if (!env.REDIS_URL) {
      console.warn("⚠️  REDIS_URL not configured. Using in-memory cache (not recommended for production)");
    }
    
    if (!env.SENTRY_DSN) {
      console.warn("⚠️  SENTRY_DSN not configured. Error tracking disabled");
    }
  }
  
  if (issues.length > 0) {
    console.error("❌ Production configuration issues:");
    issues.forEach(issue => console.error(`  - ${issue}`));
    
    if (config.isProduction) {
      process.exit(1);
    }
  }
  
  return issues.length === 0;
}

// Initialize configuration
if (config.isProduction) {
  validateRuntimeConfig();
}

// Export environment check utilities
export const isDev = config.isDevelopment;
export const isProd = config.isProduction;
export const isTest = config.isTest;

// Export specific configs for easy access
export const {
  auth: authConfig,
  security: securityConfig,
  email: emailConfig,
  upload: uploadConfig,
  logging: loggingConfig,
} = config;

console.log(`🚀 Environment: ${env.NODE_ENV.toUpperCase()}`);
console.log(`📧 Email enabled: ${config.email.enabled ? "YES" : "NO"}`);
console.log(`🔐 2FA enabled: ${config.auth.enable2FA ? "YES" : "NO"}`);
console.log(`📊 Request logging: ${config.logging.enableRequestLogging ? "YES" : "NO"}`);
