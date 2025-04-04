/**
 * Shops Module Configuration
 *
 * This file contains configuration settings for the shops module.
 */

// Environment detection
const isDev = import.meta.env.MODE === 'development';
const isTest = import.meta.env.MODE === 'test';

// Configuration options
export const SHOPS_CONFIG = {
  // Always use real API data
  USE_REAL_API: true,

  // API endpoints
  API: {
    SHOPS: 'shops',
    SHOP_BY_ID: (id: string) => `shops/${id}`,
    SHOP_STAFF: (id: string) => `shops/${id}/staff`,
    SHOP_INVENTORY: (id: string) => `shops/${id}/inventory`,
    SHOP_REPORTS: (id: string) => `shops/${id}/reports`,
    SHOP_ACTIVITY: (id: string) => `shops/${id}/activity`,
  },

  // Pagination defaults
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
  },

  // Feature flags
  FEATURES: {
    ENABLE_SHOP_REPORTS: true,
    ENABLE_SHOP_INVENTORY: true,
    ENABLE_SHOP_STAFF: true,
    ENABLE_SHOP_ACTIVITY: true,
  },
};

export default SHOPS_CONFIG;
