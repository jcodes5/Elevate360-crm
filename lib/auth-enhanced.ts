import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import type { User } from "@/types"

// JWT Configuration
const JWT_ACCESS_SECRET = process.env.JWT_SECRET || "your-access-secret-key"
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key"
const JWT_ACCESS_EXPIRES_IN = "15m" // 15 minutes
const JWT_REFRESH_EXPIRES_IN = "7d" // 7 days

// Token payload interface
export interface TokenPayload {
  userId: string
  email: string
  role: string
  organizationId: string
  iat?: number
  exp?: number
}

// Auth result interfaces
export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface AuthResult {
  user: Omit<User, 'password'>
  tokens: AuthTokens
}

export class EnhancedAuthService {
  // Password hashing with strong salt rounds
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12
    return bcrypt.hash(password, saltRounds)
  }

  static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword)
  }

  // Generate both access and refresh tokens
  static generateTokens(user: User): AuthTokens {
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    }

    const accessToken = jwt.sign(payload, JWT_ACCESS_SECRET, { 
      expiresIn: JWT_ACCESS_EXPIRES_IN,
      issuer: 'elevate360-crm',
      audience: 'elevate360-users'
    })
    
    const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { 
      expiresIn: JWT_REFRESH_EXPIRES_IN,
      issuer: 'elevate360-crm',
      audience: 'elevate360-users'
    })

    return {
      accessToken,
      refreshToken,
      expiresIn: 15 * 60 // 15 minutes in seconds
    }
  }

  // Verify access token
  static verifyAccessToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, JWT_ACCESS_SECRET, {
        issuer: 'elevate360-crm',
        audience: 'elevate360-users'
      }) as TokenPayload
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error("Access token expired")
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error("Invalid access token")
      }
      throw new Error("Token verification failed")
    }
  }

  // Verify refresh token
  static verifyRefreshToken(refreshToken: string): TokenPayload {
    try {
      return jwt.verify(refreshToken, JWT_REFRESH_SECRET, {
        issuer: 'elevate360-crm',
        audience: 'elevate360-users'
      }) as TokenPayload
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error("Refresh token expired")
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error("Invalid refresh token")
      }
      throw new Error("Refresh token verification failed")
    }
  }

  // Refresh access token using refresh token
  static async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; expiresIn: number }> {
    const payload = this.verifyRefreshToken(refreshToken)
    
    // Generate new access token with fresh payload
    const newPayload: TokenPayload = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      organizationId: payload.organizationId,
    }
    
    const accessToken = jwt.sign(newPayload, JWT_ACCESS_SECRET, { 
      expiresIn: JWT_ACCESS_EXPIRES_IN,
      issuer: 'elevate360-crm',
      audience: 'elevate360-users'
    })

    return {
      accessToken,
      expiresIn: 15 * 60 // 15 minutes in seconds
    }
  }

  // Set secure HTTP-only cookies
  static setAuthCookies(tokens: AuthTokens) {
    const cookieStore = cookies()
    
    // Set access token cookie (shorter expiry)
    cookieStore.set('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60, // 15 minutes
      path: '/'
    })

    // Set refresh token cookie (longer expiry)
    cookieStore.set('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    })
  }

  // Clear auth cookies
  static clearAuthCookies() {
    const cookieStore = cookies()
    
    cookieStore.set('accessToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/'
    })

    cookieStore.set('refreshToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/'
    })
  }

  // Get token from request headers or cookies
  static getTokenFromRequest(request: Request): string | null {
    // Try Authorization header first
    const authHeader = request.headers.get('authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7)
    }

    // Try cookies as fallback
    const cookieHeader = request.headers.get('cookie')
    if (cookieHeader) {
      const cookies = Object.fromEntries(
        cookieHeader.split('; ').map(c => {
          const [key, value] = c.split('=')
          return [key, value]
        })
      )
      return cookies.accessToken || null
    }

    return null
  }

  // Validate password strength
  static validatePasswordStrength(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = []
    
    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long")
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter")
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter")
    }
    
    if (!/\d/.test(password)) {
      errors.push("Password must contain at least one number")
    }
    
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push("Password must contain at least one special character")
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }
}

// Role hierarchy for permission checking
export const ROLE_HIERARCHY = {
  admin: 3,
  manager: 2,
  agent: 1,
} as const

export type RoleName = keyof typeof ROLE_HIERARCHY

// Permission checker
export function hasPermission(userRole: string, requiredRole: string): boolean {
  const userLevel = ROLE_HIERARCHY[userRole as RoleName] || 0
  const requiredLevel = ROLE_HIERARCHY[requiredRole as RoleName] || 0
  return userLevel >= requiredLevel
}

// Check if user can access resource
export function canAccessResource(userRole: string, resource: string, action: string): boolean {
  // Define resource permissions
  const permissions: Record<string, Record<string, string[]>> = {
    users: {
      create: ['admin'],
      read: ['admin', 'manager'],
      update: ['admin'],
      delete: ['admin']
    },
    contacts: {
      create: ['admin', 'manager', 'agent'],
      read: ['admin', 'manager', 'agent'],
      update: ['admin', 'manager', 'agent'],
      delete: ['admin', 'manager']
    },
    deals: {
      create: ['admin', 'manager', 'agent'],
      read: ['admin', 'manager', 'agent'],
      update: ['admin', 'manager', 'agent'],
      delete: ['admin', 'manager']
    },
    campaigns: {
      create: ['admin', 'manager'],
      read: ['admin', 'manager', 'agent'],
      update: ['admin', 'manager'],
      delete: ['admin', 'manager']
    },
    analytics: {
      read: ['admin', 'manager']
    },
    settings: {
      read: ['admin'],
      update: ['admin']
    }
  }

  const resourcePermissions = permissions[resource]
  if (!resourcePermissions) {
    return false // Resource doesn't exist
  }

  const allowedRoles = resourcePermissions[action]
  if (!allowedRoles) {
    return false // Action not defined for resource
  }

  return allowedRoles.includes(userRole)
}

// Rate limiting for authentication attempts
class AuthRateLimiter {
  private attempts: Map<string, { count: number; lastAttempt: number }> = new Map()
  private readonly maxAttempts = 5
  private readonly windowMs = 15 * 60 * 1000 // 15 minutes

  checkRateLimit(identifier: string): { allowed: boolean; retryAfter?: number } {
    const now = Date.now()
    const attemptData = this.attempts.get(identifier)

    if (!attemptData) {
      this.attempts.set(identifier, { count: 1, lastAttempt: now })
      return { allowed: true }
    }

    // Reset if window has passed
    if (now - attemptData.lastAttempt > this.windowMs) {
      this.attempts.set(identifier, { count: 1, lastAttempt: now })
      return { allowed: true }
    }

    // Check if max attempts exceeded
    if (attemptData.count >= this.maxAttempts) {
      const retryAfter = Math.ceil((this.windowMs - (now - attemptData.lastAttempt)) / 1000)
      return { allowed: false, retryAfter }
    }

    // Increment attempts
    attemptData.count++
    attemptData.lastAttempt = now
    return { allowed: true }
  }

  resetAttempts(identifier: string) {
    this.attempts.delete(identifier)
  }
}

export const authRateLimiter = new AuthRateLimiter()
