import jwt from "jsonwebtoken";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import type { User } from "@/types";
import { NextRequest } from "next/server";
import { getClientIp } from "@/lib/request-utils";

// Production JWT Configuration
const JWT_ACCESS_SECRET =
  process.env.JWT_SECRET || "elevate360-production-access-secret-key-2024";
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET ||
  "elevate360-production-refresh-secret-key-2024";
const JWT_ACCESS_EXPIRES_IN = "15m";
const JWT_REFRESH_EXPIRES_IN = "7d";

// Token blacklist for secure logout (in production, use Redis)
class TokenBlacklist {
  private blacklist = new Set<string>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired tokens every hour
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60 * 60 * 1000);
  }

  private cleanup() {
    // In production, implement proper cleanup logic with Redis TTL
    // For now, we'll clear the set periodically
    if (this.blacklist.size > 10000) {
      this.blacklist.clear();
    }
  }

  add(token: string) {
    this.blacklist.add(token);
  }

  has(token: string): boolean {
    return this.blacklist.has(token);
  }

  destroy() {
    clearInterval(this.cleanupInterval);
  }
}

export const tokenBlacklist = new TokenBlacklist();

// Session storage for real-time management
class SessionManager {
  private activeSessions = new Map<
    string,
    {
      userId: string;
      deviceId: string;
      lastActivity: number;
      ipAddress: string;
      userAgent: string;
    }
  >();

  addSession(sessionId: string, session: any) {
    this.activeSessions.set(sessionId, {
      ...session,
      lastActivity: Date.now(),
    });
  }

  updateActivity(sessionId: string) {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.lastActivity = Date.now();
    }
  }

  removeSession(sessionId: string) {
    this.activeSessions.delete(sessionId);
  }

  getUserSessions(userId: string) {
    return Array.from(this.activeSessions.entries())
      .filter(([_, session]) => session.userId === userId)
      .map(([sessionId, session]) => ({ sessionId, ...session }));
  }

  removeAllUserSessions(userId: string) {
    for (const [sessionId, session] of this.activeSessions.entries()) {
      if (session.userId === userId) {
        this.activeSessions.delete(sessionId);
      }
    }
  }

  getActiveSessionsCount(): number {
    return this.activeSessions.size;
  }

  cleanup() {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    for (const [sessionId, session] of this.activeSessions.entries()) {
      if (now - session.lastActivity > maxAge) {
        this.activeSessions.delete(sessionId);
      }
    }
  }
}

export const sessionManager = new SessionManager();

// Clean up sessions every hour
setInterval(() => {
  sessionManager.cleanup();
}, 60 * 60 * 1000);

// Enhanced token payload interface
export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  organizationId: string;
  sessionId: string;
  deviceId?: string;
  isOnboardingCompleted?: boolean;
  iat?: number;
  exp?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  sessionId: string;
}

export interface AuthResult {
  user: Omit<User, "password">;
  tokens: AuthTokens;
  sessionInfo: {
    deviceId: string;
    ipAddress: string;
    userAgent: string;
  };
}

