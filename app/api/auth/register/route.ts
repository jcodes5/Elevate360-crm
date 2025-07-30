import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/auth"
import { db } from "@/lib/database"
import type { User } from "@/types"

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName, role = "agent", organizationId } = await request.json()

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ success: false, message: "All fields are required" }, { status: 400 })
    }

    // Check if user already exists
    const existingUsers = await db.findMany<User>("users", { email })

    if (existingUsers.length > 0) {
      return NextResponse.json({ success: false, message: "User already exists" }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await AuthService.hashPassword(password)

    // Create user
    const userData = {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role,
      organizationId: organizationId || "default-org",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const user = await db.create<User>("users", userData as any)

    // Generate tokens
    const { token, refreshToken } = AuthService.generateTokens(user)

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user as any

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
