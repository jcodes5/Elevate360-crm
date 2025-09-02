import crypto from "crypto";
import { config } from "@/lib/env-config";

export interface EmailVerificationToken {
  token: string;
  hashedToken: string;
  expiresAt: Date;
}

export interface EmailVerificationResult {
  isValid: boolean;
  isExpired: boolean;
  error?: string;
}

export class EmailVerificationService {
  private static readonly TOKEN_LENGTH = 32;
  private static readonly TOKEN_VALIDITY_HOURS = 24;
  
  /**
   * Generate email verification token
   */
  static generateVerificationToken(): EmailVerificationToken {
    // Generate random token
    const token = crypto.randomBytes(this.TOKEN_LENGTH).toString('hex');
    
    // Hash the token for storage
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    
    // Set expiration time
    const expiresAt = new Date(Date.now() + this.TOKEN_VALIDITY_HOURS * 60 * 60 * 1000);
    
    return {
      token,
      hashedToken,
      expiresAt,
    };
  }
  
  /**
   * Verify email verification token
   */
  static verifyToken(token: string, hashedToken: string, expiresAt: Date): EmailVerificationResult {
    // Check if token has expired
    if (new Date() > expiresAt) {
      return {
        isValid: false,
        isExpired: true,
        error: "Verification token has expired",
      };
    }
    
    // Hash provided token and compare
    const providedHashedToken = crypto.createHash('sha256').update(token).digest('hex');
    
    if (providedHashedToken !== hashedToken) {
      return {
        isValid: false,
        isExpired: false,
        error: "Invalid verification token",
      };
    }
    
    return {
      isValid: true,
      isExpired: false,
    };
  }
  
  /**
   * Generate email verification URL
   */
  static generateVerificationUrl(token: string, baseUrl: string = ""): string {
    const verifyUrl = `${baseUrl}/auth/verify-email?token=${token}`;
    return verifyUrl;
  }
  
