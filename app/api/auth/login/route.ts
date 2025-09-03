import { type NextRequest, NextResponse } from "next/server";
import { ProductionAuthService } from "@/lib/auth-production";
import { db } from "@/lib/database-config";
import { validateAndSanitizeInput } from "@/lib/input-validation";
import { logAuditEvent, AuditEventType } from "@/lib/audit-logger";
import { authRateLimiter } from "@/lib/enhanced-rate-limiter";
import { AUTH_CONFIG } from "@/lib/auth-config";
import { validateCsrfToken } from "../csrf-token/route";
import type { User } from "@/types";

// Account lockout management
const accountLockouts = new Map<string, { lockedUntil: number; attempts: number }>();

// Clean up expired lockouts
setInterval(() => {
  const now = Date.now();
  for (const [email, lockout] of accountLockouts.entries()) {
    if (now >= lockout.lockedUntil) {
      accountLockouts.delete(email);
    }
  }
}, 60000);

function checkAccountLockout(email: string): { isLocked: boolean; retryAfter?: number } {
  const lockout = accountLockouts.get(email);
  if (!lockout) return { isLocked: false };

  const now = Date.now();
  if (now >= lockout.lockedUntil) {
    accountLockouts.delete(email);
    return { isLocked: false };
  }

  return {
    isLocked: true,
    retryAfter: Math.ceil((lockout.lockedUntil - now) / 1000),
  };
}

function recordFailedAttempt(email: string): void {
  const lockout = accountLockouts.get(email) || { lockedUntil: 0, attempts: 0 };
  lockout.attempts++;

  if (lockout.attempts >= AUTH_CONFIG.security.lockout.maxAttempts) {
    lockout.lockedUntil = Date.now() + AUTH_CONFIG.security.lockout.durationMinutes * 60 * 1000;
    console.warn(`Account locked for ${email} due to ${lockout.attempts} failed attempts`);
  }

  accountLockouts.set(email, lockout);
}

function clearFailedAttempts(email: string): void {
  accountLockouts.delete(email);
}

// Suspicious activity detection
function detectSuspiciousActivity(request: NextRequest, email: string): string[] {
  const warnings: string[] = [];
  
  // Check user agent
  const userAgent = request.headers.get("user-agent");
  if (!userAgent || userAgent.includes("bot") || userAgent.includes("curl")) {
    warnings.push("Suspicious user agent");
  }

  // Check for common attack patterns in email
  if (email.includes("'") || email.includes("\"") || email.includes("<") || email.includes(">")) {
    warnings.push("Potential injection attempt in email");
  }

  return warnings;
}

