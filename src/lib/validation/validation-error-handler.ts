/**
 * Validation Error Handler
 * 
 * Utilities for handling validation errors with specific, helpful error messages.
 */

import { ZodError } from 'zod';
import { getValidationErrorMessage } from '../error/error-messages';
import { ResourceType, OperationType } from '../error/error-messages';
import { toast } from '@/lib/toast';

/**
 * Field-specific validation error messages
 */
const fieldErrorMessages: Record<string, string> = {
  // User fields
  'email': 'Please enter a valid email address.',
  'password': 'Password must contain at least 8 characters, including uppercase, lowercase, number, and special character.',
  'confirmPassword': 'Passwords do not match.',
  'username': 'Username must be 3-20 characters and can only contain letters, numbers, and underscores.',
  'firstName': 'First name is required.',
  'lastName': 'Last name is required.',
  'phone': 'Please enter a valid phone number.',
  
  // Product fields
  'name': 'Name is required.',
  'price': 'Please enter a valid price (greater than 0).',
  'salePrice': 'Sale price must be less than the regular price.',
  'sku': 'SKU must be unique.',
  'barcode': 'Please enter a valid barcode.',
  'quantity': 'Quantity must be a positive number.',
  'category': 'Please select a category.',
  'description': 'Description is required.',
  
  // Order fields
  'orderNumber': 'Order number is required.',
  'orderDate': 'Please enter a valid date.',
  'customer': 'Please select a customer.',
  'paymentMethod': 'Please select a payment method.',
  'items': 'Order must contain at least one item.',
  
  // Shop fields
  'shopName': 'Shop name is required.',
  'address': 'Address is required.',
  'city': 'City is required.',
  'state': 'State/Province is required.',
  'postalCode': 'Postal/ZIP code is required.',
  'country': 'Country is required.',
  
  // Common fields
  'required': 'This field is required.',
  'minLength': 'This field must be at least {min} characters.',
  'maxLength': 'This field cannot exceed {max} characters.',
  'min': 'This value must be at least {min}.',
  'max': 'This value cannot exceed {max}.',
  'pattern': 'This field contains invalid characters.',
  'email': 'Please enter a valid email address.',
  'url': 'Please enter a valid URL.',
  'date': 'Please enter a valid date.',
  'time': 'Please enter a valid time.',
  'datetime': 'Please enter a valid date and time.',
  'number': 'Please enter a valid number.',
  'integer': 'Please enter a whole number.',
  'positive': 'Please enter a positive number.',
  'negative': 'Please enter a negative number.',
  'boolean': 'This field must be true or false.',
  'enum': 'Please select a valid option.',
  'array': 'Please provide a list of values.',
  'object': 'Please provide a valid object.',
  'custom': 'This field is invalid.'
};

/**
 * Format a validation error message with placeholders
 * 
 * @param message Message template with placeholders
 * @param params Parameters to replace placeholders
 * @returns Formatted message
 */
function formatErrorMessage(message: string, params: Record<string, any> = {}): string {
  return message.replace(/{(\w+)}/g, (_, key) => {
    return params[key] !== undefined ? String(params[key]) : `{${key}}`;
  });
}

/**
 * Get a specific error message for a field
 * 
 * @param field Field name
 * @param errorType Type of validation error
 * @param params Additional parameters for the error message
 * @returns Specific error message
 */
export function getFieldErrorMessage(
  field: string,
  errorType: string = 'required',
  params: Record<string, any> = {}
): string {
  // Check for field-specific error message
  const fieldKey = field.toLowerCase();
  if (fieldErrorMessages[fieldKey]) {
    return formatErrorMessage(fieldErrorMessages[fieldKey], params);
  }
  
  // Check for error type message
  if (fieldErrorMessages[errorType]) {
    return formatErrorMessage(fieldErrorMessages[errorType], params);
  }
  
  // Use generic message with field name
  return getValidationErrorMessage(field, {
    value: params.value,
    suggestion: params.suggestion
  });
}

/**
 * Format Zod validation errors into user-friendly messages
 * 
 * @param error Zod validation error
 * @param options Additional context for the error messages
 * @returns Object with field-specific error messages
 */
export function formatZodErrors(
  error: ZodError,
  options: {
    resource?: ResourceType;
    operation?: OperationType;
  } = {}
): Record<string, string> {
  const { resource, operation } = options;
  const formattedErrors: Record<string, string> = {};
  
  for (const issue of error.errors) {
    const path = issue.path.join('.');
    const field = path || issue.code;
    
    // Get error parameters
    const params: Record<string, any> = {
      ...issue,
      value: issue.received,
      expected: issue.expected,
      min: issue.minimum,
      max: issue.maximum
    };
    
    // Get specific error message
    formattedErrors[field] = getFieldErrorMessage(
      field,
      issue.code,
      params
    );
  }
  
  return formattedErrors;
}

/**
 * Show toast notifications for validation errors
 * 
 * @param errors Validation errors object
 * @param options Toast options
 */
export function showValidationErrorToasts(
  errors: Record<string, string>,
  options: {
    title?: string;
    showAll?: boolean;
    maxToasts?: number;
  } = {}
): void {
  const { 
    title = 'Validation Error', 
    showAll = false,
    maxToasts = 3
  } = options;
  
  const errorMessages = Object.values(errors);
  
  if (errorMessages.length === 0) {
    return;
  }
  
  if (errorMessages.length === 1 || showAll) {
    // Show individual toasts for each error
    errorMessages.slice(0, showAll ? undefined : maxToasts).forEach(message => {
      toast.error(title, message);
    });
    
    // If there are more errors than maxToasts, show a summary
    if (!showAll && errorMessages.length > maxToasts) {
      toast.error(
        'Additional Errors',
        `${errorMessages.length - maxToasts} more validation errors. Please check the form.`
      );
    }
  } else {
    // Show a summary toast
    toast.error(
      title,
      `${errorMessages.length} validation errors. Please check the form.`
    );
  }
}

/**
 * Handle a validation error with improved error messages
 * 
 * @param error Validation error (Zod or other)
 * @param options Additional context and handling options
 * @returns Formatted error messages
 */
export function handleValidationError(
  error: unknown,
  options: {
    resource?: ResourceType;
    operation?: OperationType;
    showToasts?: boolean;
    toastTitle?: string;
    showAllToasts?: boolean;
    maxToasts?: number;
  } = {}
): Record<string, string> {
  const {
    resource,
    operation,
    showToasts = true,
    toastTitle = 'Validation Error',
    showAllToasts = false,
    maxToasts = 3
  } = options;
  
  let formattedErrors: Record<string, string> = {};
  
  // Handle Zod errors
  if (error instanceof ZodError) {
    formattedErrors = formatZodErrors(error, { resource, operation });
  }
  // Handle other validation errors
  else if (error instanceof Error) {
    formattedErrors._error = error.message;
  }
  // Handle unknown errors
  else if (error) {
    formattedErrors._error = String(error);
  }
  
  // Show toast notifications if requested
  if (showToasts && Object.keys(formattedErrors).length > 0) {
    showValidationErrorToasts(formattedErrors, {
      title: toastTitle,
      showAll: showAllToasts,
      maxToasts
    });
  }
  
  return formattedErrors;
}
