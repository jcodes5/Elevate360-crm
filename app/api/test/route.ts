import { NextResponse } from "next/server"

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      message: "API is working correctly",
      timestamp: new Date().toISOString(),
      env: {
        NODE_ENV: process.env.NODE_ENV,
        USE_MOCK_DB: process.env.USE_MOCK_DB,
      }
    })
  } catch (error) {
    console.error("Test API error:", error)
    return NextResponse.json({
      success: false,
      message: "Test API failed",
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
