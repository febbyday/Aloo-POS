/**
 * CSRF Token Hook
 * 
 * This hook provides functionality to manage CSRF tokens in the application.
 * It handles token refreshing and ensures tokens are available for API requests.
 */

import { useState, useEffect, useCallback } from 'react';
import { refreshCsrfToken, hasCsrfToken, getCsrfToken } from '../utils/csrfProtection';

/**
 * Hook for managing CSRF tokens
 * @returns Object with CSRF token state and functions
 */
export function useCsrfToken() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasToken, setHasToken] = useState<boolean>(hasCsrfToken());

  /**
   * Refresh the CSRF token
   * @returns Promise that resolves to true if token was refreshed successfully
   */
  const refresh = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const success = await refreshCsrfToken();
      setHasToken(hasCsrfToken());
      
      if (!success) {
        setError('Failed to refresh CSRF token');
      }
      
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error refreshing CSRF token';
      setError(errorMessage);
      console.error('Error refreshing CSRF token:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Ensure a CSRF token is available, refreshing if needed
   * @returns Promise that resolves to true if token is available
   */
  const ensureToken = useCallback(async (): Promise<boolean> => {
    if (hasCsrfToken()) {
      setHasToken(true);
      return true;
    }
    
    return await refresh();
  }, [refresh]);

  // Check for token on mount
  useEffect(() => {
    if (!hasCsrfToken()) {
      refresh();
    }
  }, [refresh]);

  return {
    hasToken,
    isLoading,
    error,
    refresh,
    ensureToken,
    getToken: getCsrfToken
  };
}

export default useCsrfToken;
