import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";

// In-memory token store for development (use Redis in production)
const csrfTokens = new Map<string, { token: string; expires: number }>();

// Clean up expired tokens
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of csrfTokens.entries()) {
    if (now >= data.expires) {
      csrfTokens.delete(key);
    }
  }
}, 60000);

export async function GET(request: NextRequest) {
  try {
    // Generate session ID if not exists
    const sessionId = request.cookies.get("sessionId")?.value || randomBytes(16).toString("hex");
    
    // Generate CSRF token
    const csrfToken = randomBytes(32).toString("hex");
    
    // Store token with 1 hour expiry
    csrfTokens.set(sessionId, {
      token: csrfToken,
      expires: Date.now() + 60 * 60 * 1000, // 1 hour
    });

    const response = NextResponse.json({
      success: true,
      data: { csrfToken },
    });

    // Set session cookie if new
    if (!request.cookies.get("sessionId")?.value) {
      response.cookies.set("sessionId", sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60, // 24 hours
        path: "/",
      });
    }

    return response;
  } catch (error) {
    console.error("CSRF token generation error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to generate CSRF token" },
      { status: 500 }
    );
  }
}

// Export the token validation function for use in other endpoints
export function validateCsrfToken(sessionId: string, token: string): boolean {
  const storedData = csrfTokens.get(sessionId);
  if (!storedData || Date.now() >= storedData.expires) {
    return false;
  }
  return storedData.token === token;
}
