import { type NextRequest, NextResponse } from "next/server"
import { EnhancedAuthService } from "@/lib/auth-enhanced"

export async function GET(request: NextRequest) {
  try {
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
    
    return NextResponse.json({
      success: true,
      data: {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
        organizationId: payload.organizationId,
      },
      message: "Token is valid"
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Invalid or expired token" },
      { status: 401 }
    )
  }
}
