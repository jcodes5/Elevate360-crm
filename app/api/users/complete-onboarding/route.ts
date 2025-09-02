import { type NextRequest, NextResponse } from "next/server"
import { EnhancedAuthService } from "@/lib/auth-enhanced"
import { db } from "@/lib/database-config"
import type { User } from "@/types"

export async function POST(request: NextRequest) {
  try {
    console.log("📋 Onboarding API called")
    const { onboardingData, isOnboardingCompleted } = await request.json()
    console.log("📝 Received onboarding data:", { onboardingData, isOnboardingCompleted })

    // Try to get token from Authorization header first
    let token = request.headers.get("authorization")?.replace("Bearer ", "")
    console.log("🔐 Token from header:", token ? "Yes" : "No")

    // If no header token, try to get from cookies
    if (!token) {
      token = request.cookies.get("accessToken")?.value
      console.log("🍪 Token from cookies:", token ? "Yes" : "No")
    }

    if (!token) {
      console.log("❌ No authorization token provided")
      return NextResponse.json({ 
        success: false, 
        message: "No authorization token" 
      }, { status: 401 })
    }

    let decoded
    try {
      decoded = EnhancedAuthService.verifyAccessToken(token)
      console.log("✅ Token decoded successfully for user:", decoded.userId)
    } catch (error) {
      console.log("❌ Token verification failed:", error)
      return NextResponse.json({ 
        success: false, 
        message: "Invalid token" 
      }, { status: 401 })
    }

    // Update user onboarding status
    console.log("📊 Updating user onboarding status...")
    const updatedUser: any = await db.updateById("users", decoded.userId, {
      isOnboardingCompleted: true,
      phone: onboardingData?.phone,
      updatedAt: new Date()
    })

    if (!updatedUser) {
      console.log("❌ User not found:", decoded.userId)
      return NextResponse.json({ 
        success: false, 
        message: "User not found" 
      }, { status: 404 })
    }

    console.log("✅ User updated successfully:", updatedUser.id)

    // Remove password from response
    const { password: _, ...userWithoutPassword } = updatedUser as any

    // Generate new auth tokens with updated onboarding status
    const tokens = EnhancedAuthService.generateTokens({
      ...updatedUser,
      isOnboardingCompleted: true
    } as User)

    console.log("🎉 Onboarding completed for user:", decoded.userId)

    const responseData = {
      success: true,
      message: "Onboarding completed successfully",
      data: {
        user: userWithoutPassword,
        tokens: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: tokens.expiresIn
        }
      }
    }

    console.log("📤 Sending response")
    
    // Create response and set updated auth cookies
    const response = NextResponse.json(responseData)
    
    // Update cookies with new tokens (including updated onboarding status)
    response.cookies.set("accessToken", tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60, // 15 minutes
      path: "/",
    })

    // Set refresh token if it exists in request cookies
    const existingRefreshToken = request.cookies.get("refreshToken")?.value
    if (existingRefreshToken || tokens.refreshToken) {
      response.cookies.set("refreshToken", tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: "/",
      })
    }
    
    return response

  } catch (error) {
    console.error("❌ Onboarding completion error:", error)
    return NextResponse.json({ 
      success: false, 
      message: "Internal server error" 
    }, { status: 500 })
  }
}
