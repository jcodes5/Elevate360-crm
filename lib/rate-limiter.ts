import { NextRequest, NextResponse } from "next/server";
import { AUTH_CONFIG } from "./auth-config";

// Simple in-memory store for rate limiting
const ipAttempts = new Map<string, { count: number; resetTime: number }>();

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of ipAttempts.entries()) {
    if (now >= data.resetTime) {
      ipAttempts.delete(ip);
    }
  }
}, 60000); // Clean up every minute

export async function rateLimiter(request: NextRequest) {
  const ip = request.ip || request.headers.get("x-forwarded-for") || "unknown";
  const now = Date.now();
  const windowMs = AUTH_CONFIG.security.rateLimit.windowMs;
  const maxAttempts = AUTH_CONFIG.security.rateLimit.maxAttempts;

  // Get or create attempt counter for this IP
  const attempts = ipAttempts.get(ip) || {
    count: 0,
    resetTime: now + windowMs,
  };

  // Reset if window has expired
  if (now >= attempts.resetTime) {
    attempts.count = 1;
    attempts.resetTime = now + windowMs;
  } else {
    attempts.count++;
  }

  ipAttempts.set(ip, attempts);

  // Check if rate limit exceeded
  if (attempts.count > maxAttempts) {
    const retryAfter = Math.ceil((attempts.resetTime - now) / 1000);
    return NextResponse.json(
      { success: false, message: "Too many requests" },
      {
        status: 429,
        headers: {
          "Retry-After": retryAfter.toString(),
          "X-RateLimit-Limit": maxAttempts.toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": Math.ceil(attempts.resetTime / 1000).toString(),
        },
      }
    );
  }

  return null; // Continue to next middleware/handler
}
