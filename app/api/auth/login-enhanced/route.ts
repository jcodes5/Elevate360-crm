import { type NextRequest, NextResponse } from "next/server"
import { EnhancedAuthService, authRateLimiter } from "@/lib/auth-enhanced"
import { db } from "@/lib/database-config"
import { createTestData } from "@/lib/seed-data"
import { createTestDataPrisma } from "@/lib/seed-data-prisma"
import type { User } from "@/types"

export async function POST(request: NextRequest) {
  try {
    console.log("Enhanced login route called")
    
    // Get client IP for rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    
    // Check rate limiting
    const rateLimitResult = authRateLimiter.checkRateLimit(clientIP)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Too many login attempts. Try again in ${rateLimitResult.retryAfter} seconds.`,
          retryAfter: rateLimitResult.retryAfter
        }, 
        { 
          status: 429,
          headers: {
            'Retry-After': rateLimitResult.retryAfter?.toString() || '900'
          }
        }
      )
    }

    const { email, password, rememberMe = false } = await request.json()
    console.log("Login attempt for email:", email)

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" }, 
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: "Invalid email format" }, 
        { status: 400 }
      )
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
        return NextResponse.json(
          { success: false, message: "Error initializing test data" }, 
          { status: 500 }
        )
      }
    }

    if (!user) {
      console.log("User not found:", email)
      return NextResponse.json(
        { success: false, message: "Invalid email or password" }, 
        { status: 401 }
      )
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { success: false, message: "Account is deactivated. Please contact support." }, 
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await EnhancedAuthService.comparePassword(password, user.password!)

    if (!isValidPassword) {
      console.log("Invalid password for user:", email)
      return NextResponse.json(
        { success: false, message: "Invalid email or password" }, 
        { status: 401 }
      )
    }

    // Reset rate limiting on successful login
    authRateLimiter.resetAttempts(clientIP)

    // Update last login timestamp
    await db.updateById("users", user.id, { lastLogin: new Date() })

    // Generate tokens
    const tokens = EnhancedAuthService.generateTokens(user)

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    // Prepare response
    const responseData = {
      success: true,
      data: {
        user: userWithoutPassword,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn,
        tokenType: 'Bearer'
      },
      message: "Login successful"
    }

    const response = NextResponse.json(responseData)

    // Set secure HTTP-only cookies if remember me is enabled
    if (rememberMe) {
      response.cookies.set('accessToken', tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60, // 15 minutes
        path: '/'
      })

      response.cookies.set('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/'
      })
    }

    console.log("Login successful for user:", user.id)
    return response

  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" }, 
      { status: 500 }
    )
  }
}
