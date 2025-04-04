/**
 * 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
 * 
 * Authentication Event Constants
 * 
 * Constants for authentication-related events used throughout the application.
 */

/**
 * Authentication Events
 */
export const AUTH_EVENTS = {
  // Login events
  LOGIN_SUCCESS: 'auth:login:success',
  LOGIN_FAILURE: 'auth:login:failure',
  LOGIN_RATE_LIMITED: 'auth:login:rate_limited',
  
  // Logout events
  LOGOUT: 'auth:logout',
  
  // Session events
  RESTORE_SESSION: 'auth:session:restore',
  NO_SESSION: 'auth:session:none',
  SESSION_TIMEOUT: 'auth:session:timeout',
  
  // Token events
  TOKEN_REFRESHED: 'auth:token:refreshed',
  TOKEN_EXPIRED: 'auth:token:expired',
  
  // Authorization events
  UNAUTHORIZED: 'auth:unauthorized',
  FORBIDDEN: 'auth:forbidden',
  
  // Authentication status events
  AUTHENTICATED: 'auth:authenticated',
  AUTH_ERROR: 'auth:error',
  
  // Registration events
  REGISTER_SUCCESS: 'auth:register:success',
  REGISTER_FAILURE: 'auth:register:failure',
  
  // Password events
  PASSWORD_CHANGED: 'auth:password:changed',
  PASSWORD_RESET_REQUESTED: 'auth:password:reset:requested',
  PASSWORD_RESET_COMPLETED: 'auth:password:reset:completed',
  
  // API status events
  API_AVAILABLE: 'auth:api:available',
  API_UNAVAILABLE: 'auth:api:unavailable'
};

/**
 * Password-related Events
 */
export const PASSWORD_EVENTS = {
  CHANGE_SUCCESS: 'password:change:success',
  CHANGE_FAILURE: 'password:change:failure',
  RESET_REQUESTED: 'password:reset:requested',
  RESET_SUCCESS: 'password:reset:success',
  RESET_FAILURE: 'password:reset:failure'
};

/**
 * API-related Events
 */
export const API_EVENTS = {
  AVAILABLE: 'api:available',
  UNAVAILABLE: 'api:unavailable',
  ERROR: 'api:error'
};
