import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { refreshToken } = await request.json()

    if (!refreshToken) {
      return NextResponse.json({ success: false, message: "Refresh token is required" }, { status: 400 })
    }

    // Generate new access token
    const newToken = await AuthService.refreshAccessToken(refreshToken)

    return NextResponse.json({
      success: true,
      data: {
        token: newToken,
        expiresIn: 900,
      },
    })
  } catch (error) {
    console.error("Token refresh error:", error)
    return NextResponse.json({ success: false, message: "Invalid refresh token" }, { status: 401 })
  }
}
