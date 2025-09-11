import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ProductionAuthService } from "@/lib/auth-production";
import { db } from "@/lib/database-config";
import { getClientInfo } from "@/lib/request-utils";
import { config as envConfig } from "@/lib/env-config";

// Security headers for all responses
function addSecurityHeaders(response: NextResponse, request: NextRequest) {
  // Basic security headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
  
  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join("; ");
  
  response.headers.set("Content-Security-Policy", csp);
  
  // HTTPS enforcement in production
  if (envConfig.isProduction) {
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  }
  
  // Rate limiting headers (if applicable)
  if (envConfig.security.rateLimitEnabled) {
    response.headers.set("X-RateLimit-Limit", envConfig.security.apiRateLimit.requests.toString());
  }
  
  return response;
}

// Public paths that don't require authentication
const publicPaths = [
  "/",
  "/landing",
  "/auth/login",
  "/auth/register",
  "/api/auth/login",
  "/api/auth/refresh",
  "/api/auth/logout",
  "/api/auth/verify",
  "/api/test",
  "/unauthorized",
];

// Static asset patterns
const staticAssetPatterns = [
  /^\/favicon\.ico$/,
  /^\/.*\.svg$/,
  /^\/.*\.png$/,
  /^\/.*\.jpg$/,
  /^\/.*\.jpeg$/,
  /^\/.*\.gif$/,
  /^\/.*\.css$/,
  /^\/.*\.js$/,
  /^\/_next\/static\//,
  /^\/_next\/image\//,
];

// API path prefix
const apiPrefix = "/api/";

// Protected route prefixes that require completed onboarding
const protectedPrefixes = [
  "/dashboard",
  "/analytics", 
  "/settings",
  "/crm",
  "/marketing",
  "/appointments",
  "/contacts",
  "/deals",
  "/tasks",
  "/workflows",
  "/users",
  "/campaigns",
  "/reports",
];

// Admin-only routes
const adminOnlyPrefixes = [
  "/admin",
  "/settings/users",
  "/settings/organization",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isApiRoute = pathname.startsWith(apiPrefix);
  
  // Skip middleware for static assets
  if (staticAssetPatterns.some(pattern => pattern.test(pathname))) {
    return NextResponse.next();
  }

  // Allow public paths
  const isPublic = publicPaths.some(path => pathname === path || pathname.startsWith(path));
  if (isPublic) {
    const response = NextResponse.next();
    return addSecurityHeaders(response, request);
  }

  // Get tokens from cookies
  const { accessToken, refreshToken, sessionId } = ProductionAuthService.getTokensFromCookies(request);

  // No access token -> redirect or return 401
  if (!accessToken) {
    if (isApiRoute) {
      const response = NextResponse.json(
        { success: false, message: "Authentication required", code: "NO_TOKEN" },
        { status: 401 }
      );
      return addSecurityHeaders(response, request);
    }
    
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    const response = NextResponse.redirect(loginUrl);
    return addSecurityHeaders(response, request);
  }

  try {
    // Verify access token
    const payload = await ProductionAuthService.verifyAccessToken(accessToken);
    
    // For API routes, allow continuation with valid token
    if (isApiRoute) {
      const response = NextResponse.next();
      response.headers.set("X-User-ID", payload.userId);
      response.headers.set("X-User-Role", payload.role);
      response.headers.set("X-Session-ID", payload.sessionId || "");
      return addSecurityHeaders(response, request);
    }

    // Check if user needs onboarding
    let needsOnboarding = payload.isOnboardingCompleted === false;
    
    // Double-check with database for authoritative state
    try {
      const user = await db.findById("users", payload.userId);
      if (user) {
        needsOnboarding = !user.isOnboardingCompleted;
        
        // Check if user is still active
        if (!user.isActive) {
          const response = NextResponse.redirect(new URL("/unauthorized", request.url));
          ProductionAuthService.clearAuthCookies();
          return addSecurityHeaders(response, request);
        }
      }
    } catch (dbError) {
      console.warn("Database check failed in middleware:", dbError);
      // Continue with token data if DB is unavailable
    }

    // Handle onboarding flow
    if (needsOnboarding) {
      const isProtectedRoute = protectedPrefixes.some(prefix => pathname.startsWith(prefix)) || pathname === "/";
      
      if (isProtectedRoute && pathname !== "/onboarding") {
        const response = NextResponse.redirect(new URL("/onboarding", request.url));
        return addSecurityHeaders(response, request);
      }
    }

    // Check admin-only routes
    const isAdminRoute = adminOnlyPrefixes.some(prefix => pathname.startsWith(prefix));
    if (isAdminRoute && payload.role !== "admin") {
      const response = NextResponse.redirect(new URL("/unauthorized", request.url));
      return addSecurityHeaders(response, request);
    }

    // Check role-based access for specific routes
    if (pathname.startsWith("/settings") && !["admin", "manager"].includes(payload.role)) {
      const response = NextResponse.redirect(new URL("/unauthorized", request.url));
      return addSecurityHeaders(response, request);
    }

    // All checks passed, continue
    const response = NextResponse.next();
    response.headers.set("X-User-ID", payload.userId);
    response.headers.set("X-User-Role", payload.role);
    response.headers.set("X-Session-ID", payload.sessionId || "");
    return addSecurityHeaders(response, request);

  } catch (error: any) {
    console.warn("Token verification failed:", error.message);
    
    // Try to refresh token if available
    if (refreshToken) {
      try {
        const newTokenData = await ProductionAuthService.refreshAccessToken(refreshToken);
        
        // Create response with new token
        const response = NextResponse.next();
          
        // Set new access token cookie
        response.cookies.set("accessToken", newTokenData.accessToken, {
          httpOnly: true,
          secure: envConfig.isProduction,
          sameSite: "strict",
          maxAge: 15 * 60, // 15 minutes
          path: "/",
        });
        
        // Add user headers if token refresh was successful
        try {
          const newPayload = await ProductionAuthService.verifyAccessToken(newTokenData.accessToken);
          response.headers.set("X-User-ID", newPayload.userId);
          response.headers.set("X-User-Role", newPayload.role);
          response.headers.set("X-Session-ID", newPayload.sessionId || "");
        } catch (e) {
          console.warn("Failed to verify refreshed token:", e);
        }
        
        return addSecurityHeaders(response, request);
        
      } catch (refreshError) {
        console.warn("Token refresh failed:", refreshError);
        // Fall through to logout logic below
      }
    }

    // Token verification and refresh failed - logout user
    if (isApiRoute) {
      const response = NextResponse.json(
        { success: false, message: "Invalid or expired token", code: "TOKEN_EXPIRED" },
        { status: 401 }
      );
      ProductionAuthService.clearAuthCookies();
      return addSecurityHeaders(response, request);
    }

    // Redirect to login with return URL
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    loginUrl.searchParams.set("reason", "session_expired");
    
    const response = NextResponse.redirect(loginUrl);
    ProductionAuthService.clearAuthCookies();
    return addSecurityHeaders(response, request);
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
