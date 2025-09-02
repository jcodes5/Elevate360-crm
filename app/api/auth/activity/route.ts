import { type NextRequest, NextResponse } from "next/server";
import { ProductionAuthService, sessionManager } from "@/lib/auth-production";

export async function POST(request: NextRequest) {
  try {
    // Get token to identify session
    const { accessToken } = ProductionAuthService.getTokensFromCookies(request);
    
    if (!accessToken) {
      return NextResponse.json(
        { success: false, message: "No access token provided" },
        { status: 401 }
      );
    }

    const payload = ProductionAuthService.verifyAccessToken(accessToken);
    
    // Update session activity (this happens automatically in verifyAccessToken)
    // But we can also track additional activity metadata
    const body = await request.json().catch(() => ({}));
    const { action, page } = body;

    // Log activity if needed (optional)
    if (action || page) {
      console.log(`User ${payload.userId} activity: ${action || 'page_view'} on ${page || 'unknown'}`);
    }

    return NextResponse.json({
      success: true,
      message: "Activity recorded",
      data: {
        sessionId: payload.sessionId,
        lastActivity: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error("Activity tracking error:", error);
    
    return NextResponse.json(
      { success: false, message: "Failed to record activity" },
      { status: 401 }
    );
  }
}