export class ProductionAuthService {
  // Enhanced password hashing
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 14; // Increased for production
    return bcrypt.hash(password, saltRounds);
  }

  static async comparePassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  // Generate session ID
  static generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Generate device ID
  static generateDeviceId(userAgent: string, ipAddress: string): string {
    const input = `${userAgent}_${ipAddress}_${Date.now()}`;
    return Buffer.from(input).toString("base64").substr(0, 16);
  }

  // Helper function to create a JWT secret key
  private static createSecretKey(secret: string): Uint8Array {
    return new TextEncoder().encode(secret);
  }

  // Generate tokens with session tracking
  static async generateTokens(
    user: User,
    sessionInfo: {
      ipAddress: string;
      userAgent: string;
    }
  ): Promise<AuthTokens> {
    const sessionId = this.generateSessionId();
    const deviceId = this.generateDeviceId(
      sessionInfo.userAgent,
      sessionInfo.ipAddress
    );

    const payload: Omit<TokenPayload, "iat" | "exp"> = {
      userId: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
      sessionId,
      deviceId,
      isOnboardingCompleted: user.isOnboardingCompleted ?? false,
    };

    // Create access token
    const accessToken = await new SignJWT(payload as any)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setIssuer('elevate360-crm')
      .setAudience('elevate360-users')
      .setExpirationTime(JWT_ACCESS_EXPIRES_IN)
      .setJti(sessionId)
      .sign(this.createSecretKey(JWT_ACCESS_SECRET));

    // Create refresh token
    const refreshToken = await new SignJWT(payload as any)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setIssuer('elevate360-crm')
      .setAudience('elevate360-users')
      .setExpirationTime(JWT_REFRESH_EXPIRES_IN)
      .setJti(sessionId)
      .sign(this.createSecretKey(JWT_REFRESH_SECRET));

    // Register session
    sessionManager.addSession(sessionId, {
      userId: user.id,
      deviceId,
      lastActivity: Date.now(),
      ipAddress: sessionInfo.ipAddress,
      userAgent: sessionInfo.userAgent,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 15 * 60,
      sessionId,
    };
  }

  // Verify access token with blacklist check
  static async verifyAccessToken(token: string): Promise<TokenPayload> {
    // Check if token is blacklisted
    if (tokenBlacklist.has(token)) {
      console.log("❌ Access token is blacklisted");
      throw new Error("Token has been revoked");
    }

    try {
      console.log("🔑 Verifying access token with JWT_ACCESS_SECRET");
      console.log("🔑 Access token length:", token.length);
      console.log("🔑 JWT_ACCESS_SECRET starts with:", JWT_ACCESS_SECRET.substring(0, 10) + "...");

      const { payload } = await jwtVerify(token, this.createSecretKey(JWT_ACCESS_SECRET), {
        issuer: "elevate360-crm",
        audience: "elevate360-users",
      });

      const typedPayload = payload as unknown as TokenPayload;
      console.log("✅ Access token verified successfully for user:", typedPayload.userId);

      // Update session activity if session exists
      if (typedPayload.sessionId) {
        sessionManager.updateActivity(typedPayload.sessionId);
      }

      return typedPayload;
    } catch (error: any) {
      console.log("❌ Access token verification failed");
      console.log("❌ Error type:", error.constructor.name);
      console.log("❌ Error message:", error.message);

      if (error.name === 'TokenExpiredError') {
        console.log("❌ Token expired");
        throw new Error("Access token expired");
      } else if (error.name === 'JsonWebTokenError') {
        console.log("❌ JWT Error name:", error.name);
        console.log("❌ JWT Error details:", error);
        throw new Error("Invalid access token");
      }
      console.log("❌ Unexpected error:", error);
      throw new Error("Token verification failed");
    }
  }

  // Verify refresh token
  static async verifyRefreshToken(refreshToken: string): Promise<TokenPayload> {
    if (tokenBlacklist.has(refreshToken)) {
      console.log("❌ Refresh token is blacklisted");
      throw new Error("Refresh token has been revoked");
    }

    try {
      console.log("🔑 Verifying refresh token with JWT_REFRESH_SECRET");
      console.log("🔑 Refresh token length:", refreshToken.length);
      console.log(
        "🔑 JWT_REFRESH_SECRET starts with:",
        JWT_REFRESH_SECRET.substring(0, 10) + "..."
      );

      const { payload } = await jwtVerify(refreshToken, this.createSecretKey(JWT_REFRESH_SECRET), {
        issuer: "elevate360-crm",
        audience: "elevate360-users",
      });

      const typedPayload = payload as unknown as TokenPayload;
      console.log(
        "✅ Refresh token verified successfully for user:",
        typedPayload.userId
      );
      return typedPayload;
    } catch (error: any) {
      console.log("❌ Refresh token verification failed");
      console.log("❌ Error type:", error.constructor.name);
      console.log("❌ Error message:", error.message);

      if (error.name === 'TokenExpiredError') {
        console.log("❌ Token expired");
        throw new Error("Refresh token expired");
      } else if (error.name === 'JsonWebTokenError') {
        console.log("❌ JWT Error name:", error.name);
        console.log("❌ JWT Error details:", error);
        throw new Error("Invalid refresh token");
      }
      console.log("❌ Unexpected error:", error);
      throw new Error("Refresh token verification failed");
    }
  }

  // Refresh access token with session validation
  static async refreshAccessToken(refreshToken: string): Promise<{
    accessToken: string;
    expiresIn: number;
    sessionId: string;
  }> {
    const payload = await this.verifyRefreshToken(refreshToken);

    // Validate session still exists
    const sessions = sessionManager.getUserSessions(payload.userId);
    const activeSession = sessions.find(
      (s) => s.sessionId === payload.sessionId
    );

    if (!activeSession) {
      throw new Error("Session not found or expired");
    }

    // Generate new access token with same session
    const newPayload: Omit<TokenPayload, "iat" | "exp"> = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      organizationId: payload.organizationId,
      sessionId: payload.sessionId,
      deviceId: payload.deviceId,
      isOnboardingCompleted: payload.isOnboardingCompleted ?? false,
    };

    const accessToken = await new SignJWT(newPayload as any)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setIssuer('elevate360-crm')
      .setAudience('elevate360-users')
      .setExpirationTime(JWT_ACCESS_EXPIRES_IN)
      .setJti(payload.sessionId!)
      .sign(this.createSecretKey(JWT_ACCESS_SECRET));

    return {
      accessToken,
      expiresIn: 15 * 60,
      sessionId: payload.sessionId!,
    };
  }

  // Secure logout with token blacklisting
  static logout(token: string, refreshToken?: string): void {
    try {
      const payload = jwt.decode(token) as TokenPayload;

      // Add tokens to blacklist
      tokenBlacklist.add(token);
      if (refreshToken) {
        tokenBlacklist.add(refreshToken);
      }

      // Remove session
      if (payload?.sessionId) {
        sessionManager.removeSession(payload.sessionId);
      }
    } catch (error) {
      console.warn("Error during logout cleanup:", error);
    }
  }

  // Logout all sessions for a user
  static logoutAllSessions(userId: string): void {
    const sessions = sessionManager.getUserSessions(userId);

    // Remove all user sessions
    sessionManager.removeAllUserSessions(userId);

    // In production, you would also blacklist all active tokens for this user
    console.log(`Logged out ${sessions.length} sessions for user ${userId}`);
  }

  // Set secure cookies with enhanced security
  static setAuthCookies(tokens: AuthTokens, remember: boolean = false) {
    const cookieStore = cookies();
    const isProduction = process.env.NODE_ENV === "production";

    // Access token cookie
    cookieStore.set("accessToken", tokens.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
      maxAge: 15 * 60, // 15 minutes
      path: "/",
    });

    // Refresh token cookie (optional for remember me)
    if (remember) {
      cookieStore.set("refreshToken", tokens.refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: "/",
      });
    }

    // Session ID cookie for tracking
    cookieStore.set("sessionId", tokens.sessionId, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
      maxAge: remember ? 7 * 24 * 60 * 60 : 24 * 60 * 60,
      path: "/",
    });
  }

  // Clear auth cookies
  static clearAuthCookies() {
    const cookieStore = cookies();
    const isProduction = process.env.NODE_ENV === "production";

    ["accessToken", "refreshToken", "sessionId"].forEach((name) => {
      cookieStore.set(name, "", {
        httpOnly: true,
        secure: isProduction,
        sameSite: "strict",
        maxAge: 0,
        path: "/",
      });
    });
  }

  // Get token from request
  static getTokenFromRequest(request: Request): string | null {
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      return authHeader.substring(7);
    }

    const cookieHeader = request.headers.get("cookie");
    if (cookieHeader) {
      const cookies = Object.fromEntries(
        cookieHeader.split("; ").map((c) => {
          const [key, value] = c.split("=");
          return [key, value];
        })
      );
      return cookies.accessToken || null;
    }

    return null;
  }

  // Get tokens from Next.js request
  static getTokensFromCookies(request: NextRequest): {
    accessToken: string | null;
    refreshToken: string | null;
    sessionId: string | null;
  } {
    return {
      accessToken: request.cookies.get("accessToken")?.value || null,
      refreshToken: request.cookies.get("refreshToken")?.value || null,
      sessionId: request.cookies.get("sessionId")?.value || null,
    };
  }

  // Enhanced password validation
  static validatePasswordStrength(password: string): {
    isValid: boolean;
    errors: string[];
    score: number;
  } {
    const errors: string[] = [];
    let score = 0;

    if (!password || typeof password !== "string") {
      return { isValid: false, errors: ["Password is required"], score: 0 };
    }

    // Length checks
    if (password.length >= 8) score += 20;
    else errors.push("Password must be at least 8 characters long");

    if (password.length >= 12) score += 10;

    // Character type checks
    if (/[A-Z]/.test(password)) score += 15;
    else errors.push("Password must contain at least one uppercase letter");

    if (/[a-z]/.test(password)) score += 15;
    else errors.push("Password must contain at least one lowercase letter");

    if (/[0-9]/.test(password)) score += 15;
    else errors.push("Password must contain at least one number");

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 15;
    else errors.push("Password must contain at least one special character");

    // Additional strength checks
    if (!/(.)\1{2,}/.test(password)) score += 10; // No repeated characters
    if (/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/.test(password)) score += 10;

    return {
      isValid: errors.length === 0 && score >= 60,
      errors,
      score: Math.min(100, score),
    };
  }

  // Get user sessions
  static getUserSessions(userId: string) {
    return sessionManager.getUserSessions(userId);
  }

  // Get session analytics
  static getSessionAnalytics() {
    return {
      activeSessions: sessionManager.getActiveSessionsCount(),
      timestamp: new Date().toISOString(),
    };
  }
}

