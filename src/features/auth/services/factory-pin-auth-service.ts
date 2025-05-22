/**
 * 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
 * 
 * Factory-Based PIN Auth Service
 * 
 * This service uses the centralized service factory and endpoint registry to provide
 * a consistent implementation of PIN auth-related operations with minimal duplication.
 */

import {
  PinLoginCredentials,
  PinLoginResponse,
  AUTH_EVENTS,
  User
} from '../types/auth.types';
import {
  PinLoginRequest,
  PinSetupRequest,
  PinChangeRequest,
  PinVerificationRequest,
  PinStatusResponse
} from '../schemas/pin-auth.schemas';
import {
  isAccountLocked,
  recordFailedLoginAttempt,
  resetFailedLoginAttempts,
  detectSuspiciousActivity
} from '../utils/securityUtils';
import {
  getDeviceFingerprint,
  createTrustedDevice
} from '../utils/deviceFingerprint';
import { createServiceMethod } from '@/lib/api/service-endpoint-factory';
import { PIN_AUTH_ENDPOINTS, TRUSTED_DEVICE_ENDPOINTS } from '@/lib/api/endpoint-registry';
import { ApiErrorType, createErrorHandler } from '@/lib/api/error-handler';
import { enhancedApiClient } from '@/lib/api/enhanced-api-client';

// Create module-specific error handler
const errorHandler = createErrorHandler('auth/pin');

// Define retry configuration
const PIN_AUTH_RETRY_CONFIG = {
  maxRetries: 1,
  retryDelay: 1000,
  shouldRetry: (error: any) => {
    // Only retry on network errors, not on auth failures
    return error.type === ApiErrorType.NETWORK || 
           error.type === ApiErrorType.TIMEOUT;
  }
};

/**
 * Factory-based PIN Authentication Service
 */
class FactoryPinAuthService {
  /**
   * Login with PIN
   * @param credentials PIN login credentials
   * @returns Promise with login response
   */
  async loginWithPin(credentials: PinLoginCredentials): Promise<PinLoginResponse> {
    try {
      // Check if account is locked due to too many failed attempts
      const lockStatus = isAccountLocked(credentials.username);
      if (lockStatus.isLocked) {
        const remainingMinutes = Math.ceil((lockStatus.remainingMs || 0) / 60000);

        return {
          success: false,
          error: `Too many failed login attempts. Please try again in ${remainingMinutes} minutes.`
        };
      }

      // Get device fingerprint
      const deviceId = credentials.deviceId || getDeviceFingerprint();

      // Check for suspicious activity
      const isSuspicious = detectSuspiciousActivity(credentials.username, deviceId);

      // If suspicious activity detected, dispatch event but continue with login
      if (isSuspicious) {
        window.dispatchEvent(new CustomEvent(AUTH_EVENTS.SUSPICIOUS_ACTIVITY, {
          detail: { username: credentials.username, deviceId }
        }));
      }

      // Prepare login request
      const loginRequest: PinLoginRequest = {
        username: credentials.username,
        pin: credentials.pin,
        deviceId,
        rememberDevice: credentials.rememberDevice || false
      };

      // Send login request using enhanced API client
      const response = await enhancedApiClient.post<PinLoginResponse['user']>(
        'auth/pin/LOGIN',
        loginRequest,
        undefined,
        { retry: PIN_AUTH_RETRY_CONFIG }
      );

      if (response.success && response.data) {
        // Reset failed login attempts on success
        resetFailedLoginAttempts(credentials.username);

        // If remember device is true, add to trusted devices
        if (credentials.rememberDevice) {
          this.addTrustedDevice();
        }

        // Dispatch login success event
        window.dispatchEvent(new CustomEvent(AUTH_EVENTS.PIN_LOGIN_SUCCESS, {
          detail: { data: response.data }
        }));

        return {
          success: true,
          user: response.data,
          token: response.data.token,
          refreshToken: response.data.refreshToken,
          expiresIn: response.data.expiresIn,
          expiresAt: response.data.expiresAt
        };
      } else {
        // Record failed login attempt
        const failedAttempt = recordFailedLoginAttempt(credentials.username);

        // Dispatch login failure event
        window.dispatchEvent(new CustomEvent(AUTH_EVENTS.PIN_LOGIN_FAILURE, {
          detail: {
            error: response.error,
            attemptCount: failedAttempt.count,
            isLocked: failedAttempt.isLocked
          }
        }));

        return {
          success: false,
          error: response.error || 'PIN login failed'
        };
      }
    } catch (error) {
      console.error('[PIN AUTH] Login error:', error);

      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';

      // Record failed login attempt
      recordFailedLoginAttempt(credentials.username);

      // Dispatch login failure event
      window.dispatchEvent(new CustomEvent(AUTH_EVENTS.PIN_LOGIN_FAILURE, {
        detail: { error: errorMessage }
      }));

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Set up PIN for a user
   * @param data PIN setup data
   * @returns Promise with setup result
   */
  async setupPin(data: PinSetupRequest): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await enhancedApiClient.post<{ success: boolean }>(
        'auth/pin/SETUP',
        data
      );

      if (response.success) {
        // Dispatch PIN setup success event
        window.dispatchEvent(new CustomEvent(AUTH_EVENTS.PIN_SETUP_SUCCESS));

        return { success: true };
      } else {
        // Dispatch PIN setup failure event
        window.dispatchEvent(new CustomEvent(AUTH_EVENTS.PIN_SETUP_FAILURE, {
          detail: { error: response.error }
        }));

        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('[PIN AUTH] Setup error:', error);

      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';

      // Dispatch PIN setup failure event
      window.dispatchEvent(new CustomEvent(AUTH_EVENTS.PIN_SETUP_FAILURE, {
        detail: { error: errorMessage }
      }));

      return { success: false, error: errorMessage };
    }
  }

  /**
   * Change PIN
   * @param data PIN change data
   * @returns Promise with change result
   */
  async changePin(data: PinChangeRequest): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await enhancedApiClient.post<{ success: boolean }>(
        'auth/pin/CHANGE',
        data
      );

      if (response.success) {
        // Dispatch PIN change success event
        window.dispatchEvent(new CustomEvent(AUTH_EVENTS.PIN_CHANGE_SUCCESS));

        return { success: true };
      } else {
        // Dispatch PIN change failure event
        window.dispatchEvent(new CustomEvent(AUTH_EVENTS.PIN_CHANGE_FAILURE, {
          detail: { error: response.error }
        }));

        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('[PIN AUTH] Change error:', error);

      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';

      // Dispatch PIN change failure event
      window.dispatchEvent(new CustomEvent(AUTH_EVENTS.PIN_CHANGE_FAILURE, {
        detail: { error: errorMessage }
      }));

      return { success: false, error: errorMessage };
    }
  }

