import { AUTH_CONFIG } from "./auth-config";

export function sanitizeEmail(email: string): string {
  // Convert to lowercase and trim whitespace
  return email.toLowerCase().trim();
}

export function sanitizeString(str: string): string {
  // Remove potentially dangerous characters and trim whitespace
  return str
    .trim()
    .replace(/[<>]/g, "") // Remove < and > to prevent HTML injection
    .replace(/['"]/g, ""); // Remove quotes
}

export function validateAndSanitizeInput(input: Record<string, any>) {
  const sanitized: Record<string, any> = {};
  const errors: string[] = [];

  // Email validation and sanitization
  if (input.email) {
    if (typeof input.email !== "string") {
      errors.push("Email must be a string");
    } else {
      const sanitizedEmail = sanitizeEmail(input.email);
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(sanitizedEmail)) {
        errors.push("Invalid email format");
      } else {
        sanitized.email = sanitizedEmail;
      }
    }
  }

  // Password validation
  if (input.password) {
    if (typeof input.password !== "string") {
      errors.push("Password must be a string");
    } else {
      sanitized.password = input.password;
    }
  } else {
    errors.push("Password is required");
  }

  // Name validation and sanitization
  if (input.firstName) {
    if (typeof input.firstName !== "string") {
      errors.push("First name must be a string");
    } else {
      sanitized.firstName = sanitizeString(input.firstName);
      if (sanitized.firstName.length < 1) {
        errors.push("First name is required");
      }
    }
  }

  if (input.lastName) {
    if (typeof input.lastName !== "string") {
      errors.push("Last name must be a string");
    } else {
      sanitized.lastName = sanitizeString(input.lastName);
      if (sanitized.lastName.length < 1) {
        errors.push("Last name is required" as any);
      }
    }
  }

  // Role validation
  if (input.role) {
    if (typeof input.role !== "string") {
      errors.push("Role must be a string");
    } else {
      const role = input.role.toLowerCase();
      const validRoles = AUTH_CONFIG.roles.valid as readonly string[];
      if (!validRoles.includes(role)) {
        errors.push("Invalid role specified");
      } else {
        sanitized.role = role;
      }
    }
  }

  // Organization name sanitization
  if (input.organizationName) {
    if (typeof input.organizationName !== "string") {
      errors.push("Organization name must be a string");
    } else {
      sanitized.organizationName = sanitizeString(input.organizationName);
    }
  }

  return {
    sanitized,
    errors,
    isValid: errors.length === 0,
  };
}
