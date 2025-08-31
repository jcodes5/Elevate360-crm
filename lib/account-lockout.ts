import { NextRequest, NextResponse } from "next/server";
import { db } from "./database-config";
import { AUTH_CONFIG } from "./auth-config";
import { AuditEventType, logAuditEvent } from "./audit-logger";

interface FailedAttempt {
  count: number;
  lastAttempt: Date;
  lockedUntil?: Date;
}

// In-memory store for failed attempts - in production, use Redis or similar
const failedAttempts = new Map<string, FailedAttempt>();

// Clean up old entries periodically
setInterval(() => {
  const now = new Date();
  for (const [email, data] of failedAttempts.entries()) {
    if (data.lockedUntil && data.lockedUntil < now) {
      failedAttempts.delete(email);
    }
  }
}, 60000); // Clean up every minute

export async function checkAccountLockout(
  request: NextRequest,
  email: string
): Promise<NextResponse | null> {
  const now = new Date();
  const attempt = failedAttempts.get(email) || { count: 0, lastAttempt: now };

  // Check if account is locked
  if (attempt.lockedUntil && attempt.lockedUntil > now) {
    const remainingMinutes = Math.ceil(
      (attempt.lockedUntil.getTime() - now.getTime()) / (60 * 1000)
    );

    await logAuditEvent(request, AuditEventType.LOGIN_FAILURE, {
      email,
      status: "failure",
      details: { reason: "Account locked", remainingMinutes },
    });

    return NextResponse.json(
      {
        success: false,
        message: `Account is locked. Try again in ${remainingMinutes} minutes.`,
      },
      { status: 423 } // Locked status code
    );
  }

  return null;
}

export async function recordFailedAttempt(
  request: NextRequest,
  email: string
): Promise<NextResponse | null> {
  const now = new Date();
  const attempt = failedAttempts.get(email) || { count: 0, lastAttempt: now };

  // Reset count if last attempt was more than the window time ago
  if (
    now.getTime() - attempt.lastAttempt.getTime() >
    AUTH_CONFIG.security.lockout.windowMinutes * 60 * 1000
  ) {
    attempt.count = 0;
  }

  attempt.count++;
  attempt.lastAttempt = now;

  // Lock account if too many attempts
  if (attempt.count >= AUTH_CONFIG.security.lockout.maxAttempts) {
    attempt.lockedUntil = new Date(
      now.getTime() + AUTH_CONFIG.security.lockout.durationMinutes * 60 * 1000
    );

    await logAuditEvent(request, AuditEventType.ACCOUNT_LOCKOUT, {
      email,
      status: "success",
      details: {
        lockedUntil: attempt.lockedUntil,
        failedAttempts: attempt.count,
      },
    });

    failedAttempts.set(email, attempt);

    return NextResponse.json(
      {
        success: false,
        message: `Account locked for ${AUTH_CONFIG.security.lockout.durationMinutes} minutes due to too many failed attempts.`,
      },
      { status: 423 }
    );
  }

  failedAttempts.set(email, attempt);
  return null;
}

export function resetFailedAttempts(email: string) {
  failedAttempts.delete(email);
}
