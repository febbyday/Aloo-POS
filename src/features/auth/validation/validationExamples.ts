/**
 * User Validation Examples
 * 
 * This file provides practical examples of how to use the validation utilities
 * in various scenarios throughout the application.
 */

import { 
  validateUser, 
  validateNewUser, 
  validateUserUpdate,
  validatePassword,
  validatePasswordChange,
  validateEmail,
  validateUsername
} from './userValidationUtils';

import {
  registerRule,
  createRuleSet,
  addRuleToSet,
  applyRules,
  initializeDefaultRules,
  CustomValidationRule
} from './customRuleManager';

/**
 * Example 1: Basic Validation
 * Shows how to validate a complete user object
 */
export function exampleValidateUser() {
  const user = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    username: 'john_doe',
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'ADMIN' as const,
    permissions: ['READ', 'WRITE', 'DELETE'],
    isActive: true,
    createdAt: new Date().toISOString(),
    isPinEnabled: false
  };

  const result = validateUser(user);
  
  if (result.success) {
    console.log('User validation passed', result.data);
    // Proceed with operation using validated data
    return result.data;
  } else {
    console.error('User validation failed', result.formattedErrors);
    // Show errors in the UI
    return null;
  }
}

/**
 * Example 2: Validating Form Input for New User
 * Shows how to validate user registration form data
 */
export function exampleValidateUserRegistration(formData: any) {
  // Typically would come from a form submission
  const newUserData = {
    username: formData.username,
    email: formData.email,
    password: formData.password,
    confirmPassword: formData.confirmPassword,
    firstName: formData.firstName,
    lastName: formData.lastName,
    role: formData.role,
    permissions: formData.permissions || []
  };

  const result = validateNewUser(newUserData);
  
  if (result.success) {
    // Proceed with user creation
    return { 
      validData: result.data,
      success: true
    };
  } else {
    // Return validation errors for the form
    return { 
      errors: result.errors,
      success: false
    };
  }
}

/**
 * Example 3: Using Custom Validation Rules
 * Shows how to create and apply custom validation rules
 */
export function exampleUsingCustomRules() {
  // Initialize default rules
  initializeDefaultRules();
  
  // Create a custom rule for minimum role permissions
  const minPermissionsRule: CustomValidationRule<any> = {
    name: 'user.permissions.minimum',
    description: 'Ensures users have the minimum required permissions for their role',
    category: 'permissions',
    validate: (data) => {
      if (data.role === 'ADMIN') {
        const requiredPermissions = ['USERS_MANAGE', 'SETTINGS_EDIT', 'REPORTS_VIEW'];
        return requiredPermissions.every(perm => data.permissions.includes(perm));
      }
      return true;
    },
    errorMessage: 'Admins must have the minimum required permissions',
    errorPath: 'permissions',
    severity: 'error',
    enabled: true
  };
  
  // Register the custom rule
  registerRule(minPermissionsRule);
  
  // Create a rule set for user permission validation
  const permissionRuleSet = createRuleSet(
    'permission-rules',
    'Permission Validation Rules',
    'Rules for validating user permissions'
  );
  
  // Add the rule to the set
  addRuleToSet('permission-rules', minPermissionsRule);
  
  // Apply the rules to validate user data
  const userData = {
    role: 'ADMIN',
    permissions: ['USERS_VIEW', 'SETTINGS_VIEW']
  };
  
  const ruleResults = applyRules(userData, [minPermissionsRule]);
  
  // Check if there are any validation failures
  const hasErrors = ruleResults.some(result => !result.success && result.severity === 'error');
  
  return {
    userData,
    ruleResults,
    isValid: !hasErrors
  };
}

/**
 * Example 4: Using Validation in a React Component
 * Shows how to use validation in a React component with form handling
 */
export function UserRegistrationFormExample() {
  // This would be part of a React component
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    // Get form data (using FormData API for example)
    const form = event.currentTarget;
    const formData = new FormData(form);
    
    // Extract and process form values
    const userData = {
      username: formData.get('username') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      confirmPassword: formData.get('confirmPassword') as string,
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      role: formData.get('role') as string
    };
    
    // Validate the user data
    const validationResult = validateNewUser(userData);
    
    if (validationResult.success) {
      // Data is valid, proceed with registration
      console.log('Valid user data:', validationResult.data);
      // api.registerUser(validationResult.data)...
    } else {
      // Display validation errors
      console.error('Validation failed:', validationResult.errors);
      // setFormErrors(validationResult.errors)...
    }
  };
  
  // React component would render a form here
  // with error handling for each field
}

/**
 * Example 5: Real-time Field Validation
 * Shows how to validate individual fields as the user types
 */
export function exampleRealTimeValidation(fieldName: string, value: string) {
  switch (fieldName) {
    case 'username':
      return validateUsername(value);
      
    case 'email':
      return validateEmail(value);
      
    case 'password':
      return validatePassword(value);
      
    default:
      return {
        success: false,
        errors: { [fieldName]: 'Unknown field' }
      };
  }
}

/**
 * Example 6: Validating User Updates
 * Shows how to validate partial updates to a user
 */
export function exampleValidateUserUpdate(userId: string, updates: any) {
  // Include the user ID with the updates
  const updateData = {
    id: userId,
    ...updates
  };
  
  const result = validateUserUpdate(updateData);
  
  if (result.success) {
    console.log('Update validation passed', result.data);
    // Proceed with update operation
    return result.data;
  } else {
    console.error('Update validation failed', result.formattedErrors);
    // Show errors in the UI
    return null;
  }
}

/**
 * Example 7: Password Change Validation
 * Shows how to validate password changes
 */
export function exampleValidatePasswordChange(passwordData: any) {
  const result = validatePasswordChange({
    currentPassword: passwordData.currentPassword,
    newPassword: passwordData.newPassword,
    confirmPassword: passwordData.confirmPassword
  });
  
  if (result.success) {
    console.log('Password validation passed');
    // Proceed with password change
    return true;
  } else {
    console.error('Password validation failed', result.formattedErrors);
    // Show errors in the UI
    return false;
  }
}
