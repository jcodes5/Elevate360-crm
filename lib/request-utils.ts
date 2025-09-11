import { NextRequest } from "next/server";

/**
 * Extract client IP address from various headers in a Next.js request
 * Handles common proxy headers and falls back to "unknown" if no IP found
 */
export function getClientIp(request: NextRequest | Request): string {
  // Check common proxy headers in order of preference
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  const cfIP = request.headers.get("cf-connecting-ip");
  
  // x-forwarded-for can contain multiple IPs (client, proxy1, proxy2...)
  // Take the first one which should be the original client
  if (forwarded) {
    const firstIP = forwarded.split(",")[0].trim();
    if (firstIP) return firstIP;
  }
  
  // Direct real IP header
  if (realIP) return realIP;
  
  // Cloudflare connecting IP
  if (cfIP) return cfIP;
  
  // Fallback to unknown if no IP can be determined
  return "unknown";
}

/**
 * Get user agent string from request headers
 */
export function getUserAgent(request: NextRequest | Request): string {
  return request.headers.get("user-agent") || "unknown";
}

/**
 * Extract client information for logging and security
 */
export function getClientInfo(request: NextRequest | Request) {
  return {
    ipAddress: getClientIp(request),
    userAgent: getUserAgent(request),
  };
}
