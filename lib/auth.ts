import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import type { User } from "@/types"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "your-refresh-secret"

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12)
  }

  static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword)
  }

  static generateTokens(user: User): { token: string; refreshToken: string } {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    }

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "15m" })
    const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: "7d" })

    return { token, refreshToken }
  }

  static verifyToken(token: string): any {
    try {
      return jwt.verify(token, JWT_SECRET)
    } catch (error) {
      throw new Error("Invalid token")
    }
  }

  static verifyRefreshToken(refreshToken: string): any {
    try {
      return jwt.verify(refreshToken, JWT_REFRESH_SECRET)
    } catch (error) {
      throw new Error("Invalid refresh token")
    }
  }

  static async refreshAccessToken(refreshToken: string): Promise<string> {
    const payload = this.verifyRefreshToken(refreshToken)
    const newToken = jwt.sign(
      {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
        organizationId: payload.organizationId,
      },
      JWT_SECRET,
      { expiresIn: "15m" },
    )
    return newToken
  }
}

export function requireAuth(requiredRole?: string) {
  return (req: any, res: any, next: any) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "")

      if (!token) {
        return res.status(401).json({ success: false, message: "No token provided" })
      }

      const decoded = AuthService.verifyToken(token)
      req.user = decoded

      if (requiredRole && !hasPermission(decoded.role, requiredRole)) {
        return res.status(403).json({ success: false, message: "Insufficient permissions" })
      }

      next()
    } catch (error) {
      return res.status(401).json({ success: false, message: "Invalid token" })
    }
  }
}

export function hasPermission(userRole: string, requiredRole: string): boolean {
  const roleHierarchy = {
    admin: 3,
    manager: 2,
    agent: 1,
  }

  return (roleHierarchy as any)[userRole] >= (roleHierarchy as any)[requiredRole]
}
