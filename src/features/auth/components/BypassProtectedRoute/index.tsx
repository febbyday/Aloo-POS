/**
 * Development Bypass Protected Route Component
 *
 * This component is a special version of the ProtectedRoute that allows
 * for bypassing authentication checks in development mode.
 * DO NOT USE IN PRODUCTION - FOR DEVELOPMENT PURPOSES ONLY
 */

import { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

/**
 * Protected Route Props
 */
export interface ProtectedRouteProps {
  /** The children components to render */
  children?: ReactNode;
  
  /** Permissions required to access the route */
  permissions?: string[];
  
  /** Roles required to access the route */
  roles?: string[];
  
  /** Path to redirect to if user is not authenticated */
  redirectPath?: string;
}

/**
 * Development Bypass Protected Route
 * 
 * This provides no actual protection and allows any route to be accessed,
 * even without authentication. Use only for development when backend might not be available.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  // For logging purposes only
  if (!isAuthenticated && !isLoading) {
    console.info('[DEV MODE] Protected route would normally require authentication, but auth check is bypassed in development.');
  }

  // Simply render children or the Outlet without any checks
  return children ? <>{children}</> : <Outlet />;
}

export default ProtectedRoute;
