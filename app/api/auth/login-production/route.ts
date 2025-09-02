import { type NextRequest, NextResponse } from "next/server";
import { ProductionAuthService, productionRateLimiter } from "@/lib/auth-production";
import { db } from "@/lib/database-config";
import { validateAndSanitizeInput } from "@/lib/input-validation";
import { logAuditEvent, AuditEventType } from "@/lib/audit-logger";
import type { User } from "@/types";

// Enhanced security headers
function addSecurityHeaders(response: NextResponse) {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
  
  if (process.env.NODE_ENV === "production") {
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  }
  
  return response;
}

// Get client information for session tracking
function getClientInfo(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  const ipAddress = forwarded ? forwarded.split(",")[0].trim() : request.ip || "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";
  
  return { ipAddress, userAgent };
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = await productionRateLimiter.check(request);
    if (rateLimitResponse) {
      return addSecurityHeaders(new NextResponse(rateLimitResponse.body, {
        status: rateLimitResponse.status,
        headers: rateLimitResponse.headers,
      }));
    }

    // Get client information
    const clientInfo = getClientInfo(request);

    // Validate and sanitize input
    const requestBody = await request.json();
    const { sanitized, errors: validationErrors, isValid } = validateAndSanitizeInput(requestBody);

    if (!isValid) {
      await logAuditEvent(request, AuditEventType.LOGIN_FAILURE, {
        email: requestBody.email,
        ipAddress: clientInfo.ipAddress,
        userAgent: clientInfo.userAgent,
        status: "failure",
        details: { errors: validationErrors, reason: "Input validation failed" },
      });

      const response = NextResponse.json(
        { 
          success: false, 
          message: "Invalid input data", 
          errors: validationErrors.map(error => ({ field: "general", message: error }))
        },
        { status: 400 }
      );

      return addSecurityHeaders(response);
    }

    const { email, password, rememberMe = false } = sanitized;

    // Validate required fields
    if (!email || !password) {
      await logAuditEvent(request, AuditEventType.LOGIN_FAILURE, {
        email,
        ipAddress: clientInfo.ipAddress,
        userAgent: clientInfo.userAgent,
        status: "failure",
        details: { reason: "Missing email or password" },
      });

      const response = NextResponse.json(
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

      return addSecurityHeaders(response);
    }

    // Enhanced email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      await logAuditEvent(request, AuditEventType.LOGIN_FAILURE, {
        email,
        ipAddress: clientInfo.ipAddress,
        userAgent: clientInfo.userAgent,
        status: "failure",
        details: { reason: "Invalid email format" },
      });

      const response = NextResponse.json(
        { 
          success: false, 
          message: "Invalid email format",
          errors: [{ field: "email", message: "Please enter a valid email address" }]
        },
        { status: 400 }
      );

      return addSecurityHeaders(response);
    }

    // Find user
    const users = await db.findMany("users", { where: { email } });
    const user = users[0] as User;

    if (!user) {
      await logAuditEvent(request, AuditEventType.LOGIN_FAILURE, {
        email,
        ipAddress: clientInfo.ipAddress,
        userAgent: clientInfo.userAgent,
        status: "failure",
        details: { reason: "User not found" },
      });

      // Return generic error to prevent email enumeration
      const response = NextResponse.json(
        { 
          success: false, 
          message: "Invalid email or password",
          errors: [{ field: "general", message: "Invalid email or password" }]
        },
        { status: 401 }
      );

      return addSecurityHeaders(response);
    }

    // Check if user account is active
    if (!user.isActive) {
      await logAuditEvent(request, AuditEventType.LOGIN_FAILURE, {
        userId: user.id,
        email,
        ipAddress: clientInfo.ipAddress,
        userAgent: clientInfo.userAgent,
        status: "failure",
        details: { reason: "Account deactivated" },
      });

      const response = NextResponse.json(
        { 
          success: false, 
          message: "Account is deactivated. Please contact support.",
          accountDeactivated: true,
        },
        { status: 401 }
      );

      return addSecurityHeaders(response);
    }

    // Check email verification if required
    if (process.env.REQUIRE_EMAIL_VERIFICATION === "true" && !user.emailVerified) {
      await logAuditEvent(request, AuditEventType.LOGIN_FAILURE, {
        userId: user.id,
        email,
        ipAddress: clientInfo.ipAddress,
        userAgent: clientInfo.userAgent,
        status: "failure",
        details: { reason: "Email not verified" },
      });

      const response = NextResponse.json(
        {
          success: false,
          message: "Please verify your email address before logging in",
          emailNotVerified: true,
        },
        { status: 401 }
      );

      return addSecurityHeaders(response);
    }

    // Verify password
    const isValidPassword = await ProductionAuthService.comparePassword(password, user.password!);

    if (!isValidPassword) {
      await logAuditEvent(request, AuditEventType.LOGIN_FAILURE, {
        userId: user.id,
        email,
        ipAddress: clientInfo.ipAddress,
        userAgent: clientInfo.userAgent,
        status: "failure",
        details: { reason: "Invalid password" },
      });

      const response = NextResponse.json(
        { 
          success: false, 
          message: "Invalid email or password",
          errors: [{ field: "general", message: "Invalid email or password" }]
        },
        { status: 401 }
      );

      return addSecurityHeaders(response);
    }

    // Reset rate limiting on successful login
    productionRateLimiter.reset(request);

    // Update user login information
    await db.updateById("users", user.id, { 
      lastLogin: new Date(),
      loginAttempts: 0,
    });

    // Generate tokens with session tracking
    const tokens = ProductionAuthService.generateTokens(user, clientInfo);

    // Remove sensitive data from response
    const { password: _, ...userWithoutPassword } = user;

    // Log successful login
    await logAuditEvent(request, AuditEventType.LOGIN_SUCCESS, {
      userId: user.id,
      email,
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
      status: "success",
      details: {
        sessionId: tokens.sessionId,
        rememberMe,
        loginMethod: "password",
      },
    });

    const responseData = {
      success: true,
      data: {
        user: userWithoutPassword,
        tokens: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: tokens.expiresIn,
          tokenType: "Bearer",
        },
        session: {
          sessionId: tokens.sessionId,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
          activeSessions: ProductionAuthService.getUserSessions(user.id).length,
        },
      },
      message: "Login successful",
    };

    const response = NextResponse.json(responseData, { status: 200 });

    // Set secure cookies
    ProductionAuthService.setAuthCookies(tokens, rememberMe);

    // Add security and rate limit headers
    productionRateLimiter.addHeaders(response, request);
    response.headers.set("X-Login-Success", "true");
    response.headers.set("X-Session-ID", tokens.sessionId);

    return addSecurityHeaders(response);

  } catch (error) {
    console.error("[Auth] Production login error:", error);

    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    const clientInfo = getClientInfo(request);

    await logAuditEvent(request, AuditEventType.LOGIN_FAILURE, {
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
      status: "failure",
      details: { error: errorMessage },
    });

    const response = NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );

    return addSecurityHeaders(response);
  }
}
