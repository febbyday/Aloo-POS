/**
 * 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
 *
 * Authentication Configuration
 *
 * This file contains configuration settings for the authentication system.
 * It includes development mode options for bypassing authentication during development.
 */

/**
 * Authentication configuration settings
 */
export const AUTH_CONFIG = {
  // Token management
  TOKEN: {
    REFRESH_INTERVAL_MS: 14 * 60 * 1000, // Refresh token 1 min before expiry (for 15 min tokens)
    EXPIRY_BUFFER_MS: 10 * 1000, // Buffer time (10 seconds) for checking token expiry
  },

  // Session management
  SESSION: {
    TIMEOUT_MS: 30 * 60 * 1000, // 30 minutes of inactivity
    STORAGE_KEY: 'auth_session',
    CHECK_INTERVAL_MS: 60 * 1000, // Check session validity every minute
  },

  // Development mode settings - enable bypasses for debugging
  DEV_MODE: {
    BYPASS_AUTH: true, // Enable auth bypass so app won't crash in development
    ENABLE_MOCK_DATA: false, // Keep mock data disabled - attempt to use real API data
    // Default user removed - we will always use real authentication when API is available
  }
};
