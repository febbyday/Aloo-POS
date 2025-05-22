/**
 * 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
 * 
 * Security Utilities
 * 
 * This utility provides enhanced security features for authentication.
 */

import { AUTH_EVENTS } from '../types/auth.types';

/**
 * Maximum number of failed login attempts before temporary lockout
 */
const MAX_LOGIN_ATTEMPTS = 5;

/**
 * Lockout duration in milliseconds (15 minutes)
 */
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;

/**
 * Storage key for failed login attempts
 */
const FAILED_ATTEMPTS_KEY = 'auth_failed_attempts';

/**
 * Storage key for lockout expiry
 */
const LOCKOUT_EXPIRY_KEY = 'auth_lockout_expiry';

/**
 * Interface for failed login attempts
 */
interface FailedLoginAttempts {
  count: number;
  lastAttempt: string;
  username: string;
}

/**
 * Record a failed login attempt
 * @param username Username that failed to login
 * @returns Object with count and whether the account is locked
 */
export function recordFailedLoginAttempt(username: string): { count: number; isLocked: boolean; lockoutRemaining?: number } {
  try {
    // Get current failed attempts
    const storedAttempts = localStorage.getItem(FAILED_ATTEMPTS_KEY);
    let attempts: FailedLoginAttempts = storedAttempts
      ? JSON.parse(storedAttempts)
      : { count: 0, lastAttempt: new Date().toISOString(), username };
    
    // If username is different, reset attempts
    if (attempts.username !== username) {
      attempts = { count: 0, lastAttempt: new Date().toISOString(), username };
    }
    
    // Increment attempt count
    attempts.count += 1;
    attempts.lastAttempt = new Date().toISOString();
    
    // Store updated attempts
    localStorage.setItem(FAILED_ATTEMPTS_KEY, JSON.stringify(attempts));
    
    // Check if account should be locked
    if (attempts.count >= MAX_LOGIN_ATTEMPTS) {
      const lockoutExpiry = Date.now() + LOCKOUT_DURATION_MS;
      localStorage.setItem(LOCKOUT_EXPIRY_KEY, lockoutExpiry.toString());
      
      // Dispatch rate limit event
      window.dispatchEvent(new CustomEvent(AUTH_EVENTS.LOGIN_RATE_LIMITED, {
        detail: { username, lockoutExpiry }
      }));
      
      // Calculate remaining lockout time in minutes
      const lockoutRemaining = Math.ceil(LOCKOUT_DURATION_MS / 60000);
      
      return { count: attempts.count, isLocked: true, lockoutRemaining };
    }
    
    return { count: attempts.count, isLocked: false };
  } catch (error) {
    console.error('Error recording failed login attempt:', error);
    return { count: 0, isLocked: false };
  }
}

/**
 * Check if a user account is temporarily locked
 * @param username Username to check
 * @returns Object with locked status and remaining lockout time
 */
export function isAccountLocked(username: string): { isLocked: boolean; remainingMs?: number } {
  try {
    // Get current failed attempts
    const storedAttempts = localStorage.getItem(FAILED_ATTEMPTS_KEY);
    if (!storedAttempts) {
      return { isLocked: false };
    }
    
    const attempts: FailedLoginAttempts = JSON.parse(storedAttempts);
    
    // If username is different, not locked
    if (attempts.username !== username) {
      return { isLocked: false };
    }
    
    // If not enough failed attempts, not locked
    if (attempts.count < MAX_LOGIN_ATTEMPTS) {
      return { isLocked: false };
    }
    
    // Check lockout expiry
    const lockoutExpiryStr = localStorage.getItem(LOCKOUT_EXPIRY_KEY);
    if (!lockoutExpiryStr) {
      return { isLocked: false };
    }
    
    const lockoutExpiry = parseInt(lockoutExpiryStr, 10);
    const now = Date.now();
    
    // If lockout has expired, reset and return not locked
    if (now > lockoutExpiry) {
      resetFailedLoginAttempts();
      return { isLocked: false };
    }
    
    // Account is locked, calculate remaining time
    const remainingMs = lockoutExpiry - now;
    
    return { isLocked: true, remainingMs };
  } catch (error) {
    console.error('Error checking account lock status:', error);
    return { isLocked: false };
  }
}

