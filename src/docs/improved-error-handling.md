# Improved Error Handling Guide

This guide explains how to use the improved error handling utilities to create more specific and informative error messages throughout the application.

## Overview

The improved error handling system provides:

1. **Specific Error Messages**: Detailed, context-aware error messages that help users understand what went wrong
2. **Consistent Format**: Standardized error message format across the application
3. **Resource-Specific Handling**: Error messages tailored to specific resources (products, orders, etc.)
4. **Operation-Specific Handling**: Error messages tailored to specific operations (create, update, delete, etc.)
5. **Improved Validation Errors**: Field-specific validation error messages

## Error Message Utilities

### Basic Error Messages

The `error-messages.ts` utility provides functions for generating consistent error messages:

```typescript
import { 
  getApiErrorMessage, 
  getOperationErrorMessage, 
  getValidationErrorMessage,
  OperationType,
  ResourceType
} from '@/lib/error/error-messages';

// Get an API error message
const message = getApiErrorMessage(ApiErrorType.NOT_FOUND, {
  resource: ResourceType.PRODUCT,
  resourceName: 'Red T-Shirt'
});
// "The product "Red T-Shirt" could not be found."

// Get an operation error message
const message = getOperationErrorMessage(OperationType.UPDATE, {
  resource: ResourceType.ORDER,
  resourceId: '12345'
});
// "Failed to update order (ID: 12345)."

// Get a validation error message
const message = getValidationErrorMessage('email', {
  value: 'invalid-email'
});
// "Please enter a valid email address (invalid-email)."
```

## Enhanced API Error

The `enhanced-api-error.ts` utility provides an improved API error class with more context:

```typescript
import { 
  createEnhancedApiError, 
  EnhancedApiError 
} from '@/lib/api/enhanced-api-error';
import { OperationType, ResourceType } from '@/lib/error/error-messages';

try {
  // API call that might fail
  await api.updateProduct(productId, data);
} catch (error) {
  // Create enhanced error with context
  const enhancedError = createEnhancedApiError(error, {
    operation: OperationType.UPDATE,
    resource: ResourceType.PRODUCT,
    resourceId: productId,
    resourceName: data.name
  });
  
  // Get user-friendly message
  const userMessage = enhancedError.getUserFriendlyMessage();
  
  // Show toast with specific message
  toast.error('Update Failed', userMessage);
  
  // Log detailed error
  console.error('Product update error:', enhancedError.toDetailedObject());
}
```

## Operation Error Handler

The `operation-error-handler.ts` utility provides a simpler way to handle operation-specific errors:

```typescript
import { 
  handleOperationError, 
  createOperationErrorHandler,
  createResourceErrorHandlers
} from '@/lib/error/operation-error-handler';
import { OperationType, ResourceType } from '@/lib/error/error-messages';

// Handle a specific operation error
try {
  await api.createProduct(data);
} catch (error) {
  handleOperationError(error, {
    operation: OperationType.CREATE,
    resource: ResourceType.PRODUCT,
    resourceName: data.name
  });
  return null;
}

// Create a handler for a specific resource
const productErrorHandlers = createResourceErrorHandlers(ResourceType.PRODUCT);

// Use the resource-specific handlers
try {
  await api.updateProduct(productId, data);
} catch (error) {
  productErrorHandlers.handleUpdateError(error, {
    resourceName: data.name,
    resourceId: productId
  });
  return null;
}
```

## Validation Error Handler

The `validation-error-handler.ts` utility provides improved handling for validation errors:

```typescript
import { 
  handleValidationError,
  formatZodErrors,
  showValidationErrorToasts
} from '@/lib/validation/validation-error-handler';
import { ResourceType, OperationType } from '@/lib/error/error-messages';
import { z } from 'zod';

// Define a schema
const productSchema = z.object({
  name: z.string().min(3, 'Product name must be at least 3 characters'),
  price: z.number().positive('Price must be greater than 0'),
  category: z.string().min(1, 'Please select a category')
});

// Validate data
try {
  const validData = productSchema.parse(formData);
  return validData;
} catch (error) {
  // Handle validation error with improved messages
  const errors = handleValidationError(error, {
    resource: ResourceType.PRODUCT,
    operation: OperationType.CREATE,
    showToasts: true
  });
  
  // Return the errors to display in the form
  return { errors };
}
```

## Example: Product Service with Improved Error Handling

Here's a complete example of a product service with improved error handling:

```typescript
import { createResourceErrorHandlers } from '@/lib/error/operation-error-handler';
import { ResourceType } from '@/lib/error/error-messages';
import { handleValidationError } from '@/lib/validation/validation-error-handler';
import { z } from 'zod';

// Create product-specific error handlers
const productErrors = createResourceErrorHandlers(ResourceType.PRODUCT);

// Define validation schema
const productSchema = z.object({
  name: z.string().min(3, 'Product name must be at least 3 characters'),
  price: z.number().positive('Price must be greater than 0'),
  category: z.string().min(1, 'Please select a category')
});

export const productService = {
  async getProducts() {
    try {
      const response = await api.get('/products');
      return response.data;
    } catch (error) {
      productErrors.handleFetchError(error, {
        suggestion: 'Please refresh the page or try again later.'
      });
      return [];
    }
  },
  
  async getProductById(id: string) {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      productErrors.handleFetchError(error, {
        resourceId: id,
        suggestion: 'The product may have been deleted or moved.'
      });
      return null;
    }
  },
  
  async createProduct(data: unknown) {
    try {
      // Validate data first
      const validData = productSchema.parse(data);
      
      // Send to API
      const response = await api.post('/products', validData);
      
      // Show success message
      toast.success('Product Created', `Product "${validData.name}" was created successfully.`);
      
      return response.data;
    } catch (error) {
      // Check if it's a validation error
      if (error instanceof z.ZodError) {
        return { 
          success: false, 
          errors: handleValidationError(error, {
            resource: ResourceType.PRODUCT,
            operation: OperationType.CREATE
          })
        };
      }
      
      // Handle API error
      productErrors.handleCreateError(error, {
        resourceName: (data as any)?.name || 'product'
      });
      
      return { success: false };
    }
  }
};
```

## Best Practices

1. **Be Specific**: Include resource names and IDs in error messages when available
2. **Provide Context**: Include the operation that failed (create, update, etc.)
3. **Suggest Solutions**: When possible, suggest how to fix the error
4. **Use Consistent Format**: Follow the established error message format
5. **Handle Validation Separately**: Use the validation error handler for form validation errors
6. **Log Detailed Errors**: Log detailed error information for debugging
7. **Show User-Friendly Messages**: Only show user-friendly messages in the UI