export async function POST(request: NextRequest) {
  try {
    console.log("🔐 Login API called");
    
    // Enhanced rate limiting with IP-based tracking
    const rateLimitResponse = await authRateLimiter.check(request);
    if (rateLimitResponse) return rateLimitResponse;

    // CSRF protection (skip in development for now)
    if (process.env.NODE_ENV === "production") {
      const csrfToken = request.headers.get("x-csrf-token");
      const sessionId = request.cookies.get("sessionId")?.value;

      if (!csrfToken || !sessionId || !validateCsrfToken(sessionId, csrfToken)) {
        await logAuditEvent(request, AuditEventType.LOGIN_FAILURE, {
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
    console.log("📝 Login request for email:", requestBody.email);
    
    const {
      sanitized,
      errors: validationErrors,
      isValid,
    } = validateAndSanitizeInput(requestBody);

    if (!isValid) {
      await logAuditEvent(request, AuditEventType.LOGIN_FAILURE, {
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

    const { email, password, rememberMe = false } = sanitized;

    // Validate required fields
    if (!email || !password) {
      await logAuditEvent(request, AuditEventType.LOGIN_FAILURE, {
        email,
        status: "failure",
        details: { reason: "Missing email or password" },
      });

      return NextResponse.json(
        { 
          success: false, 
          message: "Email and password are required",
          errors: [
            { field: "email", message: !email ? "Email is required" : "" },
            { field: "password", message: !password ? "Password is required" : "" }
          ].filter(e => e.message)
        },
        { status: 400 }
      );
    }

    // Check for account lockout
    const lockoutStatus = checkAccountLockout(email);
    if (lockoutStatus.isLocked) {
      await logAuditEvent(request, AuditEventType.LOGIN_FAILURE, {
        email,
        status: "failure",
        details: { reason: "Account locked", retryAfter: lockoutStatus.retryAfter },
      });

      return NextResponse.json(
        {
          success: false,
          message: "Account temporarily locked due to multiple failed attempts",
          retryAfter: lockoutStatus.retryAfter,
          accountLocked: true,
        },
        { 
          status: 423,
          headers: {
            "Retry-After": lockoutStatus.retryAfter?.toString() || "1800",
          },
        }
      );
    }

    // Detect suspicious activity
    const suspiciousWarnings = detectSuspiciousActivity(request, email);
    if (suspiciousWarnings.length > 0) {
      console.warn(`⚠️ Suspicious login attempt for ${email}:`, suspiciousWarnings);
      
      await logAuditEvent(request, AuditEventType.LOGIN_FAILURE, {
        email,
        status: "failure",
        details: { reason: "Suspicious activity detected", warnings: suspiciousWarnings },
      });
    }

    // Find user
    console.log("🔍 Looking up user...");
    const users = await db.findMany("users", { where: { email } });
    const user = users[0];

    if (!user) {
      recordFailedAttempt(email);
      
      await logAuditEvent(request, AuditEventType.LOGIN_FAILURE, {
        email,
        status: "failure",
        details: { reason: "User not found" },
      });

      // Return generic error to prevent email enumeration
      return NextResponse.json(
        { 
          success: false, 
          message: "Invalid email or password",
          errors: [{ field: "general", message: "Invalid email or password" }]
        },
        { status: 401 }
      );
    }

    console.log("👤 User found:", user.id);

    // Check if user account is active
    if (!user.isActive) {
      await logAuditEvent(request, AuditEventType.LOGIN_FAILURE, {
        userId: user.id,
        email,
        status: "failure",
        details: { reason: "Account deactivated" },
      });

      return NextResponse.json(
        { 
          success: false, 
          message: "Account is deactivated. Please contact support.",
          accountDeactivated: true,
        },
        { status: 401 }
      );
    }

    // Check if email is verified (if required)
    if (process.env.REQUIRE_EMAIL_VERIFICATION === "true" && !user.emailVerified) {
      await logAuditEvent(request, AuditEventType.LOGIN_FAILURE, {
        userId: user.id,
        email,
        status: "failure",
        details: { reason: "Email not verified" },
      });

      return NextResponse.json(
        {
          success: false,
          message: "Please verify your email address before logging in",
          emailNotVerified: true,
        },
        { status: 401 }
      );
    }

    // Verify password with timing attack protection
    console.log("🔒 Verifying password...");
    const isValidPassword = await ProductionAuthService.comparePassword(
      password,
      user.password!
    );

    if (!isValidPassword) {
      recordFailedAttempt(email);
      
      await logAuditEvent(request, AuditEventType.LOGIN_FAILURE, {
        userId: user.id,
        email,
        status: "failure",
        details: { reason: "Invalid password" },
      });

      // Return generic error to prevent password enumeration
      return NextResponse.json(
        { 
          success: false, 
          message: "Invalid email or password",
          errors: [{ field: "general", message: "Invalid email or password" }]
        },
        { status: 401 }
      );
    }

    console.log("✅ Password verified");

    // Clear any failed attempts on successful login
    clearFailedAttempts(email);
    authRateLimiter.reset(request); // Reset rate limiting for this user

    // Update user login information
    console.log("📊 Updating user login info...");
    await db.updateById("users", user.id, { 
      lastLogin: new Date(),
      loginAttempts: 0,
    });

    // Generate tokens with enhanced security
    console.log("🎫 Generating tokens...");
    const sessionInfo = {
      ipAddress: request.headers.get("x-forwarded-for") || request.ip || "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
    };
    const tokens = ProductionAuthService.generateTokens(user, sessionInfo);

    // Remove sensitive data from response
    const { password: _, ...userWithoutPassword } = user;

    // Log successful login
    await logAuditEvent(request, AuditEventType.LOGIN_SUCCESS, {
      userId: user.id,
      email,
      status: "success",
      details: {
        rememberMe,
        userAgent: request.headers.get("user-agent") || "unknown",
        ip: request.headers.get("x-forwarded-for") || request.ip || "unknown",
      },
    });

    const responseData = {
      success: true,
      data: {
        user: userWithoutPassword,
        token: tokens.accessToken, // For backward compatibility
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        sessionId: tokens.sessionId,
        expiresIn: tokens.expiresIn,
      },
      message: "Login successful",
    };

    console.log("📤 Creating response with cookies...");
    const response = NextResponse.json(responseData, { status: 200 });

    // Set secure cookies - ALWAYS set both access and refresh tokens
    response.cookies.set("accessToken", tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: AUTH_CONFIG.tokens.access.maxAge, // 15 minutes
      path: "/",
    });

    // ALWAYS set refresh token (not just when rememberMe is true)
    response.cookies.set("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: rememberMe ? AUTH_CONFIG.tokens.refresh.maxAge : AUTH_CONFIG.tokens.access.maxAge * 4, // 1 hour if not remember me, 7 days if remember me
      path: "/",
    });

    console.log("🍪 Cookies set:", {
      accessToken: "set",
      refreshToken: "set",
      rememberMe,
      accessTokenMaxAge: AUTH_CONFIG.tokens.access.maxAge,
      refreshTokenMaxAge: rememberMe ? AUTH_CONFIG.tokens.refresh.maxAge : AUTH_CONFIG.tokens.access.maxAge * 4
    });

    // Add security headers
    response.headers.set("X-Login-Success", "true");
    authRateLimiter.addHeaders(response, request);

    console.log("🎉 Login successful for user:", user.id);
    return response;
  } catch (error) {
    console.error("❌ [Auth] Login error:", error);

    const errorMessage =
      error instanceof Error ? error.message : typeof error === "string" ? error : "Internal server error";

    await logAuditEvent(request, AuditEventType.LOGIN_FAILURE, {
      status: "failure",
      details: { error: errorMessage },
    });

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
