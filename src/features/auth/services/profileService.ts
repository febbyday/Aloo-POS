/**
 * 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
 *
 * Profile Service
 *
 * This service handles user profile management functions,
 * including profile updates and password changes.
 */

import { User, PasswordChange, PASSWORD_EVENTS } from '../types/auth.types';
import { csrfProtectedApi } from '../../../lib/api/csrf-protected-api';

// API endpoints
const PROFILE_ENDPOINTS = {
  PROFILE: '/auth/profile',
  UPDATE_PROFILE: '/auth/profile/update',
  CHANGE_PASSWORD: '/auth/profile/change-password',
  UPLOAD_AVATAR: '/auth/profile/upload-avatar',
} as const;

/**
 * Profile Service Implementation
 * Handles user profile-related operations
 */
class ProfileServiceImpl {
  /**
   * Update user profile
   * 
   * @param profileData - The updated profile information
   * @returns Promise with success status and updated user or error
   */
  async updateProfile(profileData: Partial<User>): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const result = await csrfProtectedApi.post(PROFILE_ENDPOINTS.UPDATE_PROFILE, profileData);

      if (result.success && result.data) {
        // Dispatch profile updated event
        window.dispatchEvent(new CustomEvent('auth:profile:updated', {
          detail: { data: result.data }
        }));

        return { success: true, user: result.data as User };
      } else {
        return { success: false, error: result.error || 'Failed to update profile' };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      console.error('[PROFILE] Error updating profile:', error);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Change user password
   * 
   * @param passwordData - Object containing current and new password
   * @returns Promise with success status or error
   */
  async changePassword(passwordData: PasswordChange): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await csrfProtectedApi.post(PROFILE_ENDPOINTS.CHANGE_PASSWORD, passwordData);

      if (result.success) {
        // Dispatch password changed event
        window.dispatchEvent(new CustomEvent(PASSWORD_EVENTS.PASSWORD_CHANGED, {
          detail: { timestamp: new Date().toISOString() }
        }));

        return { success: true };
      } else {
        return { success: false, error: result.error || 'Failed to change password' };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      console.error('[PROFILE] Error changing password:', error);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Upload user avatar
   * 
   * @param file - The avatar file to upload
   * @returns Promise with success status and avatar URL or error
   */
  async uploadAvatar(file: File): Promise<{ success: boolean; avatarUrl?: string; error?: string }> {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      // Use regular API client with multipart/form-data content type
      const options: RequestInit = {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header as the browser will set it with the boundary
      };

      const result = await csrfProtectedApi.post(PROFILE_ENDPOINTS.UPLOAD_AVATAR, formData, options);

      if (result.success && result.data?.avatarUrl) {
        // Dispatch avatar updated event
        window.dispatchEvent(new CustomEvent('auth:avatar:updated', {
          detail: { avatarUrl: result.data.avatarUrl }
        }));

        return { success: true, avatarUrl: result.data.avatarUrl as string };
      } else {
        return { success: false, error: result.error || 'Failed to upload avatar' };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      console.error('[PROFILE] Error uploading avatar:', error);
      return { success: false, error: errorMessage };
    }
  }
}

// Export singleton instance
export const profileService = new ProfileServiceImpl();