  /**
   * Generate welcome email content
   */
  static generateWelcomeEmail(
    userName: string,
    verificationUrl: string
  ): { subject: string; html: string; text: string } {
    const subject = "Welcome to Elevate360 CRM - Please verify your email";
    
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Verification</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #007bff; color: white; padding: 20px; text-align: center; }
    .content { padding: 30px 20px; background: #f9f9f9; }
    .button { 
      display: inline-block; 
      background: #007bff; 
      color: white; 
      padding: 12px 30px; 
      text-decoration: none; 
      border-radius: 5px;
      margin: 20px 0;
    }
    .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
    .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin: 20px 0; border-radius: 5px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to Elevate360 CRM</h1>
    </div>
    
    <div class="content">
      <h2>Hello ${userName}!</h2>
      
      <p>Thank you for creating an account with Elevate360 CRM. To complete your registration and secure your account, please verify your email address by clicking the button below:</p>
      
      <div style="text-align: center;">
        <a href="${verificationUrl}" class="button">Verify Email Address</a>
      </div>
      
      <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
      <p style="word-break: break-all; background: #f1f1f1; padding: 10px; border-radius: 3px;">
        ${verificationUrl}
      </p>
      
      <div class="warning">
        <strong>Security Note:</strong> This verification link will expire in 24 hours. If you didn't create this account, please ignore this email.
      </div>
      
      <p>Once verified, you'll have full access to:</p>
      <ul>
        <li>Contact and lead management</li>
        <li>Sales pipeline tracking</li>
        <li>Marketing automation</li>
        <li>Analytics and reporting</li>
        <li>Team collaboration tools</li>
      </ul>
      
      <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
      
      <p>Best regards,<br>The Elevate360 CRM Team</p>
    </div>
    
    <div class="footer">
      <p>This email was sent to you because you created an account on Elevate360 CRM.</p>
      <p>If you did not create this account, please ignore this email.</p>
    </div>
  </div>
</body>
</html>
    `;
    
    const text = `
Welcome to Elevate360 CRM!

Hello ${userName},

Thank you for creating an account with Elevate360 CRM. To complete your registration and secure your account, please verify your email address by visiting the following link:

${verificationUrl}

This verification link will expire in 24 hours. If you didn't create this account, please ignore this email.

Once verified, you'll have full access to our CRM features including contact management, sales pipeline tracking, marketing automation, and more.

If you have any questions, please contact our support team.

Best regards,
The Elevate360 CRM Team
    `;
    
    return { subject, html, text };
  }
  
  /**
   * Generate resend verification email content
   */
  static generateResendEmail(
    userName: string,
    verificationUrl: string
  ): { subject: string; html: string; text: string } {
    const subject = "Email Verification - Elevate360 CRM";
    
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Verification</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #007bff; color: white; padding: 20px; text-align: center; }
    .content { padding: 30px 20px; background: #f9f9f9; }
    .button { 
      display: inline-block; 
      background: #007bff; 
      color: white; 
      padding: 12px 30px; 
      text-decoration: none; 
      border-radius: 5px;
      margin: 20px 0;
    }
    .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Email Verification</h1>
    </div>
    
    <div class="content">
      <h2>Hello ${userName}!</h2>
      
      <p>We received a request to resend your email verification link. Please click the button below to verify your email address:</p>
      
      <div style="text-align: center;">
        <a href="${verificationUrl}" class="button">Verify Email Address</a>
      </div>
      
      <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
      <p style="word-break: break-all; background: #f1f1f1; padding: 10px; border-radius: 3px;">
        ${verificationUrl}
      </p>
      
      <p><strong>Note:</strong> This verification link will expire in 24 hours.</p>
      
      <p>If you didn't request this verification email, please ignore it.</p>
      
      <p>Best regards,<br>The Elevate360 CRM Team</p>
    </div>
    
    <div class="footer">
      <p>This email was sent because you requested email verification.</p>
    </div>
  </div>
</body>
</html>
    `;
    
    const text = `
Email Verification - Elevate360 CRM

Hello ${userName},

We received a request to resend your email verification link. Please visit the following link to verify your email address:

${verificationUrl}

This verification link will expire in 24 hours.

If you didn't request this verification email, please ignore it.

Best regards,
The Elevate360 CRM Team
    `;
    
    return { subject, html, text };
  }
}

// Email service interface
export interface EmailService {
  sendEmail(to: string, subject: string, html: string, text: string): Promise<boolean>;
}

// Mock email service for development
export class MockEmailService implements EmailService {
  async sendEmail(to: string, subject: string, html: string, text: string): Promise<boolean> {
    console.log("📧 Mock Email Service - Email would be sent:");
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log("HTML content length:", html.length);
    console.log("Text content length:", text.length);
    console.log("---");
    
    // In development, always return success
    return true;
  }
}

// SMTP email service for production
export class SMTPEmailService implements EmailService {
  private config: {
    host: string;
    port: number;
    user: string;
    password: string;
    from: string;
  };
  
  constructor() {
    this.config = {
      host: config.email.smtp.host || "",
      port: config.email.smtp.port || 587,
      user: config.email.smtp.user || "",
      password: config.email.smtp.password || "",
      from: config.email.smtp.from || "",
    };
  }
  
  async sendEmail(to: string, subject: string, html: string, text: string): Promise<boolean> {
    try {
      // In a real implementation, you would use nodemailer or similar
      // This is a placeholder for the actual SMTP implementation
      
      console.log("📧 SMTP Email Service - Sending email:");
      console.log(`From: ${this.config.from}`);
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log("SMTP Config:", { 
        host: this.config.host, 
        port: this.config.port,
        user: this.config.user ? "configured" : "not configured"
      });
      
      // TODO: Implement actual SMTP sending with nodemailer
      // For now, return true in development
      return config.isDevelopment;
      
    } catch (error) {
      console.error("Failed to send email:", error);
      return false;
    }
  }
}

// Email service factory
export function createEmailService(): EmailService {
  if (config.email.enabled && config.isProduction) {
    return new SMTPEmailService();
  }
  return new MockEmailService();
}
