/**
 * User Validation Utilities
 * 
 * Functions for validating user data with the Zod schemas
 * Includes utility functions for common validation tasks and support for custom rules
 */

import { z, ZodError, ZodIssue } from 'zod';
import { 
  ExtendedUserSchema, 
  NewUserSchema, 
  UserUpdateSchema, 
  PasswordChangeSchema,
  UserSearchSchema,
  PasswordSchema,
  UsernameSchema,
  EmailSchema
} from './userValidationSchema';
import { User } from '../types/auth.types';

/**
 * Custom validation result interface
 * Provides structured information about validation results
 */
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: Record<string, string>;
  formattedErrors?: string[];
}

/**
 * Registry for custom validation rules
 * Allows extending validation beyond the schema rules
 */
interface CustomRule<T> {
  name: string;
  validate: (data: T) => boolean;
  errorMessage: string;
  errorPath?: string;
}

// Store for custom validation rules
const customUserRules: CustomRule<any>[] = [];

/**
 * Add a custom validation rule
 * @param rule The custom validation rule to add
 */
export function addCustomUserValidationRule<T>(rule: CustomRule<T>): void {
  customUserRules.push(rule);
}

/**
 * Remove a custom validation rule by name
 * @param name The name of the rule to remove
 */
export function removeCustomUserValidationRule(name: string): void {
  const index = customUserRules.findIndex(rule => rule.name === name);
  if (index !== -1) {
    customUserRules.splice(index, 1);
  }
}

/**
 * Format Zod validation errors into a user-friendly structure
 * @param error The ZodError object
 * @returns An object with field names as keys and error messages as values
 */
export function formatZodErrors(error: ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  
  for (const issue of error.issues) {
    const path = issue.path.join('.');
    errors[path || 'general'] = issue.message;
  }
  
  return errors;
}

/**
 * Get formatted error messages as an array of strings
 * @param error The ZodError object
 * @returns An array of error message strings
 */
export function getErrorMessages(error: ZodError): string[] {
  return error.issues.map(issue => 
    issue.path.length > 0 
      ? `${issue.path.join('.')}: ${issue.message}` 
      : issue.message
  );
}

/**
 * Apply custom validation rules to the data
 * @param data The data to validate
 * @param applicableRules The custom rules to apply
 * @returns An array of ZodIssue objects for any validation errors
 */
function applyCustomRules<T>(data: T, applicableRules: CustomRule<T>[]): ZodIssue[] {
  const issues: ZodIssue[] = [];
  
  for (const rule of applicableRules) {
    if (!rule.validate(data)) {
      issues.push({
        code: 'custom',
        path: rule.errorPath ? rule.errorPath.split('.') : [],
        message: rule.errorMessage
      });
    }
  }
  
  return issues;
}

/**
 * Validate a complete user object against the extended schema
 * @param user The user object to validate
 * @returns A validation result with success status and errors if any
 */
export function validateUser(user: Partial<User>): ValidationResult<User> {
  try {
    const validatedUser = ExtendedUserSchema.parse(user);
    
    // Apply any custom rules that apply to user objects
    const applicableRules = customUserRules.filter(rule => 
      rule.name.startsWith('user.') || rule.name === 'user'
    );
    const customIssues = applyCustomRules(validatedUser, applicableRules);
    
    if (customIssues.length > 0) {
      const customError = new ZodError(customIssues);
      return {
        success: false,
        errors: formatZodErrors(customError),
        formattedErrors: getErrorMessages(customError)
      };
    }
    
    return {
      success: true,
      data: validatedUser
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        errors: formatZodErrors(error),
        formattedErrors: getErrorMessages(error)
      };
    }
    
    // Handle unexpected errors
    return {
      success: false,
      errors: { general: 'An unexpected error occurred during validation' },
      formattedErrors: ['An unexpected error occurred during validation']
    };
  }
}

/**
 * Validate a new user registration
 * @param userData The new user data to validate
 * @returns A validation result with success status and errors if any
 */
export function validateNewUser(userData: any): ValidationResult<z.infer<typeof NewUserSchema>> {
  try {
    const validatedUser = NewUserSchema.parse(userData);
    
    // Apply any custom rules that apply to new user creation
    const applicableRules = customUserRules.filter(rule => 
      rule.name.startsWith('newUser.') || rule.name === 'newUser'
    );
    const customIssues = applyCustomRules(validatedUser, applicableRules);
    
    if (customIssues.length > 0) {
      const customError = new ZodError(customIssues);
      return {
        success: false,
        errors: formatZodErrors(customError),
        formattedErrors: getErrorMessages(customError)
      };
    }
    
    return {
      success: true,
      data: validatedUser
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        errors: formatZodErrors(error),
        formattedErrors: getErrorMessages(error)
      };
    }
    
    // Handle unexpected errors
    return {
      success: false,
      errors: { general: 'An unexpected error occurred during validation' },
      formattedErrors: ['An unexpected error occurred during validation']
    };
  }
}

