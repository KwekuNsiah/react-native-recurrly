/**
 * Form validation utilities for authentication flows
 */

export interface ValidationError {
  field?: string;
  message: string;
}

/**
 * Validate email format
 */
export const validateEmail = (email: string): ValidationError | null => {
  if (!email.trim()) {
    return { field: "email", message: "Email address is required" };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { field: "email", message: "Please enter a valid email address" };
  }

  return null;
};

/**
 * Validate password strength
 * Requirements:
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 */
export const validatePassword = (password: string): ValidationError | null => {
  if (!password) {
    return { field: "password", message: "Password is required" };
  }

  if (password.length < 8) {
    return {
      field: "password",
      message: "Password must be at least 8 characters",
    };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      field: "password",
      message: "Password must contain an uppercase letter",
    };
  }

  if (!/[a-z]/.test(password)) {
    return {
      field: "password",
      message: "Password must contain a lowercase letter",
    };
  }

  if (!/[0-9]/.test(password)) {
    return { field: "password", message: "Password must contain a number" };
  }

  return null;
};

/**
 * Validate password confirmation
 */
export const validatePasswordConfirmation = (
  password: string,
  confirmPassword: string,
): ValidationError | null => {
  if (!confirmPassword) {
    return {
      field: "confirmPassword",
      message: "Please confirm your password",
    };
  }

  if (password !== confirmPassword) {
    return { field: "confirmPassword", message: "Passwords do not match" };
  }

  return null;
};

/**
 * Validate email for sign-in (simpler - just format)
 */
export const validateSignInEmail = (email: string): ValidationError | null => {
  if (!email.trim()) {
    return { field: "email", message: "Email address is required" };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { field: "email", message: "Please enter a valid email address" };
  }

  return null;
};

/**
 * Validate sign-in password (just required)
 */
export const validateSignInPassword = (
  password: string,
): ValidationError | null => {
  if (!password) {
    return { field: "password", message: "Password is required" };
  }

  return null;
};

/**
 * Validate verification code
 */
export const validateVerificationCode = (
  code: string,
): ValidationError | null => {
  if (!code.trim()) {
    return { field: "code", message: "Verification code is required" };
  }

  if (code.length < 6) {
    return { field: "code", message: "Verification code must be 6 digits" };
  }

  return null;
};

/**
 * Check if field has error
 */
export const hasFieldError = (
  errors: Record<string, any> | null | undefined,
  field: string,
): boolean => {
  if (!errors) return false;
  if (errors.fields && errors.fields[field]) return true;
  return false;
};

/**
 * Get field error message
 */
export const getFieldErrorMessage = (
  errors: Record<string, any> | null | undefined,
  field: string,
): string | null => {
  if (!errors) return null;
  if (errors.fields && errors.fields[field]) {
    return errors.fields[field]?.message || "Invalid input";
  }
  return null;
};