// Rate limiting for production
export class ProductionRateLimiter {
  private attempts = new Map<
    string,
    { count: number; lastAttempt: number; blockedUntil?: number }
  >();
  private readonly maxAttempts = 5;
  private readonly windowMs = 15 * 60 * 1000; // 15 minutes
  private readonly blockDuration = 30 * 60 * 1000; // 30 minutes

  async check(request: NextRequest): Promise<Response | null> {
    const identifier = this.getIdentifier(request);
    const now = Date.now();
    const attemptData = this.attempts.get(identifier);

    if (!attemptData) {
      this.attempts.set(identifier, { count: 1, lastAttempt: now });
      return null;
    }

    // Check if currently blocked
    if (attemptData.blockedUntil && now < attemptData.blockedUntil) {
      const retryAfter = Math.ceil((attemptData.blockedUntil - now) / 1000);
      return new Response(
        JSON.stringify({
          success: false,
          message: "Too many attempts. Account temporarily blocked.",
          retryAfter,
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": retryAfter.toString(),
          },
        }
      );
    }

    // Reset if window has passed
    if (now - attemptData.lastAttempt > this.windowMs) {
      this.attempts.set(identifier, { count: 1, lastAttempt: now });
      return null;
    }

    // Increment attempts
    attemptData.count++;
    attemptData.lastAttempt = now;

    // Block if max attempts exceeded
    if (attemptData.count >= this.maxAttempts) {
      attemptData.blockedUntil = now + this.blockDuration;
      const retryAfter = Math.ceil(this.blockDuration / 1000);

      return new Response(
        JSON.stringify({
          success: false,
          message: "Too many failed attempts. Account blocked for 30 minutes.",
          retryAfter,
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": retryAfter.toString(),
          },
        }
      );
    }

    return null;
  }