/**
 * Validate user update data
 * @param updateData The user update data to validate
 * @returns A validation result with success status and errors if any
 */
export function validateUserUpdate(updateData: any): ValidationResult<z.infer<typeof UserUpdateSchema>> {
  try {
    const validatedUpdate = UserUpdateSchema.parse(updateData);
    
    // Apply any custom rules that apply to user updates
    const applicableRules = customUserRules.filter(rule => 
      rule.name.startsWith('userUpdate.') || rule.name === 'userUpdate'
    );
    const customIssues = applyCustomRules(validatedUpdate, applicableRules);
    
    if (customIssues.length > 0) {
      const customError = new ZodError(customIssues);
      return {
        success: false,
        errors: formatZodErrors(customError),
        formattedErrors: getErrorMessages(customError)
      };
    }
    
    return {
      success: true,
      data: validatedUpdate
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        errors: formatZodErrors(error),
        formattedErrors: getErrorMessages(error)
      };
    }
    
    // Handle unexpected errors
    return {
      success: false,
      errors: { general: 'An unexpected error occurred during validation' },
      formattedErrors: ['An unexpected error occurred during validation']
    };
  }
}

/**
 * Validate password change data
 * @param passwordData The password change data to validate
 * @returns A validation result with success status and errors if any
 */
export function validatePasswordChange(passwordData: any): ValidationResult<z.infer<typeof PasswordChangeSchema>> {
  try {
    const validatedData = PasswordChangeSchema.parse(passwordData);
    
    // Apply any custom rules specific to password changes
    const applicableRules = customUserRules.filter(rule => 
      rule.name.startsWith('passwordChange.') || rule.name === 'passwordChange'
    );
    const customIssues = applyCustomRules(validatedData, applicableRules);
    
    if (customIssues.length > 0) {
      const customError = new ZodError(customIssues);
      return {
        success: false,
        errors: formatZodErrors(customError),
        formattedErrors: getErrorMessages(customError)
      };
    }
    
    return {
      success: true,
      data: validatedData
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        errors: formatZodErrors(error),
        formattedErrors: getErrorMessages(error)
      };
    }
    
    // Handle unexpected errors
    return {
      success: false,
      errors: { general: 'An unexpected error occurred during validation' },
      formattedErrors: ['An unexpected error occurred during validation']
    };
  }
}

/**
 * Validate a single password
 * @param password The password to validate
 * @returns A validation result with success status and errors if any
 */
export function validatePassword(password: string): ValidationResult<string> {
  try {
    const validatedPassword = PasswordSchema.parse(password);
    return {
      success: true,
      data: validatedPassword
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        errors: formatZodErrors(error),
        formattedErrors: getErrorMessages(error)
      };
    }
    
    // Handle unexpected errors
    return {
      success: false,
      errors: { general: 'An unexpected error occurred during validation' },
      formattedErrors: ['An unexpected error occurred during validation']
    };
  }
}

/**
 * Validate a username
 * @param username The username to validate
 * @returns A validation result with success status and errors if any
 */
export function validateUsername(username: string): ValidationResult<string> {
  try {
    const validatedUsername = UsernameSchema.parse(username);
    return {
      success: true,
      data: validatedUsername
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        errors: formatZodErrors(error),
        formattedErrors: getErrorMessages(error)
      };
    }
    
    // Handle unexpected errors
    return {
      success: false,
      errors: { general: 'An unexpected error occurred during validation' },
      formattedErrors: ['An unexpected error occurred during validation']
    };
  }
}

/**
 * Validate an email address
 * @param email The email to validate
 * @returns A validation result with success status and errors if any
 */
export function validateEmail(email: string): ValidationResult<string> {
  try {
    const validatedEmail = EmailSchema.parse(email);
    return {
      success: true,
      data: validatedEmail
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        errors: formatZodErrors(error),
        formattedErrors: getErrorMessages(error)
      };
    }
    
    // Handle unexpected errors
    return {
      success: false,
      errors: { general: 'An unexpected error occurred during validation' },
      formattedErrors: ['An unexpected error occurred during validation']
    };
  }
}

/**
 * Validate user search criteria
 * @param searchCriteria The search criteria to validate
 * @returns A validation result with success status and errors if any
 */
export function validateUserSearch(searchCriteria: any): ValidationResult<z.infer<typeof UserSearchSchema>> {
  try {
    const validatedCriteria = UserSearchSchema.parse(searchCriteria);
    return {
      success: true,
      data: validatedCriteria
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        errors: formatZodErrors(error),
        formattedErrors: getErrorMessages(error)
      };
    }
    
    // Handle unexpected errors
    return {
      success: false,
      errors: { general: 'An unexpected error occurred during validation' },
      formattedErrors: ['An unexpected error occurred during validation']
    };
  }
}
