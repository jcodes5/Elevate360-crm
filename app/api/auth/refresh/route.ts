import { type NextRequest, NextResponse } from "next/server";
import { EnhancedAuthService } from "@/lib/auth-enhanced";

export async function POST(request: NextRequest) {
  try {
    console.log("Token refresh route called");

    // Get refresh token from body or cookies
    let refreshToken: string | undefined;

    try {
      const body = await request.json();
      refreshToken = body.refreshToken;
    } catch {
      // If JSON parsing fails, try to get from cookies
    }

    if (!refreshToken) {
      refreshToken = request.cookies.get("refreshToken")?.value;
    }

    // Diagnostic: log whether the cookie header contains a refresh token
    try {
      const cookieHeader = request.headers.get("cookie");
      console.log("Refresh route - cookie header:", cookieHeader);
      console.log(
        "Refresh route - parsed cookie refreshToken:",
        request.cookies.get("refreshToken")?.value
      );
    } catch (err) {
      console.warn("Could not read cookie header for diagnostics", err);
    }

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, message: "No refresh token provided" },
        { status: 401 }
      );
    }

    // Refresh the access token
    const result = await EnhancedAuthService.refreshAccessToken(refreshToken);

    const responseData = {
      success: true,
      data: {
        accessToken: result.accessToken,
        expiresIn: result.expiresIn,
        tokenType: "Bearer",
      },
      message: "Token refreshed successfully",
    };

    const response = NextResponse.json(responseData);

    // Update access token cookie
    response.cookies.set("accessToken", result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60, // 15 minutes
      path: "/",
    });

    // Check if we need to redirect (from middleware)
    const redirectUrl = request.nextUrl.searchParams.get("redirect");
    if (redirectUrl) {
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }

    return response;
  } catch (error) {
    console.error("Token refresh error:", error);

    // Clear invalid cookies
    const response = NextResponse.json(
      { success: false, message: "Invalid refresh token" },
      { status: 401 }
    );

    response.cookies.delete("accessToken");
    response.cookies.delete("refreshToken");

    return response;
  }
}

export async function GET(request: NextRequest) {
  // Handle GET requests from middleware redirects
  return POST(request);
}
