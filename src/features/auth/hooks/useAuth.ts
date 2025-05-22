/**
 * Use Auth Hook
 * 
 * Custom hook for accessing authentication context and functionality
 * throughout the application, including session management.
 */

import { useContext } from 'react';
import { AuthContext, AuthContextType } from '../context/AuthContext';

/**
 * useAuth hook
 * 
 * Provides access to all authentication-related state and functions
 * @returns Authentication context state and actions
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default useAuth;
