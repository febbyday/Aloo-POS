/**
 * Critical API Initialization
 *
 * This module handles the initialization of critical API data during application startup.
 * It prioritizes and batches critical API requests to improve performance.
 */

import { RequestPriority, initBatchClient } from './initialization-batch-manager';
import { logger } from '../logging/logger';
import { performanceMonitor } from '../performance/performance-monitor';
import { API_CONSTANTS } from './config';

// Critical API endpoints
export const CRITICAL_ENDPOINTS = {
  // Authentication
  AUTH_VERIFY: 'auth/VERIFY',
  AUTH_SESSION: 'auth/SESSION',

  // User data
  USER_PROFILE: 'users/PROFILE',
  USER_PERMISSIONS: 'users/PERMISSIONS',

  // Core configuration
  SYSTEM_CONFIG: 'settings/SYSTEM',
  APP_CONFIG: 'settings/APP',

  // Store data
  STORES_LIST: 'stores/LIST',
  ACTIVE_STORE: 'stores/ACTIVE',

  // Company data
  COMPANY_INFO: 'company/INFO',

  // Notifications
  NOTIFICATIONS_UNREAD: 'notifications/UNREAD_COUNT',

  // Payment processing
  PAYMENT_METHODS: 'payments/METHODS',

  // Tax configuration
  TAX_CONFIG: 'settings/TAX',

  // Currency settings
  CURRENCY_CONFIG: 'settings/CURRENCY',

  // Business hours
  BUSINESS_HOURS: 'settings/BUSINESS_HOURS',

  // POS configuration
  POS_CONFIG: 'settings/POS',

  // Role permissions
  ROLE_PERMISSIONS: 'roles/PERMISSIONS'
};

// High priority endpoints
export const HIGH_PRIORITY_ENDPOINTS = {
  // Categories
  CATEGORIES_LIST: 'categories/LIST',

  // Products
  PRODUCTS_FEATURED: 'products/FEATURED',
  PRODUCTS_LOW_STOCK: 'products/LOW_STOCK',

  // Customers
  CUSTOMERS_RECENT: 'customers/RECENT',

  // Sales
  SALES_SUMMARY: 'sales/SUMMARY',
  SALES_DAILY: 'sales/DAILY',

  // Staff
  STAFF_ACTIVE: 'staff/ACTIVE',

  // Inventory
  INVENTORY_LOCATIONS: 'inventory/LOCATIONS',

  // Brands
  BRANDS_LIST: 'brands/LIST',

  // Loyalty
  LOYALTY_SETTINGS: 'loyalty/SETTINGS',

  // Discounts
  ACTIVE_DISCOUNTS: 'discounts/ACTIVE'
};

// Medium priority endpoints
export const MEDIUM_PRIORITY_ENDPOINTS = {
  // UI configuration
  UI_CONFIG: 'settings/UI',
  UI_THEME: 'settings/THEME',

  // User preferences
  USER_PREFERENCES: 'users/PREFERENCES',

  // Feature flags
  FEATURE_FLAGS: 'settings/FEATURES',

  // Receipt settings
  RECEIPT_SETTINGS: 'settings/RECEIPT',

  // Email templates
  EMAIL_TEMPLATES: 'settings/EMAIL_TEMPLATES',

  // Notification settings
  NOTIFICATION_SETTINGS: 'settings/NOTIFICATIONS',

  // Product attributes
  PRODUCT_ATTRIBUTES: 'products/ATTRIBUTES',

  // Variation templates
  VARIATION_TEMPLATES: 'variation-templates/LIST',

  // Gift card templates
  GIFT_CARD_TEMPLATES: 'gift-cards/TEMPLATES',

  // Hardware settings
  HARDWARE_SETTINGS: 'settings/HARDWARE'
};

/**
 * Initialize critical API data
 *
 * @returns Promise that resolves when critical data is initialized
 */
