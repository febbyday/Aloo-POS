/**
 * Development Authentication Wrapper
 *
 * This component ensures that authentication is bypassed in development mode.
 * It sets up mock authentication data and ensures all routes are accessible.
 */

import { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useLocation, useNavigate } from 'react-router-dom';

export function DevAuthWrapper() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Set up mock authentication data in development mode
  useEffect(() => {
    if (!import.meta.env.DEV) return;

    // Only run this effect once on initial mount
    const hasRun = sessionStorage.getItem('dev_auth_setup_complete');
    if (hasRun === 'true') return;

    console.log('[DEV] DevAuthWrapper running, path:', location.pathname);
    console.log('[DEV] Auth status:', { isAuthenticated, isLoading });

    // If we're on the login page and in development mode, redirect to dashboard
    if (location.pathname === '/login') {
      console.log('[DEV] Redirecting from login page to dashboard');
      navigate('/', { replace: true });
      return;
    }

    // If not authenticated in development mode, set up mock auth data
    if (!isAuthenticated && !isLoading) {
      console.log('[DEV] Setting up mock authentication data');

      // Set localStorage items for auth
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

      // Set sessionStorage for auth state
      sessionStorage.setItem('auth_state', JSON.stringify({
        isAuthenticated: true,
        user: {
          id: '1',
          username: 'dev_user',
          email: 'dev@example.com',
          fullName: 'Development User',
          firstName: 'Development',
          lastName: 'User',
          roles: ['Admin'],
          permissions: ['*'],
          isActive: true
        },
        permissions: ['*']
      }));

      // Mark that we've run this setup
      sessionStorage.setItem('dev_auth_setup_complete', 'true');

      // Force reload to apply the auth data, but only if we're not already in an infinite loop
      const reloadCount = parseInt(sessionStorage.getItem('dev_auth_reload_count') || '0');
      if (reloadCount < 2) { // Limit to max 2 reloads
        sessionStorage.setItem('dev_auth_reload_count', (reloadCount + 1).toString());
        window.location.reload();
      } else {
        console.warn('[DEV] Prevented reload loop. Authentication may not be fully set up.');
      }
    }
  }, []); // Empty dependency array to run only once

  // This component doesn't render anything
  return null;
}

export default DevAuthWrapper;
