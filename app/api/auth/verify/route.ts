import { type NextRequest, NextResponse } from "next/server";
import { ProductionAuthService, sessionManager } from "@/lib/auth-production";
import { db } from "@/lib/database-config";

export async function POST(request: NextRequest) {
  try {
    // Get tokens from cookies or headers
    const { accessToken, sessionId } = ProductionAuthService.getTokensFromCookies(request);

    if (!accessToken) {
      return NextResponse.json(
        { success: false, message: "No access token provided" },
        { status: 401 }
      );
    }

    // Verify token
    const payload = ProductionAuthService.verifyAccessToken(accessToken);

    // Get user from database to ensure they still exist and are active
    const user = await db.findById("users", payload.userId);
    
    if (!user || !user.isActive) {
      return NextResponse.json(
        { success: false, message: "User not found or inactive" },
        { status: 401 }
      );
    }

    // Get session information
    const userSessions = ProductionAuthService.getUserSessions(payload.userId);
    const currentSession = userSessions.find(s => s.sessionId === payload.sessionId);

    if (!currentSession) {
      return NextResponse.json(
        { success: false, message: "Session not found" },
        { status: 401 }
      );
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      data: {
        user: userWithoutPassword,
        sessionId: payload.sessionId,
        activeSessions: userSessions.length,
        lastActivity: new Date(currentSession.lastActivity),
        isValid: true,
      },
      message: "Session is valid",
    });

  } catch (error) {
    console.error("Session verification error:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Invalid token";
    
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 401 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Handle GET requests (same logic)
  return POST(request);
}
