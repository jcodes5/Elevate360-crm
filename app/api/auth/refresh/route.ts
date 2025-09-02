import { type NextRequest, NextResponse } from "next/server";
import { EnhancedAuthService } from "@/lib/auth-enhanced";

export async function POST(request: NextRequest) {
  try {
    console.log("🔄 Token refresh route called");

    // Get refresh token from body or cookies
    let refreshToken: string | undefined;

    try {
      const body = await request.json();
      refreshToken = body.refreshToken;
      console.log("📦 Refresh token from body:", !!refreshToken);
    } catch {
      // If JSON parsing fails, try to get from cookies
      console.log("📦 No body or invalid JSON, checking cookies...");
    }

    if (!refreshToken) {
      refreshToken = request.cookies.get("refreshToken")?.value;
      console.log("🍪 Refresh token from cookies:", !!refreshToken);
    }

    // Diagnostic: log cookie headers
    const cookieHeader = request.headers.get("cookie");
    console.log("🍪 Cookie header:", cookieHeader ? "present" : "null");
    
    if (cookieHeader) {
      const cookies = cookieHeader.split(';').map(c => c.trim());
      const accessTokenCookie = cookies.find(c => c.startsWith('accessToken='));
      const refreshTokenCookie = cookies.find(c => c.startsWith('refreshToken='));
      
      console.log("🍪 Access token cookie:", accessTokenCookie ? "found" : "missing");
      console.log("🍪 Refresh token cookie:", refreshTokenCookie ? "found" : "missing");
    }

    if (!refreshToken) {
      console.log("❌ No refresh token provided");
      return NextResponse.json(
        { success: false, message: "No refresh token provided" },
        { status: 401 }
      );
    }

    console.log("✅ Refresh token found, attempting refresh...");

    // Refresh the access token
    const result = await EnhancedAuthService.refreshAccessToken(refreshToken);
    console.log("✅ Token refresh successful");

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

    console.log("🍪 Updated access token cookie");

    // Check if we need to redirect (from middleware)
    const redirectUrl = request.nextUrl.searchParams.get("redirect");
    if (redirectUrl) {
      console.log("🔄 Redirecting to:", redirectUrl);
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }

    return response;
  } catch (error) {
    console.error("❌ Token refresh error:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Invalid refresh token";
    console.log("❌ Refresh failed with error:", errorMessage);

    // Clear invalid cookies
    const response = NextResponse.json(
      { success: false, message: errorMessage },
      { status: 401 }
    );

    response.cookies.set("accessToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    response.cookies.set("refreshToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    console.log("🗑️ Cleared invalid cookies");

    return response;
  }
}

export async function GET(request: NextRequest) {
  // Handle GET requests from middleware redirects
  return POST(request);
}
