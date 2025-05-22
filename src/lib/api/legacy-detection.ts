/**
 * Legacy API Detection Utilities
 *
 * This file provides utilities to detect and report legacy API usage.
 * It can be used to help identify code that needs to be migrated to the enhanced API client.
 */

import { getApiUrl, getApiPath } from './enhanced-config';
import { LEGACY_TO_ENHANCED_MAP } from './migration-utils';

// Track which files have already been reported to avoid spamming the console
const reportedFiles = new Set<string>();

/**
 * Report legacy API usage with detailed information
 *
 * @param functionName - The legacy function name
 * @param args - The arguments passed to the legacy function
 * @param suggestion - A suggestion for how to migrate
 */
export function reportLegacyApiUsage(
  functionName: string,
  args: any[],
  suggestion: string
): void {
  // Get the stack trace to identify where this function is being called from
  const stackTrace = new Error().stack || '';
  const stackLines = stackTrace.split('\n');

  // Find the first line that's not from this file or the legacy function
  let callerInfo = '';
  for (let i = 2; i < stackLines.length; i++) {
    const line = stackLines[i];
    if (!line.includes('legacy-detection.ts') &&
        !line.includes('config.ts') &&
        !line.includes('api-config.ts')) {
      callerInfo = line.trim();
      break;
    }
  }

  // Extract file path from the caller info if possible
  let filePath = '';
  const fileMatch = callerInfo.match(/\((.+?):\d+:\d+\)/);
  if (fileMatch && fileMatch[1]) {
    filePath = fileMatch[1];

    // Skip if we've already reported this file
    if (reportedFiles.has(filePath)) {
      return;
    }

    // Add to the set of reported files
    reportedFiles.add(filePath);
  }

  // Log a warning with caller information
  console.warn(
    `\n=== LEGACY API USAGE DETECTED ===\n` +
    `Function: ${functionName}(${args.map(a => JSON.stringify(a)).join(', ')})\n` +
    `Called from: ${callerInfo}\n` +
    `File: ${filePath}\n` +
    `Suggestion: ${suggestion}\n` +
    `Please migrate to the enhanced API client and endpoint registry.\n` +
    `=================================\n`
  );
}

/**
 * Get a suggestion for how to migrate from a legacy endpoint key
 *
 * @param legacyKey - The legacy endpoint key
 * @returns A suggestion for how to migrate
 */
export function getSuggestionForLegacyKey(legacyKey: string): string {
  // Check if we have a mapping for this legacy key
  const mapping = LEGACY_TO_ENHANCED_MAP[legacyKey];

  if (mapping) {
    return `Replace with getApiUrl('${mapping.module}', '${mapping.endpoint}')`;
  }

  // If no mapping exists, provide a generic suggestion
  return `Replace with getApiUrl('module', 'endpoint') using the appropriate module and endpoint`;
}

/**
 * Detect legacy API usage in the application
 * This function can be called during development to help identify code that needs to be migrated
 */
export async function detectLegacyApiUsage(): Promise<void> {
  console.log('Scanning for legacy API usage...');

  try {
    // Instead of trying to modify ES modules (which are immutable),
    // we'll set up global monitoring for these functions when they're called
    
    // Create a monitoring layer for development use
    if (window && typeof window === 'object') {
      // Set up a global monitor object
      (window as any).__legacyApiMonitor = {
        // Store original references (as they can't be modified)
        active: true,
        
        // Method to track usage
        trackUsage: function(name: string, args: any[], suggestion: string) {
          if (this.active) {
            reportLegacyApiUsage(name, args, suggestion);
          }
        }
      };
      
      console.log('Legacy API usage detection enabled using monitoring approach.');
      console.log('Check the console for warnings when legacy APIs are used.');
    } else {
      throw new Error('Cannot initialize legacy API detection without window object');
    }
  } catch (error) {
    console.warn('Failed to initialize legacy API detection:', error);
  }
}

// Export a function to get the legacy detection status
export function getLegacyDetectionStatus(): { reportedFiles: string[] } {
  return {
    reportedFiles: Array.from(reportedFiles)
  };
}

/**
 * Wrapper for monitoring legacy API usage
 * Use this to create monitored versions of legacy API functions
 */
export function createLegacyMonitor<T extends (...args: any[]) => any>(func: T, funcName: string, getSuggestion: (args: Parameters<T>) => string): T {
  return ((...args: Parameters<T>): ReturnType<T> => {
    // Check if the monitor exists and is active
    if (typeof window !== 'undefined' && (window as any).__legacyApiMonitor?.active) {
      (window as any).__legacyApiMonitor.trackUsage(funcName, args, getSuggestion(args));
    }
    return func(...args);
  }) as T;
}

/**
 * Creates a proxy to monitor property access
 * @param obj The object to monitor
 * @param propertyName The property to monitor
 * @param suggestion The suggestion to display when the property is accessed
 */
export function monitorPropertyAccess(moduleName: string, propertyName: string, suggestion: string): void {
  // Only set up monitoring in development mode
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    // Simply log the legacy usage when someone imports this module
    // We don't modify properties as that would cause errors with ES modules
    console.warn(`Legacy API '${propertyName}' from module '${moduleName}' was imported.\nSuggestion: ${suggestion}`);
  }
}
