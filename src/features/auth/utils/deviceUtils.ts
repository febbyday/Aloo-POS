/**
 * Device Utilities
 * 
 * Utilities for device identification, fingerprinting, and device-related
 * functionality for session management.
 */

import { DeviceInfo } from '../types';
import FingerprintJS from '@fingerprintjs/fingerprintjs';

// Storage key for device ID
const DEVICE_ID_KEY = 'pos_device_id';

/**
 * Initialize fingerprint service
 * @returns Promise with initialized fingerprint agent
 */
let fingerprintPromise: Promise<any> | null = null;
const getFingerPrintAgent = async () => {
  if (!fingerprintPromise) {
    fingerprintPromise = FingerprintJS.load();
  }
  return fingerprintPromise;
};

/**
 * Generate a unique device fingerprint
 * @returns Device fingerprint as a string
 */
export async function generateDeviceFingerprint(): Promise<string> {
  try {
    const agent = await getFingerPrintAgent();
    const result = await agent.get();
    return result.visitorId;
  } catch (error) {
    console.error('Error generating device fingerprint:', error);
    // Fallback to a simpler fingerprint
    return createSimpleFingerprint();
  }
}

/**
 * Get device fingerprint (from storage or generate a new one)
 * @returns Device fingerprint as a string
 */
export function getDeviceFingerprint(): string {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  
  if (!deviceId) {
    // Create a simple fingerprint for immediate use
    deviceId = createSimpleFingerprint();
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
    
    // Generate a more sophisticated fingerprint asynchronously
    generateDeviceFingerprint().then(betterFingerprint => {
      localStorage.setItem(DEVICE_ID_KEY, betterFingerprint);
    });
  }
  
  return deviceId;
}

/**
 * Create a simple device fingerprint as a fallback
 * @returns Simple device fingerprint
 */
function createSimpleFingerprint(): string {
  const navigatorInfo = [
    navigator.userAgent,
    navigator.language,
    new Date().getTimezoneOffset(),
    navigator.platform,
    navigator.vendor,
    window.screen.colorDepth,
    window.screen.height,
    window.screen.width
  ].join('-');
  
  return hashString(navigatorInfo + '-' + new Date().getTime());
}

/**
 * Create a simple hash of a string
 * @param str String to hash
 * @returns Hashed string
 */
function hashString(str: string): string {
  let hash = 0;
  if (str.length === 0) return hash.toString(36);
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return Math.abs(hash).toString(36);
}

/**
 * Check if this is a new device
 * @param storedDevices List of stored trusted devices
 * @returns True if this is a new device
 */
export function isNewDevice(storedDevices: DeviceInfo[]): boolean {
  const currentDeviceId = getDeviceFingerprint();
  return !storedDevices.some(device => device.deviceId === currentDeviceId);
}

/**
 * Compare two device fingerprints and calculate similarity score
 * @param fp1 First fingerprint
 * @param fp2 Second fingerprint
 * @returns Similarity score (0-1)
 */
export function getDeviceSimilarity(fp1: string, fp2: string): number {
  // Simple implementation for demonstration
  // In a real implementation, you would use a more sophisticated 
  // algorithm for comparing fingerprints
  if (fp1 === fp2) return 1;
  
  // Calculate string similarity
  let matchCount = 0;
  const minLength = Math.min(fp1.length, fp2.length);
  
  for (let i = 0; i < minLength; i++) {
    if (fp1[i] === fp2[i]) matchCount++;
  }
  
  return matchCount / minLength;
}

/**
 * Get human-readable device name
 * @returns Device name string
 */
export function getDeviceName(): string {
  const ua = navigator.userAgent;
  let browserName = "Unknown Browser";
  let osName = "Unknown OS";
  
  // Extract browser name
  if (ua.includes("Firefox")) {
    browserName = "Firefox";
  } else if (ua.includes("SamsungBrowser")) {
    browserName = "Samsung Browser";
  } else if (ua.includes("Opera") || ua.includes("OPR")) {
    browserName = "Opera";
  } else if (ua.includes("Edge")) {
    browserName = "Edge";
  } else if (ua.includes("Chrome")) {
    browserName = "Chrome";
  } else if (ua.includes("Safari")) {
    browserName = "Safari";
  }
  
  // Extract OS name
  if (ua.includes("Windows")) {
    osName = "Windows";
  } else if (ua.includes("Mac")) {
    osName = "macOS";
  } else if (ua.includes("Android")) {
    osName = "Android";
  } else if (ua.includes("iOS")) {
    osName = "iOS";
  } else if (ua.includes("Linux")) {
    osName = "Linux";
  }
  
  // Determine device type
  let deviceType = "Desktop";
  if (/iPhone|iPad|iPod|Android/i.test(ua)) {
    deviceType = /iPad/i.test(ua) ? "Tablet" : "Mobile";
  }
  
  return `${browserName} on ${osName} (${deviceType})`;
}
