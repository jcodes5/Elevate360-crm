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

    // Get request body
    const { code, action = "verify" } = await request.json();

    if (!code) {
      return NextResponse.json(
        { success: false, message: "Verification code is required" },
        { status: 400 }
      );
    }

    // Get user from database
    const user = await db.findById("users", userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Parse 2FA config
    let twoFactorConfig;
    try {
      twoFactorConfig = user.twoFactorConfig ? JSON.parse(user.twoFactorConfig) : null;
    } catch (error) {
      console.error("Failed to parse 2FA config:", error);
      return NextResponse.json(
        { success: false, message: "Invalid 2FA configuration" },
        { status: 500 }
      );
    }

    if (!twoFactorConfig || !twoFactorConfig.secret) {
      return NextResponse.json(
        { success: false, message: "2FA is not configured for this account" },
        { status: 400 }
      );
    }

    // Verify the code
    const verification = TwoFactorAuthService.verifyToken(
      twoFactorConfig.secret,
      code,
      twoFactorConfig.backupCodes || []
    );

    if (!verification.isValid) {
      await logAuditEvent(request, AuditEventType.SECURITY_EVENT, {
        userId,
        email: user.email,
        status: "failure",
        details: {
          action: "2fa_verification_failed",
          method: "totp",
          error: verification.error,
        },
      });

      return NextResponse.json(
        { success: false, message: verification.error || "Invalid verification code" },
        { status: 400 }
      );
    }

    // Handle setup completion
    if (action === "setup" && twoFactorConfig.status === TwoFactorStatus.PENDING_SETUP) {
      // Enable 2FA
      twoFactorConfig.status = TwoFactorStatus.ENABLED;
      twoFactorConfig.setupCompletedAt = new Date();

      await db.updateById("users", userId, {
        twoFactorEnabled: true,
        twoFactorConfig: JSON.stringify(twoFactorConfig),
        updatedAt: new Date(),
      });

      await logAuditEvent(request, AuditEventType.SECURITY_EVENT, {
        userId,
        email: user.email,
        status: "success",
        details: {
          action: "2fa_enabled",
          method: "totp",
        },
      });

      return NextResponse.json({
        success: true,
        message: "2FA has been successfully enabled for your account",
        data: {
          enabled: true,
          backupCodesRemaining: twoFactorConfig.backupCodes?.length || 0,
        },
      });
    }

    // Handle regular verification (login or sensitive operation)
    if (verification.usedBackupCode) {
      // Remove used backup code
      twoFactorConfig.backupCodes = TwoFactorAuthService.removeUsedBackupCode(
        twoFactorConfig.backupCodes || [],
        verification.usedBackupCode
      );

      await db.updateById("users", userId, {
        twoFactorConfig: JSON.stringify(twoFactorConfig),
        updatedAt: new Date(),
      });

      await logAuditEvent(request, AuditEventType.SECURITY_EVENT, {
        userId,
        email: user.email,
        status: "success",
        details: {
          action: "2fa_backup_code_used",
          backupCodesRemaining: twoFactorConfig.backupCodes.length,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Verification successful (backup code used)",
        data: {
          verified: true,
          backupCodeUsed: true,
          backupCodesRemaining: twoFactorConfig.backupCodes.length,
          warning: twoFactorConfig.backupCodes.length <= 2 
            ? "You have few backup codes remaining. Consider generating new ones."
            : null,
        },
      });
    }

    // Regular TOTP verification
    await logAuditEvent(request, AuditEventType.SECURITY_EVENT, {
      userId,
      email: user.email,
      status: "success",
      details: {
        action: "2fa_verified",
        method: "totp",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Verification successful",
      data: {
        verified: true,
        backupCodesRemaining: twoFactorConfig.backupCodes?.length || 0,
      },
    });

  } catch (error) {
    console.error("2FA verification error:", error);
    
    return NextResponse.json(
      { success: false, message: "Failed to verify 2FA code" },
      { status: 500 }
    );
  }
}
