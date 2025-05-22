/**
 * Error Messages Utility
 * 
 * Centralized utility for generating consistent, specific error messages
 * throughout the application.
 */

import { ApiErrorType } from '../api/api-error';

/**
 * Types of operations that can generate errors
 */
export enum OperationType {
  FETCH = 'fetch',
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  UPLOAD = 'upload',
  DOWNLOAD = 'download',
  PROCESS = 'process',
  AUTHENTICATE = 'authenticate',
  AUTHORIZE = 'authorize',
  VALIDATE = 'validate',
  CONNECT = 'connect',
  SYNC = 'sync',
  IMPORT = 'import',
  EXPORT = 'export',
  SEARCH = 'search',
  CALCULATE = 'calculate',
  GENERATE = 'generate'
}

/**
 * Resource types in the application
 */
export enum ResourceType {
  PRODUCT = 'product',
  ORDER = 'order',
  CUSTOMER = 'customer',
  USER = 'user',
  ROLE = 'role',
  PERMISSION = 'permission',
  CATEGORY = 'category',
  INVENTORY = 'inventory',
  SHOP = 'shop',
  STAFF = 'staff',
  REPORT = 'report',
  SETTING = 'setting',
  FILE = 'file',
  IMAGE = 'image',
  PAYMENT = 'payment',
  DISCOUNT = 'discount',
  TAX = 'tax',
  INVOICE = 'invoice',
  NOTIFICATION = 'notification',
  SESSION = 'session',
  DATA = 'data'
}

/**
 * Options for generating error messages
 */
interface ErrorMessageOptions {
  operation?: OperationType;
  resource?: ResourceType;
  resourceId?: string;
  resourceName?: string;
  details?: string;
  errorCode?: string;
  statusCode?: number;
  field?: string;
  value?: string;
  suggestion?: string;
  retry?: boolean;
}

/**
 * Generate a user-friendly error message for API errors
 * 
 * @param errorType Type of API error
 * @param options Additional context for the error message
 * @returns User-friendly error message
 */
export function getApiErrorMessage(errorType: ApiErrorType, options: ErrorMessageOptions = {}): string {
  const {
    operation,
    resource,
    resourceId,
    resourceName,
    details,
    suggestion,
    retry
  } = options;
  
  // Format resource description
  const resourceDesc = getResourceDescription(resource, resourceName, resourceId);
  
  // Format operation description
  const operationDesc = operation ? `${operation} ${resourceDesc}` : resourceDesc;
  
  // Base message based on error type
  let message = '';
  
  switch (errorType) {
    case ApiErrorType.NETWORK:
      message = `Unable to connect to the server${operation ? ` while trying to ${operation} ${resourceDesc}` : ''}. Please check your internet connection.`;
      break;
      
    case ApiErrorType.TIMEOUT:
      message = `The request timed out${operation ? ` while trying to ${operation} ${resourceDesc}` : ''}. The server might be experiencing high load.`;
      break;
      
    case ApiErrorType.SERVER:
      message = `The server encountered an error${operation ? ` while processing your request to ${operation} ${resourceDesc}` : ''}. Our team has been notified.`;
      break;
      
    case ApiErrorType.AUTHENTICATION:
      message = `Your session has expired or you are not logged in. Please log in again to ${operation ? `${operation} ${resourceDesc}` : 'continue'}.`;
      break;
      
    case ApiErrorType.AUTHORIZATION:
      message = `You do not have permission to ${operation ? `${operation} ${resourceDesc}` : 'perform this action'}.`;
      break;
      
    case ApiErrorType.VALIDATION:
      if (options.field) {
        message = `Invalid ${options.field}${options.value ? ` "${options.value}"` : ''} ${operation ? `when trying to ${operation} ${resourceDesc}` : ''}.`;
      } else {
        message = `Validation failed${operation ? ` when trying to ${operation} ${resourceDesc}` : ''}. Please check your input.`;
      }
      break;
      
    case ApiErrorType.NOT_FOUND:
      message = `The ${resourceDesc} could not be found.`;
      break;
      
    case ApiErrorType.CONFLICT:
      message = `A conflict occurred${operation ? ` while trying to ${operation} ${resourceDesc}` : ''}. ${resourceName ? `A ${resource} with this name already exists.` : ''}`;
      break;
      
    case ApiErrorType.RATE_LIMIT:
      message = `Rate limit exceeded${operation ? ` while trying to ${operation} ${resourceDesc}` : ''}. Please try again later.`;
      break;
      
    case ApiErrorType.MOCK_DISABLED:
      message = `Mock data is disabled for this operation. Please connect to a real API.`;
      break;
      
    default:
      message = `An unexpected error occurred${operation ? ` while trying to ${operation} ${resourceDesc}` : ''}.`;
  }
  
  // Add details if provided
  if (details) {
    message += ` ${details}`;
  }
  
  // Add suggestion if provided
  if (suggestion) {
    message += ` ${suggestion}`;
  }
  
  // Add retry suggestion if applicable
  if (retry) {
    message += ' Please try again.';
  }
  
  return message;
}