export async function initializeCriticalApiData(): Promise<void> {
  logger.info('Initializing critical API data');
  performanceMonitor.markStart('app:init:criticalApiData');

  try {
    // Create an array of promises for critical API requests
    const criticalRequests = [
      // Authentication
      initBatchClient.get(CRITICAL_ENDPOINTS.AUTH_VERIFY, undefined, RequestPriority.CRITICAL),
      initBatchClient.get(CRITICAL_ENDPOINTS.AUTH_SESSION, undefined, RequestPriority.CRITICAL),

      // User data
      initBatchClient.get(CRITICAL_ENDPOINTS.USER_PROFILE, undefined, RequestPriority.CRITICAL),
      initBatchClient.get(CRITICAL_ENDPOINTS.USER_PERMISSIONS, undefined, RequestPriority.CRITICAL),

      // Core configuration
      initBatchClient.get(CRITICAL_ENDPOINTS.SYSTEM_CONFIG, undefined, RequestPriority.CRITICAL),
      initBatchClient.get(CRITICAL_ENDPOINTS.APP_CONFIG, undefined, RequestPriority.CRITICAL),

      // Store data
      initBatchClient.get(CRITICAL_ENDPOINTS.STORES_LIST, undefined, RequestPriority.CRITICAL),
      initBatchClient.get(CRITICAL_ENDPOINTS.ACTIVE_STORE, undefined, RequestPriority.CRITICAL),

      // Company data
      initBatchClient.get(CRITICAL_ENDPOINTS.COMPANY_INFO, undefined, RequestPriority.CRITICAL),

      // Notifications
      initBatchClient.get(CRITICAL_ENDPOINTS.NOTIFICATIONS_UNREAD, undefined, RequestPriority.CRITICAL),

      // Payment processing
      initBatchClient.get(CRITICAL_ENDPOINTS.PAYMENT_METHODS, undefined, RequestPriority.CRITICAL),

      // Tax configuration
      initBatchClient.get(CRITICAL_ENDPOINTS.TAX_CONFIG, undefined, RequestPriority.CRITICAL),

      // Currency settings
      initBatchClient.get(CRITICAL_ENDPOINTS.CURRENCY_CONFIG, undefined, RequestPriority.CRITICAL),

      // Business hours
      initBatchClient.get(CRITICAL_ENDPOINTS.BUSINESS_HOURS, undefined, RequestPriority.CRITICAL),

      // POS configuration
      initBatchClient.get(CRITICAL_ENDPOINTS.POS_CONFIG, undefined, RequestPriority.CRITICAL),

      // Role permissions
      initBatchClient.get(CRITICAL_ENDPOINTS.ROLE_PERMISSIONS, undefined, RequestPriority.CRITICAL)
    ];

    // Execute critical batch
    await initBatchClient.executeCritical();

    logger.info('Critical API data initialized successfully');
  } catch (error) {
    logger.error('Error initializing critical API data', { error });
    throw error;
  } finally {
    performanceMonitor.markEnd('app:init:criticalApiData');
  }
}

/**
 * Initialize high priority API data
 *
 * @returns Promise that resolves when high priority data is initialized
 */
export async function initializeHighPriorityApiData(): Promise<void> {
  logger.info('Initializing high priority API data');
  performanceMonitor.markStart('app:init:highPriorityApiData');

  try {
    // Create an array of promises for high priority API requests
    const highPriorityRequests = [
      // Categories
      initBatchClient.get(HIGH_PRIORITY_ENDPOINTS.CATEGORIES_LIST, undefined, RequestPriority.HIGH),

      // Products
      initBatchClient.get(HIGH_PRIORITY_ENDPOINTS.PRODUCTS_FEATURED, undefined, RequestPriority.HIGH),
      initBatchClient.get(HIGH_PRIORITY_ENDPOINTS.PRODUCTS_LOW_STOCK, undefined, RequestPriority.HIGH),

      // Customers
      initBatchClient.get(HIGH_PRIORITY_ENDPOINTS.CUSTOMERS_RECENT, undefined, RequestPriority.HIGH),

      // Sales
      initBatchClient.get(HIGH_PRIORITY_ENDPOINTS.SALES_SUMMARY, undefined, RequestPriority.HIGH),
      initBatchClient.get(HIGH_PRIORITY_ENDPOINTS.SALES_DAILY, undefined, RequestPriority.HIGH),

      // Staff
      initBatchClient.get(HIGH_PRIORITY_ENDPOINTS.STAFF_ACTIVE, undefined, RequestPriority.HIGH),

      // Inventory
      initBatchClient.get(HIGH_PRIORITY_ENDPOINTS.INVENTORY_LOCATIONS, undefined, RequestPriority.HIGH),

      // Brands
      initBatchClient.get(HIGH_PRIORITY_ENDPOINTS.BRANDS_LIST, undefined, RequestPriority.HIGH),

      // Loyalty
      initBatchClient.get(HIGH_PRIORITY_ENDPOINTS.LOYALTY_SETTINGS, undefined, RequestPriority.HIGH),

      // Discounts
      initBatchClient.get(HIGH_PRIORITY_ENDPOINTS.ACTIVE_DISCOUNTS, undefined, RequestPriority.HIGH)
    ];

    // Execute all batches
    await initBatchClient.executeAll();

    logger.info('High priority API data initialized successfully');
  } catch (error) {
    logger.error('Error initializing high priority API data', { error });
    throw error;
  } finally {
    performanceMonitor.markEnd('app:init:highPriorityApiData');
  }
}

