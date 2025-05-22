/**
 * 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
 * 
 * Factory-Based Shops Module Configuration
 *
 * This file contains configuration settings for the shops module using the enhanced API client and endpoint registry.
 */

import { SHOP_ENDPOINTS } from '@/lib/api/endpoint-registry';

// Environment detection
const isDev = import.meta.env.MODE === 'development';
const isTest = import.meta.env.MODE === 'test';

// Configuration options
export const SHOPS_CONFIG = {
  // Always use real API data
  USE_REAL_API: true,

  // API endpoints - using endpoint registry
  API: {
    // Use the endpoint registry for all API endpoints
    SHOPS: SHOP_ENDPOINTS.LIST,
    SHOP_BY_ID: SHOP_ENDPOINTS.DETAIL,
    SHOP_STAFF: SHOP_ENDPOINTS.STAFF,
    SHOP_INVENTORY: SHOP_ENDPOINTS.INVENTORY,
    SHOP_SETTINGS: SHOP_ENDPOINTS.SETTINGS,
    UPDATE_SHOP_SETTINGS: SHOP_ENDPOINTS.UPDATE_SETTINGS,
    SHOP_SALES: SHOP_ENDPOINTS.SALES,
    ASSIGN_STAFF: SHOP_ENDPOINTS.ASSIGN_STAFF
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
