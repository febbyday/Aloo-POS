/**
 * Operation Error Handler
 * 
 * Utilities for handling operation-specific errors with detailed, helpful error messages.
 */

import { toast } from '@/lib/toast';
import { OperationType, ResourceType, getOperationErrorMessage } from './error-messages';
import { createEnhancedApiError, EnhancedApiError } from '../api/enhanced-api-error';
import { ApiErrorType } from '../api/error-handler';

/**
 * Options for handling operation errors
 */
interface OperationErrorOptions {
  operation: OperationType;
  resource?: ResourceType;
  resourceId?: string;
  resourceName?: string;
  details?: string;
  suggestion?: string;
  retry?: boolean;
  showToast?: boolean;
  toastTitle?: string;
  logError?: boolean;
}

/**
 * Handle an error for a specific operation
 * 
 * @param error Original error
 * @param options Operation context and handling options
 * @returns Enhanced API error
 */
export function handleOperationError(
  error: unknown,
  options: OperationErrorOptions
): EnhancedApiError {
  const {
    operation,
    resource,
    resourceId,
    resourceName,
    details,
    suggestion,
    retry = true,
    showToast = true,
    toastTitle,
    logError = true
  } = options;
  
  // Create enhanced error with operation context
  const enhancedError = createEnhancedApiError(error, {
    operation,
    resource,
    resourceId,
    resourceName,
    suggestion,
    retryable: retry
  });
  
  // Generate a user-friendly message
  const userMessage = enhancedError.getUserFriendlyMessage();
  
  // Show toast notification if requested
  if (showToast) {
    const title = toastTitle || getOperationToastTitle(operation, enhancedError.type);
    toast.error(title, userMessage);
  }
  
  // Log error if requested
  if (logError) {
    console.error(
      `Operation Error [${operation}]${resource ? ` [${resource}]` : ''}:`,
      enhancedError.toDetailedObject()
    );
  }
  
  return enhancedError;
}

/**
 * Get a toast title for an operation error
 */
function getOperationToastTitle(operation: OperationType, errorType: ApiErrorType): string {
  switch (operation) {
    case OperationType.FETCH:
      return 'Failed to Load';
    case OperationType.CREATE:
      return 'Failed to Create';
    case OperationType.UPDATE:
      return 'Failed to Update';
    case OperationType.DELETE:
      return 'Failed to Delete';
    case OperationType.UPLOAD:
      return 'Upload Failed';
    case OperationType.DOWNLOAD:
      return 'Download Failed';
    case OperationType.PROCESS:
      return 'Processing Failed';
    case OperationType.AUTHENTICATE:
      return 'Authentication Failed';
    case OperationType.AUTHORIZE:
      return 'Authorization Failed';
    case OperationType.VALIDATE:
      return 'Validation Failed';
    case OperationType.CONNECT:
      return 'Connection Failed';
    case OperationType.SYNC:
      return 'Sync Failed';
    case OperationType.IMPORT:
      return 'Import Failed';
    case OperationType.EXPORT:
      return 'Export Failed';
    case OperationType.SEARCH:
      return 'Search Failed';
    case OperationType.CALCULATE:
      return 'Calculation Failed';
    case OperationType.GENERATE:
      return 'Generation Failed';
    default:
      return 'Operation Failed';
  }
}

/**
 * Create a handler for a specific operation and resource
 * 
 * @param defaultOptions Default options for the handler
 * @returns Operation-specific error handler
 */
export function createOperationErrorHandler(
  defaultOptions: Omit<OperationErrorOptions, 'operation'> & { operation?: OperationType }
) {
  return function handleError(
    error: unknown,
    operationOrOptions: OperationType | Partial<OperationErrorOptions>
  ): EnhancedApiError {
    // Determine if first argument is operation type or options
    const isOperationType = typeof operationOrOptions === 'string';
    
    // Merge options
    const options: OperationErrorOptions = {
      ...defaultOptions,
      ...(isOperationType 
        ? { operation: operationOrOptions as OperationType }
        : operationOrOptions as Partial<OperationErrorOptions>)
    };
    
    // Ensure operation is defined
    if (!options.operation) {
      throw new Error('Operation type is required for error handling');
    }
    
    return handleOperationError(error, options);
  };
}

/**
 * Create resource-specific error handlers
 * 
 * @param resource Resource type
 * @param resourceName Optional resource name
 * @returns Object with operation-specific error handlers
 */
export function createResourceErrorHandlers(
  resource: ResourceType,
  resourceName?: string
) {
  const baseOptions = { resource, resourceName };
  
  return {
    handleFetchError: (error: unknown, options: Partial<OperationErrorOptions> = {}) => 
      handleOperationError(error, { ...baseOptions, operation: OperationType.FETCH, ...options }),
      
    handleCreateError: (error: unknown, options: Partial<OperationErrorOptions> = {}) => 
      handleOperationError(error, { ...baseOptions, operation: OperationType.CREATE, ...options }),
      
    handleUpdateError: (error: unknown, options: Partial<OperationErrorOptions> = {}) => 
      handleOperationError(error, { ...baseOptions, operation: OperationType.UPDATE, ...options }),
      
    handleDeleteError: (error: unknown, options: Partial<OperationErrorOptions> = {}) => 
      handleOperationError(error, { ...baseOptions, operation: OperationType.DELETE, ...options }),
      
    handleUploadError: (error: unknown, options: Partial<OperationErrorOptions> = {}) => 
      handleOperationError(error, { ...baseOptions, operation: OperationType.UPLOAD, ...options }),
      
    handleDownloadError: (error: unknown, options: Partial<OperationErrorOptions> = {}) => 
      handleOperationError(error, { ...baseOptions, operation: OperationType.DOWNLOAD, ...options }),
      
    handleProcessError: (error: unknown, options: Partial<OperationErrorOptions> = {}) => 
      handleOperationError(error, { ...baseOptions, operation: OperationType.PROCESS, ...options }),
      
    handleSearchError: (error: unknown, options: Partial<OperationErrorOptions> = {}) => 
      handleOperationError(error, { ...baseOptions, operation: OperationType.SEARCH, ...options }),
  };
}
