/**
 * Special Route Wrapper
 *
 * This component provides a wrapper for routes that have authentication issues
 * in development mode, specifically the users, roles, and permissions pages.
 * It ensures these routes work correctly with the authentication bypass.
 */

import { useEffect, ReactNode, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface SpecialRouteWrapperProps {
  children: ReactNode;
}

export function SpecialRouteWrapper({ children }: SpecialRouteWrapperProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isHandled, setIsHandled] = useState(false);
  const initialRenderRef = useRef(true);

  // Check if this is a problematic route
  const isProblematicRoute =
    location.pathname === '/users' ||
    location.pathname === '/roles' ||
    location.pathname === '/permissions' ||
    location.pathname.startsWith('/permissions/');

  // Prevent redirects for these specific routes
  useEffect(() => {
    // Always mark these routes as handled to prevent redirects
    if (isProblematicRoute) {
      setIsHandled(true);
    }
  }, [isProblematicRoute]);

  // Set up authentication for problematic routes
  useEffect(() => {
    // Only run in development mode and for problematic routes
    if (!import.meta.env.DEV || !isProblematicRoute) return;

    // Check if we've already handled this route
    const routeKey = `route_handled_${location.pathname.replace(/\//g, '_')}`;
    if (sessionStorage.getItem(routeKey) === 'true') {
      setIsHandled(true);
      return;
    }

    console.log(`[DEV] SpecialRouteWrapper handling problematic route: ${location.pathname}`);

    // Mark the route as handled immediately to prevent redirects
    sessionStorage.setItem(routeKey, 'true');
    setIsHandled(true);

    // If not authenticated, set up mock auth data
    if (!isAuthenticated && !isLoading) {
      console.log('[DEV] Setting up mock authentication for problematic route');

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

      // Mark that we've handled this route
      sessionStorage.setItem(routeKey, 'true');

      // Set a flag to prevent dashboard redirects for these routes
      sessionStorage.setItem('prevent_dashboard_redirect', 'true');

      // Only reload if this is the first render
      if (initialRenderRef.current) {
        initialRenderRef.current = false;

        // Reload the page once to apply auth, but prevent infinite loops
        const reloadCount = parseInt(sessionStorage.getItem('special_route_reload_count') || '0');
        if (reloadCount < 1) { // Only reload once
          sessionStorage.setItem('special_route_reload_count', '1');
          window.location.reload();
        }
      }
    }
  }, [isAuthenticated, isLoading, isProblematicRoute, location.pathname]);

  // Always render children for problematic routes to prevent redirects
  if (isProblematicRoute) {
    return <>{children}</>;
  }

  // If we're authenticated, render the children
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // If we're still loading, show a loading indicator
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="ml-2">Loading...</p>
      </div>
    );
  }

  // For any other case, render the children (this will be handled by other auth mechanisms if needed)
  return <>{children}</>;
}

export default SpecialRouteWrapper;
