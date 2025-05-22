/**
 * Session Management Service
 *
 * Service for managing user sessions, including listing, tracking,
 * and revoking sessions across multiple devices.
 */

import { enhancedApiClient } from '../../../lib/api/enhanced-api-client';
import {
  UserSession,
  SessionStatus,
  SessionDetails,
  SessionFilterOptions,
  SessionManagementResponse,
  SESSION_EVENTS
} from '../types';
import { errorHandler } from '../../../lib/error/error-handler';
import { DeviceInfo } from '../types/session.types';
import { getDeviceFingerprint } from '../utils/deviceUtils';
import { SESSION_ENDPOINTS } from '../../../lib/api/endpoint-registry';

/**
 * Session Management Service Implementation
 */
class SessionServiceImpl {
  /**
   * Get all active sessions for the current user
   * @returns Promise with array of sessions
   */
  async getAllSessions(): Promise<UserSession[]> {
    try {
      const response = await enhancedApiClient.get<UserSession[]>(
        'auth/sessions/LIST'
      );
      return response;
    } catch (error) {
      const apiError = errorHandler.handleError(error, 'getAllSessions');
      throw apiError;
    }
  }

  /**
   * Get current session details
   * @returns Promise with current session details
   */
  async getCurrentSession(): Promise<SessionDetails> {
    try {
      const response = await enhancedApiClient.get<SessionDetails>(
        'auth/sessions/CURRENT'
      );
      return response;
    } catch (error) {
      const apiError = errorHandler.handleError(error, 'getCurrentSession');
      throw apiError;
    }
  }

  /**
   * Get detailed information about a specific session
   * @param sessionId Session ID to get details for
   * @returns Promise with session details
   */
  async getSessionDetails(sessionId: string): Promise<SessionDetails> {
    try {
      const response = await enhancedApiClient.get<SessionDetails>(
        'auth/sessions/DETAILS',
        { sessionId }
      );
      return response;
    } catch (error) {
      const apiError = errorHandler.handleError(error, 'getSessionDetails');
      throw apiError;
    }
  }

  /**
   * Revoke a specific session
   * @param sessionId Session ID to revoke
   * @param reason Optional reason for revocation
   * @returns Promise with success status
   */
  async revokeSession(sessionId: string, reason?: string): Promise<SessionManagementResponse> {
    try {
      const response = await enhancedApiClient.post<SessionManagementResponse>(
        'auth/sessions/REVOKE',
        { sessionId, reason }
      );

      // Dispatch session revoked event
      this.dispatchSessionEvent(SESSION_EVENTS.SESSION_REVOKED, {
        sessionId,
        timestamp: new Date().toISOString()
      });

      return response;
    } catch (error) {
      const apiError = errorHandler.handleError(error, 'revokeSession');
      throw apiError;
    }
  }

  /**
   * Revoke all sessions except the current one
   * @param keepCurrent If true, keep the current session active (default: true)
   * @param reason Optional reason for revocation
   * @returns Promise with success status
   */
  async revokeAllSessions(keepCurrent: boolean = true, reason?: string): Promise<SessionManagementResponse> {
    try {
      const response = await enhancedApiClient.post<SessionManagementResponse>(
        'auth/sessions/REVOKE_ALL',
        { keepCurrent, reason }
      );

      // Dispatch all sessions revoked event
      this.dispatchSessionEvent(SESSION_EVENTS.SESSION_REVOKED_ALL, {
        keepCurrent,
        timestamp: new Date().toISOString()
      });

      return response;
    } catch (error) {
      const apiError = errorHandler.handleError(error, 'revokeAllSessions');
      throw apiError;
    }
  }

  /**
   * Get filtered sessions based on provided options
   * @param options Filter options
   * @returns Promise with filtered sessions
   */
  async getFilteredSessions(options: SessionFilterOptions): Promise<UserSession[]> {
    try {
      const response = await enhancedApiClient.get<UserSession[]>(
        'auth/sessions/LIST',
        undefined,
        { params: options }
      );
      return response;
    } catch (error) {
      const apiError = errorHandler.handleError(error, 'getFilteredSessions');
      throw apiError;
    }
  }

