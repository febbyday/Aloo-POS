/**
 * useAuth Hook
 *
 * This hook provides access to the authentication context.
 * It handles authentication state, user data, and permissions.
 */

import { useContext, useEffect, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import { AUTH_EVENTS } from '../types/auth.types';

/**
 * useAuth Hook
 * @returns Authentication context with additional navigation helpers
 */
export function useAuth() {
  const context = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  // Navigate to login page with return URL
  const navigateToLogin = useCallback((returnUrl?: string) => {
    const currentPath = location.pathname + location.search;
    const redirectPath = returnUrl || currentPath;

    // Only add returnUrl if it's not the login page itself
    const loginPath = redirectPath && !redirectPath.includes('/login')
      ? `/login?returnUrl=${encodeURIComponent(redirectPath)}`
      : '/login';

    navigate(loginPath);
  }, [navigate, location]);

  // Navigate after successful login
  const navigateAfterLogin = useCallback(() => {
    const params = new URLSearchParams(location.search);
    const returnUrl = params.get('returnUrl');

    // Check if we should prevent dashboard redirect (for special routes)
    const preventDashboardRedirect = sessionStorage.getItem('prevent_dashboard_redirect') === 'true';

    // Check if we're on a special route that should not redirect
    const isSpecialRoute =
      location.pathname === '/roles' ||
      location.pathname === '/permissions' ||
      location.pathname.startsWith('/permissions/');

    if (returnUrl) {
      // Decode the return URL and navigate to it
      navigate(decodeURIComponent(returnUrl));
    } else if (preventDashboardRedirect || isSpecialRoute) {
      // Don't redirect if we're on a special route or have the prevent flag
      console.log('[AUTH] Preventing dashboard redirect for special route:', location.pathname);
      // Clear the flag after using it
      if (preventDashboardRedirect) {
        sessionStorage.removeItem('prevent_dashboard_redirect');
      }
    } else {
      // Default navigation to dashboard
      navigate('/dashboard');
    }
  }, [navigate, location]);

  // Handle unauthorized events
  useEffect(() => {
    const handleUnauthorized = (event: Event) => {
      // Only redirect to login if we're not already on the login page
      if (!location.pathname.includes('/login')) {
        console.log('[AUTH] Unauthorized event received in useAuth, redirecting to login');
        navigateToLogin();
      }
    };

    // Add event listener
    window.addEventListener(AUTH_EVENTS.UNAUTHORIZED, handleUnauthorized);
    window.addEventListener(AUTH_EVENTS.SESSION_EXPIRED, handleUnauthorized);

    // Cleanup event listener on unmount
    return () => {
      window.removeEventListener(AUTH_EVENTS.UNAUTHORIZED, handleUnauthorized);
      window.removeEventListener(AUTH_EVENTS.SESSION_EXPIRED, handleUnauthorized);
    };
  }, [navigateToLogin, location.pathname]);

  // Persist auth state in sessionStorage to prevent loss on page refresh
  useEffect(() => {
    const persistedAuth = sessionStorage.getItem('auth_state');
    if (persistedAuth && !context.isAuthenticated && !context.isLoading) {
      try {
        const authData = JSON.parse(persistedAuth);
        // Make sure we have all the required properties
        if (authData && typeof authData.isAuthenticated === 'boolean') {
          console.log('[AUTH] Restoring auth state from session storage');
          context.restoreAuth(authData);

          // Also refresh auth in the background to ensure it's still valid
          setTimeout(() => {
            context.refreshAuth().catch(error => {
              console.error('[AUTH] Error refreshing auth:', error);
            });
          }, 100);
        }
      } catch (error) {
        console.error('Failed to parse auth state from session storage:', error);
        sessionStorage.removeItem('auth_state');
      }
    }
  }, [context.isAuthenticated, context.isLoading, context]);

  // Update persisted state when auth changes
  useEffect(() => {
    if (context.isAuthenticated) {
      sessionStorage.setItem('auth_state', JSON.stringify({
        isAuthenticated: true,
        user: context.user,
        permissions: context.permissions
      }));
    } else {
      sessionStorage.removeItem('auth_state');
    }
  }, [context.isAuthenticated, context.user, context.permissions]);

  // Return the context with additional navigation helpers
  return {
    ...context,
    navigateToLogin,
    navigateAfterLogin
  };
}
