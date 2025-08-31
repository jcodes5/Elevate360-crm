import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";

// In-memory token store - in production, use Redis or similar
const csrfTokens = new Map<string, { token: string; expires: number }>();

// Clean up expired tokens periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of csrfTokens.entries()) {
    if (now >= data.expires) {
      csrfTokens.delete(key);
    }
  }
}, 60000); // Clean up every minute

export function generateCsrfToken(): string {
  return randomBytes(32).toString("hex");
}

export function storeCsrfToken(sessionId: string, token: string) {
  csrfTokens.set(sessionId, {
    token,
    expires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  });
}

export function validateCsrfToken(sessionId: string, token: string): boolean {
  const storedData = csrfTokens.get(sessionId);
  if (!storedData) return false;

  const isValid = storedData.token === token;
  if (isValid) {
    // Delete token after successful validation (one-time use)
    csrfTokens.delete(sessionId);
  }
  return isValid;
}

export async function csrfProtection(request: NextRequest) {
  // Skip CSRF check for GET requests
  if (request.method === "GET") return null;

  const csrfToken = request.headers.get("x-csrf-token");
  const sessionId = request.cookies.get("sessionId")?.value;

  if (!csrfToken || !sessionId) {
    return NextResponse.json(
      { success: false, message: "CSRF token missing" },
      { status: 403 }
    );
  }

  if (!validateCsrfToken(sessionId, csrfToken)) {
    return NextResponse.json(
      { success: false, message: "Invalid CSRF token" },
      { status: 403 }
    );
  }

  return null; // Continue to next middleware/handler
}
