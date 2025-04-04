/**
 * Development Authentication Bypass Component
 * 
 * This component is only used in development mode to bypass authentication.
 * It automatically logs in a development user when the application starts.
 */

import { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

export function DevAuthBypass() {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // Only run in development mode
    if (!import.meta.env.DEV) return;

    // Check if we need to bypass authentication
    if (!isAuthenticated && !isLoading) {
      console.log('[DEV] Setting up development authentication bypass');
      
      // Set up mock authentication data
      localStorage.setItem('auth_token', 'dev-token');
      localStorage.setItem('auth_user', JSON.stringify({
        id: '1',
        username: 'dev_user',
        email: 'dev@example.com',
        fullName: 'Development User',
        firstName: 'Development',
        lastName: 'User',
        roles: ['Admin'],
        permissions: ['*'],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      }));
      
      // Force reload to apply the auth token
      window.location.reload();
    }
  }, [isAuthenticated, isLoading]);

  // This component doesn't render anything
  return null;
}

export default DevAuthBypass;
