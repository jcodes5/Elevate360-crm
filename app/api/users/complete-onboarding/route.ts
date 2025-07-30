import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/auth"
import { db } from "@/lib/database"
import type { User } from "@/types"

export async function POST(request: NextRequest) {
  try {
    console.log("Onboarding API called")
    const { onboardingData, isOnboardingCompleted } = await request.json()
    console.log("Received onboarding data:", { onboardingData, isOnboardingCompleted })

    // Get user from token
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    console.log("Token received:", token ? "Yes" : "No")

    if (!token) {
      console.log("No authorization token provided")
      return NextResponse.json({ success: false, message: "No authorization token" }, { status: 401 })
    }

    let decoded
    try {
      decoded = AuthService.verifyToken(token)
    } catch (error) {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 })
    }

    // Update user onboarding status
    const updatedUser = await db.updateById<User>("users", decoded.userId, {
      isOnboardingCompleted: true,
      phone: onboardingData.phone,
      updatedAt: new Date()
    })

    if (!updatedUser) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    // Here you could also save the onboarding data to a separate collection
    // or update organization settings based on the preferences
    
    console.log("Onboarding completed for user:", decoded.userId, "with data:", onboardingData)

    return NextResponse.json({
      success: true,
      message: "Onboarding completed successfully",
      data: {
        user: { ...updatedUser, password: undefined } // Remove password from response
      }
    })

  } catch (error) {
    console.error("Onboarding completion error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
