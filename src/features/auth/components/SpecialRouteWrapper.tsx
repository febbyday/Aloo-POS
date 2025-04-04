/**
 * Special Route Wrapper
 * 
 * This component provides a wrapper for routes that have authentication issues
 * in development mode, specifically the users, roles, and permissions pages.
 * It ensures these routes work correctly with the authentication bypass.
 */

import { useEffect, ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface SpecialRouteWrapperProps {
  children: ReactNode;
}

export function SpecialRouteWrapper({ children }: SpecialRouteWrapperProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Check if this is a problematic route
  const isProblematicRoute = 
    location.pathname === '/users' || 
    location.pathname === '/roles' || 
    location.pathname.startsWith('/permissions/');

  // Set up authentication for problematic routes
  useEffect(() => {
    // Only run in development mode and for problematic routes
    if (!import.meta.env.DEV || !isProblematicRoute) return;

    // Check if we've already handled this route
    const routeKey = `route_handled_${location.pathname.replace(/\//g, '_')}`;
    if (sessionStorage.getItem(routeKey) === 'true') return;

    console.log(`[DEV] SpecialRouteWrapper handling problematic route: ${location.pathname}`);

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
      
      // Reload the page once to apply auth, but prevent infinite loops
      const reloadCount = parseInt(sessionStorage.getItem('special_route_reload_count') || '0');
      if (reloadCount < 1) { // Only reload once
        sessionStorage.setItem('special_route_reload_count', '1');
        window.location.reload();
      }
    }
  }, [isAuthenticated, isLoading, isProblematicRoute, location.pathname]);

  // Render children
  return <>{children}</>;
}

export default SpecialRouteWrapper;
