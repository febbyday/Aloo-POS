import { useState, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';

/**
 * Interface for the useDataOperation hook parameters
 */
export interface DataOperationOptions<TData, TParams extends any[]> {
  /** The operation function that will be executed */
  operation: (...params: TParams) => Promise<TData>;
  
  /** Optional error handler function */
  onError?: (error: Error) => void;
  
  /** Optional success handler function */
  onSuccess?: (data: TData) => void;
  
  /** Whether to show a toast on success */
  showSuccessToast?: boolean;
  
  /** Success toast title */
  successTitle?: string;
  
  /** Success toast message */
  successMessage?: string;
  
  /** Whether to show a toast on error */
  showErrorToast?: boolean;
  
  /** Error toast title */
  errorTitle?: string;
  
  /** Whether to rethrow the error */
  rethrow?: boolean;
}

/**
 * Interface for the return value of the useDataOperation hook
 */
export interface DataOperationResult<TData, TParams extends any[]> {
  /** Function to execute the operation */
  execute: (...params: TParams) => Promise<TData | null>;
  
  /** Whether the operation is currently loading */
  loading: boolean;
  
  /** The error object, if an error occurred */
  error: Error | null;
  
  /** The data returned by the operation */
  data: TData | null;
  
  /** Function to reset the state */
  reset: () => void;
}

/**
 * Hook for handling data operations with consistent loading, error, and success states
 * 
 * This hook provides a standardized way to handle async data operations
 * throughout the application, with built-in error handling, loading states,
 * and success notifications.
 * 
 * @example
 * const { execute, loading, error } = useDataOperation({
 *   operation: api.fetchUserData,
 *   onSuccess: (data) => console.log('Data loaded', data),
 *   showSuccessToast: true,
 *   successMessage: 'User data loaded successfully'
 * });
 * 
 * // Later in your component
 * useEffect(() => {
 *   execute(userId);
 * }, [userId, execute]);
 * 
 * if (loading) return <Spinner />;
 * if (error) return <ErrorDisplay error={error} />;
 */
export function useDataOperation<TData, TParams extends any[]>({
  operation,
  onError,
  onSuccess,
  showSuccessToast = false,
  successTitle = 'Success',
  successMessage = 'Operation completed successfully',
  showErrorToast = true,
  errorTitle = 'Error',
  rethrow = false,
}: DataOperationOptions<TData, TParams>): DataOperationResult<TData, TParams> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<TData | null>(null);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  const execute = useCallback(
    async (...params: TParams): Promise<TData | null> => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await operation(...params);
        setData(result);
        setLoading(false);
        
        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess(result);
        }
        
        // Show success toast if enabled
        if (showSuccessToast) {
          toast({
            title: successTitle,
            description: successMessage,
          });
        }
        
        return result;
      } catch (err) {
        setLoading(false);
        
        // Convert to Error object if needed
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        
        // Call onError callback if provided
        if (onError) {
          onError(error);
        }
        
        // Show error toast if enabled
        if (showErrorToast) {
          toast({
            title: errorTitle,
            description: error.message,
            variant: 'destructive',
          });
        }
        
        // Rethrow the error if needed
        if (rethrow) {
          throw error;
        }
        
        return null;
      }
    },
    [
      operation,
      onError,
      onSuccess,
      showSuccessToast,
      successTitle,
      successMessage,
      showErrorToast,
      errorTitle,
      rethrow,
    ]
  );

  return {
    execute,
    loading,
    error,
    data,
    reset,
  };
}

/**
 * Simplified version of useDataOperation with sensible defaults
 */
export function useSimpleDataOperation<TData, TParams extends any[]>(
  operation: (...params: TParams) => Promise<TData>
): DataOperationResult<TData, TParams> {
  return useDataOperation({ operation });
} 