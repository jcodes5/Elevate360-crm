import { type NextRequest, NextResponse } from "next/server"

// Simple test endpoint that doesn't require authentication
export async function GET(request: NextRequest) {
  try {
    console.log("🧪 Test API called")
    
    return NextResponse.json({
      success: true,
      data: {
        message: "Test API is working",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
      },
      message: "API is healthy"
    })
  } catch (error) {
    console.error("❌ Test API error:", error)
    return NextResponse.json(
      { success: false, message: "Test API error" },
      { status: 500 }
    )
  }
}
