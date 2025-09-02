import crypto from "crypto";
import { authenticator } from "otplib";
import QRCode from "qrcode";
import { config } from "@/lib/env-config";

// TOTP Configuration
authenticator.options = {
  step: 30, // Time step in seconds
  window: 1, // Allow one step before and after current time
};

export interface TwoFactorSetup {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
  manualEntryKey: string;
}

export interface TwoFactorValidation {
  isValid: boolean;
  usedBackupCode?: string;
  error?: string;
}

export class TwoFactorAuthService {
  private static readonly APP_NAME = "Elevate360 CRM";
  
  /**
   * Generate a new 2FA secret and QR code for user setup
   */
  static async generateSetup(userEmail: string, userId: string): Promise<TwoFactorSetup> {
    // Generate base32 secret
    const secret = authenticator.generateSecret();
    
    // Create the service name for the authenticator app
    const serviceName = encodeURIComponent(this.APP_NAME);
    const accountName = encodeURIComponent(userEmail);
    
    // Generate TOTP URL for QR code
    const totpUrl = authenticator.keyuri(accountName, serviceName, secret);
    
    // Generate QR code as data URL
    const qrCodeUrl = await QRCode.toDataURL(totpUrl);
    
    // Generate backup codes
    const backupCodes = this.generateBackupCodes();
    
    // Create manual entry key (formatted secret)
    const manualEntryKey = secret.match(/.{1,4}/g)?.join(" ") || secret;
    
    return {
      secret,
      qrCodeUrl,
      backupCodes,
      manualEntryKey,
    };
  }
  
  /**
   * Verify a TOTP token or backup code
   */
  static verifyToken(
    secret: string,
    token: string,
    backupCodes: string[] = []
  ): TwoFactorValidation {
    // Remove spaces and convert to uppercase for consistency
    const cleanToken = token.replace(/\s/g, "").toUpperCase();
    
    // First try to verify as TOTP token
    try {
      const isValidTotp = authenticator.verify({
        token: cleanToken,
        secret: secret,
      });
      
      if (isValidTotp) {
        return { isValid: true };
      }
    } catch (error) {
      console.warn("TOTP verification failed:", error);
    }
    
    // If TOTP fails, check backup codes
    const matchingBackupCode = backupCodes.find(code => 
      code.toUpperCase() === cleanToken
    );
    
    if (matchingBackupCode) {
      return {
        isValid: true,
        usedBackupCode: matchingBackupCode,
      };
    }
    
    return {
      isValid: false,
      error: "Invalid verification code",
    };
  }
  
  /**
   * Generate secure backup codes
   */
  static generateBackupCodes(count: number = 10): string[] {
    const codes: string[] = [];
    
    for (let i = 0; i < count; i++) {
      // Generate 8-character alphanumeric code
      const code = crypto.randomBytes(4).toString("hex").toUpperCase();
      codes.push(code);
    }
    
    return codes;
  }
  
  /**
   * Validate backup code format
   */
  static isValidBackupCodeFormat(code: string): boolean {
    const cleanCode = code.replace(/\s/g, "").toUpperCase();
    // 8-character hexadecimal
    return /^[A-F0-9]{8}$/.test(cleanCode);
  }
  
  /**
   * Validate TOTP token format
   */
  static isValidTotpFormat(token: string): boolean {
    const cleanToken = token.replace(/\s/g, "");
    // 6-digit numeric
    return /^\d{6}$/.test(cleanToken);
  }
  
  /**
   * Remove a used backup code from the list
   */
  static removeUsedBackupCode(backupCodes: string[], usedCode: string): string[] {
    return backupCodes.filter(code => code.toUpperCase() !== usedCode.toUpperCase());
  }
  
  /**
   * Check if user has remaining backup codes
   */
  static hasRemainingBackupCodes(backupCodes: string[]): boolean {
    return backupCodes.length > 0;
  }
  
  /**
   * Generate new backup codes (for when user runs out)
   */
  static regenerateBackupCodes(): string[] {
    return this.generateBackupCodes();
  }
  
  /**
   * Validate 2FA setup completion
   */
  static validateSetupCompletion(
    secret: string,
    verificationToken: string
  ): boolean {
    try {
      return authenticator.verify({
        token: verificationToken,
        secret: secret,
      });
    } catch (error) {
      console.warn("2FA setup validation failed:", error);
      return false;
    }
  }
  
