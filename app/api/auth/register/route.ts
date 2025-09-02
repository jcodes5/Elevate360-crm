import { type NextRequest, NextResponse } from "next/server";
import { EnhancedAuthService } from "@/lib/auth-enhanced";
import { db } from "@/lib/database-config";
import { validateAndSanitizeInput } from "@/lib/input-validation";
import { logAuditEvent, AuditEventType } from "@/lib/audit-logger";
import { AUTH_CONFIG } from "@/lib/auth-config";
import { authRateLimiter } from "@/lib/enhanced-rate-limiter";
import { validateCsrfToken } from "../csrf-token/route";
import type { User } from "@/types";

// Enhanced password validation
function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
  score: number;
} {
  const errors: string[] = [];
  const config = AUTH_CONFIG.security.passwords;
  let score = 0;

  // Check if password is provided and is a string
  if (!password || typeof password !== 'string') {
    errors.push("Password is required");
    return {
      isValid: false,
      errors,
      score
    };
  }

  // Length check
  if (password.length >= config.minLength) {
    score += 20;
  } else {
    errors.push(`Password must be at least ${config.minLength} characters long`);
  }

  // Character type checks
  if (config.requireUppercase && /[A-Z]/.test(password)) {
    score += 15;
  } else if (config.requireUppercase) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (config.requireLowercase && /[a-z]/.test(password)) {
    score += 15;
  } else if (config.requireLowercase) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (config.requireNumbers && /[0-9]/.test(password)) {
    score += 15;
  } else if (config.requireNumbers) {
    errors.push("Password must contain at least one number");
  }

  if (config.requireSpecial && new RegExp(`[${config.specialChars}]`).test(password)) {
    score += 15;
  } else if (config.requireSpecial) {
    errors.push("Password must contain at least one special character");
  }

  // Additional strength checks
  if (password.length >= 12) score += 10; // Bonus for longer passwords
  if (/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/.test(password)) score += 10; // Mixed case + numbers
  if (!/(.)\1{2,}/.test(password)) score += 10; // No repeated characters

  return {
    isValid: errors.length === 0 && score >= 60,
    errors,
    score: Math.min(100, score),
  };
}

// Email domain validation
function validateEmailDomain(email: string): boolean {
  const allowedDomains = [
    // Common business email providers
    "gmail.com", "outlook.com", "hotmail.com", "yahoo.com",
    "company.com", "business.com", "enterprise.com"
  ];
  
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return false;
  
  // Allow any domain for now, but log suspicious ones
  const isSuspicious = domain.includes("tempmail") || domain.includes("10minute");
  if (isSuspicious) {
    console.warn(`Suspicious email domain detected: ${domain}`);
  }
  
  return true;
}

// Role validation with business logic
function validateUserRole(role: string, email: string): { isValid: boolean; adjustedRole: string } {
  const normalizedRole = role.toLowerCase();
  
  if (!AUTH_CONFIG.roles.valid.includes(normalizedRole as any)) {
    return { isValid: false, adjustedRole: AUTH_CONFIG.roles.default };
  }
  
  // Business logic: Only certain email domains can register as admin
  if (normalizedRole === "admin") {
    const domain = email.split("@")[1]?.toLowerCase();
    const allowedAdminDomains = ["company.com", "yourdomain.com"]; // Configure these
    
    if (!allowedAdminDomains.includes(domain || "")) {
      console.warn(`Admin registration attempt from non-authorized domain: ${domain}`);
      return { isValid: true, adjustedRole: "manager" }; // Downgrade to manager
    }
  }
  
  return { isValid: true, adjustedRole: normalizedRole };
}

