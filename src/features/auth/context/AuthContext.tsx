/**
 * 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
 *
 * Auth Context
 *
 * This context provides state management for the auth feature.
 * Enhanced with better token refresh handling.
 */

import { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, LoginCredentials, AuthContextState, AuthContextActions } from '../types/auth.types';
import { authService } from '../services/authService';
import { AUTH_CONFIG } from '../config/authConfig';
import { AUTH_EVENTS } from '../constants/authEvents';

// Define context type with state and actions
export type AuthContextType = AuthContextState & AuthContextActions;

// Default context state
const defaultContextState: AuthContextType = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  permissions: [],
  isDevelopmentMode: import.meta.env.MODE === 'development',
  isBypassEnabled: import.meta.env.MODE === 'development' && AUTH_CONFIG.DEV_MODE.BYPASS_AUTH,
  login: async () => ({ success: false, error: 'Auth context not initialized' }),
  logout: async () => {},
  hasPermission: () => false,
  hasRole: () => false,
  refreshAuth: async () => false,
  restoreAuth: () => {},
  clearAuthError: () => {}
};

// Create the context
export const AuthContext = createContext<AuthContextType>(defaultContextState);

export interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Auth Provider Component
 * Manages authentication state and provides auth-related functions
 */
export function AuthProvider({ children }: AuthProviderProps) {
  // State
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  
  // Environment flags
  const isDevelopmentMode = import.meta.env.MODE === 'development';
  const isBypassEnabled = isDevelopmentMode && AUTH_CONFIG.DEV_MODE.BYPASS_AUTH;

  // Clear auth error
  const clearAuthError = useCallback(() => {
    setError(null);
  }, []);

  // Check if user has a specific permission
  const hasPermission = useCallback((permission: string): boolean => {
    if (!permissions || permissions.length === 0) return false;
    
    // Check for wildcard permission
    if (permissions.includes('*')) return true;
    
    // Check for specific permission
    return permissions.includes(permission);
  }, [permissions]);

  // Check if user has a specific role
  const hasRole = useCallback((role: string): boolean => {
    if (!user || !user.roles || user.roles.length === 0) return false;
    return user.roles.includes(role);
  }, [user]);

  // Login function
  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setError(null);
      const result = await authService.login(credentials);
      
      if (result.success && result.user) {
        setUser(result.user);
        setPermissions(result.user.permissions || []);
        setIsAuthenticated(true);
        
        // Dispatch login success event
        window.dispatchEvent(new CustomEvent(AUTH_EVENTS.LOGIN_SUCCESS, {
          detail: { data: result.user }
        }));
        
        return { success: true };
      } else {
        setError(result.error || 'Login failed');
        
        // Dispatch login failure event
        window.dispatchEvent(new CustomEvent(AUTH_EVENTS.LOGIN_FAILURE, {
          detail: { error: result.error }
        }));
        
        return { success: false, error: result.error };
      }
    } catch (error: any) {
      const errorMessage = error.message || 'An unexpected error occurred during login';
      setError(errorMessage);
      
      // Dispatch auth error event
      window.dispatchEvent(new CustomEvent(AUTH_EVENTS.AUTH_ERROR, {
        detail: { data: { message: errorMessage } }
      }));
      
      return { success: false, error: errorMessage };
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Always clear local state regardless of API success
      setUser(null);
      setPermissions([]);
      setIsAuthenticated(false);
      setError(null);
      
      // Dispatch logout event
      window.dispatchEvent(new CustomEvent(AUTH_EVENTS.LOGOUT));
    }
  }, []);

  // Refresh authentication
  const refreshAuth = useCallback(async (): Promise<boolean> => {
    try {
      console.log('[AUTH] Refreshing authentication');
      const refreshResult = await authService.refreshToken();
      
      if (refreshResult) {
        console.log('[AUTH] Token refreshed successfully');
        
        // Get current user after refresh
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          setPermissions(currentUser.permissions || []);
          setIsAuthenticated(true);
          setError(null);
          
          // Dispatch token refreshed event
          window.dispatchEvent(new CustomEvent(AUTH_EVENTS.TOKEN_REFRESHED, {
            detail: { timestamp: new Date().toISOString() }
          }));
          
          return true;
        }
      } else {
        console.log('[AUTH] Token refresh failed');
      }
      
      return false;
    } catch (error) {
      console.error('[AUTH] Error refreshing authentication:', error);
      return false;
    }
  }, []);

  // Restore auth state (used when recovering from session storage)
  const restoreAuth = useCallback((authData: { isAuthenticated: boolean; user: User | null; permissions: string[] }) => {
    if (authData.isAuthenticated && authData.user) {
      setUser(authData.user);
      setPermissions(authData.permissions || []);
      setIsAuthenticated(true);
    }
  }, []);

  // Initialize auth state on component mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Initialize auth service (if the method exists)
        if (typeof authService.init === 'function') {
          authService.init();
        }
        
        // In bypass mode, use default user
        if (isBypassEnabled) {
          setUser(AUTH_CONFIG.DEV_MODE.DEFAULT_USER);
          setPermissions(AUTH_CONFIG.DEV_MODE.DEFAULT_USER.permissions);
          setIsAuthenticated(true);
          setIsLoading(false);
          return;
        }
        
        // Check existing authentication
        const isUserAuthenticated = authService.isAuthenticated();
        if (isUserAuthenticated) {
          const currentUser = authService.getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
            setPermissions(currentUser.permissions || []);
            setIsAuthenticated(true);
          }
        } else {
          // No valid session, handle accordingly
          setUser(null);
          setPermissions([]);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('[AUTH] Auth initialization error:', error);
        setUser(null);
        setPermissions([]);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    initAuth();
    
    // Set up auth event listeners
    const handleLoginSuccess = (event: Event) => {
      const customEvent = event as CustomEvent;
      const userData = customEvent.detail?.data as User;
      if (userData) {
        setUser(userData);
        setPermissions(userData.permissions || []);
        setIsAuthenticated(true);
        setError(null);
      }
    };
    
    const handleLogout = () => {
      setUser(null);
      setPermissions([]);
      setIsAuthenticated(false);
    };
    
    const handleAuthError = (event: Event) => {
      const customEvent = event as CustomEvent;
      const errorMessage = customEvent.detail?.data?.message || 'Authentication error';
      setError(errorMessage);
    };
    
    const handleTokenRefreshed = async (event: Event) => {
      console.log('[AUTH] Token refreshed event received');
      try {
        // Refresh user data after token refresh
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          setPermissions(currentUser.permissions || []);
          setIsAuthenticated(true);
          setError(null);
        } else {
          // Try to fetch current user from server
          const user = await authService.fetchCurrentUser();
          setUser(user);
          setPermissions(user.permissions || []);
          setIsAuthenticated(true);
          setError(null);
        }
      } catch (error) {
        console.error('[AUTH] Error handling token refresh:', error);
      }
    };
    
    const handleUnauthorized = () => {
      console.log('[AUTH] Unauthorized event received, attempting refresh');
      // Try to refresh the token
      authService.refreshToken().catch(() => {
        // If refresh fails, log out
        authService.logout();
      });
    };
    
    // Add event listeners
    window.addEventListener(AUTH_EVENTS.LOGIN_SUCCESS, handleLoginSuccess);
    window.addEventListener(AUTH_EVENTS.LOGOUT, handleLogout);
    window.addEventListener(AUTH_EVENTS.AUTH_ERROR, handleAuthError);
    window.addEventListener(AUTH_EVENTS.TOKEN_REFRESHED, handleTokenRefreshed);
    window.addEventListener('auth:token:refreshed', handleTokenRefreshed);
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    
    // Cleanup event listeners on unmount
    return () => {
      window.removeEventListener(AUTH_EVENTS.LOGIN_SUCCESS, handleLoginSuccess);
      window.removeEventListener(AUTH_EVENTS.LOGOUT, handleLogout);
      window.removeEventListener(AUTH_EVENTS.AUTH_ERROR, handleAuthError);
      window.removeEventListener(AUTH_EVENTS.TOKEN_REFRESHED, handleTokenRefreshed);
      window.removeEventListener('auth:token:refreshed', handleTokenRefreshed);
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [isBypassEnabled]);

  // Context value
  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    error,
    permissions,
    isDevelopmentMode,
    isBypassEnabled,
    login,
    logout,
    hasPermission,
    hasRole,
    refreshAuth,
    restoreAuth,
    clearAuthError
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}
