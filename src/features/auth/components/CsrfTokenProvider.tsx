/**
 * CSRF Token Provider
 * 
 * This component provides CSRF token functionality to the application.
 * It ensures that CSRF tokens are available for API requests and handles token refreshing.
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { useCsrfToken } from '../hooks/useCsrfToken';

// Define the context type
interface CsrfTokenContextType {
  hasToken: boolean;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<boolean>;
  ensureToken: () => Promise<boolean>;
  getToken: () => string | null;
}

// Create the context with a default value
const CsrfTokenContext = createContext<CsrfTokenContextType | undefined>(undefined);

// Props for the provider component
interface CsrfTokenProviderProps {
  children: ReactNode;
}

/**
 * CSRF Token Provider Component
 * Provides CSRF token functionality to child components
 */
export function CsrfTokenProvider({ children }: CsrfTokenProviderProps) {
  const csrfToken = useCsrfToken();
  
  return (
    <CsrfTokenContext.Provider value={csrfToken}>
      {children}
    </CsrfTokenContext.Provider>
  );
}

/**
 * Hook to use the CSRF token context
 * @returns CSRF token context
 */
export function useCsrfTokenContext(): CsrfTokenContextType {
  const context = useContext(CsrfTokenContext);
  
  if (context === undefined) {
    throw new Error('useCsrfTokenContext must be used within a CsrfTokenProvider');
  }
  
  return context;
}

export default CsrfTokenProvider;
