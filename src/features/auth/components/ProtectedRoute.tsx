/**
 * 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
 *
 * Protected Route Component
 *
 * This component ensures that routes are only accessible to authenticated users.
 * If a user is not authenticated, they will be redirected to the login page.
 */

import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { usePermissions } from '../hooks/usePermissions';
import { Loader2, ShieldAlert } from 'lucide-react';
import { AUTH_EVENTS } from '../constants/authEvents';
import { ProtectedRouteProps } from '../types/auth.types';

/**
 * Protected Route Component
 *
 * Wraps routes that should only be accessible to authenticated users
 * with optional permission or role-based access control.
 */
export function ProtectedRoute({
  children,
  permissions = [],
  roles = [],
  redirectPath = '/login'
}: ProtectedRouteProps) {
  const {
    isAuthenticated,
    isLoading,
    isDevelopmentMode
  } = useAuth();

  const { hasAnyPermission, hasAnyRole } = usePermissions();

  const location = useLocation();
  const [isVerifying, setIsVerifying] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  // Verify authentication and permissions
  useEffect(() => {
    // Flag to track if component is mounted
    let isMounted = true;
    
    // Verify user access to the protected route
    const verifyAccess = async () => {
      if (isLoading || !isMounted) return;

      // Development mode check - always grant access in development mode
      if (isDevelopmentMode) {
        console.log('[ROUTE] Development mode: Access automatically granted');
        setIsVerifying(false);
        setAccessDenied(false); // Make sure access isn't denied
        return;
      }

      setIsVerifying(true);

      try {
        console.log('[ROUTE] Verifying access for protected route');

        if (!isAuthenticated) {
          console.log('[ROUTE] User not authenticated, redirecting to login');
          setAccessDenied(true);
          return;
        }

        // Check permissions if specified
        if (permissions.length > 0 && !isLoading && isAuthenticated) {
          const hasAccess = hasAnyPermission(permissions);
          if (!hasAccess) {
            console.log('[ROUTE] User lacks required permissions:', permissions);
            setAccessDenied(true);
            setIsVerifying(false);
            return;
          }
        }

        // Check roles if specified
        if (roles.length > 0 && !isLoading && isAuthenticated) {
          const hasRequiredRole = hasAnyRole(roles);
          if (!hasRequiredRole) {
            console.log('[ROUTE] User lacks required roles:', roles);
            setAccessDenied(true);
            setIsVerifying(false);
            return;
          }
        }

        // All checks passed
        console.log('[ROUTE] Access granted to:', location.pathname);
        if (isMounted) {
          setAccessDenied(false);
          setIsVerifying(false);
        }
      } catch (error) {
        console.error('[ROUTE] Error verifying access:', error);
        if (isMounted) {
          setIsVerifying(false);
        }
      }
    };

    // Initial verification
    verifyAccess();

    // Event handlers
    const handleAuthEvent = () => {
      if (isMounted) {
        verifyAccess();
      }
    };

    const handleTokenRefreshed = () => {
      console.log('[ROUTE] Token refreshed event received, re-verifying access');
      if (isMounted) {
        // Use requestAnimationFrame to avoid setTimeout issues
        requestAnimationFrame(verifyAccess);
      }
    };

    // Set up event listeners
    window.addEventListener(AUTH_EVENTS.LOGIN_SUCCESS, handleAuthEvent);
    window.addEventListener(AUTH_EVENTS.LOGOUT, handleAuthEvent);
    window.addEventListener(AUTH_EVENTS.UNAUTHORIZED, handleAuthEvent);
    window.addEventListener(AUTH_EVENTS.FORBIDDEN, handleAuthEvent);
    window.addEventListener(AUTH_EVENTS.TOKEN_REFRESHED, handleTokenRefreshed);
    window.addEventListener('auth:token:refreshed', handleTokenRefreshed);

    // Clean up function - ensures no leaked listeners
    return () => {
      isMounted = false;
      window.removeEventListener(AUTH_EVENTS.LOGIN_SUCCESS, handleAuthEvent);
      window.removeEventListener(AUTH_EVENTS.LOGOUT, handleAuthEvent);
      window.removeEventListener(AUTH_EVENTS.UNAUTHORIZED, handleAuthEvent);
      window.removeEventListener(AUTH_EVENTS.FORBIDDEN, handleAuthEvent);
      window.removeEventListener(AUTH_EVENTS.TOKEN_REFRESHED, handleTokenRefreshed);
      window.removeEventListener('auth:token:refreshed', handleTokenRefreshed);
    };
  }, [
    isLoading,
    isAuthenticated,
    isDevelopmentMode,
    location.pathname,
    permissions,
    roles,
    hasAnyPermission,
    hasAnyRole
  ]);

  // Debug logging
  useEffect(() => {
    console.log('[ROUTE] Protected route state:', {
      isAuthenticated,
      isLoading,
      isVerifying,
      isDevelopmentMode,
      accessDenied,
      path: location.pathname,
      permissions,
      roles
    });
  }, [
    isAuthenticated,
    isLoading,
    isVerifying,
    isDevelopmentMode,
    accessDenied,
    location.pathname,
    permissions,
    roles
  ]);

  // Development mode bypass
  if (isDevelopmentMode) {
    // Development mode indicator component
    const DevelopmentModeIndicator = () => (
      <div className="fixed bottom-4 right-4 bg-yellow-500 text-black px-3 py-1.5 rounded-full
                    text-xs font-medium flex items-center shadow-md z-50 gap-1">
        <ShieldAlert className="w-3.5 h-3.5" />
        Auth Bypass Active
      </div>
    );

    // Log permissions and roles check in dev mode
    if ((permissions.length > 0 || roles.length > 0) && isDevelopmentMode) {
      const permissionMessage = permissions.length > 0
        ? `Permissions needed: ${permissions.join(', ')}`
        : '';

      const rolesMessage = roles.length > 0
        ? `Roles needed: ${roles.join(', ')}`
        : '';

      console.log(
        '[ROUTE] Development mode: Access requirements bypassed.',
        permissionMessage,
        rolesMessage
      );
    }

    // Return content with dev mode indicator
    return (
      <>
        {children}
        <DevelopmentModeIndicator />
      </>
    );
  }

  // Show loading state while verifying
  if (isLoading || isVerifying) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <span className="text-muted-foreground">Verifying authentication...</span>
      </div>
    );
  }

  // Redirect to login if not authenticated, but only in production mode
  if (!isAuthenticated && !import.meta.env.DEV) {
    // Prevent redirect loops by checking if we're already on the login page
    if (location.pathname !== redirectPath) {
      return <Navigate to={redirectPath} state={{ from: location.pathname }} replace />;
    }
  }

  // Show access denied page if user doesn't have required permissions or roles
  if (accessDenied) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="max-w-md p-6 bg-card rounded-lg shadow-md border border-border">
          <h1 className="text-2xl font-bold text-destructive mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-4">
            You don't have permission to access this page.
            Please contact your administrator if you believe this is an error.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
            >
              Go Back
            </button>
            <a
              href="/"
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
            >
              Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  // If all checks pass, render the children
  return <>{children}</>;
}