/**
 * 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
 *
 * Authentication Types
 *
 * Type definitions for the authentication system, including user data,
 * authentication responses, and context interfaces.
 */

/**
 * Re-export UserRole from auth schemas
 */
import { UserRole } from '../schemas/auth.schemas';
import { UserSession, SessionDetails } from './session.types';

/**
 * User Interface
 * Represents a user in the system with their role and permissions
 * This interface is aligned with the backend User model
 */
export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName?: string; // Computed from firstName + lastName
  role: UserRole;
  permissions: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  lastLogin?: string | null;
  avatar?: string | null;
  // PIN Authentication
  isPinEnabled: boolean;
  lastPinChange?: string | null;
  failedPinAttempts?: number;
  pinLockedUntil?: string | null;
  // Additional fields for frontend use
  securitySettings?: UserSecuritySettings;
}

/**
 * Login Credentials
 * Represents the data needed for user login
 */
export interface LoginCredentials {
  username: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Register Credentials
 * Represents the data needed for user registration
 */
export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
}

/**
 * Login Response
 * Represents the response from the login API
 */
export interface LoginResponse {
  success: boolean;
  data?: {
    user: User;
    expiresIn?: number;
  };
  error?: string;
}

/**
 * Authentication Response
 * Represents the response from the authentication API
 */
export interface AuthResponse {
  token: string;
  refreshToken: string;
  accessToken: string; // Alias for token for compatibility
  user: User;
  expiresIn: number;
}

/**
 * Token Verification Response
 * Represents the response from token verification API
 */
export interface TokenVerificationResponse {
  valid: boolean;
  user?: User;
  error?: string;
}

/**
 * Authentication Session
 * Represents a stored authentication session
 */
export interface AuthSession {
  token: string;
  refreshToken?: string;
  user: User;
  expiresAt: string;
}

/**
 * Auth Context State
 * Represents the current state of the authentication context
 */
export interface AuthContextState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  permissions: string[];
  error: string | null;
  isDevelopmentMode: boolean;
  isPinAuthEnabled: boolean;
  pinAuthStatus: {
    isEnabled: boolean;
    lastChanged?: string;
    isLoading: boolean;
  };
  securitySettings: {
    trustedDevices: TrustedDevice[];
    isLoading: boolean;
  };
  sessionManagement: {
    activeSessions: number;
    isLoading: boolean;
    hasMultipleDevices: boolean;
  };
}

/**
 * Auth Context Actions
 * Actions that can be performed through the authentication context
 */
