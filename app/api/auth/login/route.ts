import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/auth"
import { db } from "@/lib/database-config"
import { createTestData } from "@/lib/seed-data"
import { createTestDataPrisma } from "@/lib/seed-data-prisma"
import type { User } from "@/types"

export async function POST(request: NextRequest) {
  try {
    console.log("Login route called")
    const { email, password } = await request.json()
    console.log("Login attempt for email:", email)

    if (!email || !password) {
      return NextResponse.json({ success: false, message: "Email and password are required" }, { status: 400 })
    }

    // Find user by email
    let users = await db.findMany<User>("users", { email })
    let user = users[0]

    // If no user found and this is the test user, create test data
    if (!user && email === "test@example.com") {
      console.log("Creating test data...")
      try {
        const USE_MOCK_DB = process.env.USE_MOCK_DB === 'true'
        if (USE_MOCK_DB) {
          const testData = await createTestData()
          user = testData.testUser
        } else {
          const testData = await createTestDataPrisma()
          user = testData.testUser
        }
      } catch (error) {
        console.error("Error creating test data:", error)
        return NextResponse.json({ success: false, message: "Error initializing test data" }, { status: 500 })
      }
    }

    if (!user) {
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 })
    }

    // Verify password
    const isValidPassword = await AuthService.comparePassword(password, user.password as any)

    if (!isValidPassword) {
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 })
    }

    // Update last login
    await db.updateById("users", user.id, { lastLogin: new Date() })

    // Generate tokens
    const { token, refreshToken } = AuthService.generateTokens(user)

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user as any

    // Create response
    const response = NextResponse.json({
      success: true,
      data: {
        user: userWithoutPassword,
        token,
        refreshToken,
        expiresIn: 900, // 15 minutes
      },
      message: "Login successful"
    })

    // Set cookies
    response.cookies.set('accessToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60, // 15 minutes
      path: '/'
    })

    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}