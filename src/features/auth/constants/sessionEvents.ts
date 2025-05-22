/**
 * Session Events Constants
 * 
 * Constants for session-related events such as creation, expiration, and revocation
 */

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

export default SESSION_EVENTS;
