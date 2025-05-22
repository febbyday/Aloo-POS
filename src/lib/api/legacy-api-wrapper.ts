/**
 * Legacy API Wrapper
 * 
 * This file provides safe wrappers for legacy API functions that track usage
 * without attempting to modify immutable ES modules directly.
 */

import { reportLegacyApiUsage, getSuggestionForLegacyKey } from './legacy-detection';

// Import original modules but don't modify them directly
import * as originalConfig from './config';
import * as originalApiConfig from './api-config';

/**
 * Wrapper for getApiEndpoint that logs usage but doesn't attempt to modify the original
 */
export function getApiEndpoint(...args: Parameters<typeof originalConfig.getApiEndpoint>) {
  // Only track in development mode and if window exists
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    const legacyKey = args[0];
    reportLegacyApiUsage(
      'getApiEndpoint',
      args,
      getSuggestionForLegacyKey(legacyKey)
    );
  }
  
  // Call the original function
  return originalConfig.getApiEndpoint(...args);
}

/**
 * Safe proxy for API_CONFIG
 * This creates a proxy object that logs access to specific properties
 */
export const API_CONFIG = new Proxy(originalApiConfig.API_CONFIG, {
  get(target, prop, receiver) {
    // Monitor specific properties that should be migrated
    if (prop === 'FULL_API_URL' && import.meta.env.DEV && typeof window !== 'undefined') {
      reportLegacyApiUsage(
        'API_CONFIG.FULL_API_URL',
        [],
        'Use getApiUrl() from enhanced-config instead'
      );
    }
    
    // Return the original value
    return Reflect.get(target, prop, receiver);
  }
});

// Re-export any other needed functions/objects from the legacy modules
export const { API_VERSION, API_PATHS } = originalConfig;

/**
 * Initializes the legacy API wrapper monitoring
 * Call this instead of the original detectLegacyApiUsage
 */
export function initLegacyApiMonitoring(): void {
  console.log('Legacy API monitoring initialized safely.');
  console.log('Use imported functions from "legacy-api-wrapper.ts" instead of direct imports to track usage.');
}