  /**
   * Generate recovery information for user
   */
  static generateRecoveryInfo(secret: string): {
    recoveryCode: string;
    expiresAt: Date;
  } {
    // Generate one-time recovery code
    const recoveryCode = crypto.randomBytes(16).toString("hex").toUpperCase();
    
    // Recovery code expires in 24 hours
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    return {
      recoveryCode,
      expiresAt,
    };
  }
  
  /**
   * Verify recovery code
   */
  static verifyRecoveryCode(
    storedCode: string,
    providedCode: string,
    expiresAt: Date
  ): boolean {
    // Check if code has expired
    if (new Date() > expiresAt) {
      return false;
    }
    
    // Compare codes (case-insensitive)
    return storedCode.toUpperCase() === providedCode.toUpperCase();
  }
}

// SMS-based 2FA (alternative implementation)
export class SMSTwoFactorService {
  /**
   * Generate a 6-digit SMS verification code
   */
  static generateSMSCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
  
  /**
   * Verify SMS code with time-based validation
   */
  static verifySMSCode(
    storedCode: string,
    providedCode: string,
    generatedAt: Date,
    validityMinutes: number = 5
  ): boolean {
    // Check if code has expired
    const expiresAt = new Date(generatedAt.getTime() + validityMinutes * 60 * 1000);
    if (new Date() > expiresAt) {
      return false;
    }
    
    // Compare codes
    return storedCode === providedCode;
  }
}

// Email-based 2FA (alternative implementation)
export class EmailTwoFactorService {
  /**
   * Generate a 6-digit email verification code
   */
  static generateEmailCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
  
  /**
   * Verify email code
   */
  static verifyEmailCode(
    storedCode: string,
    providedCode: string,
    generatedAt: Date,
    validityMinutes: number = 10
  ): boolean {
    // Check if code has expired
    const expiresAt = new Date(generatedAt.getTime() + validityMinutes * 60 * 1000);
    if (new Date() > expiresAt) {
      return false;
    }
    
    // Compare codes
    return storedCode === providedCode;
  }
}

// 2FA Method Types
export enum TwoFactorMethod {
  TOTP = "totp",
  SMS = "sms", 
  EMAIL = "email",
}

// 2FA Status Types
export enum TwoFactorStatus {
  DISABLED = "disabled",
  PENDING_SETUP = "pending_setup",
  ENABLED = "enabled",
  TEMPORARILY_DISABLED = "temporarily_disabled",
}

// User 2FA Configuration Interface
export interface UserTwoFactorConfig {
  status: TwoFactorStatus;
  method: TwoFactorMethod;
  secret?: string;
  backupCodes: string[];
  recoveryCode?: string;
  recoveryCodeExpiresAt?: Date;
  lastUsedAt?: Date;
  setupCompletedAt?: Date;
}

// 2FA Verification Request
export interface TwoFactorVerificationRequest {
  userId: string;
  code: string;
  method: TwoFactorMethod;
  trustDevice?: boolean;
}

// Trusted Device Management
export class TrustedDeviceService {
  /**
   * Generate device fingerprint
   */
  static generateDeviceFingerprint(userAgent: string, ipAddress: string): string {
    const input = `${userAgent}_${ipAddress}`;
    return crypto.createHash("sha256").update(input).digest("hex");
  }
  
  /**
   * Check if device is trusted
   */
  static isDeviceTrusted(
    deviceFingerprint: string,
    trustedDevices: string[],
    trustDurationDays: number = 30
  ): boolean {
    // In a real implementation, you'd also check the trust timestamp
    return trustedDevices.includes(deviceFingerprint);
  }
  
  /**
   * Add device to trusted list
   */
  static addTrustedDevice(
    deviceFingerprint: string,
    trustedDevices: string[]
  ): string[] {
    if (!trustedDevices.includes(deviceFingerprint)) {
      return [...trustedDevices, deviceFingerprint];
    }
    return trustedDevices;
  }
  
  /**
   * Remove device from trusted list
   */
  static removeTrustedDevice(
    deviceFingerprint: string,
    trustedDevices: string[]
  ): string[] {
    return trustedDevices.filter(device => device !== deviceFingerprint);
  }
}
