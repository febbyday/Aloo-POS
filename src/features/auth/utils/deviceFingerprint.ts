/**
 * 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
 * 
 * Device Fingerprinting Utility
 * 
 * This utility provides functions for generating and managing device fingerprints
 * to enhance security by identifying and tracking devices used for authentication.
 */

import { v4 as uuidv4 } from 'uuid';
import { TrustedDevice } from '../types/auth.types';

/**
 * Device information interface
 */
interface DeviceInfo {
  userAgent: string;
  language: string;
  platform: string;
  screenResolution: string;
  timezone: string;
  colorDepth: number;
  deviceMemory?: number;
  hardwareConcurrency?: number;
  touchSupport: boolean;
  cookiesEnabled: boolean;
}

/**
 * Generate a device fingerprint based on browser and device characteristics
 * @returns A unique device identifier
 */
export function generateDeviceFingerprint(): string {
  try {
    // Get device information
    const deviceInfo = getDeviceInfo();
    
    // Create a string from device information
    const deviceString = JSON.stringify(deviceInfo);
    
    // Generate a hash from the device string
    // In a real implementation, you might use a more sophisticated hashing algorithm
    // For simplicity, we're using a combination of hash and UUID
    const hash = simpleHash(deviceString);
    const uniqueId = `${hash}-${uuidv4().slice(0, 8)}`;
    
    // Store the device ID in local storage for persistence
    localStorage.setItem('device_id', uniqueId);
    
    return uniqueId;
  } catch (error) {
    console.error('Error generating device fingerprint:', error);
    
    // Fallback to a random UUID if fingerprinting fails
    const fallbackId = `fallback-${uuidv4()}`;
    localStorage.setItem('device_id', fallbackId);
    
    return fallbackId;
  }
}

/**
 * Get the current device fingerprint or generate a new one
 * @returns The device fingerprint
 */
export function getDeviceFingerprint(): string {
  const storedId = localStorage.getItem('device_id');
  
  if (storedId) {
    return storedId;
  }
  
  return generateDeviceFingerprint();
}

/**
 * Get information about the current device
 * @returns Device information
 */
function getDeviceInfo(): DeviceInfo {
  const { userAgent, language, platform } = navigator;
  const { width, height } = window.screen;
  const { colorDepth } = window.screen;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const touchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const cookiesEnabled = navigator.cookieEnabled;
  
  // Optional properties that might not be available in all browsers
  const deviceMemory = (navigator as any).deviceMemory;
  const hardwareConcurrency = navigator.hardwareConcurrency;
  
  return {
    userAgent,
    language,
    platform,
    screenResolution: `${width}x${height}`,
    timezone,
    colorDepth,
    deviceMemory,
    hardwareConcurrency,
    touchSupport,
    cookiesEnabled
  };
}

/**
 * Simple hash function for strings
 * @param str String to hash
 * @returns A simple hash value
 */
function simpleHash(str: string): string {
  let hash = 0;
  
  if (str.length === 0) {
    return hash.toString(16);
  }
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return Math.abs(hash).toString(16);
}

/**
 * Get a user-friendly name for the current device
 * @returns A device name based on browser and OS
 */
export function getDeviceName(): string {
  const userAgent = navigator.userAgent;
  let browser = 'Unknown Browser';
  let os = 'Unknown OS';
  
  // Detect browser
  if (userAgent.indexOf('Firefox') > -1) {
    browser = 'Firefox';
  } else if (userAgent.indexOf('SamsungBrowser') > -1) {
    browser = 'Samsung Browser';
  } else if (userAgent.indexOf('Opera') > -1 || userAgent.indexOf('OPR') > -1) {
    browser = 'Opera';
  } else if (userAgent.indexOf('Trident') > -1) {
    browser = 'Internet Explorer';
  } else if (userAgent.indexOf('Edge') > -1) {
    browser = 'Edge';
  } else if (userAgent.indexOf('Chrome') > -1) {
    browser = 'Chrome';
  } else if (userAgent.indexOf('Safari') > -1) {
    browser = 'Safari';
  }
  
  // Detect OS
  if (userAgent.indexOf('Windows') > -1) {
    os = 'Windows';
  } else if (userAgent.indexOf('Mac') > -1) {
    os = 'MacOS';
  } else if (userAgent.indexOf('Linux') > -1) {
    os = 'Linux';
  } else if (userAgent.indexOf('Android') > -1) {
    os = 'Android';
  } else if (userAgent.indexOf('like Mac') > -1) {
    os = 'iOS';
  }
  
  return `${browser} on ${os}`;
}

/**
 * Check if the current device is trusted
 * @param trustedDevices List of trusted devices
 * @returns True if the device is trusted
 */
export function isDeviceTrusted(trustedDevices: TrustedDevice[]): boolean {
  const deviceId = getDeviceFingerprint();
  
  return trustedDevices.some(device => device.id === deviceId);
}

/**
 * Create a trusted device object from the current device
 * @returns A trusted device object
 */
export function createTrustedDevice(): TrustedDevice {
  const deviceId = getDeviceFingerprint();
  const deviceName = getDeviceName();
  const userAgent = navigator.userAgent;
  
  // Extract browser and OS from user agent
  let browser = 'Unknown';
  let os = 'Unknown';
  
  if (userAgent.indexOf('Firefox') > -1) {
    browser = 'Firefox';
  } else if (userAgent.indexOf('Chrome') > -1) {
    browser = 'Chrome';
  } else if (userAgent.indexOf('Safari') > -1) {
    browser = 'Safari';
  } else if (userAgent.indexOf('Edge') > -1) {
    browser = 'Edge';
  }
  
  if (userAgent.indexOf('Windows') > -1) {
    os = 'Windows';
  } else if (userAgent.indexOf('Mac') > -1) {
    os = 'MacOS';
  } else if (userAgent.indexOf('Android') > -1) {
    os = 'Android';
  } else if (userAgent.indexOf('iOS') > -1 || userAgent.indexOf('iPhone') > -1 || userAgent.indexOf('iPad') > -1) {
    os = 'iOS';
  } else if (userAgent.indexOf('Linux') > -1) {
    os = 'Linux';
  }
  
  return {
    id: deviceId,
    name: deviceName,
    browser,
    os,
    lastUsed: new Date().toISOString(),
    ipAddress: '' // This will be filled in by the server
  };
}
