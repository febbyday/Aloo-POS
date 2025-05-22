import { z } from 'zod';

/**
 * Shared password validation schema
 * 
 * Enforces the following rules:
 * - Minimum 8 characters
 * - Maximum 100 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
export const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .max(100, "Password cannot exceed 100 characters")
  .refine(
    (password) => {
      // Check for at least one uppercase letter
      const hasUppercase = /[A-Z]/.test(password);
      // Check for at least one lowercase letter
      const hasLowercase = /[a-z]/.test(password);
      // Check for at least one number
      const hasNumber = /[0-9]/.test(password);
      // Check for at least one special character
      const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password);
      
      return hasUppercase && hasLowercase && hasNumber && hasSpecial;
    },
    {
      message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    }
  );

/**
 * Validates if a password meets the security requirements
 * 
 * @param password The password to validate
 * @returns An object with isValid and error properties
 */
export function validatePassword(password: string): { isValid: boolean; error?: string } {
  try {
    passwordSchema.parse(password);
    return { isValid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        isValid: false, 
        error: error.errors[0]?.message || "Invalid password" 
      };
    }
    return { isValid: false, error: "Invalid password" };
  }
}