/**
 * Get a formatted description of a resource
 */
function getResourceDescription(
  resource?: ResourceType,
  resourceName?: string,
  resourceId?: string
): string {
  if (!resource) {
    return 'resource';
  }
  
  let description = resource;
  
  if (resourceName) {
    description += ` "${resourceName}"`;
  } else if (resourceId) {
    description += ` (ID: ${resourceId})`;
  }
  
  return description;
}

/**
 * Generate a validation error message for a specific field
 * 
 * @param field Field name that failed validation
 * @param options Additional context for the error message
 * @returns Specific validation error message
 */
export function getValidationErrorMessage(field: string, options: ErrorMessageOptions = {}): string {
  const { value, resource, operation, suggestion } = options;
  
  // Common validation error messages by field
  switch (field.toLowerCase()) {
    case 'email':
      return `Please enter a valid email address${value ? ` (${value})` : ''}.`;
      
    case 'password':
      return 'Password must contain at least 8 characters, including uppercase, lowercase, number, and special character.';
      
    case 'name':
      return `Please enter a valid name${value ? ` (${value})` : ''}.`;
      
    case 'price':
      return `Please enter a valid price${value ? ` (${value})` : ''}.`;
      
    case 'quantity':
      return `Please enter a valid quantity${value ? ` (${value})` : ''}.`;
      
    case 'date':
      return `Please enter a valid date${value ? ` (${value})` : ''}.`;
      
    case 'phone':
      return `Please enter a valid phone number${value ? ` (${value})` : ''}.`;
      
    default:
      return `Invalid ${field}${value ? ` (${value})` : ''}${operation ? ` when trying to ${operation} ${resource || 'resource'}` : ''}${suggestion ? `. ${suggestion}` : '.'}`;
  }
}

/**
 * Generate an operation-specific error message
 * 
 * @param operation Type of operation that failed
 * @param options Additional context for the error message
 * @returns Operation-specific error message
 */
export function getOperationErrorMessage(operation: OperationType, options: ErrorMessageOptions = {}): string {
  const { resource, resourceName, resourceId, details, suggestion, retry } = options;
  
  // Format resource description
  const resourceDesc = getResourceDescription(resource, resourceName, resourceId);
  
  // Base message based on operation
  let message = '';
  
  switch (operation) {
    case OperationType.FETCH:
      message = `Failed to retrieve ${resourceDesc}.`;
      break;
      
    case OperationType.CREATE:
      message = `Failed to create ${resourceDesc}.`;
      break;
      
    case OperationType.UPDATE:
      message = `Failed to update ${resourceDesc}.`;
      break;
      
    case OperationType.DELETE:
      message = `Failed to delete ${resourceDesc}.`;
      break;
      
    case OperationType.UPLOAD:
      message = `Failed to upload ${resourceDesc}.`;
      break;
      
    case OperationType.DOWNLOAD:
      message = `Failed to download ${resourceDesc}.`;
      break;
      
    case OperationType.PROCESS:
      message = `Failed to process ${resourceDesc}.`;
      break;
      
    case OperationType.AUTHENTICATE:
      message = `Authentication failed${resource ? ` for ${resourceDesc}` : ''}.`;
      break;
      
    case OperationType.AUTHORIZE:
      message = `Authorization failed${resource ? ` for ${resourceDesc}` : ''}.`;
      break;
      
    case OperationType.VALIDATE:
      message = `Validation failed${resource ? ` for ${resourceDesc}` : ''}.`;
      break;
      
    default:
      message = `Operation ${operation} failed${resource ? ` for ${resourceDesc}` : ''}.`;
  }
  
  // Add details if provided
  if (details) {
    message += ` ${details}`;
  }
  
  // Add suggestion if provided
  if (suggestion) {
    message += ` ${suggestion}`;
  }
  
  // Add retry suggestion if applicable
  if (retry) {
    message += ' Please try again.';
  }
  
  return message;
}