  /**
   * Get current device information
   * @returns Current device info object
   */
  getCurrentDeviceInfo(): DeviceInfo {
    const userAgent = navigator.userAgent;
    const deviceId = getDeviceFingerprint();

    // Parse user agent to extract browser, OS, etc.
    const browser = this.getBrowserInfo(userAgent);
    const os = this.getOSInfo(userAgent);
    const deviceType = this.getDeviceType(userAgent);

    return {
      deviceId,
      deviceName: `${browser.name} on ${os.name}`,
      deviceType: deviceType.type,
      browser: browser.name,
      browserVersion: browser.version,
      os: os.name,
      osVersion: os.version,
      isMobile: deviceType.isMobile,
      isTablet: deviceType.isTablet,
      isDesktop: deviceType.isDesktop,
      isTrusted: false // By default, new devices are not trusted
    };
  }

  /**
   * Extract browser information from user agent
   * @param userAgent Browser user agent string
   * @returns Browser name and version
   */
  private getBrowserInfo(userAgent: string): { name: string; version: string } {
    // Default values
    let name = 'Unknown Browser';
    let version = '';

    // Chrome
    if (userAgent.includes('Chrome')) {
      name = 'Chrome';
      const match = userAgent.match(/Chrome\/(\d+\.\d+)/);
      if (match) version = match[1];
    }
    // Edge
    else if (userAgent.includes('Edg')) {
      name = 'Edge';
      const match = userAgent.match(/Edg\/(\d+\.\d+)/);
      if (match) version = match[1];
    }
    // Firefox
    else if (userAgent.includes('Firefox')) {
      name = 'Firefox';
      const match = userAgent.match(/Firefox\/(\d+\.\d+)/);
      if (match) version = match[1];
    }
    // Safari
    else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      name = 'Safari';
      const match = userAgent.match(/Version\/(\d+\.\d+)/);
      if (match) version = match[1];
    }
    // IE
    else if (userAgent.includes('Trident') || userAgent.includes('MSIE')) {
      name = 'Internet Explorer';
      const match = userAgent.match(/(?:MSIE |rv:)(\d+\.\d+)/);
      if (match) version = match[1];
    }

    return { name, version };
  }

  /**
   * Extract OS information from user agent
   * @param userAgent Browser user agent string
   * @returns OS name and version
   */
  private getOSInfo(userAgent: string): { name: string; version: string } {
    // Default values
    let name = 'Unknown OS';
    let version = '';

    // Windows
    if (userAgent.includes('Windows')) {
      name = 'Windows';

      if (userAgent.includes('Windows NT 10.0')) version = '10';
      else if (userAgent.includes('Windows NT 6.3')) version = '8.1';
      else if (userAgent.includes('Windows NT 6.2')) version = '8';
      else if (userAgent.includes('Windows NT 6.1')) version = '7';
      else if (userAgent.includes('Windows NT 6.0')) version = 'Vista';
      else if (userAgent.includes('Windows NT 5.1')) version = 'XP';
    }
    // macOS
    else if (userAgent.includes('Mac OS X')) {
      name = 'macOS';
      const match = userAgent.match(/Mac OS X (\d+[._]\d+)/);
      if (match) {
        version = match[1].replace('_', '.');
      }
    }
    // iOS
    else if (/iPhone|iPad|iPod/.test(userAgent)) {
      name = 'iOS';
      const match = userAgent.match(/OS (\d+[._]\d+)/);
      if (match) {
        version = match[1].replace('_', '.');
      }
    }
    // Android
    else if (userAgent.includes('Android')) {
      name = 'Android';
      const match = userAgent.match(/Android (\d+\.\d+)/);
      if (match) version = match[1];
    }
    // Linux
    else if (userAgent.includes('Linux')) {
      name = 'Linux';
    }

    return { name, version };
  }

  /**
   * Determine device type from user agent
   * @param userAgent Browser user agent string
   * @returns Device type information
   */
  private getDeviceType(userAgent: string): {
    type: string;
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean
  } {
    const isMobile = /iPhone|iPad|iPod|Android|webOS|BlackBerry|Windows Phone/i.test(userAgent);
    const isTablet = /iPad|Android(?!.*Mobile)/i.test(userAgent);
    const isDesktop = !isMobile && !isTablet;

    let type = 'desktop';
    if (isTablet) type = 'tablet';
    else if (isMobile) type = 'mobile';

    return { type, isMobile, isTablet, isDesktop };
  }

  /**
   * Dispatch a session-related event
   * @param eventType Type of session event
   * @param data Event data
   */
  private dispatchSessionEvent(eventType: string, data: any): void {
    window.dispatchEvent(new CustomEvent(eventType, { detail: data }));
  }
}

// Create singleton instance
export const sessionService = new SessionServiceImpl();

// Export default for backward compatibility
export default sessionService;
