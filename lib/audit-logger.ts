import { NextRequest } from "next/server";
import { db } from "./database-config";
import { getClientIp, getUserAgent } from "@/lib/request-utils";

export enum AuditEventType {
  LOGIN_SUCCESS = "LOGIN_SUCCESS",
  LOGIN_FAILURE = "LOGIN_FAILURE",
  REGISTER_SUCCESS = "REGISTER_SUCCESS",
  REGISTER_FAILURE = "REGISTER_FAILURE",
  PASSWORD_RESET_REQUEST = "PASSWORD_RESET_REQUEST",
  PASSWORD_RESET_SUCCESS = "PASSWORD_RESET_SUCCESS",
  PASSWORD_CHANGE = "PASSWORD_CHANGE",
  ACCOUNT_LOCKOUT = "ACCOUNT_LOCKOUT",
  ACCOUNT_UNLOCK = "ACCOUNT_UNLOCK",
}

interface AuditLogEntry {
  eventType: AuditEventType;
  userId?: string;
  email?: string;
  ipAddress: string;
  userAgent: string;
  requestPath: string;
  timestamp: Date;
  details?: Record<string, any>;
  status: "success" | "failure";
  correlationId: string;
}

export async function logAuditEvent(
  request: NextRequest,
  eventType: AuditEventType,
  details: {
    userId?: string;
    email?: string;
    status: "success" | "failure";
    details?: Record<string, any>;
  }
) {
  // Validate required fields before creating log
  if (!request || !eventType || !details || !details.status) {
    console.error("Invalid audit event parameters");
    return;
  }

  const entry: AuditLogEntry = {
    eventType,
    userId: details.userId,
    email: details.email,
    ipAddress: getClientIp(request),
    userAgent: getUserAgent(request),
    requestPath: request.nextUrl.pathname,
    timestamp: new Date(),
    status: details.status,
    details: details.details,
    correlationId:
      request.headers.get("x-correlation-id") || randomCorrelationId(),
  };

  try {
    await db.create("audit_logs", entry);
  } catch (error) {
    console.error("Failed to write audit log:", error);
    
    // Only log to console in development environment
    if (process.env.NODE_ENV === "development") {
      console.warn("Audit log entry (fallback):", JSON.stringify(entry, null, 2));
    }
    
    // Don't throw - audit logging should not break the main flow
  }
}

// Generate a random correlation ID if one is not provided
function randomCorrelationId(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}