  reset(request: NextRequest) {
    const identifier = this.getIdentifier(request);
    this.attempts.delete(identifier);
  }

  addHeaders(response: Response, request: NextRequest) {
    const identifier = this.getIdentifier(request);
    const attemptData = this.attempts.get(identifier);

    if (attemptData) {
      response.headers.set("X-RateLimit-Limit", this.maxAttempts.toString());
      response.headers.set(
        "X-RateLimit-Remaining",
        Math.max(0, this.maxAttempts - attemptData.count).toString()
      );
      response.headers.set(
        "X-RateLimit-Reset",
        new Date(attemptData.lastAttempt + this.windowMs).toISOString()
      );
    }
  }

  private getIdentifier(request: NextRequest): string {
    return getClientIp(request);
  }
}

export const productionRateLimiter = new ProductionRateLimiter();

// RBAC system
export const ROLE_HIERARCHY = {
  admin: 3,
  manager: 2,
  agent: 1,
} as const;

export type RoleName = keyof typeof ROLE_HIERARCHY;

export function hasPermission(userRole: string, requiredRole: string): boolean {
  const userLevel = ROLE_HIERARCHY[userRole as RoleName] || 0;
  const requiredLevel = ROLE_HIERARCHY[requiredRole as RoleName] || 0;
  return userLevel >= requiredLevel;
}

export function canAccessResource(
  userRole: string,
  resource: string,
  action: string
): boolean {
  const permissions: Record<string, Record<string, string[]>> = {
    users: {
      create: ["admin"],
      read: ["admin", "manager"],
      update: ["admin"],
      delete: ["admin"],
    },
    contacts: {
      create: ["admin", "manager", "agent"],
      read: ["admin", "manager", "agent"],
      update: ["admin", "manager", "agent"],
      delete: ["admin", "manager"],
    },
    deals: {
      create: ["admin", "manager", "agent"],
      read: ["admin", "manager", "agent"],
      update: ["admin", "manager", "agent"],
      delete: ["admin", "manager"],
    },
    campaigns: {
      create: ["admin", "manager"],
      read: ["admin", "manager", "agent"],
      update: ["admin", "manager"],
      delete: ["admin", "manager"],
    },
    analytics: { read: ["admin", "manager"] },
    settings: { read: ["admin"], update: ["admin"] },
  };

  const resourcePermissions = permissions[resource];
  if (!resourcePermissions) return false;

  const allowedRoles = resourcePermissions[action];
  if (!allowedRoles) return false;

  return allowedRoles.includes(userRole);
}
