/**
 * useAuth Hook
 *
 * This hook provides state management and operations for auth.
 * Enhanced with better token refresh handling.
 */

import { useContext, useEffect, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import { AUTH_EVENTS } from '../constants/authEvents';

export function useAuth() {
  const context = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  // Refresh authentication
  const refreshAuth = useCallback(async (): Promise<boolean> => {
    try {
      console.log('[AUTH] Manually refreshing authentication');
      const refreshResult = await authService.refreshToken();
      
      if (refreshResult) {
        console.log('[AUTH] Token refreshed successfully');
        
        // Get current user after refresh
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          context.setUser(currentUser);
          context.setPermissions(currentUser.permissions || []);
          context.setIsAuthenticated(true);
          context.setError(null);
          
          // Dispatch token refreshed event
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent(AUTH_EVENTS.TOKEN_REFRESHED, {
              detail: { timestamp: new Date().toISOString() }
            }));
          }
          
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('[AUTH] Error refreshing authentication:', error);
      return false;
    }
  }, [context]);

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
            refreshAuth().catch(error => {
              console.error('[AUTH] Error refreshing auth:', error);
            });
          }, 100);
        }
      } catch (error) {
        console.error('Failed to parse auth state from session storage:', error);
        sessionStorage.removeItem('auth_state');
      }
    }
  }, [context.isAuthenticated, context.isLoading, context, refreshAuth]);

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

  // Set up event listeners for auth events
  useEffect(() => {
    // Handle unauthorized events
    const handleUnauthorized = () => {
      console.log('[AUTH] Unauthorized event received in useAuth, attempting refresh');
      refreshAuth().catch(() => {
        // If refresh fails, log out
        context.logout();
      });
    };
    
    // Add event listeners
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    
    // Cleanup event listeners on unmount
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [context, refreshAuth]);

  return {
    ...context,
    refreshAuth
  };
}
