import { type NextRequest, NextResponse } from "next/server"
import { EnhancedAuthService, authRateLimiter } from "@/lib/auth-enhanced"
import { db } from "@/lib/database-config"
import type { User } from "@/types"

export async function POST(request: NextRequest) {
  try {
    console.log("Enhanced register route called")
    
    // Get client IP for rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    
    // Check rate limiting (stricter for registration)
    const rateLimitResult = authRateLimiter.checkRateLimit(`register_${clientIP}`)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Too many registration attempts. Try again in ${rateLimitResult.retryAfter} seconds.`,
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

    const { 
      email, 
      password, 
      firstName, 
      lastName, 
      role = "agent", 
      organizationName 
    } = await request.json()

    console.log("Registration attempt for:", { email, firstName, lastName, role })

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { success: false, message: "All fields are required" }, 
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

    // Validate password strength
    const passwordValidation = EnhancedAuthService.validatePasswordStrength(password)
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Password does not meet requirements",
          errors: passwordValidation.errors
        }, 
        { status: 400 }
      )
    }

    // Validate role
    const validRoles = ['admin', 'manager', 'agent']
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { success: false, message: "Invalid role specified" }, 
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUsers = await db.findMany<User>("users", { email })
    if (existingUsers.length > 0) {
      return NextResponse.json(
        { success: false, message: "User with this email already exists" }, 
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await EnhancedAuthService.hashPassword(password)

    // For now, use a default organization ID
    // In a real app, you'd create or assign to an organization
    const organizationId = "default-org"

    // Create user
    const userData = {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role,
      organizationId,
      isActive: true,
      isOnboardingCompleted: false,
      onboardingStep: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const user = await db.create<User>("users", userData as any)

    // Reset rate limiting on successful registration
    authRateLimiter.resetAttempts(`register_${clientIP}`)

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
      message: "Registration successful"
    }

    const response = NextResponse.json(responseData, { status: 201 })

    // Set secure HTTP-only cookies
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

    console.log("Registration successful for user:", user.id)
    return response

  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" }, 
      { status: 500 }
    )
  }
}
