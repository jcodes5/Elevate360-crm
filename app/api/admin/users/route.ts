import { type NextRequest, NextResponse } from "next/server"
import { EnhancedAuthService, canAccessResource } from "@/lib/auth-enhanced"
import { db } from "@/lib/database-config"
import type { User } from "@/types"

// Helper function to verify admin access
async function verifyAdminAccess(request: NextRequest) {
  const token = EnhancedAuthService.getTokenFromRequest(request)
  
  if (!token) {
    throw new Error("No token provided")
  }

  const payload = EnhancedAuthService.verifyAccessToken(token)

  // Check if user has admin role
  if (payload.role !== 'admin') {
    throw new Error("Admin access required")
  }

  return payload
}

// GET - List all users (Admin only)
export async function GET(request: NextRequest) {
  try {
    console.log("Admin users list route called")

    // Verify admin access
    const payload = await verifyAdminAccess(request)

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const role = searchParams.get('role')
    const organizationId = searchParams.get('organizationId') || payload.organizationId

    // Build filter
    const filter: Partial<User> = { organizationId }
    if (role) {
      filter.role = role as any
    }

    // Get users (excluding passwords)
    const users = await db.findMany<User>("users", filter, {
      limit,
      offset: (page - 1) * limit
    })

    // Remove passwords from all users
    const sanitizedUsers = users.map(user => {
      const { password, ...userWithoutPassword } = user
      return userWithoutPassword
    })

    return NextResponse.json({
      success: true,
      data: {
        users: sanitizedUsers,
        pagination: {
          page,
          limit,
          total: users.length
        }
      },
      message: "Users retrieved successfully"
    })

  } catch (error) {
    console.error("Admin users list error:", error)

    if (error instanceof Error) {
      if (error.message.includes("token") || error.message.includes("Admin")) {
        return NextResponse.json(
          { success: false, message: error.message },
          { status: 401 }
        )
      }
    }

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST - Create new user (Admin only)
export async function POST(request: NextRequest) {
  try {
    console.log("Admin create user route called")

    // Verify admin access
    await verifyAdminAccess(request)

    const {
      email,
      password,
      firstName,
      lastName,
      role = "agent",
      organizationId
    } = await request.json()

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

    // Create user
    const userData = {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role,
      organizationId: organizationId || "default-org",
      isActive: true,
      isOnboardingCompleted: false,
      onboardingStep: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const user = await db.create<User>("users", userData as any)

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(
      {
        success: true,
        data: { user: userWithoutPassword },
        message: "User created successfully"
      },
      { status: 201 }
    )

  } catch (error) {
    console.error("Admin create user error:", error)

    if (error instanceof Error) {
      if (error.message.includes("token") || error.message.includes("Admin")) {
        return NextResponse.json(
          { success: false, message: error.message },
          { status: 401 }
        )
      }
    }

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}
