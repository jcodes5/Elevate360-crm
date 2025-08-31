import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import type { User } from "@/types";
import { NextRequest } from "next/server";

// JWT Configuration - Use consistent secrets
const JWT_ACCESS_SECRET = process.env.JWT_SECRET || "your-access-secret-key";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key";
const JWT_ACCESS_EXPIRES_IN = "15m"; // 15 minutes
const JWT_REFRESH_EXPIRES_IN = "7d"; // 7 days

// Token payload interface
export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  organizationId: string;
  isOnboardingCompleted?: boolean;
  iat?: number;
  exp?: number;
}

// Auth result interfaces
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResult {
  user: Omit<User, "password">;
  tokens: AuthTokens;
}

export class UnifiedAuthService {
  // Password hashing with strong salt rounds
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  static async comparePassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      console.error("Password comparison error:", error);
      return false;
    }
  }

  // Generate both access and refresh tokens with consistent secrets
  static generateTokens(user: User): { token: string; refreshToken: string } {
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
      isOnboardingCompleted: user.isOnboardingCompleted ?? false,
    };

    const token = jwt.sign(payload, JWT_ACCESS_SECRET, {
      expiresIn: JWT_ACCESS_EXPIRES_IN,
      issuer: "elevate360-crm",
      audience: "elevate360-users",
    });

    const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, {
      expiresIn: JWT_REFRESH_EXPIRES_IN,
      issuer: "elevate360-crm",
      audience: "elevate360-users",
    });

    return { token, refreshToken };
  }

  // Enhanced token generation with full AuthTokens interface
  static generateAuthTokens(user: User): AuthTokens {
    const { token, refreshToken } = this.generateTokens(user);
    return {
      accessToken: token,
      refreshToken,
      expiresIn: 15 * 60, // 15 minutes in seconds
    };
  }

  // Verify access token
  static verifyAccessToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, JWT_ACCESS_SECRET, {
        issuer: "elevate360-crm",
        audience: "elevate360-users",
      }) as TokenPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error("Access token expired");
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error("Invalid access token");
      }
      throw new Error("Token verification failed");
    }
  }

  // Legacy verifyToken method for backward compatibility
  static verifyToken(token: string): TokenPayload {
    return this.verifyAccessToken(token);
  }

  // Verify refresh token
  static verifyRefreshToken(refreshToken: string): TokenPayload {
    try {
      return jwt.verify(refreshToken, JWT_REFRESH_SECRET, {
        issuer: "elevate360-crm",
        audience: "elevate360-users",
      }) as TokenPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error("Refresh token expired");
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error("Invalid refresh token");
      }
      throw new Error("Refresh token verification failed");
    }
  }

  // Refresh access token using refresh token
  static async refreshAccessToken(
    refreshToken: string
  ): Promise<{ accessToken: string; expiresIn: number }> {
    const payload = this.verifyRefreshToken(refreshToken);

    // Generate new access token with fresh payload
    const newPayload: TokenPayload = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      organizationId: payload.organizationId,
      isOnboardingCompleted: payload.isOnboardingCompleted ?? false,
    };

    const accessToken = jwt.sign(newPayload, JWT_ACCESS_SECRET, {
      expiresIn: JWT_ACCESS_EXPIRES_IN,
      issuer: "elevate360-crm",
      audience: "elevate360-users",
    });

    return {
      accessToken,
      expiresIn: 15 * 60, // 15 minutes in seconds
    };
  }

  // Legacy method for backward compatibility
  static async refreshAccessTokenLegacy(refreshToken: string): Promise<string> {
    const result = await this.refreshAccessToken(refreshToken);
    return result.accessToken;
  }

  // Set secure HTTP-only cookies
  static setAuthCookies(tokens: AuthTokens | { token: string; refreshToken: string }) {
    const cookieStore = cookies();
    
    const accessToken = 'accessToken' in tokens ? tokens.accessToken : tokens.token;
    const refreshToken = tokens.refreshToken;

    // Set access token cookie (shorter expiry)
    cookieStore.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60, // 15 minutes
      path: "/",
    });

    // Set refresh token cookie (longer expiry)
    cookieStore.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });
  }

  // Clear auth cookies
  static clearAuthCookies() {
    const cookieStore = cookies();

    cookieStore.set("accessToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0,
      path: "/",
    });

    cookieStore.set("refreshToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0,
      path: "/",
    });
  }

  // Get token from request headers or cookies
  static getTokenFromRequest(request: Request): string | null {
    // Try Authorization header first
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      return authHeader.substring(7);
    }

    // Try cookies as fallback
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

  // Get tokens from cookies in Next.js middleware
  static getTokensFromCookies(request: NextRequest): {
    accessToken: string | null;
    refreshToken: string | null;
  } {
    const accessToken = request.cookies.get("accessToken")?.value || null;
    const refreshToken = request.cookies.get("refreshToken")?.value || null;
    return { accessToken, refreshToken };
  }

  // Validate password strength
  static validatePasswordStrength(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long");
    }

    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }

    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }

    if (!/\d/.test(password)) {
      errors.push("Password must contain at least one number");
    }

