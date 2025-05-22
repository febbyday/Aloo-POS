/**
 * Session Management Types
 *
 * Type definitions for user session management, including active sessions,
 * session history, and device information.
 */

import { User } from './auth.types';

/**
 * User Session
 * Represents an active user session across devices
 */
export interface UserSession {
  id: string;
  userId: string;
  deviceInfo: DeviceInfo;
  ipAddress: string;
  startedAt: string;
  lastActiveAt: string;
  expiresAt: string;
  active: boolean;
  revoked?: boolean;
  revokedAt?: string;
  revokedBy?: string;
  revokedReason?: string;
}

/**
 * Device Information
 * Details about the device used for the session
 */
export interface DeviceInfo {
  deviceId: string;
  deviceName: string;
  deviceType: string;
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTrusted: boolean;
  trustedSince?: string;
}

/**
 * Session Status
 * The status of a user session
 */
export enum SessionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
  LOGGED_OUT = 'logged_out'
}

/**
 * Session Location
 * Geographic location information for a session
 */
export interface SessionLocation {
  city?: string;
  region?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

/**
 * Session Details
 * Detailed information about a user session
 */
export interface SessionDetails extends UserSession {
  user: User;
  location?: SessionLocation;
  isCurrent: boolean;
}

/**
 * Session Filter Options
 * Options for filtering sessions in the UI
 */
export interface SessionFilterOptions {
  status?: SessionStatus;
  deviceType?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

/**
 * Session Events
 * Event names for session-related events
 */
export const SESSION_EVENTS = {
  SESSION_CREATED: 'session:created',
  SESSION_UPDATED: 'session:updated',
  SESSION_EXPIRED: 'session:expired',
  SESSION_REVOKED: 'session:revoked',
  SESSION_REVOKED_ALL: 'session:revoked:all',
  NEW_DEVICE_LOGIN: 'session:new-device-login',
  SUSPICIOUS_LOGIN: 'session:suspicious-login',
};

/**
 * Session Management Response
 * Response from session management API calls
 */
export interface SessionManagementResponse {
  success: boolean;
  message?: string;
  error?: string;
}
