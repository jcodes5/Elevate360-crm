import { type NextRequest, NextResponse } from "next/server";
import { EnhancedAuthService } from "@/lib/auth-enhanced";
import { db } from "@/lib/database-config";
import { csrfProtection } from "@/lib/csrf-protection";
import { validateAndSanitizeInput } from "@/lib/input-validation";
import { logAuditEvent, AuditEventType } from "@/lib/audit-logger";
import { AUTH_CONFIG } from "@/lib/auth-config";
import { rateLimiter } from "@/lib/rate-limiter";
import type { User } from "@/types";

// Password validation function
function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const config = AUTH_CONFIG.security.passwords;

  if (password.length < config.minLength) {
    errors.push(
      `Password must be at least ${config.minLength} characters long`
    );
  }

  if (config.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (config.requireLowercase && !/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (config.requireNumbers && !/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  if (
    config.requireSpecial &&
    !new RegExp(`[${config.specialChars}]`).test(password)
  ) {
    errors.push("Password must contain at least one special character");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Role validation function
function validateRole(role: string): boolean {
  return AUTH_CONFIG.roles.valid.includes(role.toLowerCase() as any);
}

export async function POST(request: NextRequest) {
  try {
    // Check rate limit
    const rateLimitResponse = await rateLimiter(request);
    if (rateLimitResponse) return rateLimitResponse;

    // Check CSRF token
    const csrfResponse = await csrfProtection(request);
    if (csrfResponse) return csrfResponse;

    // Get request body and validate/sanitize inputs
    const requestBody = await request.json();
    const {
      sanitized,
      errors: validationErrors,
      isValid,
    } = validateAndSanitizeInput(requestBody);

    if (!isValid) {
      await logAuditEvent(request, AuditEventType.REGISTER_FAILURE, {
        email: requestBody.email,
        status: "failure",
        details: { errors: validationErrors },
      });

      return NextResponse.json(
        { success: false, message: "Invalid input", errors: validationErrors },
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

    // Validate role
    if (!validateRole(role)) {
      await logAuditEvent(request, AuditEventType.REGISTER_FAILURE, {
        email,
        status: "failure",
        details: { reason: "Invalid role" },
      });

      return NextResponse.json(
        { success: false, message: "Invalid role specified" },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      await logAuditEvent(request, AuditEventType.REGISTER_FAILURE, {
        email,
        status: "failure",
        details: {
          reason: "Password validation failed",
          errors: passwordValidation.errors,
        },
      });

      return NextResponse.json(
        {
          success: false,
          message: "Password does not meet requirements",
          errors: passwordValidation.errors,
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUsers = await db.findMany("users", { where: { email } });

    if (existingUsers.length > 0) {
      await logAuditEvent(request, AuditEventType.REGISTER_FAILURE, {
        email,
        status: "failure",
        details: { reason: "Email already exists" },
      });

      return NextResponse.json(
        { success: false, message: "User already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await EnhancedAuthService.hashPassword(password);

    // Create organization for the user
    const organizationData = {
      name: organizationName || `${firstName}'s Organization`,
      settings: {},
      subscription: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const organization = await db.create("organizations", organizationData);

    // Ensure we have a valid organization ID
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

    // Convert role to uppercase to match Prisma enum values
    const prismaRole = role.toUpperCase() as "ADMIN" | "MANAGER" | "AGENT";

    // Create user
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
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const user = await db.create("users", userData);

    // Generate tokens
    const tokens = EnhancedAuthService.generateTokens(user);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    await logAuditEvent(request, AuditEventType.REGISTER_SUCCESS, {
      userId: user.id,
      email,
      status: "success",
      details: {
        organizationId: organization.id,
        role: prismaRole,
      },
    });

    const response = NextResponse.json(
      {
        success: true,
        data: {
          user: userWithoutPassword,
          token: tokens.accessToken, // For backward compatibility
          accessToken: tokens.accessToken, // New standard name
          refreshToken: tokens.refreshToken,
          expiresIn: tokens.expiresIn,
        },
      },
      { status: 201 }
    );

    // Set cookies using shared configuration
    const { access, refresh } = AUTH_CONFIG.tokens;

    response.cookies.set(access.cookieName, tokens.accessToken, {
      ...access.cookieOptions,
      maxAge: access.maxAge,
    });

    response.cookies.set(refresh.cookieName, tokens.refreshToken, {
      ...refresh.cookieOptions,
      maxAge: refresh.maxAge,
    });

    return response;
  } catch (error) {
    console.error("[Auth] Registration error:", error);

    const errorMessage =
      error instanceof Error ? error.message : typeof error === "string" ? error : JSON.stringify(error);

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
