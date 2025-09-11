import { type NextRequest, NextResponse } from "next/server"
import { ProductionAuthService } from "@/lib/auth-production"

export async function POST(request: NextRequest) {
  try {
    console.log("Logout route called")

    // Get token for logging purposes
    const token = ProductionAuthService.getTokenFromRequest(request)
    
    if (token) {
      try {
        const payload = await ProductionAuthService.verifyAccessToken(token)
        console.log("User logout:", payload.userId)
      } catch (error) {
        // Token might be expired, but we still want to clear cookies
        console.log("Logout with invalid/expired token")
      }
    }

    const refreshToken = request.cookies.get('refreshToken')?.value

    // Blacklist tokens and remove session
    if (token) {
      try {
        ProductionAuthService.logout(token, refreshToken)
      } catch {}
    }

    // Create response
    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully"
    })

    // Clear auth cookies
    response.cookies.set('accessToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/'
    })

    response.cookies.set('refreshToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/'
    })

    return response

  } catch (error) {
    console.error("Logout error:", error)
    
    // Still clear cookies even if there's an error
    const response = NextResponse.json(
      { success: false, message: "Error during logout" },
      { status: 500 }
    )

    response.cookies.delete('accessToken')
    response.cookies.delete('refreshToken')

    return response
  }
}
