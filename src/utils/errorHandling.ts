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
export const showErrorToast = async (error: unknown, title = 'Something went wrong'): Promise<void> => {
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

  try {
    // Dynamically import the toast service to avoid circular dependencies
    const { ToastService } = await import('@/lib/toast');
    ToastService.error(title, description);
  } catch (toastError) {
    // If there's an error showing the toast, just log it
    console.error('Error showing toast:', toastError);
    console.error('Original error:', error);
  }
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
    // Log the error first
    console.error(error);

    // Show toast notification
    await showErrorToast(error, errorTitle);

    return null;
  }
};