/**
 * Reset failed login attempts
 * @param username Optional username to reset (if not provided, resets for all users)
 */
export function resetFailedLoginAttempts(username?: string): void {
  try {
    // If no username provided, clear all attempts
    if (!username) {
      localStorage.removeItem(FAILED_ATTEMPTS_KEY);
      localStorage.removeItem(LOCKOUT_EXPIRY_KEY);
      return;
    }
    
    // Get current failed attempts
    const storedAttempts = localStorage.getItem(FAILED_ATTEMPTS_KEY);
    if (!storedAttempts) {
      return;
    }
    
    const attempts: FailedLoginAttempts = JSON.parse(storedAttempts);
    
    // If username matches, reset attempts
    if (attempts.username === username) {
      localStorage.removeItem(FAILED_ATTEMPTS_KEY);
      localStorage.removeItem(LOCKOUT_EXPIRY_KEY);
    }
  } catch (error) {
    console.error('Error resetting failed login attempts:', error);
  }
}

/**
 * Detect suspicious activity based on login patterns
 * @param username Username to check
 * @param ipAddress IP address of the login attempt
 * @param deviceId Device ID of the login attempt
 * @returns True if activity is suspicious
 */
export function detectSuspiciousActivity(
  username: string,
  deviceId: string
): boolean {
  try {
    // Get last login information
    const lastLoginInfo = localStorage.getItem(`last_login_${username}`);
    
    // If no previous login, not suspicious
    if (!lastLoginInfo) {
      // Store current login info for future reference
      storeLoginInfo(username, deviceId);
      return false;
    }
    
    const lastLogin = JSON.parse(lastLoginInfo);
    
    // Check if device is different
    const isNewDevice = lastLogin.deviceId !== deviceId;
    
    // Store current login info
    storeLoginInfo(username, deviceId);
    
    // For now, just consider new devices as potentially suspicious
    // In a real implementation, you would have more sophisticated checks
    return isNewDevice;
  } catch (error) {
    console.error('Error detecting suspicious activity:', error);
    return false;
  }
}

/**
 * Store login information for future reference
 * @param username Username
 * @param deviceId Device ID
 */
function storeLoginInfo(username: string, deviceId: string): void {
  try {
    const loginInfo = {
      deviceId,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem(`last_login_${username}`, JSON.stringify(loginInfo));
  } catch (error) {
    console.error('Error storing login info:', error);
  }
}

/**
 * Generate a random PIN
 * @returns A 4-digit PIN
 */
export function generateRandomPin(): string {
  // Generate a random 4-digit number
  const pin = Math.floor(1000 + Math.random() * 9000).toString();
  return pin;
}

/**
 * Validate a PIN format
 * @param pin PIN to validate
 * @returns True if PIN is valid
 */
export function isValidPinFormat(pin: string): boolean {
  // PIN must be exactly 4 digits
  return /^\d{4}$/.test(pin);
}

/**
 * Check if a PIN is common or easily guessable
 * @param pin PIN to check
 * @returns True if PIN is common
 */
export function isCommonPin(pin: string): boolean {
  // List of common PINs to avoid
  const commonPins = [
    '0000', '1111', '2222', '3333', '4444', '5555', '6666', '7777', '8888', '9999',
    '1234', '4321', '1212', '2121', '1122', '2211', '1313', '3131', '1414', '4141',
    '2000', '2001', '2002', '2003', '2004', '2005', '2006', '2007', '2008', '2009',
    '2010', '2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019',
    '2020', '2021', '2022', '2023', '2024', '2025', '0123', '1230', '0987', '9870'
  ];
  
  return commonPins.includes(pin);
}