export async function POST(request: NextRequest) {
  try {
    // Enhanced rate limiting
    const rateLimitResponse = await authRateLimiter.check(request);
    if (rateLimitResponse) return rateLimitResponse;

    // CSRF protection (skip in development for now)
    if (process.env.NODE_ENV === "production") {
      const csrfToken = request.headers.get("x-csrf-token");
      const sessionId = request.cookies.get("sessionId")?.value;

      if (!csrfToken || !sessionId || !validateCsrfToken(sessionId, csrfToken)) {
        await logAuditEvent(request, AuditEventType.REGISTER_FAILURE, {
          status: "failure",
          details: { reason: "CSRF token validation failed" },
        });

        return NextResponse.json(
          { success: false, message: "Invalid or missing CSRF token" },
          { status: 403 }
        );
      }
    }

    // Get and validate request body
    const requestBody = await request.json();
    
    // Enhanced input validation
    const {
      sanitized,
      errors: validationErrors,
      isValid,
    } = validateAndSanitizeInput(requestBody);

    if (!isValid) {
      await logAuditEvent(request, AuditEventType.REGISTER_FAILURE, {
        email: requestBody.email,
        status: "failure",
        details: { errors: validationErrors, reason: "Input validation failed" },
      });

      return NextResponse.json(
        { 
          success: false, 
          message: "Invalid input data", 
          errors: validationErrors.map(error => ({ field: "general", message: error }))
        },
        { status: 400 }
      );
    }

    const {
      email,
      password,
      firstName,
      lastName,
      role = AUTH_CONFIG.roles.default,
      organizationName,
    } = sanitized;

    // Enhanced email validation
    if (!validateEmailDomain(email)) {
      await logAuditEvent(request, AuditEventType.REGISTER_FAILURE, {
        email,
        status: "failure",
        details: { reason: "Invalid email domain" },
      });

      return NextResponse.json(
        { 
          success: false, 
          message: "Invalid email domain",
          errors: [{ field: "email", message: "Please use a valid business email address" }]
        },
        { status: 400 }
      );
    }

    // Enhanced role validation
    const roleValidation = validateUserRole(role, email);
    if (!roleValidation.isValid) {
      await logAuditEvent(request, AuditEventType.REGISTER_FAILURE, {
        email,
        status: "failure",
        details: { reason: "Invalid role specified" },
      });

      return NextResponse.json(
        { 
          success: false, 
          message: "Invalid role specified",
          errors: [{ field: "role", message: "Please select a valid role" }]
        },
        { status: 400 }
      );
    }

    // Enhanced password validation
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      await logAuditEvent(request, AuditEventType.REGISTER_FAILURE, {
        email,
        status: "failure",
        details: {
          reason: "Password validation failed",
          passwordScore: passwordValidation.score,
          errors: passwordValidation.errors,
        },
      });

      return NextResponse.json(
        {
          success: false,
          message: "Password does not meet security requirements",
          errors: passwordValidation.errors.map(error => ({ field: "password", message: error })),
          passwordStrength: {
            score: passwordValidation.score,
            requirements: passwordValidation.errors
          }
        },
        { status: 400 }
      );
    }

    // Check for existing user
    const existingUsers = await db.findMany("users", { where: { email } });
    if (existingUsers.length > 0) {
      await logAuditEvent(request, AuditEventType.REGISTER_FAILURE, {
        email,
        status: "failure",
        details: { reason: "Email already exists" },
      });

      return NextResponse.json(
        { 
          success: false, 
          message: "An account with this email already exists",
          errors: [{ field: "email", message: "This email is already registered" }]
        },
        { status: 409 }
      );
    }

    // Hash password with enhanced security
    const hashedPassword = await EnhancedAuthService.hashPassword(password);

    // Create organization
    const organizationData = {
      name: organizationName || `${firstName} ${lastName}'s Organization`,
      settings: {
        timezone: "UTC",
        dateFormat: "YYYY-MM-DD",
        currency: "USD",
      },
      subscription: {
        plan: "trial",
        status: "active",
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days trial
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const organization = await db.create("organizations", organizationData);

    if (!organization || !organization.id) {
      await logAuditEvent(request, AuditEventType.REGISTER_FAILURE, {
        email,
        status: "failure",
        details: { reason: "Failed to create organization" },
      });

      return NextResponse.json(
        { success: false, message: "Failed to create organization" },
        { status: 500 }
      );
    }

    // Create user with enhanced data
    const prismaRole = roleValidation.adjustedRole.toUpperCase() as "ADMIN" | "MANAGER" | "AGENT";
    const userData = {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: prismaRole,
      organizationId: organization.id,
      isActive: true,
      isOnboardingCompleted: false,
      onboardingStep: 0,
      emailVerified: false, // Require email verification
      twoFactorEnabled: false,
      securityQuestions: [],
      loginAttempts: 0,
      lastLogin: null,
      passwordChangedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const user = await db.create("users", userData);

    // Generate tokens
    const tokens = EnhancedAuthService.generateTokens(user);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    // Log successful registration
    await logAuditEvent(request, AuditEventType.REGISTER_SUCCESS, {
      userId: user.id,
      email,
      status: "success",
      details: {
        organizationId: organization.id,
        role: prismaRole,
        passwordScore: passwordValidation.score,
        emailDomain: email.split("@")[1],
      },
    });

    const response = NextResponse.json(
      {
        success: true,
        data: {
          user: userWithoutPassword,
          token: tokens.accessToken,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: tokens.expiresIn,
          organization: {
            id: organization.id,
            name: organization.name,
          },
        },
        message: "Account created successfully",
      },
      { status: 201 }
    );

    // Set secure cookies
    const { access, refresh } = AUTH_CONFIG.tokens;

    response.cookies.set(access.cookieName, tokens.accessToken, {
      ...access.cookieOptions,
      maxAge: access.maxAge,
    });

    response.cookies.set(refresh.cookieName, tokens.refreshToken, {
      ...refresh.cookieOptions,
      maxAge: refresh.maxAge,
    });

    // Add rate limit headers
    authRateLimiter.addHeaders(response, request);

    return response;
  } catch (error) {
    console.error("[Auth] Registration error:", error);

    const errorMessage =
      error instanceof Error ? error.message : typeof error === "string" ? error : "Internal server error";

    await logAuditEvent(request, AuditEventType.REGISTER_FAILURE, {
      status: "failure",
      details: { error: errorMessage },
    });

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