/**
 * Initialize all API data
 *
 * @returns Promise that resolves when all data is initialized
 */
export async function initializeAllApiData(): Promise<void> {
  logger.info('Initializing all API data');
  performanceMonitor.markStart('app:init:allApiData');

  try {
    // First initialize critical data
    await initializeCriticalApiData();

    // Then initialize high priority data
    await initializeHighPriorityApiData();

    // Add medium priority requests
    initBatchClient.get(MEDIUM_PRIORITY_ENDPOINTS.UI_CONFIG, undefined, RequestPriority.MEDIUM);
    initBatchClient.get(MEDIUM_PRIORITY_ENDPOINTS.UI_THEME, undefined, RequestPriority.MEDIUM);
    initBatchClient.get(MEDIUM_PRIORITY_ENDPOINTS.USER_PREFERENCES, undefined, RequestPriority.MEDIUM);
    initBatchClient.get(MEDIUM_PRIORITY_ENDPOINTS.FEATURE_FLAGS, undefined, RequestPriority.MEDIUM);
    initBatchClient.get(MEDIUM_PRIORITY_ENDPOINTS.RECEIPT_SETTINGS, undefined, RequestPriority.MEDIUM);
    initBatchClient.get(MEDIUM_PRIORITY_ENDPOINTS.EMAIL_TEMPLATES, undefined, RequestPriority.MEDIUM);
    initBatchClient.get(MEDIUM_PRIORITY_ENDPOINTS.NOTIFICATION_SETTINGS, undefined, RequestPriority.MEDIUM);
    initBatchClient.get(MEDIUM_PRIORITY_ENDPOINTS.PRODUCT_ATTRIBUTES, undefined, RequestPriority.MEDIUM);
    initBatchClient.get(MEDIUM_PRIORITY_ENDPOINTS.VARIATION_TEMPLATES, undefined, RequestPriority.MEDIUM);
    initBatchClient.get(MEDIUM_PRIORITY_ENDPOINTS.GIFT_CARD_TEMPLATES, undefined, RequestPriority.MEDIUM);
    initBatchClient.get(MEDIUM_PRIORITY_ENDPOINTS.HARDWARE_SETTINGS, undefined, RequestPriority.MEDIUM);

    // Execute all remaining batches
    await initBatchClient.executeAll();

    logger.info('All API data initialized successfully');
  } catch (error) {
    logger.error('Error initializing all API data', { error });
    throw error;
  } finally {
    performanceMonitor.markEnd('app:init:allApiData');
  }
}

/**
 * Check if the API is available
 *
 * @returns Promise that resolves with a boolean indicating if the API is available
 */
export async function isApiAvailable(): Promise<boolean> {
  try {
    const response = await fetch(`${API_CONSTANTS.FULL_URL}/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });

    return response.ok;
  } catch (error) {
    logger.error('Error checking API availability', { error });
    return false;
  }
}

// Export the critical API initialization service
export const criticalApiInitService = {
  initializeCriticalApiData,
  initializeHighPriorityApiData,
  initializeAllApiData,
  isApiAvailable,
  CRITICAL_ENDPOINTS,
  HIGH_PRIORITY_ENDPOINTS,
  MEDIUM_PRIORITY_ENDPOINTS
};
