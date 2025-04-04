/**
 * Protected Route Component
 * 
 * This component protects routes by checking authentication and permissions.
 * It ensures that only authenticated users with the required permissions can access protected routes.
 */

import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AUTH_EVENTS } from '../types/auth.types';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  permissions?: string[];
  roles?: string[];
  redirectPath?: string;
}

/**
 * Protected Route Component
 * Ensures that only authenticated users with the required permissions can access the route
 */
export function ProtectedRoute({ 
  children, 
  permissions = [], 
  roles = [], 
  redirectPath = '/login' 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, hasPermission, hasRole, refreshAuth } = useAuth();
  const location = useLocation();
  const [isVerifying, setIsVerifying] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  // Verify if the user has access to the route
  useEffect(() => {
    let mounted = true;
    
    const verifyAccess = async () => {
      // If not authenticated, no need to check permissions
      if (!isAuthenticated) {
        if (mounted) {
          setHasAccess(false);
          setIsVerifying(false);
        }
        return;
      }
      
      // If no permissions or roles required, grant access
      if (permissions.length === 0 && roles.length === 0) {
        if (mounted) {
          setHasAccess(true);
          setIsVerifying(false);
        }
        return;
      }
      
      // Check permissions
      let permissionAccess = permissions.length === 0;
      for (const permission of permissions) {
        if (hasPermission(permission)) {
          permissionAccess = true;
          break;
        }
      }
      
      // Check roles
      let roleAccess = roles.length === 0;
      for (const role of roles) {
        if (hasRole(role)) {
          roleAccess = true;
          break;
        }
      }
      
      // Grant access if either permission or role check passes
      const access = permissionAccess && roleAccess;
      
      if (mounted) {
        setHasAccess(access);
        setIsVerifying(false);
      }
    };
    
    // If still loading auth state, wait
    if (isLoading) {
      return;
    }
    
    // Verify access
    verifyAccess();
    
    // Listen for auth events that might affect route access
    const handleAuthEvent = () => {
      if (mounted) {
        verifyAccess();
      }
    };
    
    // Handle token refresh events specifically
    const handleTokenRefreshed = () => {
      console.log('[ROUTE] Token refreshed event received, re-verifying access');
      if (mounted) {
        // Small delay to ensure auth state is updated
        setTimeout(() => {
          verifyAccess();
        }, 100);
      }
    };
    
    // Set up event listeners
    window.addEventListener(AUTH_EVENTS.LOGIN_SUCCESS, handleAuthEvent);
    window.addEventListener(AUTH_EVENTS.LOGOUT, handleAuthEvent);
    window.addEventListener(AUTH_EVENTS.UNAUTHORIZED, handleAuthEvent);
    window.addEventListener(AUTH_EVENTS.FORBIDDEN, handleAuthEvent);
    window.addEventListener(AUTH_EVENTS.TOKEN_REFRESHED, handleTokenRefreshed);
    window.addEventListener('auth:token:refreshed', handleTokenRefreshed);

    return () => {
      mounted = false;
      window.removeEventListener(AUTH_EVENTS.LOGIN_SUCCESS, handleAuthEvent);
      window.removeEventListener(AUTH_EVENTS.LOGOUT, handleAuthEvent);
      window.removeEventListener(AUTH_EVENTS.UNAUTHORIZED, handleAuthEvent);
      window.removeEventListener(AUTH_EVENTS.FORBIDDEN, handleAuthEvent);
      window.removeEventListener(AUTH_EVENTS.TOKEN_REFRESHED, handleTokenRefreshed);
      window.removeEventListener('auth:token:refreshed', handleTokenRefreshed);
    };
  }, [isAuthenticated, isLoading, hasPermission, hasRole, permissions, roles]);

  // Ensure authentication is refreshed when the component mounts
  useEffect(() => {
    const ensureAuthentication = async () => {
      if (isAuthenticated) {
        // If already authenticated, still refresh in the background
        // to ensure the token is fresh
        try {
          console.log('[ROUTE] Refreshing authentication in the background');
          await refreshAuth();
        } catch (error) {
          console.error('[ROUTE] Error refreshing authentication:', error);
        }
      }
    };

    ensureAuthentication();
  }, [isAuthenticated, refreshAuth]);

  // Show loading state while verifying access
  if (isLoading || isVerifying) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <span className="text-muted-foreground">Verifying access...</span>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    // Include the current path as returnUrl
    const returnUrl = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`${redirectPath}?returnUrl=${returnUrl}`} replace />;
  }

  // If authenticated but doesn't have required permissions, show forbidden
  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h2>
        <p className="text-muted-foreground">
          You don't have permission to access this page.
        </p>
      </div>
    );
  }

  // If authenticated and has access, render the children
  return <>{children}</>;
}
