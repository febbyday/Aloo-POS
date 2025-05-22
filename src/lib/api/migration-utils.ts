/**
 * API Migration Utilities
 *
 * This file contains utility functions to help with migrating from the legacy
 * API configuration to the new enhanced API configuration system.
 */

import { apiConfig } from './config';
// Import constants directly to avoid circular dependencies
import { FULL_API_URL } from './api-constants';

/**
 * Map of legacy endpoint keys to new module/endpoint pairs
 * This map is used to automatically convert legacy endpoint keys to the new format
 * @public
 */
export const LEGACY_TO_ENHANCED_MAP: Record<string, { module: string; endpoint: string }> = {
  'products': { module: 'products', endpoint: 'LIST' },
  'products-categories': { module: 'categories', endpoint: 'LIST' },
  'products-variants': { module: 'products', endpoint: 'VARIANTS' },
  'products-attributes': { module: 'products', endpoint: 'ATTRIBUTES' },
  'customers': { module: 'customers', endpoint: 'LIST' },
  'customers-groups': { module: 'customers', endpoint: 'GROUPS' },
  'shops': { module: 'shops', endpoint: 'LIST' },
  'shops-inventory': { module: 'shops', endpoint: 'INVENTORY' },
  'shops-staff': { module: 'shops', endpoint: 'STAFF' },
  'suppliers': { module: 'suppliers', endpoint: 'LIST' },
  'suppliers-orders': { module: 'suppliers', endpoint: 'ORDERS' },
  'auth': { module: 'auth', endpoint: 'LIST' },
  'login': { module: 'auth', endpoint: 'LOGIN' },
  'logout': { module: 'auth', endpoint: 'LOGOUT' },
  // Add more mappings as needed
};

/**
 * Convert a legacy endpoint key to the new enhanced endpoint
 *
 * @param legacyKey - The legacy endpoint key
 * @returns The path using the enhanced endpoint registry
 */
export function legacyToEnhancedPath(legacyKey: string): string {
  // Check if we have a mapping for this legacy key
  const mapping = LEGACY_TO_ENHANCED_MAP[legacyKey];

  if (mapping) {
    // Construct the path manually instead of using getApiPath
    // This avoids circular dependencies
    const module = mapping.module;
    const endpoint = mapping.endpoint.toLowerCase();
    return `/${module}${endpoint === 'list' ? '' : `/${endpoint}`}`;
  }

  // Fallback to the legacy endpoint
  if (apiConfig.endpoints[legacyKey as keyof typeof apiConfig.endpoints]) {
    console.warn(`Using legacy endpoint key: ${legacyKey}. Please migrate to the enhanced endpoint registry.`);
    return apiConfig.endpoints[legacyKey as keyof typeof apiConfig.endpoints];
  }

  // If no mapping or legacy endpoint exists, return a default path
  console.error(`No mapping found for legacy endpoint key: ${legacyKey}`);
  return `/${legacyKey}`;
}

/**
 * Convert a legacy endpoint key to the new enhanced URL
 *
 * @param legacyKey - The legacy endpoint key
 * @returns The full URL using the enhanced endpoint registry
 */
export function legacyToEnhancedUrl(legacyKey: string): string {
  // Check if we have a mapping for this legacy key
  const mapping = LEGACY_TO_ENHANCED_MAP[legacyKey];

  if (mapping) {
    // Construct the URL manually instead of using getApiUrl
    // This avoids circular dependencies
    const path = legacyToEnhancedPath(legacyKey);
    return `${FULL_API_URL}${path}`;
  }

  // Fallback to the legacy endpoint
  if (apiConfig.endpoints[legacyKey as keyof typeof apiConfig.endpoints]) {
    console.warn(`Using legacy endpoint key: ${legacyKey}. Please migrate to the enhanced endpoint registry.`);
    return `${apiConfig.fullApiUrl}${apiConfig.endpoints[legacyKey as keyof typeof apiConfig.endpoints]}`;
  }

  // If no mapping or legacy endpoint exists, return a default URL
  console.error(`No mapping found for legacy endpoint key: ${legacyKey}`);
  return `${apiConfig.fullApiUrl}/${legacyKey}`;
}

/**
 * Wrapper for the legacy getApiEndpoint function
 * This helps with migration by logging warnings and providing the enhanced alternative
 *
 * @param feature - The legacy feature endpoint key
 * @returns The complete API endpoint URL
 * @deprecated Use getApiUrl or getApiPath from enhanced-config instead
 */
export function getApiEndpointWithWarning(feature: keyof typeof apiConfig.endpoints): string {
  console.warn(
    `Using deprecated getApiEndpoint function with key: ${feature}. ` +
    `Consider migrating to getApiUrl or getApiPath from enhanced-config.`
  );

  // Try to use the enhanced endpoint if possible
  const mapping = LEGACY_TO_ENHANCED_MAP[feature];
  if (mapping) {
    console.info(`Suggestion: Replace with getApiUrl('${mapping.module}', '${mapping.endpoint}')`);
    return legacyToEnhancedUrl(feature);
  }

  // Fall back to the legacy implementation
  if (!apiConfig.endpoints[feature]) {
    console.warn(`No endpoint defined for feature: ${feature}`);
    return apiConfig.fullApiUrl;
  }
  return `${apiConfig.fullApiUrl}${apiConfig.endpoints[feature]}`;
}
