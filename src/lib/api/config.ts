/**
 * API Configuration
 *
 * This file contains configuration settings for the API client.
 * It provides different configurations for development and production environments.
 *
 * IMPORTANT: This file imports from api-constants.ts, which is the single source of truth
 * for API configuration. All API-related code should import from api-constants.ts directly
 * or from this file.
 *
 * @deprecated Consider importing directly from api-constants.ts instead of this file.
 */

// Import all constants from api-constants.ts
import {
  API_URL,
  API_VERSION,
  API_PREFIX,
  FULL_API_URL,
  DEFAULT_HEADERS,
  DEFAULT_TIMEOUT,
  FETCH_OPTIONS,
  shouldUseMockData
} from './api-constants';

// API configuration options
export const apiConfig = {
  // Base URL configuration
  baseUrl: API_URL,
  apiVersion: API_VERSION,
  apiPrefix: API_PREFIX,
  fullApiUrl: FULL_API_URL,

  // Request configuration
  headers: DEFAULT_HEADERS,
  timeout: DEFAULT_TIMEOUT,
  useMockData: shouldUseMockData(),
  
  // Feature-specific mock data settings
  featureMockSettings: {
    roles: false // Never use mock data for roles
  },

  // CORS settings
  fetchOptions: FETCH_OPTIONS,

  // Module-specific endpoints
  endpoints: {
    'employment-types': '/employment-types',
    'employment-statuses': '/staff/employment-statuses',
    'staff': '/staff',
    'staff-roles': '/staff/roles',
    'staff-shifts': '/staff/shifts',
    'staff-attendance': '/staff/attendance',
    'staff-performance': '/staff/performance',
    'staff-documents': '/staff/documents',
    'staff-permissions': '/staff/permissions',
    'staff-settings': '/staff/settings',
    'staff-leave': '/staff/leave',
    'staff-payroll': '/staff/payroll',
    'staff-training': '/staff/training',
    'staff-schedules': '/staff/schedules',
    'roles': '/roles',
    'shops': '/shops',
    'suppliers': '/suppliers',
    'suppliers-price-lists': '/suppliers/price-lists',
    'suppliers-orders': '/suppliers/orders',
    'suppliers-contacts': '/suppliers/contacts',
    'loyalty': '/loyalty',
    'loyalty-transactions': '/loyalty/transactions',
    'loyalty-tiers': '/loyalty/tiers',
    'loyalty-rewards': '/loyalty/rewards',
    'loyalty-settings': '/loyalty/settings',
    'auth': '/auth',
    'login': '/auth/login',
    'logout': '/auth/logout',
    'register': '/auth/register',
    'refresh': '/auth/refresh',
    'verify': '/auth/verify',
    'forgot-password': '/auth/forgot-password',
    'reset-password': '/auth/reset-password',
    'products': '/products',
    'products-categories': '/categories',
    'products-variants': '/products/variants',
    'products-attributes': '/products/attributes',
    'products-pricing': '/products/pricing',
    'inventory': '/inventory',
    'inventory-adjustments': '/inventory/adjustments',
    'inventory-transfers': '/inventory/transfers',
    'inventory-counts': '/inventory/counts',
    'sales': '/sales',
    'sales-transactions': '/sales/transactions',
    'sales-returns': '/sales/returns',
    'sales-discounts': '/sales/discounts',
    'customers': '/customers',
    'customers-groups': '/customers/groups',
    'customers-loyalty': '/customers/loyalty',
    'shops-inventory': '/shops/inventory',
    'shops-staff': '/shops/staff',
    'shops-settings': '/shops/settings',
    'shops-hours': '/shops/hours',
    'shops-transfers': '/shops/transfers',
    'shops-reports': '/shops/reports',
    'repairs': '/repairs',
    'repairs-tickets': '/repairs/tickets',
    'repairs-diagnosis': '/repairs/diagnosis',
    'repairs-parts': '/repairs/parts',
    'repairs-charges': '/repairs/charges',
    'repairs-status': '/repairs/status',
    'repairs-technicians': '/repairs/technicians',
    'repairs-reports': '/repairs/reports',
    'markets': '/markets',
    'markets-stock': '/markets/stock',
    'markets-staff': '/markets/staff',
    'markets-analytics': '/markets/analytics',
    'markets-settings': '/markets/settings',
    'markets-location': '/markets/location',
    'markets-performance': '/markets/performance'
  }
};

/**
 * Get the full API endpoint URL for a specific feature
 *
 * @param feature - The feature endpoint key
 * @returns The complete API endpoint URL
 * @deprecated CRITICAL: This function is deprecated and will be removed in a future release.
 * Use getApiUrl or getApiPath from enhanced-config instead.
 * Example: Replace getApiEndpoint('shops') with getApiUrl('shops', 'LIST')
 */
export const getApiEndpoint = (feature: keyof typeof apiConfig.endpoints): string => {
  // Get the stack trace to identify where this function is being called from
  const stackTrace = new Error().stack || '';
  const callerInfo = stackTrace.split('\n')[2] || '';

  // Log a more severe warning with caller information
  console.error(
    `DEPRECATED API USAGE: getApiEndpoint('${feature}') is deprecated and will be removed soon.\n` +
    `Called from: ${callerInfo.trim()}\n` +
    `Please migrate to the enhanced API client and endpoint registry.\n` +
    `Use getApiUrl or getApiPath from @/lib/api/enhanced-config instead.`
  );

  // Fall back to the original implementation
  if (!apiConfig.endpoints[feature]) {
    console.warn(`No endpoint defined for feature: ${feature}`);
    return apiConfig.fullApiUrl;
  }
  return `${apiConfig.fullApiUrl}${apiConfig.endpoints[feature]}`;
};

/**
 * Re-export constants for use in other modules
 * This ensures backward compatibility while encouraging direct imports from api-constants.ts
 */
export { API_CONSTANTS } from './api-constants';

/**
 * Export a helper function to check if we're using the API or mock data
 */
export function isUsingRealApi(): boolean {
  return !apiConfig.useMockData;
}