  /**
   * Verify PIN
   * @param pin PIN to verify
   * @returns Promise with verification result
   */
  async verifyPin(pin: string): Promise<{ success: boolean; error?: string }> {
    try {
      const data: PinVerificationRequest = { pin };

      const response = await enhancedApiClient.post<{ success: boolean }>(
        'auth/pin/VERIFY',
        data
      );

      return {
        success: response.success,
        error: response.error
      };
    } catch (error) {
      console.error('[PIN AUTH] Verification error:', error);

      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';

      return { success: false, error: errorMessage };
    }
  }

  /**
   * Disable PIN
   * @returns Promise with disable result
   */
  async disablePin(): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await enhancedApiClient.post<{ success: boolean }>(
        'auth/pin/DISABLE'
      );

      if (response.success) {
        // Dispatch PIN disabled event
        window.dispatchEvent(new CustomEvent(AUTH_EVENTS.PIN_DISABLED));

        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('[PIN AUTH] Disable error:', error);

      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';

      return { success: false, error: errorMessage };
    }
  }

  /**
   * Reset a user's PIN (admin only)
   * @param userId ID of user whose PIN to reset
   * @returns Promise with reset result
   */
  async resetUserPin(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await enhancedApiClient.post<{ success: boolean }>(
        'auth/pin/RESET_USER_PIN',
        { userId }
      );

      if (response.success) {
        // Dispatch PIN reset event
        window.dispatchEvent(new CustomEvent(AUTH_EVENTS.PIN_RESET, {
          detail: { userId }
        }));

        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('[PIN AUTH] Reset user PIN error:', error);

      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';

      return { success: false, error: errorMessage };
    }
  }

  /**
   * Get PIN status
   * @returns Promise with PIN status
   */
  async getPinStatus(): Promise<PinStatusResponse> {
    try {
      const response = await enhancedApiClient.get<PinStatusResponse>(
        'auth/pin/STATUS'
      );

      if (response.success && response.data) {
        return response.data;
      } else {
        return { isPinEnabled: false };
      }
    } catch (error) {
      console.error('[PIN AUTH] Status error:', error);
      return { isPinEnabled: false };
    }
  }

  /**
   * Add current device to trusted devices
   * @returns Promise with result
   */
  async addTrustedDevice(): Promise<{ success: boolean; error?: string }> {
    try {
      const device = createTrustedDevice();

      const response = await enhancedApiClient.post<{ success: boolean }>(
        'auth/devices/ADD',
        { device }
      );

      if (response.success) {
        // Dispatch device trusted event
        window.dispatchEvent(new CustomEvent(AUTH_EVENTS.DEVICE_TRUSTED, {
          detail: { device }
        }));

        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('[PIN AUTH] Add trusted device error:', error);

      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';

      return { success: false, error: errorMessage };
    }
  }

  /**
   * Remove a device from trusted devices
   * @param deviceId Device ID to remove
   * @returns Promise with result
   */
  async removeTrustedDevice(deviceId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await enhancedApiClient.post<{ success: boolean }>(
        'auth/devices/REMOVE',
        { deviceId }
      );

      if (response.success) {
        // Dispatch device removed event
        window.dispatchEvent(new CustomEvent(AUTH_EVENTS.DEVICE_REMOVED, {
          detail: { deviceId }
        }));

        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('[PIN AUTH] Remove trusted device error:', error);

      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';

      return { success: false, error: errorMessage };
    }
  }

  /**
   * Get trusted devices
   * @returns Promise with trusted devices
   */
  async getTrustedDevices(): Promise<{ devices: any[]; error?: string }> {
    try {
      const response = await enhancedApiClient.get<{ devices: any[] }>(
        'auth/devices/LIST'
      );

      if (response.success && response.data) {
        return { devices: response.data.devices };
      } else {
        return { devices: [], error: response.error };
      }
    } catch (error) {
      console.error('[PIN AUTH] Get trusted devices error:', error);

      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';

      return { devices: [], error: errorMessage };
    }
  }
}

// Export singleton instance
export const factoryPinAuthService = new FactoryPinAuthService();

// Export for backward compatibility
export default factoryPinAuthService;
