import { type NextRequest, NextResponse } from "next/server"
import { EnhancedAuthService } from "@/lib/auth-enhanced"
import { db } from "@/lib/database-config"
import type { User } from "@/types"

export async function GET(request: NextRequest) {
  try {
    console.log("User verification route called")

    // Get token from request
    const token = EnhancedAuthService.getTokenFromRequest(request)

    if (!token) {
      return NextResponse.json(
        { success: false, message: "No token provided" },
        { status: 401 }
      )
    }

    // Verify token
    const payload = EnhancedAuthService.verifyAccessToken(token)

    // Get fresh user data from database
    const user = await db.findById<User>("users", payload.userId)

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      )
    }

    if (!user.isActive) {
      return NextResponse.json(
        { success: false, message: "User account is deactivated" },
        { status: 401 }
      )
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      data: {
        user: userWithoutPassword,
        tokenPayload: {
          userId: payload.userId,
          email: payload.email,
          role: payload.role,
          organizationId: payload.organizationId
        }
      },
      message: "User verified successfully"
    })

  } catch (error) {
    console.error("User verification error:", error)

    if (error instanceof Error && error.message === "Access token expired") {
      return NextResponse.json(
        { success: false, message: "Token expired", code: "TOKEN_EXPIRED" },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { success: false, message: "Invalid token" },
      { status: 401 }
    )
  }
}
