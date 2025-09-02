import { type NextRequest, NextResponse } from "next/server";
import { ProductionAuthService } from "@/lib/auth-production";
import { logAuditEvent, AuditEventType } from "@/lib/audit-logger";

export async function POST(request: NextRequest) {
  try {
    // Get token to identify user
    const { accessToken } = ProductionAuthService.getTokensFromCookies(request);
    
    if (!accessToken) {
      return NextResponse.json(
        { success: false, message: "No access token provided" },
        { status: 401 }
      );
    }

    const payload = ProductionAuthService.verifyAccessToken(accessToken);
    const userId = payload.userId;

    // Get current sessions count before logout
    const currentSessions = ProductionAuthService.getUserSessions(userId);
    const sessionCount = currentSessions.length;

    // Logout all sessions for the user
    ProductionAuthService.logoutAllSessions(userId);

    // Log the logout all event
    await logAuditEvent(request, AuditEventType.LOGOUT_ALL, {
      userId,
      email: payload.email,
      status: "success",
      details: {
        sessionsTerminated: sessionCount,
        reason: "User requested logout from all devices",
      },
    });

    // Create response
    const response = NextResponse.json({
      success: true,
      message: `Successfully logged out from ${sessionCount} session(s)`,
      data: {
        sessionsTerminated: sessionCount,
      },
    });

    // Clear cookies
    ProductionAuthService.clearAuthCookies();

    return response;

  } catch (error) {
    console.error("Logout all sessions error:", error);
    
    // Still try to clear cookies even if there's an error
    const response = NextResponse.json(
      { success: false, message: "Error during logout" },
      { status: 500 }
    );

    ProductionAuthService.clearAuthCookies();
    return response;
  }
}
