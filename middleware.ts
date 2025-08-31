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
  "/api/test",
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

  // Allow public paths
  const isPublic = publicPaths.some(
    (p) => pathname === p || pathname.startsWith(p)
  );
  if (isPublic) return NextResponse.next();

  const isApiRoute = pathname.startsWith(apiPrefix);

  // Get tokens from cookies
  const { accessToken, refreshToken } =
    EnhancedAuthService.getTokensFromCookies(request);

  // No access token -> API: 401, page: redirect to login
  if (!accessToken) {
    if (isApiRoute) {
      return NextResponse.json(
        { success: false, message: "No access token provided" },
        { status: 401 }
      );
    }
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  try {
    // Verify token
    const payload = EnhancedAuthService.verifyAccessToken(accessToken);

    // For API routes we allow continuing (business logic may still check headers)
    if (isApiRoute) return NextResponse.next();

    // Determine onboarding need via token flag
    const tokenNeedsOnboarding = payload.isOnboardingCompleted === false;

    // Query DB for authoritative onboarding state (if DB available)
    let dbNeedsOnboarding = false;
    try {
      const user = await db.findById("users", payload.userId as string);
      dbNeedsOnboarding =
        !!user && (user as any).isOnboardingCompleted === false;
    } catch (dbErr) {
      // If DB fails, we'll still honor the token flag
    }

    const needsOnboarding = tokenNeedsOnboarding || dbNeedsOnboarding;

    if (needsOnboarding) {
      const isProtected =
        protectedPrefixes.some((prefix) => pathname.startsWith(prefix)) ||
        pathname === "/";
      if (isProtected) {
        return NextResponse.redirect(new URL("/onboarding", request.url));
      }
    }

    return NextResponse.next();
  } catch (err: any) {
    // Token verification failed; try refresh if we have a refresh token
    if (refreshToken) {
      try {
        const newTokenData = await EnhancedAuthService.refreshAccessToken(
          refreshToken
        );
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
        // refresh failed, fall through to redirect/401 below
      }
    }

    if (isApiRoute) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const response = NextResponse.redirect(new URL("/auth/login", request.url));
    response.cookies.delete("accessToken");
    response.cookies.delete("refreshToken");
    return response;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
