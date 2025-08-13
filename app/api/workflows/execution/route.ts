import { type NextRequest, NextResponse } from "next/server"
import { processScheduledExecutions } from "@/lib/services/workflow-execution-service"

export async function POST(request: NextRequest) {
  try {
    // In a real implementation, you would authenticate this endpoint
    // For now, we'll allow execution for demo purposes
    
    // Process all scheduled workflow executions
    await processScheduledExecutions()
    
    return NextResponse.json({
      success: true,
      message: "Scheduled workflow executions processed successfully"
    })
  } catch (error) {
    console.error("Error processing scheduled workflow executions:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}

// This endpoint could be called by a cron job or background task scheduler
export async function GET() {
  return NextResponse.json({
    success: true,
    message: "This endpoint processes scheduled workflow executions. Use POST to trigger execution."
  })
}