/**
 * Clerk error handling utilities
 * Converts Clerk API errors to user-friendly messages
 */

export interface ClerkErrorResponse {
  errors?: Array<{
    code: string;
    longMessage: string;
    message: string;
  }>;
  message?: string;
}

export interface UserFriendlyError {
  message: string;
  code?: string;
  field?: string;
}

/**
 * Map Clerk error codes to user-friendly messages
 */
const errorMessageMap: Record<string, string> = {
  invalid_password: "Email or password is incorrect",
  invalid_credentials: "Email or password is incorrect",
  form_password_pwned:
    "This password has been compromised. Please use a stronger password",
  form_identifier_not_found: "No account found with this email address",
  form_email_exists: "This email is already registered",
  invalid_code: "The code you entered is incorrect",
  form_code_not_found: "Verification code expired. Please request a new one",
  verification_code_expired: "Code expired. Request a new one",
  form_param_nil: "Please fill in all required fields",
  form_param_format_invalid: "Some fields have invalid format",
  form_param_blank: "Please fill in all required fields",
  too_many_attempts: "Too many attempts. Please try again later",
  resource_exhausted: "Too many attempts. Please try again later",
  network_error: "Connection error. Please check your internet and try again",
};

/**
 * Get user-friendly error message from Clerk error
 */
export const getClerkErrorMessage = (error: any): UserFriendlyError => {
  // Handle network errors
  if (!error || error.message === "Network Error") {
    return {
      message: "Connection error. Please check your internet and try again",
      code: "NETWORK_ERROR",
    };
  }

  // Handle Clerk ClerkAPIResponseError
  if (error.errors && Array.isArray(error.errors) && error.errors.length > 0) {
    const firstError = error.errors[0];
    const code = firstError.code || firstError.message;

    // Check if we have a mapped message
    if (errorMessageMap[code]) {
      return {
        message: errorMessageMap[code],
        code: code,
        field: getErrorField(code),
      };
    }

    // Fallback to Clerk's message
    const message = firstError.longMessage || firstError.message;
    return {
      message: message || "An unexpected error occurred",
      code: code || "UNKNOWN_ERROR",
      field: getErrorField(code),
    };
  }

  // Handle generic errors
  if (error.message) {
    const code = error.code || "UNKNOWN_ERROR";
    return {
      message:
        errorMessageMap[code] ||
        error.message ||
        "An unexpected error occurred",
      code: code,
    };
  }

  return {
    message: "An unexpected error occurred",
    code: "UNKNOWN_ERROR",
  };
};

/**
 * Map error code to affected field
 */
const getErrorField = (code: string): string | undefined => {
  const fieldMap: Record<string, string> = {
    form_identifier_not_found: "email",
    form_email_exists: "email",
    invalid_password: "password",
    form_password_pwned: "password",
    form_password_length_too_short: "password",
    invalid_code: "code",
    form_code_not_found: "code",
    verification_code_expired: "code",
  };

  return fieldMap[code];
};

/**
 * Check if error is a specific type
 */
export const isEmailNotFoundError = (error: any): boolean => {
  if (!error?.errors || !Array.isArray(error.errors)) return false;
  return error.errors.some((e: any) => e.code === "form_identifier_not_found");
};

export const isEmailAlreadyExistsError = (error: any): boolean => {
  if (!error?.errors || !Array.isArray(error.errors)) return false;
  return error.errors.some((e: any) => e.code === "form_email_exists");
};

export const isInvalidCredentialsError = (error: any): boolean => {
  if (!error?.errors || !Array.isArray(error.errors)) return false;
  return error.errors.some(
    (e: any) =>
      e.code === "invalid_password" || e.code === "invalid_credentials",
  );
};

export const isInvalidCodeError = (error: any): boolean => {
  if (!error?.errors || !Array.isArray(error.errors)) return false;
  return error.errors.some(
    (e: any) => e.code === "invalid_code" || e.code === "form_code_not_found",
  );
};

export const isCodeExpiredError = (error: any): boolean => {
  if (!error?.errors || !Array.isArray(error.errors)) return false;
  return error.errors.some((e: any) => e.code === "verification_code_expired");
};

export const isTooManyAttemptsError = (error: any): boolean => {
  if (!error?.errors || !Array.isArray(error.errors)) return false;
  return error.errors.some(
    (e: any) =>
      e.code === "too_many_attempts" || e.code === "resource_exhausted",
  );
};
