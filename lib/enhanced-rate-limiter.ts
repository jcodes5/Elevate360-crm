import { NextRequest, NextResponse } from "next/server";

interface RateLimitInfo {
  count: number;
  resetTime: number;
  firstAttempt: number;
}

interface RateLimitConfig {
  windowMs: number;
  maxAttempts: number;
  blockDurationMs: number;
  skipSuccessfulRequests?: boolean;
}

// In-memory store for rate limiting (use Redis in production)
const rateLimitStore = new Map<string, RateLimitInfo>();
const blockedIPs = new Map<string, number>(); // IP -> unblock time

// Clean up expired entries
setInterval(() => {
  const now = Date.now();
  
  // Clean up rate limit entries
  for (const [key, data] of rateLimitStore.entries()) {
    if (now >= data.resetTime) {
      rateLimitStore.delete(key);
    }
  }
  
  // Clean up blocked IPs
  for (const [ip, unblockTime] of blockedIPs.entries()) {
    if (now >= unblockTime) {
      blockedIPs.delete(ip);
    }
  }
}, 60000); // Clean every minute

export class EnhancedRateLimiter {
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  private getClientIP(request: NextRequest): string {
    // Try to get real IP from headers
    const forwarded = request.headers.get("x-forwarded-for");
    const realIP = request.headers.get("x-real-ip");
    const cloudflareIP = request.headers.get("cf-connecting-ip");
    
    return (
      cloudflareIP ||
      realIP ||
      (forwarded ? forwarded.split(",")[0].trim() : null) ||
      request.ip ||
      "unknown"
    );
  }

  private getKey(request: NextRequest, keyGenerator?: (req: NextRequest) => string): string {
    if (keyGenerator) {
      return keyGenerator(request);
    }
    return this.getClientIP(request);
  }

  public async check(
    request: NextRequest,
    keyGenerator?: (req: NextRequest) => string
  ): Promise<NextResponse | null> {
    const key = this.getKey(request, keyGenerator);
    const now = Date.now();

    // Check if IP is currently blocked
    const blockUntil = blockedIPs.get(key);
    if (blockUntil && now < blockUntil) {
      const retryAfter = Math.ceil((blockUntil - now) / 1000);
      return NextResponse.json(
        {
          success: false,
          message: "IP temporarily blocked due to too many requests",
          retryAfter,
        },
        {
          status: 429,
          headers: {
            "Retry-After": retryAfter.toString(),
            "X-RateLimit-Limit": this.config.maxAttempts.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": Math.ceil(blockUntil / 1000).toString(),
            "X-RateLimit-Blocked-Until": new Date(blockUntil).toISOString(),
          },
        }
      );
    }

    // Get or create rate limit info
    let rateLimitInfo = rateLimitStore.get(key);
    
    if (!rateLimitInfo || now >= rateLimitInfo.resetTime) {
      // Create new or reset expired entry
      rateLimitInfo = {
        count: 1,
        resetTime: now + this.config.windowMs,
        firstAttempt: now,
      };
    } else {
      // Increment existing entry
      rateLimitInfo.count++;
    }

    rateLimitStore.set(key, rateLimitInfo);

    const remaining = Math.max(0, this.config.maxAttempts - rateLimitInfo.count);
    const resetTime = Math.ceil(rateLimitInfo.resetTime / 1000);

    // Check if limit exceeded
    if (rateLimitInfo.count > this.config.maxAttempts) {
      // Block the IP for the specified duration
      const blockUntil = now + this.config.blockDurationMs;
      blockedIPs.set(key, blockUntil);
      
      // Log the incident (in production, send to monitoring system)
      console.warn(`Rate limit exceeded for ${key}. IP blocked until ${new Date(blockUntil).toISOString()}`);

      const retryAfter = Math.ceil(this.config.blockDurationMs / 1000);
      return NextResponse.json(
        {
          success: false,
          message: "Rate limit exceeded. IP temporarily blocked.",
          retryAfter,
          rateLimitExceeded: true,
        },
        {
          status: 429,
          headers: {
            "Retry-After": retryAfter.toString(),
            "X-RateLimit-Limit": this.config.maxAttempts.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": resetTime.toString(),
            "X-RateLimit-Window": Math.ceil(this.config.windowMs / 1000).toString(),
          },
        }
      );
    }

    // Add rate limit headers to successful requests
    return null; // Continue processing
  }

  public reset(request: NextRequest, keyGenerator?: (req: NextRequest) => string): void {
    const key = this.getKey(request, keyGenerator);
    rateLimitStore.delete(key);
  }

  public addHeaders(response: NextResponse, request: NextRequest, keyGenerator?: (req: NextRequest) => string): void {
    const key = this.getKey(request, keyGenerator);
    const rateLimitInfo = rateLimitStore.get(key);
    
    if (rateLimitInfo) {
      const remaining = Math.max(0, this.config.maxAttempts - rateLimitInfo.count);
      const resetTime = Math.ceil(rateLimitInfo.resetTime / 1000);
      
      response.headers.set("X-RateLimit-Limit", this.config.maxAttempts.toString());
      response.headers.set("X-RateLimit-Remaining", remaining.toString());
      response.headers.set("X-RateLimit-Reset", resetTime.toString());
      response.headers.set("X-RateLimit-Window", Math.ceil(this.config.windowMs / 1000).toString());
    }
  }
}

// Pre-configured rate limiters for different endpoints
export const authRateLimiter = new EnhancedRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxAttempts: 5, // 5 attempts per window
  blockDurationMs: 30 * 60 * 1000, // Block for 30 minutes
});

export const generalRateLimiter = new EnhancedRateLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  maxAttempts: 60, // 60 requests per minute
  blockDurationMs: 5 * 60 * 1000, // Block for 5 minutes
});

export const apiRateLimiter = new EnhancedRateLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  maxAttempts: 100, // 100 API calls per minute
  blockDurationMs: 2 * 60 * 1000, // Block for 2 minutes
});
