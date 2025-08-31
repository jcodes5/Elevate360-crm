// Authentication configuration settings
export const AUTH_CONFIG = {
  tokens: {
    access: {
      maxAge: 15 * 60, // 15 minutes in seconds
      cookieName: "accessToken",
      cookieOptions: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax" as const,
        path: "/",
      },
    },
    refresh: {
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      cookieName: "refreshToken",
      cookieOptions: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax" as const,
        path: "/",
      },
    },
  },
  security: {
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxAttempts: 5, // attempts per window per IP
    },
    passwords: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecial: true,
      specialChars: '!@#$%^&*(),.?":{}|<>',
      history: 5, // remember last 5 passwords
    },
    lockout: {
      maxAttempts: 5,
      windowMinutes: 15,
      durationMinutes: 30,
    },
    csrf: {
      tokenExpiry: 24 * 60 * 60 * 1000, // 24 hours
    },
  },
  roles: {
    valid: ["admin", "manager", "agent"] as const,
    default: "agent" as const,
  },
};
