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
    
    // Wait for the payload promise to resolve
    const resolvedPayload = await payload;

    // Check if userId exists in the payload
    if (!resolvedPayload.userId) {
      return NextResponse.json(
        { success: false, message: "Invalid token payload: missing user ID" },
        { status: 401 }
      );
    }

    // Get user from database to ensure they still exist and are active
    const user = await db.findById("users", resolvedPayload.userId);
    
    if (!user || !user.isActive) {
      return NextResponse.json(
        { success: false, message: "User not found or inactive" },
        { status: 401 }
      );
    }

    // Get session information
    const userSessions = ProductionAuthService.getUserSessions(resolvedPayload.userId);
    
    // Check if we found any active sessions for the user
    if (userSessions.length === 0) {
      // If no sessions found, this might be a server restart scenario
      // Allow access based on valid token and user only
      console.warn(`No active sessions found for user ${resolvedPayload.userId}, but token and user are valid`);
    } else {
      // If sessions exist, verify the current session
      const currentSession = userSessions.find(s => s.sessionId === resolvedPayload.sessionId);

      if (!currentSession) {
        return NextResponse.json(
          { success: false, message: "Session not found" },
          { status: 401 }
        );
      }
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      data: {
        user: userWithoutPassword,
        sessionId: resolvedPayload.sessionId,
        activeSessions: userSessions.length,
        lastActivity: userSessions.length > 0 
          ? new Date(userSessions.find(s => s.sessionId === resolvedPayload.sessionId)?.lastActivity || Date.now())
          : new Date(),
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