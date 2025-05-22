/**
 * 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
 *
 * Auth Context
 *
 * This context provides state management for the auth feature.
 * Enhanced with better token refresh handling.
 */

import { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  User,
  LoginCredentials,
  AuthContextState,
  AuthContextActions,
  PinLoginCredentials,
  PinLoginResponse,
  PasswordChange
} from '../types/auth.types';
import { authService } from '../services/authService';
import { pinAuthService } from '../services/pinAuthService';
import { profileService } from '../services/profileService';
import { AUTH_EVENTS } from '../constants/authEvents';
import { LoginRequest } from '../schemas/auth.schemas';
import { getDeviceFingerprint } from '../utils/deviceFingerprint';
import { resetFailedLoginAttempts } from '../utils/securityUtils';
import { sessionService } from '../services/sessionService';
import { SESSION_EVENTS } from '../constants/sessionEvents';

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
  isPinAuthEnabled: false,
  pinAuthStatus: {
    isEnabled: false,
    isLoading: false
  },
  securitySettings: {
    trustedDevices: [],
    isLoading: false
  },
  sessionManagement: {
    activeSessions: 0,
    isLoading: false,
    hasMultipleDevices: false
  },
  login: async () => ({ success: false, error: 'Auth context not initialized' }),
  loginWithPin: async () => ({ success: false, error: 'Auth context not initialized' }),
  logout: async () => {},
  hasPermission: () => false,
  hasRole: () => false,
  refreshAuth: async () => false,
  restoreAuth: () => {},
  clearAuthError: () => {},
  setupPin: async () => ({ success: false, error: 'Auth context not initialized' }),
  changePin: async () => ({ success: false, error: 'Auth context not initialized' }),
  disablePin: async () => ({ success: false, error: 'Auth context not initialized' }),
  isPinEnabled: async () => false,
  addTrustedDevice: async () => ({ success: false, error: 'Auth context not initialized' }),
  removeTrustedDevice: async () => ({ success: false, error: 'Auth context not initialized' }),
  updateProfile: async () => ({ success: false, error: 'Auth context not initialized' }),
  changePassword: async () => ({ success: false, error: 'Auth context not initialized' }),
  getSessions: async () => [],
  getCurrentSession: async () => {},
  revokeSession: async () => ({ success: false, error: 'Auth context not initialized' }),
  revokeAllSessions: async () => ({ success: false, error: 'Auth context not initialized' }),
  refreshSession: async () => false
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
  const [isPinAuthEnabled, setIsPinAuthEnabled] = useState<boolean>(false);
  const [pinAuthStatus, setPinAuthStatus] = useState({
    isEnabled: false,
    isLoading: false
  });
  const [securitySettings, setSecuritySettings] = useState({
    trustedDevices: [] as TrustedDevice[],
    isLoading: false
  });
  const [sessionManagement, setSessionManagement] = useState({
    activeSessions: 0,
    isLoading: false,
    hasMultipleDevices: false
  });

  // Environment check
  const isDevelopmentMode = process.env.NODE_ENV === 'development';

  // Initialize authentication
  useEffect(() => {
    initAuth();

    // Setup session management event listeners
    const handleSessionRevoked = (event: CustomEvent) => {
      // Refresh sessions after revocation
      fetchUserSessions();
    };

    const handleNewSessionCreated = (event: CustomEvent) => {
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
  }, []);

  // Fetch user sessions when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUserSessions();
    }
  }, [isAuthenticated, user]);

  // Initialize authentication
  const initAuth = async () => {
    try {
      // Initialize auth service (if the method exists)
      if (typeof authService.init === 'function') {
        authService.init();
      }

      // Check existing authentication
      const isUserAuthenticated = authService.isAuthenticated();
      if (isUserAuthenticated) {
        // In development mode, create a mock admin user if no user is found
        if (import.meta.env.DEV) {
          const currentUser = authService.getCurrentUser();
          if (!currentUser) {
            console.log('[AUTH] Development mode: Creating mock admin user');
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
            return;
          }
        }

        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          setPermissions(currentUser.permissions || []);
          setIsAuthenticated(true);
        }
      } else {
        // In development mode, create a mock admin user even if not authenticated
        if (import.meta.env.DEV) {
          console.log('[AUTH] Development mode: Creating mock admin user');
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
          // No valid session, handle accordingly
          setUser(null);
          setPermissions([]);
          setIsAuthenticated(false);
        }
      }
    } catch (error) {
      console.error('[AUTH] Auth initialization error:', error);

      // In development mode, create a mock admin user even on error
      if (import.meta.env.DEV) {
        console.log('[AUTH] Development mode: Creating mock admin user after error');
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
    }
  };

  // Fetch user sessions for session management
  const fetchUserSessions = async () => {
    if (!isAuthenticated) return;

    try {
      setSessionManagement(prev => ({ ...prev, isLoading: true }));

      // In development mode, use mock sessions data
      if (import.meta.env.DEV) {
        console.log('[AUTH] Development mode: Using mock sessions data');

        // Mock sessions data
        const mockSessions = [
          {
            id: 'mock-session-1',
            deviceInfo: {
              browser: 'Chrome',
              os: 'Windows',
              device: 'Desktop'
            },
            ipAddress: '127.0.0.1',
            lastActive: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            active: true,
            current: true
          }
        ];

        const activeSessions = mockSessions.filter(session => session.active).length;
        const hasMultiple = activeSessions > 1;

        setSessionManagement({
          activeSessions,
          isLoading: false,
          hasMultipleDevices: hasMultiple
        });

        return;
      }

      // Production mode - use real API
      const sessions = await sessionService.getAllSessions();

      // Make sure sessions is an array before filtering
      const sessionsArray = Array.isArray(sessions) ? sessions : [];

      const currentSession = await sessionService.getCurrentSession();
      const activeSessions = sessionsArray.filter(session => session.active).length;
      const hasMultiple = activeSessions > 1;

      setSessionManagement({
        activeSessions,
        isLoading: false,
        hasMultipleDevices: hasMultiple
      });
    } catch (error) {
      console.error('[AUTH] Error fetching sessions:', error);

      // In development mode, use mock data even on error
      if (import.meta.env.DEV) {
        console.log('[AUTH] Development mode: Using mock sessions data after error');
        setSessionManagement({
          activeSessions: 1,
          isLoading: false,
          hasMultipleDevices: false
        });
      } else {
        setSessionManagement(prev => ({
          ...prev,
          isLoading: false
        }));
      }
    }
  };

  // Login function
  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    try {
      setError(null);
      setIsLoading(true);

      const response = await authService.login(credentials);

      if (response.success && response.data) {
        setUser(response.data.user);
        setPermissions(response.data.user.permissions || []);
        setIsAuthenticated(true);

        // Fetch user sessions after successful login
        fetchUserSessions();

        return { success: true };
      } else {
        setError(response.error || 'Authentication failed');

        // Dispatch auth error event
        window.dispatchEvent(new CustomEvent(AUTH_EVENTS.AUTH_ERROR, {
          detail: { data: { message: response.error || 'Authentication failed' } }
        }));

        return { success: false, error: response.error || 'Authentication failed' };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMessage);

      // Dispatch auth error event
      window.dispatchEvent(new CustomEvent(AUTH_EVENTS.AUTH_ERROR, {
        detail: { data: { message: errorMessage } }
      }));

      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Login with PIN function
  const loginWithPin = async (credentials: PinLoginCredentials): Promise<{ success: boolean; error?: string }> => {
    try {
      setError(null);
      setIsLoading(true);

      const response = await authService.loginWithPin(credentials);

      if (response.success && response.user) {
        setUser(response.user);
        setPermissions(response.user.permissions || []);
        setIsAuthenticated(true);

        // Fetch user sessions after successful login
        fetchUserSessions();

        return { success: true };
      } else {
        setError(response.error || 'PIN authentication failed');

        // Dispatch auth error event
        window.dispatchEvent(new CustomEvent(AUTH_EVENTS.AUTH_ERROR, {
          detail: { data: { message: response.error || 'PIN authentication failed' } }
        }));

        return { success: false, error: response.error || 'PIN authentication failed' };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMessage);

      // Dispatch auth error event
      window.dispatchEvent(new CustomEvent(AUTH_EVENTS.AUTH_ERROR, {
        detail: { data: { message: errorMessage } }
      }));

      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

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

      // Reset session management state
      setSessionManagement({
        activeSessions: 0,
        isLoading: false,
        hasMultipleDevices: false
      });
    }
  }, []);

  // Refresh authentication
  const refreshAuth = useCallback(async (): Promise<boolean> => {
    try {
      console.log('[AUTH] Refreshing authentication');
      setIsLoading(true);

      const refreshResult = await authService.refreshToken();
      if (!refreshResult) {
        console.log('[AUTH] Token refresh failed');
        setIsAuthenticated(false);
        setUser(null);
        setPermissions([]);
        setError('Authentication session expired. Please log in again.');
        return false;
      }

      // Get current user data
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setPermissions(currentUser.permissions || []);
        setIsAuthenticated(true);
        setError(null);

        // Refresh session management data
        fetchUserSessions();

        return true;
      }

      return false;
    } catch (error) {
      console.error('[AUTH] Error refreshing authentication:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Restore auth state (used when recovering from session storage)
  const restoreAuth = useCallback((authData: { isAuthenticated: boolean; user: User | null; permissions: string[] }) => {
    if (authData.isAuthenticated && authData.user) {
      setUser(authData.user);
      setPermissions(authData.permissions || []);
      setIsAuthenticated(true);

      // Refresh session management data
      fetchUserSessions();
    }
  }, []);

  // Clear authentication error
  const clearAuthError = useCallback(() => {
    setError(null);
  }, []);

  // Check if user has a specific permission
  const hasPermission = useCallback((permission: string): boolean => {
    if (!user || !permissions.length) return false;

    // Admin role has all permissions
    if (user.role === UserRole.ADMIN) return true;

    return permissions.includes(permission);
  }, [user, permissions]);

  // Check if user has a specific role
  const hasRole = useCallback((role: string): boolean => {
    if (!user) return false;
    return user.role === role;
  }, [user]);

  // Setup PIN
  const setupPin = useCallback(async (data: { pin: string; confirmPin: string; currentPassword: string }): Promise<{ success: boolean; error?: string }> => {
    try {
      setPinAuthStatus(prev => ({ ...prev, isLoading: true }));

      const response = await authService.setupPin({
        pin: data.pin,
        confirmPin: data.confirmPin,
        currentPassword: data.currentPassword
      });

      if (response.success) {
        setPinAuthStatus({
          isEnabled: true,
          isLoading: false
        });

        // Update user state if returned in response
        if (response.user) {
          setUser(response.user);
        }

        return { success: true };
      } else {
        setPinAuthStatus(prev => ({ ...prev, isLoading: false }));
        return { success: false, error: response.error || 'Failed to set up PIN' };
      }
    } catch (error) {
      setPinAuthStatus(prev => ({ ...prev, isLoading: false }));
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      return { success: false, error: errorMessage };
    }
  }, []);

  // Change PIN
  const changePin = useCallback(async (data: { currentPin: string; newPin: string; confirmPin: string }): Promise<{ success: boolean; error?: string }> => {
    try {
      setPinAuthStatus(prev => ({ ...prev, isLoading: true }));

      const response = await authService.changePin({
        currentPin: data.currentPin,
        newPin: data.newPin,
        confirmPin: data.confirmPin
      });

      if (response.success) {
        setPinAuthStatus(prev => ({ ...prev, isLoading: false }));

        // Update user state if returned in response
        if (response.user) {
          setUser(response.user);
        }

        return { success: true };
      } else {
        setPinAuthStatus(prev => ({ ...prev, isLoading: false }));
        return { success: false, error: response.error || 'Failed to change PIN' };
      }
    } catch (error) {
      setPinAuthStatus(prev => ({ ...prev, isLoading: false }));
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      return { success: false, error: errorMessage };
    }
  }, []);

  // Disable PIN
  const disablePin = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    try {
      setPinAuthStatus(prev => ({ ...prev, isLoading: true }));

      const response = await authService.disablePin();

      if (response.success) {
        setPinAuthStatus({
          isEnabled: false,
          isLoading: false
        });

        // Update user state if returned in response
        if (response.user) {
          setUser(response.user);
        }

        return { success: true };
      } else {
        setPinAuthStatus(prev => ({ ...prev, isLoading: false }));
        return { success: false, error: response.error || 'Failed to disable PIN' };
      }
    } catch (error) {
      setPinAuthStatus(prev => ({ ...prev, isLoading: false }));
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      return { success: false, error: errorMessage };
    }
  }, []);

  // Check if PIN is enabled
  const isPinEnabled = useCallback(async (): Promise<boolean> => {
    try {
      setPinAuthStatus(prev => ({ ...prev, isLoading: true }));

      const response = await authService.isPinEnabled();

      setPinAuthStatus({
        isEnabled: response,
        isLoading: false
      });

      return response;
    } catch (error) {
      setPinAuthStatus(prev => ({ ...prev, isLoading: false }));
      console.error('Error checking PIN status:', error);
      return false;
    }
  }, []);

  // Add trusted device
  const addTrustedDevice = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    try {
      setSecuritySettings(prev => ({ ...prev, isLoading: true }));

      const response = await authService.addTrustedDevice();

      if (response.success) {
        // Update trusted devices list
        const updatedTrustedDevices =
          response.trustedDevices ||
          (user?.securitySettings?.trustedDevices || []);

        setSecuritySettings({
          trustedDevices: updatedTrustedDevices,
          isLoading: false
        });

        return { success: true };
      } else {
        setSecuritySettings(prev => ({ ...prev, isLoading: false }));
        return { success: false, error: response.error || 'Failed to add trusted device' };
      }
    } catch (error) {
      setSecuritySettings(prev => ({ ...prev, isLoading: false }));
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      return { success: false, error: errorMessage };
    }
  }, [user]);

  // Remove trusted device
  const removeTrustedDevice = useCallback(async (deviceId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setSecuritySettings(prev => ({ ...prev, isLoading: true }));

      const response = await authService.removeTrustedDevice(deviceId);

      if (response.success) {
        // Update trusted devices list
        const updatedTrustedDevices =
          response.trustedDevices ||
          (user?.securitySettings?.trustedDevices || []).filter(device => device.id !== deviceId);

        setSecuritySettings({
          trustedDevices: updatedTrustedDevices,
          isLoading: false
        });

        return { success: true };
      } else {
        setSecuritySettings(prev => ({ ...prev, isLoading: false }));
        return { success: false, error: response.error || 'Failed to remove trusted device' };
      }
    } catch (error) {
      setSecuritySettings(prev => ({ ...prev, isLoading: false }));
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      return { success: false, error: errorMessage };
    }
  }, [user]);

  // Update profile
  const updateProfile = useCallback(async (profileData: Partial<User>): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);

      const response = await authService.updateProfile(profileData);

      if (response.success) {
        // Update user state
        if (response.user) {
          setUser(response.user);
        } else if (user) {
          // Merge updated data with existing user
          setUser({ ...user, ...profileData });
        }

        return { success: true };
      } else {
        return { success: false, error: response.error || 'Failed to update profile' };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Change password
  const changePassword = useCallback(async (
    currentPassword: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);

      const response = await authService.changePassword(
        currentPassword,
        newPassword,
        confirmPassword
      );

      if (response.success) {
        // Update user state if returned in response
        if (response.user) {
          setUser(response.user);
        }

        return { success: true };
      } else {
        return { success: false, error: response.error || 'Failed to change password' };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /* SESSION MANAGEMENT FUNCTIONS */

  // Get all sessions
  const getSessions = useCallback(async (): Promise<UserSession[]> => {
    try {
      setSessionManagement(prev => ({ ...prev, isLoading: true }));

      // In development mode, use mock sessions data
      if (import.meta.env.DEV) {
        console.log('[AUTH] Development mode: Using mock sessions data in getSessions');

        // Mock sessions data
        const mockSessions = [
          {
            id: 'mock-session-1',
            deviceInfo: {
              browser: 'Chrome',
              os: 'Windows',
              device: 'Desktop'
            },
            ipAddress: '127.0.0.1',
            lastActive: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            active: true,
            current: true
          }
        ];

        setSessionManagement(prev => ({
          ...prev,
          activeSessions: mockSessions.filter(session => session.active).length,
          hasMultipleDevices: mockSessions.filter(session => session.active).length > 1,
          isLoading: false
        }));

        return mockSessions;
      }

      // Production mode - use real API
      const sessions = await sessionService.getAllSessions();

      // Make sure sessions is an array before filtering
      const sessionsArray = Array.isArray(sessions) ? sessions : [];

      setSessionManagement(prev => ({
        ...prev,
        activeSessions: sessionsArray.filter(session => session.active).length,
        hasMultipleDevices: sessionsArray.filter(session => session.active).length > 1,
        isLoading: false
      }));

      return sessionsArray;
    } catch (error) {
      setSessionManagement(prev => ({ ...prev, isLoading: false }));
      console.error('[AUTH] Error fetching sessions:', error);

      // In development mode, return mock data even on error
      if (import.meta.env.DEV) {
        console.log('[AUTH] Development mode: Returning mock sessions data after error');
        return [
          {
            id: 'mock-session-1',
            deviceInfo: {
              browser: 'Chrome',
              os: 'Windows',
              device: 'Desktop'
            },
            ipAddress: '127.0.0.1',
            lastActive: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            active: true,
            current: true
          }
        ];
      }

      return [];
    }
  }, []);

  // Get current session
  const getCurrentSession = useCallback(async (): Promise<SessionDetails> => {
    try {
      setSessionManagement(prev => ({ ...prev, isLoading: true }));

      // In development mode, use mock session data
      if (import.meta.env.DEV) {
        console.log('[AUTH] Development mode: Using mock current session data');

        // Mock current session data
        const mockSession = {
          id: 'mock-session-1',
          deviceInfo: {
            browser: 'Chrome',
            os: 'Windows',
            device: 'Desktop'
          },
          ipAddress: '127.0.0.1',
          lastActive: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          active: true,
          current: true
        };

        setSessionManagement(prev => ({ ...prev, isLoading: false }));

        return mockSession;
      }

      // Production mode - use real API
      const session = await sessionService.getCurrentSession();

      setSessionManagement(prev => ({ ...prev, isLoading: false }));

      return session;
    } catch (error) {
      setSessionManagement(prev => ({ ...prev, isLoading: false }));
      console.error('[AUTH] Error fetching current session:', error);

      // In development mode, return mock data even on error
      if (import.meta.env.DEV) {
        console.log('[AUTH] Development mode: Returning mock current session data after error');
        return {
          id: 'mock-session-1',
          deviceInfo: {
            browser: 'Chrome',
            os: 'Windows',
            device: 'Desktop'
          },
          ipAddress: '127.0.0.1',
          lastActive: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          active: true,
          current: true
        };
      }

      throw error;
    }
  }, []);

  // Revoke session
  const revokeSession = useCallback(async (sessionId: string, reason?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setSessionManagement(prev => ({ ...prev, isLoading: true }));

      const response = await sessionService.revokeSession(sessionId, reason);

      if (response.success) {
        // Refresh sessions after revocation
        await fetchUserSessions();

        return { success: true };
      } else {
        setSessionManagement(prev => ({ ...prev, isLoading: false }));
        return { success: false, error: response.error || 'Failed to revoke session' };
      }
    } catch (error) {
      setSessionManagement(prev => ({ ...prev, isLoading: false }));
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      return { success: false, error: errorMessage };
    }
  }, []);

  // Revoke all sessions
  const revokeAllSessions = useCallback(async (keepCurrent: boolean = true): Promise<{ success: boolean; error?: string }> => {
    try {
      setSessionManagement(prev => ({ ...prev, isLoading: true }));

      const response = await sessionService.revokeAllSessions(keepCurrent);

      if (response.success) {
        // Refresh sessions after revocation
        await fetchUserSessions();

        return { success: true };
      } else {
        setSessionManagement(prev => ({ ...prev, isLoading: false }));
        return { success: false, error: response.error || 'Failed to revoke all sessions' };
      }
    } catch (error) {
      setSessionManagement(prev => ({ ...prev, isLoading: false }));
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      return { success: false, error: errorMessage };
    }
  }, []);

  // Refresh current session
  const refreshSession = useCallback(async (): Promise<boolean> => {
    try {
      // Calls the refresh token endpoint indirectly
      const success = await refreshAuth();

      if (success) {
        // After refreshing auth token, also refresh sessions data
        await fetchUserSessions();
      }

      return success;
    } catch (error) {
      console.error('[AUTH] Error refreshing session:', error);
      return false;
    }
  }, [refreshAuth]);

  // Context value
  const contextValue: AuthContextType = {
    isAuthenticated,
    isLoading,
    user,
    permissions,
    error,
    isDevelopmentMode,
    isPinAuthEnabled,
    pinAuthStatus,
    securitySettings,
    sessionManagement,

    // Auth actions
    login,
    loginWithPin,
    logout,
    hasPermission,
    hasRole,
    refreshAuth,
    restoreAuth,
    clearAuthError,

    // PIN-related actions
    setupPin,
    changePin,
    disablePin,
    isPinEnabled,

    // Device-related actions
    addTrustedDevice,
    removeTrustedDevice,

    // Profile actions
    updateProfile,
    changePassword,

    // Session management actions
    getSessions,
    getCurrentSession,
    revokeSession,
    revokeAllSessions,
    refreshSession
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}
