import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/auth"
import { db } from "@/lib/database-config"
import type { User } from "@/types"

// Password validation function
function validatePasswordStrength(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long")
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter")
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter")
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number")
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Password must contain at least one special character")
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Email validation function
function validateEmailFormat(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Role validation function
function validateRole(role: string): boolean {
  const validRoles = ['admin', 'manager', 'agent']
  return validRoles.includes(role.toLowerCase())
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName, role = "agent", organizationName } = await request.json()

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ success: false, message: "All fields are required" }, { status: 400 })
    }

    // Validate email format
    if (!validateEmailFormat(email)) {
      return NextResponse.json({ success: false, message: "Invalid email format" }, { status: 400 })
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password)
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
    if (!validateRole(role)) {
      return NextResponse.json({ success: false, message: "Invalid role specified" }, { status: 400 })
    }

    // Check if user already exists
    const existingUsers = await db.findMany("users", { where: { email } })

    if (existingUsers.length > 0) {
      return NextResponse.json({ success: false, message: "User already exists" }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await AuthService.hashPassword(password)

    // Create organization for the user
    const organizationData = {
      name: organizationName || `${firstName}'s Organization`,
      settings: {},
      subscription: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const organization: any = await db.create("organizations", organizationData)
    
    // Ensure we have a valid organization ID
    if (!organization || !organization.id) {
      return NextResponse.json({ success: false, message: "Failed to create organization" }, { status: 500 })
    }

    // Convert role to uppercase to match Prisma enum values
    const prismaRole = role.toUpperCase()

    // Create user
    const userData = {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: prismaRole,
      organizationId: organization.id,
      isActive: true,
      isOnboardingCompleted: false,
      onboardingStep: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const user: any = await db.create("users", userData)

    // Generate tokens
    const { token, refreshToken } = AuthService.generateTokens(user)

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(
      {
        success: true,
        data: {
          user: userWithoutPassword,
          token,
          refreshToken,
          expiresIn: 900,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}