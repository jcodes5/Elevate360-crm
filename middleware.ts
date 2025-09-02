import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { EnhancedAuthService } from "@/lib/auth-enhanced";
import { db } from "@/lib/database-config";

// Public paths that don't require authentication
const publicPaths = [
  "/",
  "/landing",
  "/auth/login",
  "/auth/register",
  "/api/auth/login",
  "/api/auth/register", 
  "/api/auth/refresh",
  "/api/auth/logout",
  "/api/test", // Keep as public for now but fix the API
];

// Static file patterns to skip middleware
const staticFilePatterns = [
  /\/_next\/static\//,
  /\/_next\/image\//,
  /\/favicon\.ico$/,
  /\.(?:png|jpg|jpeg|gif|svg|ico|css|js|map)$/,
];

// API path prefix
const apiPrefix = "/api/";

// Protected route prefixes that should be blocked until onboarding is complete
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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  console.log(`🔍 Middleware checking: ${pathname}`);

  // Skip static files
  if (staticFilePatterns.some(pattern => pattern.test(pathname))) {
    console.log(`📁 Skipping static file: ${pathname}`);
    return NextResponse.next();
  }

  // Allow public paths
  const isPublic = publicPaths.some(p => pathname === p || pathname.startsWith(p));
  if (isPublic) {
    console.log(`🌐 Public path allowed: ${pathname}`);
    return NextResponse.next();
  }

  const isApiRoute = pathname.startsWith(apiPrefix);
  console.log(`🔗 Is API route: ${isApiRoute}`);

  // Get tokens from cookies
  const { accessToken, refreshToken } = EnhancedAuthService.getTokensFromCookies(request);
  console.log(`🍪 Tokens found - Access: ${!!accessToken}, Refresh: ${!!refreshToken}`);

  // No access token -> API: 401, page: redirect to login
  if (!accessToken) {
    console.log(`❌ No access token for: ${pathname}`);
    
    if (isApiRoute) {
      return NextResponse.json(
        { success: false, message: "No access token provided" },
        { status: 401 }
      );
    }
    
    // Avoid redirect loops - if already on login page, let it through
    if (pathname === "/auth/login") {
      console.log(`🔄 Already on login page, allowing through`);
      return NextResponse.next();
    }
    
    console.log(`🔄 Redirecting to login from: ${pathname}`);
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  try {
    // Verify token
    console.log(`🔐 Verifying token for: ${pathname}`);
    const payload = EnhancedAuthService.verifyAccessToken(accessToken);
    console.log(`✅ Token verified for user: ${payload.userId}`);

    // For API routes we allow continuing (business logic may still check headers)
    if (isApiRoute) {
      console.log(`✅ API route allowed: ${pathname}`);
      return NextResponse.next();
    }

    // Determine onboarding need via token flag
    const tokenNeedsOnboarding = payload.isOnboardingCompleted === false;
    console.log(`📋 Token says needs onboarding: ${tokenNeedsOnboarding}`);

    // Query DB for authoritative onboarding state (if DB available)
    let dbNeedsOnboarding = false;
    try {
      const user = await db.findById("users", payload.userId as string);
      dbNeedsOnboarding = !!user && (user as any).isOnboardingCompleted === false;
      console.log(`📊 DB says needs onboarding: ${dbNeedsOnboarding}`);
    } catch (dbErr) {
      console.warn(`⚠️ DB check failed:`, dbErr);
      // If DB fails, we'll still honor the token flag
    }

    const needsOnboarding = tokenNeedsOnboarding || dbNeedsOnboarding;
    console.log(`🎯 Final onboarding needed: ${needsOnboarding}`);

    if (needsOnboarding) {
      const isProtected = protectedPrefixes.some(prefix => pathname.startsWith(prefix)) || pathname === "/";
      
      if (isProtected && pathname !== "/onboarding") {
        console.log(`🔄 Redirecting to onboarding from: ${pathname}`);
        return NextResponse.redirect(new URL("/onboarding", request.url));
      }
    }

    console.log(`✅ Allowing access to: ${pathname}`);
    return NextResponse.next();
    
  } catch (err: any) {
    console.log(`❌ Token verification failed for ${pathname}:`, err.message);
    
    // Token verification failed; try refresh if we have a refresh token
    if (refreshToken) {
      console.log(`🔄 Attempting token refresh...`);
      try {
        const newTokenData = await EnhancedAuthService.refreshAccessToken(refreshToken);
        console.log(`✅ Token refresh successful`);
        
        const response = NextResponse.next();
        response.cookies.set("accessToken", newTokenData.accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax", 
          maxAge: 15 * 60,
          path: "/",
        });
        return response;
      } catch (refreshErr) {
        console.log(`❌ Token refresh failed:`, refreshErr);
        // refresh failed, fall through to redirect/401 below
      }
    }

    if (isApiRoute) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Avoid redirect loops - if already on login page, let it through  
    if (pathname === "/auth/login") {
      console.log(`🔄 Token invalid but already on login, allowing through`);
      return NextResponse.next();
    }

    console.log(`🔄 Clearing cookies and redirecting to login from: ${pathname}`);
    const response = NextResponse.redirect(new URL("/auth/login", request.url));
    response.cookies.delete("accessToken");
    response.cookies.delete("refreshToken");
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files) 
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|css|js|map)$).*)",
  ],
};
