/**
 * API Configuration
 * 
 * This file contains configuration settings for the API client.
 * It provides different configurations for development and production environments.
 */

// Define environment
const isDevelopment = import.meta.env.MODE === 'development';

// Default headers
const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

// Determine if mock mode should be enabled
const shouldUseMockData = () => {
  // Explicit setting via env var takes precedence
  if (import.meta.env.VITE_DISABLE_MOCK === "false") return true;
  if (import.meta.env.VITE_DISABLE_MOCK === "true") return false;
  
  // Default to using real data even in development
  console.log("API Config: Using real API data");
  return false;
};

// API configuration options
export const apiConfig = {
  // Use a fallback URL if the environment variable is not set
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  apiPrefix: '/api/v1',
  headers: DEFAULT_HEADERS,
  timeout: 10000, // 10 seconds
  useMockData: shouldUseMockData(),
  
  // CORS settings
  fetchOptions: {
    credentials: 'include',
    mode: 'cors',
    // Add timeout and retry options
    timeout: 10000,
    retries: 2,
    retryDelay: 1000
  },
  
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
    'roles': '/staff/roles',
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
    'products-categories': '/products/categories',
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
 */
export const getApiEndpoint = (feature: keyof typeof apiConfig.endpoints): string => {
  if (!apiConfig.endpoints[feature]) {
    console.warn(`No endpoint defined for feature: ${feature}`);
    return `${apiConfig.baseUrl}${apiConfig.apiPrefix}`;
  }
  return `${apiConfig.baseUrl}${apiConfig.apiPrefix}${apiConfig.endpoints[feature]}`;
}; 
