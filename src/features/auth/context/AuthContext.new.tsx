/**
 * Auth Context
 *
 * This context provides state management for the auth feature.
 * It manages authentication state, user data, and permissions.
 */

import { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, LoginCredentials, AuthContextState, AuthContextActions, AUTH_EVENTS } from '../types/auth.types';
import { authService } from '../services/authService';
import { AUTH_CONFIG } from '../config/authConfig';

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
        
        // Persist auth state in session storage
        sessionStorage.setItem('auth_state', JSON.stringify({
          isAuthenticated: true,
          user: result.user,
          permissions: result.user.permissions || []
        }));
        
        return { success: true };
      } else {
        setError(result.error || 'Login failed');
        return { success: false, error: result.error };
      }
    } catch (error: any) {
      const errorMessage = error.message || 'An unexpected error occurred during login';
      setError(errorMessage);
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
      
      // Clear session storage
      sessionStorage.removeItem('auth_state');
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
          
          // Update session storage
          sessionStorage.setItem('auth_state', JSON.stringify({
            isAuthenticated: true,
            user: currentUser,
            permissions: currentUser.permissions || []
          }));
          
          return true;
        }
      } else {
        console.log('[AUTH] Token refresh failed');
        
        // Try to fetch current user as a fallback
        const currentUser = await authService.fetchCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          setPermissions(currentUser.permissions || []);
          setIsAuthenticated(true);
          setError(null);
          
          // Update session storage
          sessionStorage.setItem('auth_state', JSON.stringify({
            isAuthenticated: true,
            user: currentUser,
            permissions: currentUser.permissions || []
          }));
          
          return true;
        }
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
      
      // Update session storage
      sessionStorage.setItem('auth_state', JSON.stringify(authData));
    }
  }, []);

  // Initialize auth state on component mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Initialize auth service
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
        
        // Try to restore auth state from session storage
        const persistedAuth = sessionStorage.getItem('auth_state');
        if (persistedAuth) {
          try {
            const authData = JSON.parse(persistedAuth);
            if (authData && typeof authData.isAuthenticated === 'boolean') {
              console.log('[AUTH] Restoring auth state from session storage');
              setUser(authData.user);
              setPermissions(authData.permissions || []);
              setIsAuthenticated(authData.isAuthenticated);
              
              // Verify session in the background
              setTimeout(() => {
                authService.checkSession().catch(error => {
                  console.error('[AUTH] Error checking session:', error);
                });
              }, 100);
            }
          } catch (error) {
            console.error('Failed to parse auth state from session storage:', error);
            sessionStorage.removeItem('auth_state');
          }
        } else {
          // Check existing authentication
          const isUserAuthenticated = authService.isAuthenticated();
          if (isUserAuthenticated) {
            const currentUser = authService.getCurrentUser();
            if (currentUser) {
              setUser(currentUser);
              setPermissions(currentUser.permissions || []);
              setIsAuthenticated(true);
              
              // Persist auth state in session storage
              sessionStorage.setItem('auth_state', JSON.stringify({
                isAuthenticated: true,
                user: currentUser,
                permissions: currentUser.permissions || []
              }));
            }
          } else {
            // No valid session, handle accordingly
            setUser(null);
            setPermissions([]);
            setIsAuthenticated(false);
          }
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
        
        // Persist auth state in session storage
        sessionStorage.setItem('auth_state', JSON.stringify({
          isAuthenticated: true,
          user: userData,
          permissions: userData.permissions || []
        }));
      }
    };
    
    const handleLogout = () => {
      setUser(null);
      setPermissions([]);
      setIsAuthenticated(false);
      
      // Clear session storage
      sessionStorage.removeItem('auth_state');
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
          
          // Update session storage
          sessionStorage.setItem('auth_state', JSON.stringify({
            isAuthenticated: true,
            user: currentUser,
            permissions: currentUser.permissions || []
          }));
        } else {
          // Try to fetch current user from server
          const user = await authService.fetchCurrentUser();
          if (user) {
            setUser(user);
            setPermissions(user.permissions || []);
            setIsAuthenticated(true);
            setError(null);
            
            // Update session storage
            sessionStorage.setItem('auth_state', JSON.stringify({
              isAuthenticated: true,
              user,
              permissions: user.permissions || []
            }));
          }
        }
      } catch (error) {
        console.error('[AUTH] Error handling token refresh:', error);
      }
    };
    
    const handleSessionExpired = () => {
      console.log('[AUTH] Session expired event received');
      setUser(null);
      setPermissions([]);
      setIsAuthenticated(false);
      
      // Clear session storage
      sessionStorage.removeItem('auth_state');
      
      // Set error message
      setError('Your session has expired. Please log in again.');
    };
    
    const handleUnauthorized = () => {
      console.log('[AUTH] Unauthorized event received, attempting refresh');
      // Try to refresh the token
      refreshAuth().catch(() => {
        // If refresh fails, log out
        logout();
      });
    };
    
    // Add event listeners
    window.addEventListener(AUTH_EVENTS.LOGIN_SUCCESS, handleLoginSuccess);
    window.addEventListener(AUTH_EVENTS.LOGOUT, handleLogout);
    window.addEventListener(AUTH_EVENTS.AUTH_ERROR, handleAuthError);
    window.addEventListener(AUTH_EVENTS.TOKEN_REFRESHED, handleTokenRefreshed);
    window.addEventListener(AUTH_EVENTS.SESSION_EXPIRED, handleSessionExpired);
    window.addEventListener(AUTH_EVENTS.UNAUTHORIZED, handleUnauthorized);
    window.addEventListener('auth:token:refreshed', handleTokenRefreshed);
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    
    // Cleanup event listeners on unmount
    return () => {
      window.removeEventListener(AUTH_EVENTS.LOGIN_SUCCESS, handleLoginSuccess);
      window.removeEventListener(AUTH_EVENTS.LOGOUT, handleLogout);
      window.removeEventListener(AUTH_EVENTS.AUTH_ERROR, handleAuthError);
      window.removeEventListener(AUTH_EVENTS.TOKEN_REFRESHED, handleTokenRefreshed);
      window.removeEventListener(AUTH_EVENTS.SESSION_EXPIRED, handleSessionExpired);
      window.removeEventListener(AUTH_EVENTS.UNAUTHORIZED, handleUnauthorized);
      window.removeEventListener('auth:token:refreshed', handleTokenRefreshed);
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [isBypassEnabled, logout, refreshAuth]);

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
