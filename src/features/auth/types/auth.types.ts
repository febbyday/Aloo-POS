/**
 * 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
 *
 * Authentication Types
 *
 * Type definitions for the authentication system, including user data,
 * authentication responses, and context interfaces.
 */

/**
 * User Role Enum
 * Defines the possible roles a user can have in the system
 */
export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  CASHIER = 'CASHIER',
  USER = 'USER'
}

/**
 * User Interface
 * Represents a user in the system with their roles and permissions
 */
export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  roles: string[];
  permissions: string[];
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  avatar?: string;
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
  user?: User;
  token?: string;
  refreshToken?: string;
  expiresIn?: number;
  expiresAt?: string;
  error?: string;
}

/**
 * Authentication Response
 * Represents the response from the authentication API
 */
export interface AuthResponse {
  token: string;
  refreshToken: string;
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
  isBypassEnabled: boolean;
}

/**
 * Auth Context Actions
 * Actions that can be performed through the authentication context
 */
export interface AuthContextActions {
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  refreshAuth: () => Promise<boolean>;
  restoreAuth: (authData: { isAuthenticated: boolean; user: User | null; permissions: string[] }) => void;
  clearAuthError: () => void;
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
  UNAUTHORIZED: 'auth:unauthorized',
  FORBIDDEN: 'auth:forbidden',
  AUTH_ERROR: 'auth:error',
  TOKEN_EXPIRED: 'auth:token:expired',
  TOKEN_REFRESH: 'auth:token:refresh',
  API_AVAILABLE: 'auth:api:available',
  API_UNAVAILABLE: 'auth:api:unavailable',
  SESSION_TIMEOUT: 'auth:session:timeout',
  AUTHENTICATED: 'auth:authenticated',
  REGISTER_SUCCESS: 'auth:register:success',
  REGISTER_FAILURE: 'auth:register:failure',
  LOGIN_RATE_LIMITED: 'auth:login:ratelimited'
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
