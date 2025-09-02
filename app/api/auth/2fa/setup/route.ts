import { type NextRequest, NextResponse } from "next/server";
import { ProductionAuthService } from "@/lib/auth-production";
import { TwoFactorAuthService, TwoFactorStatus } from "@/lib/two-factor-auth";
import { db } from "@/lib/database-config";
import { logAuditEvent, AuditEventType } from "@/lib/audit-logger";

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const { accessToken } = ProductionAuthService.getTokensFromCookies(request);
    
    if (!accessToken) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    const payload = ProductionAuthService.verifyAccessToken(accessToken);
    const userId = payload.userId;

    // Get user from database
    const user = await db.findById("users", userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Check if 2FA is already enabled
    if (user.twoFactorEnabled) {
      return NextResponse.json(
        { success: false, message: "2FA is already enabled for this account" },
        { status: 400 }
      );
    }

    // Generate 2FA setup
    const setup = await TwoFactorAuthService.generateSetup(user.email, userId);

    // Store temporary 2FA data (don't enable yet)
    const twoFactorConfig = {
      status: TwoFactorStatus.PENDING_SETUP,
      method: "totp",
      secret: setup.secret,
      backupCodes: setup.backupCodes,
    };

    // Update user with temporary 2FA config
    await db.updateById("users", userId, {
      twoFactorConfig: JSON.stringify(twoFactorConfig),
      updatedAt: new Date(),
    });

    // Log 2FA setup initiation
    await logAuditEvent(request, AuditEventType.SECURITY_EVENT, {
      userId,
      email: user.email,
      status: "success",
      details: {
        action: "2fa_setup_initiated",
        method: "totp",
      },
    });

    // Return setup information (exclude sensitive data)
    return NextResponse.json({
      success: true,
      data: {
        qrCode: setup.qrCodeUrl,
        manualEntryKey: setup.manualEntryKey,
        backupCodes: setup.backupCodes,
        appName: "Elevate360 CRM",
        accountName: user.email,
      },
      message: "2FA setup initiated. Please verify with your authenticator app.",
    });

  } catch (error) {
    console.error("2FA setup error:", error);
    
    return NextResponse.json(
      { success: false, message: "Failed to setup 2FA" },
      { status: 500 }
    );
  }
}
