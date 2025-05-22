/**
 * Enhanced AuthProvider with Batch Request Support
 * 
 * This component extends the standard AuthProvider with support for batch requests
 * during initialization to improve performance.
 */

import React, { useState, useEffect, useCallback, ReactNode } from 'react';
import { AuthContext, AuthContextType } from './AuthContext';
import { authService } from '../services/authService';
import { User, LoginCredentials, LoginResponse, AUTH_EVENTS, SESSION_EVENTS } from '../types/auth.types';
import { AUTH_CONFIG } from '../config/authConfig';
import { useInitialization } from '@/lib/providers/InitializationProvider';
import { RequestPriority } from '@/lib/api/initialization-batch-manager';
import { CRITICAL_ENDPOINTS } from '@/lib/api/critical-api-init';
import { logger } from '@/lib/logging/logger';
import { performanceMonitor } from '@/lib/performance/performance-monitor';

export interface AuthProviderWithBatchProps {
  children: ReactNode;
}

/**
 * Enhanced Auth Provider Component with Batch Request Support
 * 
 * This provider manages authentication state and provides auth-related functions
 * with optimized batch requests during initialization.
 */
export function AuthProviderWithBatch({ children }: AuthProviderWithBatchProps) {
  // State
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isPinAuthEnabled, setIsPinAuthEnabled] = useState<boolean>(false);
  const [pinAuthStatus, setPinAuthStatus] = useState({
    isEnabled: false,
    isLoading: false
  });
  const [securitySettings, setSecuritySettings] = useState({
    trustedDevices: [] as any[],
    isLoading: false
  });
  const [sessionManagement, setSessionManagement] = useState({
    activeSessions: 0,
    isLoading: false,
    hasMultipleDevices: false
  });

  // Get initialization context for batch requests
  const { get: batchGet, post: batchPost } = useInitialization();

  // Environment check
  const isDevelopmentMode = process.env.NODE_ENV === 'development';
  const isBypassEnabled = isDevelopmentMode && AUTH_CONFIG.DEV_MODE.BYPASS_AUTH;

  // Fetch user sessions
  const fetchUserSessions = useCallback(async () => {
    if (!isAuthenticated || !user) return;

    setSessionManagement(prev => ({ ...prev, isLoading: true }));

    try {
      // Use batch request for session data
      const sessions = await batchGet('auth/SESSIONS', undefined, RequestPriority.HIGH);
      
      setSessionManagement({
        activeSessions: sessions?.length || 0,
        hasMultipleDevices: (sessions?.length || 0) > 1,
        isLoading: false
      });
    } catch (error) {
      console.error('[AUTH] Error fetching user sessions:', error);
      setSessionManagement(prev => ({ ...prev, isLoading: false }));
    }
  }, [isAuthenticated, user, batchGet]);

  // Initialize authentication
  const initAuth = useCallback(async () => {
    performanceMonitor.markStart('auth:initialization');
    
    try {
      // Initialize auth service (if the method exists)
      if (typeof authService.init === 'function') {
        authService.init();
      }

      // In bypass mode, use default user
      if (isBypassEnabled) {
        logger.info('[AUTH] Development mode with auth bypass enabled');
        setUser(AUTH_CONFIG.DEV_MODE.DEFAULT_USER);
        setPermissions(AUTH_CONFIG.DEV_MODE.DEFAULT_USER.permissions);
        setIsAuthenticated(true);
        setIsLoading(false);
        return;
      }

      // Check existing authentication
      const isUserAuthenticated = authService.isAuthenticated();
      if (isUserAuthenticated) {
        logger.info('[AUTH] User is authenticated, fetching user data');
        
        try {
          // Use batch requests for critical auth data
          const userProfile = await batchGet(
            CRITICAL_ENDPOINTS.USER_PROFILE, 
            undefined, 
            RequestPriority.CRITICAL
          );
          
          const userPermissions = await batchGet(
            CRITICAL_ENDPOINTS.USER_PERMISSIONS, 
            undefined, 
            RequestPriority.CRITICAL
          );
          
          if (userProfile) {
            setUser(userProfile);
            setPermissions(userPermissions || userProfile.permissions || []);
            setIsAuthenticated(true);
            
            // Check if PIN auth is enabled for this user
            const isPinEnabled = userProfile.isPinEnabled || false;
            setIsPinAuthEnabled(isPinEnabled);
            setPinAuthStatus({
              isEnabled: isPinEnabled,
              isLoading: false
            });
          } else {
            // No user profile found, user might not be authenticated
            setIsAuthenticated(false);
            setUser(null);
            setPermissions([]);
          }
        } catch (error) {
          logger.error('[AUTH] Error fetching user data:', error);
          
          // In development mode, create a mock admin user on error
          if (isDevelopmentMode) {
            logger.info('[AUTH] Development mode: Creating mock admin user after error');
            const mockAdminUser = {
              id: 'dev-admin',
              username: 'admin',
              email: 'admin@example.com',
              firstName: 'Admin',
              lastName: 'User',
              role: 'ADMIN',
              permissions: ['*'], // Wildcard permission
              isActive: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            setUser(mockAdminUser);
            setPermissions(['*']); // Wildcard permission
            setIsAuthenticated(true);
          } else {
            setUser(null);
            setPermissions([]);
            setIsAuthenticated(false);
            setError('Failed to load user data. Please try again.');
          }
        }
      } else {
        // User is not authenticated
        setIsAuthenticated(false);
        setUser(null);
        setPermissions([]);
      }
    } catch (error) {
      logger.error('[AUTH] Auth initialization error:', error);

      // In development mode, create a mock admin user even on error
      if (isDevelopmentMode) {
        logger.info('[AUTH] Development mode: Creating mock admin user after error');
        const mockAdminUser = {
          id: 'dev-admin',
          username: 'admin',
          email: 'admin@example.com',
          firstName: 'Admin',
          lastName: 'User',
          role: 'ADMIN',
          permissions: ['*'], // Wildcard permission
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setUser(mockAdminUser);
        setPermissions(['*']); // Wildcard permission
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setPermissions([]);
        setIsAuthenticated(false);
      }
    } finally {
      setIsLoading(false);
      performanceMonitor.markEnd('auth:initialization');
    }
  }, [isBypassEnabled, isDevelopmentMode, batchGet]);

  // Login function
  const login = useCallback(async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await authService.login(credentials);
      
      if (response.success) {
        setUser(response.user);
        setPermissions(response.user.permissions || []);
        setIsAuthenticated(true);
        
        // Check if PIN auth is enabled for this user
        const isPinEnabled = response.user.isPinEnabled || false;
        setIsPinAuthEnabled(isPinEnabled);
        setPinAuthStatus({
          isEnabled: isPinEnabled,
          isLoading: false
        });
        
        // Fetch user sessions
        fetchUserSessions();
      } else {
        setError(response.error || 'Login failed');
      }
      
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [fetchUserSessions]);

  // Initialize authentication on component mount
  useEffect(() => {
    initAuth();

    // Setup session management event listeners
    const handleSessionRevoked = () => {
      // Refresh sessions after revocation
      fetchUserSessions();
    };

    const handleNewSessionCreated = () => {
      // Refresh sessions when a new session is created
      fetchUserSessions();
    };

    // Add event listeners
    window.addEventListener(SESSION_EVENTS.SESSION_REVOKED, handleSessionRevoked as EventListener);
    window.addEventListener(SESSION_EVENTS.SESSION_CREATED, handleNewSessionCreated as EventListener);

    return () => {
      // Remove event listeners
      window.removeEventListener(SESSION_EVENTS.SESSION_REVOKED, handleSessionRevoked as EventListener);
      window.removeEventListener(SESSION_EVENTS.SESSION_CREATED, handleNewSessionCreated as EventListener);
    };
  }, [initAuth, fetchUserSessions]);

  // Fetch user sessions when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUserSessions();
    }
  }, [isAuthenticated, user, fetchUserSessions]);

  // Create context value
  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    error,
    permissions,
    isDevelopmentMode,
    isBypassEnabled,
    isPinAuthEnabled,
    pinAuthStatus,
    securitySettings,
    sessionManagement,
    
    // Auth methods
    login,
    logout: async () => {
      // Implementation would go here
    },
    hasPermission: () => false,
    hasRole: () => false,
    refreshAuth: async () => false,
    restoreAuth: () => {},
    clearAuthError: () => {},
    
    // Additional methods would be implemented here
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProviderWithBatch;