export interface AuthContextActions {
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  loginWithPin: (credentials: PinLoginCredentials) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  refreshAuth: () => Promise<boolean>;
  restoreAuth: (authData: { isAuthenticated: boolean; user: User | null; permissions: string[] }) => void;
  clearAuthError: () => void;
  setupPin: (data: { pin: string; confirmPin: string; currentPassword: string }) => Promise<{ success: boolean; error?: string }>;
  changePin: (data: { currentPin: string; newPin: string; confirmPin: string }) => Promise<{ success: boolean; error?: string }>;
  disablePin: () => Promise<{ success: boolean; error?: string }>;
  isPinEnabled: () => Promise<boolean>;
  addTrustedDevice: () => Promise<{ success: boolean; error?: string }>;
  removeTrustedDevice: (deviceId: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (profileData: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  changePassword: (currentPassword: string, newPassword: string, confirmPassword: string) => Promise<{ success: boolean; error?: string }>;
  
  // Session Management Actions
  getSessions: () => Promise<UserSession[]>;
  getCurrentSession: () => Promise<SessionDetails>;
  revokeSession: (sessionId: string, reason?: string) => Promise<{ success: boolean; error?: string }>;
  revokeAllSessions: (keepCurrent?: boolean) => Promise<{ success: boolean; error?: string }>;
  refreshSession: () => Promise<boolean>;
}

/**
 * Combined Auth Context
 * Combines state and actions for the authentication context
 */
export interface AuthContextValue extends AuthContextState, AuthContextActions {
  // Additional properties can be added here
}

/**
 * Protected Route Props
 * Props for the ProtectedRoute component
 */
export interface ProtectedRouteProps {
  permissions?: string[];
  roles?: string[];
  redirectPath?: string;
  children: React.ReactNode;
}

/**
 * Registration Data
 * Data required for user registration
 */
export interface RegistrationData {
  username: string;
  email: string;
  password: string;
  fullName: string;
}

/**
 * Password Reset Request
 * Data required to request a password reset
 */
export interface PasswordResetRequest {
  email: string;
}

/**
 * Password Reset Confirmation
 * Data required to confirm a password reset
 */
export interface PasswordResetConfirmation {
  token: string;
  newPassword: string;
}

/**
 * Password Change
 * Data required to change a password
 */
export interface PasswordChange {
  currentPassword: string;
  newPassword: string;
}

/**
 * User Security Settings
 * Security-related settings for a user
 */
export interface UserSecuritySettings {
  mfaEnabled: boolean;
  pinEnabled: boolean;
  trustedDevices: TrustedDevice[];
  lastPasswordChange?: string;
  passwordExpiryDays?: number;
  securityQuestions?: SecurityQuestion[];
  loginNotifications: boolean;
}

/**
 * Trusted Device
 * Information about a device that has been marked as trusted
 */
export interface TrustedDevice {
  deviceId: string;
  deviceName: string;
  browser: string;
  browserVersion?: string;
  os: string;
  osVersion?: string;
  lastUsed?: string;
  ipAddress?: string;
  trustedSince: string;
  isMobile?: boolean;
  isTablet?: boolean;
  isDesktop?: boolean;
}

/**
 * Security Question
 * A security question and its answer (hashed)
 */
export interface SecurityQuestion {
  id: string;
  question: string;
  answerHash: string;
}

/**
 * PIN Login Credentials
 * Represents the data needed for PIN-based login
 */
export interface PinLoginCredentials {
  username: string;
  pin: string;
  deviceId?: string;
  rememberDevice?: boolean;
}

/**
 * PIN Login Response
 * Represents the response from the PIN login API
 */
export interface PinLoginResponse {
  success: boolean;
  user?: User;
  token?: string;
  refreshToken?: string;
  expiresIn?: number;
  expiresAt?: string;
  error?: string;
}

/**
 * Auth Error
 * Standardized error format for authentication errors
 */
export class AuthError extends Error {
  code: string;
  details?: any;
  status?: number;

  constructor(code: string, message: string, details?: any) {
    super(message);
    this.code = code;
    this.details = details;
    this.name = 'AuthError';
  }
}

/**
 * Authentication Events
 * Event names for auth-related events
 */
export const AUTH_EVENTS = {
  LOGIN_SUCCESS: 'auth:login:success',
  LOGIN_FAILURE: 'auth:login:failure',
  LOGOUT: 'auth:logout',
  TOKEN_REFRESHED: 'auth:token:refreshed',
  TOKEN_REFRESH_FAILED: 'auth:token:refresh:failed',
  UNAUTHORIZED: 'auth:unauthorized',
  FORBIDDEN: 'auth:forbidden',
  AUTH_ERROR: 'auth:error',
  TOKEN_EXPIRED: 'auth:token:expired',
  TOKEN_REFRESH: 'auth:token:refresh',
  API_AVAILABLE: 'auth:api:available',
  API_UNAVAILABLE: 'auth:api:unavailable',
  SESSION_TIMEOUT: 'auth:session:timeout',
  SESSION_EXPIRED: 'auth:session:expired',
  AUTHENTICATED: 'auth:authenticated',
  REGISTER_SUCCESS: 'auth:register:success',
  REGISTER_FAILURE: 'auth:register:failure',
  LOGIN_RATE_LIMITED: 'auth:login:ratelimited',
  PIN_LOGIN_SUCCESS: 'auth:pin:login:success',
  PIN_LOGIN_FAILURE: 'auth:pin:login:failure',
  PIN_SETUP_SUCCESS: 'auth:pin:setup:success',
  PIN_SETUP_FAILURE: 'auth:pin:setup:failure',
  PIN_CHANGE_SUCCESS: 'auth:pin:change:success',
  PIN_CHANGE_FAILURE: 'auth:pin:change:failure',
  PIN_DISABLED: 'auth:pin:disabled',
  PIN_RESET: 'auth:pin:reset',
  DEVICE_TRUSTED: 'auth:device:trusted',
  DEVICE_REMOVED: 'auth:device:removed',
  SUSPICIOUS_ACTIVITY: 'auth:suspicious:activity'
};

/**
 * Password Events
 * Event names for password-related events
 */
export const PASSWORD_EVENTS = {
  PASSWORD_CHANGED: 'auth:password:changed',
  PASSWORD_RESET_REQUESTED: 'auth:password:reset:requested',
  PASSWORD_RESET_COMPLETED: 'auth:password:reset:completed'
};

/**
 * API Events
 * Event names specifically for API health monitoring
 * These should match the events in the ApiHealth class
 */
export const API_EVENTS = {
  STATUS_CHANGE: 'api:status:change',
  AVAILABLE: 'api:available',
  UNAVAILABLE: 'api:unavailable',
  RECONNECTED: 'api:reconnected',
  NETWORK_ERROR: 'api:network:error'
};
