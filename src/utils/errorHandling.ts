// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤

import { toast } from "@/components/ui/use-toast";

/**
 * Safely converts any value to a string representation for display
 * Handles objects, arrays, and other non-primitive types
 */
export const safeStringify = (value: unknown): string => {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch (error) {
      return '[Object]';
    }
  }
  
  return String(value);
};

/**
 * Shows an error toast with a formatted error message
 */
export const showErrorToast = (error: unknown, title = 'Something went wrong'): void => {
  let description: string;
  
  if (error instanceof Error) {
    description = error.message;
    
    // Handle specific React errors
    if (error.message.includes('Objects are not valid as a React child')) {
      description = 'Attempted to render an object directly in the UI. Please convert it to a string first.';
    }
  } else if (typeof error === 'string') {
    description = error;
  } else {
    description = safeStringify(error);
  }
  
  toast({
    variant: "destructive",
    title,
    description,
  });
};

/**
 * Global error handler for async functions
 * Usage: const result = await handleAsyncError(async () => { ... });
 */
export const handleAsyncError = async <T>(
  fn: () => Promise<T>,
  errorTitle = 'Operation failed'
): Promise<T | null> => {
  try {
    return await fn();
  } catch (error) {
    showErrorToast(error, errorTitle);
    console.error(error);
    return null;
  }
};
