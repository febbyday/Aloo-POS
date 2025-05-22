/**
 * 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
 *
 * API Endpoint Registry
 *
 * This module provides a centralized registry for all API endpoints in the application.
 * It uses the endpoint utilities to ensure consistent endpoint definition and reduces
 * duplication across the application.
 */

import { createModuleEndpoints } from './endpoint-utils';

// Define endpoint module types for better type safety
export interface EndpointDefinition {
  path: string;
  requiresAuth?: boolean;
  cacheable?: boolean;
  description?: string;
}

// Define module endpoint collections
export interface EndpointModuleDefinitions {
  [key: string]: EndpointDefinition;
}

// Define the full registry type
export interface EndpointRegistry {
  [module: string]: {
    basePath: string;
    endpoints: { [key: string]: string };
    meta: { [key: string]: EndpointDefinition };
  };
}

/**
 * The centralized endpoint registry
 * This contains all API endpoints used throughout the application
 */
export const endpointRegistry: EndpointRegistry = {};

/**
 * Register endpoints for a module
 * @param moduleName Module name (corresponds to API resource path)
 * @param endpoints Endpoint definitions for the module
 * @returns Module endpoints object with resolved paths
 */
export function registerEndpoints<T extends EndpointModuleDefinitions>(
  moduleName: string,
  endpoints: T
): { [K in keyof T]: string } {
  // Generate endpoint paths
  const endpointPaths = createModuleEndpoints(moduleName, endpoints);

  // Store in registry
  endpointRegistry[moduleName] = {
    basePath: `/${moduleName}`,
    endpoints: endpointPaths,
    meta: endpoints
  };

  // Return generated endpoints
  return endpointPaths;
}

/**
 * Creates standard CRUD endpoints for a resource
 *
 * @param options Additional options for customizing endpoint behavior
 * @returns Standard CRUD endpoint definitions
 */
export function createStandardCrudEndpoints(options: {
  requiresAuth?: boolean;
  cacheable?: boolean;
  listCacheable?: boolean;
  detailCacheable?: boolean;
} = {}): EndpointModuleDefinitions {
  const {
    requiresAuth = true,
    cacheable = false,
    listCacheable = cacheable,
    detailCacheable = cacheable,
  } = options;

  return {
    LIST: {
      path: '',
      requiresAuth,
      cacheable: listCacheable,
      description: 'Get all resources'
    },
    DETAIL: {
      path: ':id',
      requiresAuth,
      cacheable: detailCacheable,
      description: 'Get resource by ID'
    },
    CREATE: {
      path: '',
      requiresAuth,
      cacheable: false,
      description: 'Create new resource'
    },
    UPDATE: {
      path: ':id',
      requiresAuth,
      cacheable: false,
      description: 'Update existing resource'
    },
    DELETE: {
      path: ':id',
      requiresAuth,
      cacheable: false,
      description: 'Delete resource'
    },
    BATCH_CREATE: {
      path: 'batch',
      requiresAuth,
      cacheable: false,
      description: 'Create multiple resources'
    },
    BATCH_UPDATE: {
      path: 'batch',
      requiresAuth,
      cacheable: false,
      description: 'Update multiple resources'
    },
    BATCH_DELETE: {
      path: 'batch',
      requiresAuth,
      cacheable: false,
      description: 'Delete multiple resources'
    },
    SEARCH: {
      path: 'search',
      requiresAuth,
      cacheable: listCacheable,
      description: 'Search resources'
    },
    EXPORT: {
      path: 'export',
      requiresAuth,
      cacheable: false,
      description: 'Export resources'
    },
    IMPORT: {
      path: 'import',
      requiresAuth,
      cacheable: false,
      description: 'Import resources'
    },
  };
}

// Register all core API endpoints
// ==============================

// Auth endpoints
export const AUTH_ENDPOINTS = registerEndpoints('auth', {
  LOGIN: { path: 'login', requiresAuth: false, description: 'User login' },
  LOGOUT: { path: 'logout', requiresAuth: true, description: 'User logout' },
  REFRESH_TOKEN: { path: 'refresh-token', requiresAuth: false, description: 'Refresh authentication token' },
  VERIFY: { path: 'verify', requiresAuth: false, description: 'Verify authentication token' },
  REGISTER: { path: 'register', requiresAuth: false, description: 'Register new user' },
  CURRENT_USER: { path: 'me', requiresAuth: true, description: 'Get current user info' },
  REQUEST_PASSWORD_RESET: { path: 'request-password-reset', requiresAuth: false, description: 'Request password reset' },
  RESET_PASSWORD: { path: 'reset-password', requiresAuth: false, description: 'Reset password with token' },
  SET_COOKIE: { path: 'set-cookie', requiresAuth: false, description: 'Set authentication cookie' },
  CLEAR_COOKIE: { path: 'clear-cookie', requiresAuth: false, description: 'Clear authentication cookie' },
  SESSION: { path: 'session', requiresAuth: true, description: 'Get session info' },
  PASSWORD_CHANGE: { path: 'password-change', requiresAuth: true, description: 'Change password' }
});

// Session management endpoints
export const SESSION_ENDPOINTS = registerEndpoints('auth/sessions', {
  LIST: { path: '', requiresAuth: true, description: 'Get all user sessions' },
  CURRENT: { path: 'current', requiresAuth: true, description: 'Get current session details' },
  DETAILS: { path: 'details', requiresAuth: true, description: 'Get session details' },
  REVOKE: { path: 'revoke', requiresAuth: true, description: 'Revoke a specific session' },
  REVOKE_ALL: { path: 'revoke-all', requiresAuth: true, description: 'Revoke all sessions' },
  REFRESH: { path: 'refresh', requiresAuth: true, description: 'Refresh current session' }
});

// PIN Auth endpoints
export const PIN_AUTH_ENDPOINTS = registerEndpoints('auth/pin', {
  LOGIN: { path: 'login-pin', requiresAuth: false, description: 'PIN login' },
  SETUP: { path: 'setup', requiresAuth: true, description: 'Setup PIN' },
  CHANGE: { path: 'change', requiresAuth: true, description: 'Change PIN' },
  VERIFY: { path: 'verify', requiresAuth: true, description: 'Verify PIN' },
  DISABLE: { path: 'disable', requiresAuth: true, description: 'Disable PIN' },
  STATUS: { path: 'status', requiresAuth: true, description: 'Get PIN status' },
  RESET_USER_PIN: { path: 'admin/reset', requiresAuth: true, description: 'Admin reset user PIN' }
});

// Trusted devices endpoints
export const TRUSTED_DEVICE_ENDPOINTS = registerEndpoints('auth/devices', {
  LIST: { path: 'trusted', requiresAuth: true, description: 'List trusted devices' },
  ADD: { path: 'trusted/add', requiresAuth: true, description: 'Add trusted device' },
  REMOVE: { path: 'trusted/remove', requiresAuth: true, description: 'Remove trusted device' }
});

// User endpoints
export const USER_ENDPOINTS = registerEndpoints('users', {
  ...createStandardCrudEndpoints(),
  CHANGE_PASSWORD: { path: ':id/change-password', requiresAuth: true, description: 'Change user password' },
  RESET_PASSWORD: { path: ':id/reset-password', requiresAuth: true, description: 'Reset user password' },
  PERMISSIONS: { path: ':id/permissions', requiresAuth: true, description: 'Get user permissions' },
  ROLES: { path: ':id/roles', requiresAuth: true, description: 'Get user roles' },
  ASSIGN_ROLE: { path: ':id/roles/:roleId', requiresAuth: true, description: 'Assign role to user' },
  REMOVE_ROLE: { path: ':id/roles/:roleId', requiresAuth: true, description: 'Remove role from user' }
});

// Product module endpoints
export const PRODUCT_ENDPOINTS = registerEndpoints('products', {
  ...createStandardCrudEndpoints({ cacheable: true }),
  VARIANTS: { path: ':id/variants', requiresAuth: true, cacheable: true, description: 'Get product variants' },
  ATTRIBUTES: { path: 'attributes', requiresAuth: false, cacheable: true, description: 'Get product attributes' },
  CATEGORIES: { path: 'categories', requiresAuth: false, cacheable: true, description: 'Get product categories' },
  INVENTORY: { path: ':id/inventory', requiresAuth: true, cacheable: false, description: 'Get product inventory' },
  ADJUST_INVENTORY: { path: ':id/inventory/adjust', requiresAuth: true, cacheable: false, description: 'Adjust product inventory' },
  RELATED: { path: ':id/related', requiresAuth: false, cacheable: true, description: 'Get related products' },
  REVIEWS: { path: ':id/reviews', requiresAuth: false, cacheable: true, description: 'Get product reviews' },
  ADD_REVIEW: { path: ':id/reviews', requiresAuth: true, cacheable: false, description: 'Add product review' }
});

// Category endpoints
export const CATEGORY_ENDPOINTS = registerEndpoints('categories', {
  ...createStandardCrudEndpoints({ cacheable: true }),
  PRODUCTS: { path: ':id/products', requiresAuth: false, cacheable: true, description: 'Get category products' },
  SUBCATEGORIES: { path: ':id/subcategories', requiresAuth: false, cacheable: true, description: 'Get subcategories' },
  PARENT: { path: ':id/parent', requiresAuth: false, cacheable: true, description: 'Get parent category' }
});

// Order endpoints
export const ORDER_ENDPOINTS = registerEndpoints('orders', {
  ...createStandardCrudEndpoints(),
  ITEMS: { path: ':id/items', requiresAuth: true, cacheable: false, description: 'Get order items' },
  ADD_ITEM: { path: ':id/items', requiresAuth: true, cacheable: false, description: 'Add item to order' },
  REMOVE_ITEM: { path: ':id/items/:itemId', requiresAuth: true, cacheable: false, description: 'Remove item from order' },
  PAYMENT: { path: ':id/payment', requiresAuth: true, cacheable: false, description: 'Process order payment' },
  FULFILLMENT: { path: ':id/fulfillment', requiresAuth: true, cacheable: false, description: 'Process order fulfillment' },
  CANCEL: { path: ':id/cancel', requiresAuth: true, cacheable: false, description: 'Cancel order' },
  REFUND: { path: ':id/refund', requiresAuth: true, cacheable: false, description: 'Refund order' },
  HISTORY: { path: ':id/history', requiresAuth: true, cacheable: false, description: 'Get order history' }
});

// Customer endpoints
export const CUSTOMER_ENDPOINTS = registerEndpoints('customers', {
  ...createStandardCrudEndpoints(),
  ADDRESSES: { path: ':id/addresses', requiresAuth: true, cacheable: false, description: 'Get customer addresses' },
  ADD_ADDRESS: { path: ':id/addresses', requiresAuth: true, cacheable: false, description: 'Add customer address' },
  UPDATE_ADDRESS: { path: ':id/addresses/:addressId', requiresAuth: true, cacheable: false, description: 'Update customer address' },
  REMOVE_ADDRESS: { path: ':id/addresses/:addressId', requiresAuth: true, cacheable: false, description: 'Remove customer address' },
  ORDERS: { path: ':id/orders', requiresAuth: true, cacheable: false, description: 'Get customer orders' },
  PAYMENT_METHODS: { path: ':id/payment-methods', requiresAuth: true, cacheable: false, description: 'Get customer payment methods' },
  ADD_PAYMENT_METHOD: { path: ':id/payment-methods', requiresAuth: true, cacheable: false, description: 'Add customer payment method' },
  NOTES: { path: ':id/notes', requiresAuth: true, cacheable: false, description: 'Get customer notes' },
  ADD_NOTE: { path: ':id/notes', requiresAuth: true, cacheable: false, description: 'Add customer note' }
});

// Inventory endpoints
export const INVENTORY_ENDPOINTS = registerEndpoints('inventory', {
  ...createStandardCrudEndpoints(),
  ADJUSTMENTS: { path: 'adjustments', requiresAuth: true, cacheable: false, description: 'Get inventory adjustments' },
  CREATE_ADJUSTMENT: { path: 'adjustments', requiresAuth: true, cacheable: false, description: 'Create inventory adjustment' },
  TRANSFERS: { path: 'transfers', requiresAuth: true, cacheable: false, description: 'Get inventory transfers' },
  CREATE_TRANSFER: { path: 'transfers', requiresAuth: true, cacheable: false, description: 'Create inventory transfer' },
  LOCATIONS: { path: 'locations', requiresAuth: true, cacheable: true, description: 'Get inventory locations' },
  COUNTS: { path: 'counts', requiresAuth: true, cacheable: false, description: 'Get inventory counts' },
  CREATE_COUNT: { path: 'counts', requiresAuth: true, cacheable: false, description: 'Create inventory count' }
});

// Sales endpoints
export const SALES_ENDPOINTS = registerEndpoints('sales', {
  ...createStandardCrudEndpoints(),
  REPORTS: { path: 'reports', requiresAuth: true, cacheable: false, description: 'Get sales reports' },
  DAILY: { path: 'daily', requiresAuth: true, cacheable: false, description: 'Get daily sales' },
  WEEKLY: { path: 'weekly', requiresAuth: true, cacheable: false, description: 'Get weekly sales' },
  MONTHLY: { path: 'monthly', requiresAuth: true, cacheable: false, description: 'Get monthly sales' },
  YEARLY: { path: 'yearly', requiresAuth: true, cacheable: false, description: 'Get yearly sales' }
});

// Supplier endpoints
export const SUPPLIER_ENDPOINTS = registerEndpoints('suppliers', {
  ...createStandardCrudEndpoints(),
  PRODUCTS: { path: ':id/products', requiresAuth: true, cacheable: false, description: 'Get supplier products' },
  ORDERS: { path: ':id/orders', requiresAuth: true, cacheable: false, description: 'Get supplier orders' },
  CREATE_ORDER: { path: ':id/orders', requiresAuth: true, cacheable: false, description: 'Create supplier order' },
  CONTACTS: { path: ':id/contacts', requiresAuth: true, cacheable: false, description: 'Get supplier contacts' },
  ADD_CONTACT: { path: ':id/contacts', requiresAuth: true, cacheable: false, description: 'Add supplier contact' }
});

// Staff endpoints
export const STAFF_ENDPOINTS = registerEndpoints('staff', {
  ...createStandardCrudEndpoints(),
  ATTENDANCE: { path: ':id/attendance', requiresAuth: true, cacheable: false, description: 'Get staff attendance' },
  RECORD_ATTENDANCE: { path: ':id/attendance', requiresAuth: true, cacheable: false, description: 'Record staff attendance' },
  PERFORMANCE: { path: ':id/performance', requiresAuth: true, cacheable: false, description: 'Get staff performance' },
  DOCUMENTS: { path: ':id/documents', requiresAuth: true, cacheable: false, description: 'Get staff documents' },
  UPLOAD_DOCUMENT: { path: ':id/documents', requiresAuth: true, cacheable: false, description: 'Upload staff document' },
  SCHEDULES: { path: ':id/schedules', requiresAuth: true, cacheable: false, description: 'Get staff schedules' },
  SET_SCHEDULE: { path: ':id/schedules', requiresAuth: true, cacheable: false, description: 'Set staff schedule' }
});

// Report endpoints
export const REPORT_ENDPOINTS = registerEndpoints('reports', {
  SALES: { path: 'sales', requiresAuth: true, cacheable: false, description: 'Get sales reports' },
  INVENTORY: { path: 'inventory', requiresAuth: true, cacheable: false, description: 'Get inventory reports' },
  CUSTOMERS: { path: 'customers', requiresAuth: true, cacheable: false, description: 'Get customer reports' },
  STAFF: { path: 'staff', requiresAuth: true, cacheable: false, description: 'Get staff reports' },
  FINANCIAL: { path: 'financial', requiresAuth: true, cacheable: false, description: 'Get financial reports' },
  TAXES: { path: 'taxes', requiresAuth: true, cacheable: false, description: 'Get tax reports' },
  CUSTOM: { path: 'custom', requiresAuth: true, cacheable: false, description: 'Get custom reports' },
  EXPORT: { path: 'export/:id', requiresAuth: true, cacheable: false, description: 'Export report' }
});

// Settings endpoints
export const SETTINGS_ENDPOINTS = registerEndpoints('settings', {
  // Generic module settings endpoints
  MODULE: { path: ':module', requiresAuth: true, cacheable: true, description: 'Get all settings for a module' },
  UPDATE_MODULE: { path: ':module', requiresAuth: true, cacheable: false, description: 'Update all settings for a module' },
  SETTING: { path: ':module/:key', requiresAuth: true, cacheable: true, description: 'Get a specific setting' },
  UPDATE_SETTING: { path: ':module/:key', requiresAuth: true, cacheable: false, description: 'Update a specific setting' },
  HISTORY: { path: ':module/history', requiresAuth: true, cacheable: true, description: 'Get settings history for a module' },
  MIGRATE: { path: ':module/migrate', requiresAuth: true, cacheable: false, description: 'Migrate settings from localStorage to database' },

  // Specific module endpoints for backward compatibility
  GENERAL: { path: 'general', requiresAuth: true, cacheable: true, description: 'Get general settings' },
  UPDATE_GENERAL: { path: 'general', requiresAuth: true, cacheable: false, description: 'Update general settings' },
  PAYMENT: { path: 'payment', requiresAuth: true, cacheable: true, description: 'Get payment settings' },
  UPDATE_PAYMENT: { path: 'payment', requiresAuth: true, cacheable: false, description: 'Update payment settings' },
  TAX: { path: 'tax', requiresAuth: true, cacheable: true, description: 'Get tax settings' },
  UPDATE_TAX: { path: 'tax', requiresAuth: true, cacheable: false, description: 'Update tax settings' },
  SYSTEM: { path: 'system', requiresAuth: true, cacheable: true, description: 'Get system settings' },
  UPDATE_SYSTEM: { path: 'system', requiresAuth: true, cacheable: false, description: 'Update system settings' },
  APPEARANCE: { path: 'appearance', requiresAuth: true, cacheable: true, description: 'Get appearance settings' },
  UPDATE_APPEARANCE: { path: 'appearance', requiresAuth: true, cacheable: false, description: 'Update appearance settings' },
  SECURITY: { path: 'security', requiresAuth: true, cacheable: true, description: 'Get security settings' },
  UPDATE_SECURITY: { path: 'security', requiresAuth: true, cacheable: false, description: 'Update security settings' },
  HARDWARE: { path: 'hardware', requiresAuth: true, cacheable: true, description: 'Get hardware settings' },
  UPDATE_HARDWARE: { path: 'hardware', requiresAuth: true, cacheable: false, description: 'Update hardware settings' },
  EMAIL: { path: 'email', requiresAuth: true, cacheable: true, description: 'Get email settings' },
  UPDATE_EMAIL: { path: 'email', requiresAuth: true, cacheable: false, description: 'Update email settings' },
  NOTIFICATION: { path: 'notification', requiresAuth: true, cacheable: true, description: 'Get notification settings' },
  UPDATE_NOTIFICATION: { path: 'notification', requiresAuth: true, cacheable: false, description: 'Update notification settings' },
  THEME: { path: 'theme', requiresAuth: true, cacheable: true, description: 'Get theme settings' },
  UPDATE_THEME: { path: 'theme', requiresAuth: true, cacheable: false, description: 'Update theme settings' },
  COMPANY: { path: 'company', requiresAuth: true, cacheable: true, description: 'Get company settings' },
  UPDATE_COMPANY: { path: 'company', requiresAuth: true, cacheable: false, description: 'Update company settings' },
  PRODUCT: { path: 'product', requiresAuth: true, cacheable: true, description: 'Get product settings' },
  UPDATE_PRODUCT: { path: 'product', requiresAuth: true, cacheable: false, description: 'Update product settings' },
  RECEIPT: { path: 'receipt', requiresAuth: true, cacheable: true, description: 'Get receipt settings' },
  UPDATE_RECEIPT: { path: 'receipt', requiresAuth: true, cacheable: false, description: 'Update receipt settings' },
  WOOCOMMERCE: { path: 'woocommerce', requiresAuth: true, cacheable: true, description: 'Get WooCommerce settings' },
  UPDATE_WOOCOMMERCE: { path: 'woocommerce', requiresAuth: true, cacheable: false, description: 'Update WooCommerce settings' },
  SHIPPING: { path: 'shipping', requiresAuth: true, cacheable: true, description: 'Get shipping settings' },
  UPDATE_SHIPPING: { path: 'shipping', requiresAuth: true, cacheable: false, description: 'Update shipping settings' },
  INTEGRATIONS: { path: 'integrations', requiresAuth: true, cacheable: true, description: 'Get integration settings' },
  UPDATE_INTEGRATION: { path: 'integrations/:id', requiresAuth: true, cacheable: false, description: 'Update integration setting' }
});

// Gift card endpoints
export const GIFT_CARD_ENDPOINTS = registerEndpoints('gift-cards', {
  ...createStandardCrudEndpoints(),
  VALIDATE: { path: 'validate', requiresAuth: true, cacheable: false, description: 'Validate gift card' },
  REDEEM: { path: ':id/redeem', requiresAuth: true, cacheable: false, description: 'Redeem gift card' },
  BALANCE: { path: ':id/balance', requiresAuth: true, cacheable: false, description: 'Get gift card balance' },
  TRANSACTIONS: { path: ':id/transactions', requiresAuth: true, cacheable: false, description: 'Get gift card transactions' },
  TEMPLATES: { path: 'templates', requiresAuth: true, cacheable: true, description: 'Get gift card templates' }
});

// Shops/markets endpoints
export const SHOP_ENDPOINTS = registerEndpoints('shops', {
  ...createStandardCrudEndpoints(),
  INVENTORY: { path: ':id/inventory', requiresAuth: true, cacheable: false, description: 'Get shop inventory' },
  STAFF: { path: ':id/staff', requiresAuth: true, cacheable: false, description: 'Get shop staff' },
  ASSIGN_STAFF: { path: ':id/staff', requiresAuth: true, cacheable: false, description: 'Assign staff to shop' },
  SALES: { path: ':id/sales', requiresAuth: true, cacheable: false, description: 'Get shop sales' },
  SETTINGS: { path: ':id/settings', requiresAuth: true, cacheable: true, description: 'Get shop settings' },
  UPDATE_SETTINGS: { path: ':id/settings', requiresAuth: true, cacheable: false, description: 'Update shop settings' }
});

// Markets endpoints (alternative to shops)
export const MARKET_ENDPOINTS = registerEndpoints('markets', {
  ...createStandardCrudEndpoints(),
  INVENTORY: { path: ':id/inventory', requiresAuth: true, cacheable: false, description: 'Get market inventory' },
  STAFF: { path: ':id/staff', requiresAuth: true, cacheable: false, description: 'Get market staff' },
  ASSIGN_STAFF: { path: ':id/staff', requiresAuth: true, cacheable: false, description: 'Assign staff to market' },
  SALES: { path: ':id/sales', requiresAuth: true, cacheable: false, description: 'Get market sales' },
  SETTINGS: { path: ':id/settings', requiresAuth: true, cacheable: true, description: 'Get market settings' },
  UPDATE_SETTINGS: { path: ':id/settings', requiresAuth: true, cacheable: false, description: 'Update market settings' }
});

// Repair service endpoints
export const REPAIR_ENDPOINTS = registerEndpoints('repairs', {
  ...createStandardCrudEndpoints(),
  STATUSES: { path: 'statuses', requiresAuth: true, cacheable: true, description: 'Get repair statuses' },
  PARTS: { path: ':id/parts', requiresAuth: true, cacheable: false, description: 'Get repair parts' },
  ADD_PART: { path: ':id/parts', requiresAuth: true, cacheable: false, description: 'Add repair part' },
  NOTES: { path: ':id/notes', requiresAuth: true, cacheable: false, description: 'Get repair notes' },
  ADD_NOTE: { path: ':id/notes', requiresAuth: true, cacheable: false, description: 'Add repair note' },
  UPDATE_STATUS: { path: ':id/status', requiresAuth: true, cacheable: false, description: 'Update repair status' }
});

// Support endpoints
export const SUPPORT_ENDPOINTS = registerEndpoints('support', {
  TICKETS: { path: 'tickets', requiresAuth: true, cacheable: false, description: 'Get support tickets' },
  TICKET_DETAIL: { path: 'tickets/:id', requiresAuth: true, cacheable: false, description: 'Get ticket details' },
  CREATE_TICKET: { path: 'tickets', requiresAuth: true, cacheable: false, description: 'Create support ticket' },
  UPDATE_TICKET: { path: 'tickets/:id', requiresAuth: true, cacheable: false, description: 'Update support ticket' },
  CLOSE_TICKET: { path: 'tickets/:id/close', requiresAuth: true, cacheable: false, description: 'Close support ticket' },
  TICKET_MESSAGES: { path: 'tickets/:id/messages', requiresAuth: true, cacheable: false, description: 'Get ticket messages' },
  ADD_MESSAGE: { path: 'tickets/:id/messages', requiresAuth: true, cacheable: false, description: 'Add ticket message' }
});

// Purchase order endpoints
export const PURCHASE_ORDER_ENDPOINTS = registerEndpoints('purchase-orders', {
  ...createStandardCrudEndpoints(),
  ITEMS: { path: ':id/items', requiresAuth: true, cacheable: false, description: 'Get purchase order items' },
  ADD_ITEM: { path: ':id/items', requiresAuth: true, cacheable: false, description: 'Add item to purchase order' },
  REMOVE_ITEM: { path: ':id/items/:itemId', requiresAuth: true, cacheable: false, description: 'Remove item from purchase order' },
  RECEIVE: { path: ':id/receive', requiresAuth: true, cacheable: false, description: 'Receive purchase order' },
  PARTIAL_RECEIVE: { path: ':id/partial-receive', requiresAuth: true, cacheable: false, description: 'Partially receive purchase order' },
  CANCEL: { path: ':id/cancel', requiresAuth: true, cacheable: false, description: 'Cancel purchase order' }
});

// Loyalty endpoints
export const LOYALTY_ENDPOINTS = registerEndpoints('loyalty', {
  ...createStandardCrudEndpoints({ cacheable: true }),
  TIERS: { path: 'tiers', requiresAuth: true, cacheable: true, description: 'Get loyalty tiers' },
  REWARDS: { path: 'rewards', requiresAuth: true, cacheable: true, description: 'Get loyalty rewards' },
  EVENTS: { path: 'events', requiresAuth: true, cacheable: false, description: 'Get loyalty events' },
  TRANSACTIONS: { path: 'transactions', requiresAuth: true, cacheable: false, description: 'Get loyalty transactions' },
  SETTINGS: { path: 'settings', requiresAuth: true, cacheable: true, description: 'Get loyalty settings' },
  UPDATE_SETTINGS: { path: 'settings', requiresAuth: true, cacheable: false, description: 'Update loyalty settings' },
  CUSTOMER_TIERS: { path: 'customer-tiers', requiresAuth: true, cacheable: false, description: 'Get customer tiers' },
  CUSTOMER_REWARDS: { path: 'customer-rewards', requiresAuth: true, cacheable: false, description: 'Get customer rewards' },
  NEXT_TIER: { path: 'next-tier', requiresAuth: true, cacheable: false, description: 'Get next tier' }
});

// Employment endpoints
export const EMPLOYMENT_ENDPOINTS = registerEndpoints('employment', {
  TYPES: { path: 'types', requiresAuth: true, cacheable: true, description: 'Get employment types' },
  STATUSES: { path: 'statuses', requiresAuth: true, cacheable: true, description: 'Get employment statuses' }
});

// Notification endpoints
export const NOTIFICATION_ENDPOINTS = registerEndpoints('notifications', {
  ...createStandardCrudEndpoints(),
  UNREAD: { path: 'unread', requiresAuth: true, cacheable: false, description: 'Get unread notifications' },
  UNREAD_COUNT: { path: 'unread/count', requiresAuth: true, cacheable: false, description: 'Get unread notification count' },
  MARK_READ: { path: ':id/read', requiresAuth: true, cacheable: false, description: 'Mark notification as read' },
  MARK_ALL_READ: { path: 'read/all', requiresAuth: true, cacheable: false, description: 'Mark all notifications as read' },
  PREFERENCES: { path: 'preferences', requiresAuth: true, cacheable: true, description: 'Get notification preferences' },
  UPDATE_PREFERENCES: { path: 'preferences', requiresAuth: true, cacheable: false, description: 'Update notification preferences' }
});

// Health check endpoint
export const HEALTH_ENDPOINTS = registerEndpoints('health', {
  CHECK: { path: '', requiresAuth: false, cacheable: false, description: 'Health check endpoint' }
});

// Role endpoints
export const ROLE_ENDPOINTS = registerEndpoints('roles', {
  ...createStandardCrudEndpoints(),
  STAFF: { path: ':id/staff', requiresAuth: true, cacheable: false, description: 'Get staff members assigned to a role' },
  TEMPLATES: { path: 'templates', requiresAuth: true, cacheable: true, description: 'Get role templates' },
  ASSIGN_USER: { path: 'assign-user', requiresAuth: true, cacheable: false, description: 'Assign user to role' },
  REMOVE_USER: { path: 'remove-user', requiresAuth: true, cacheable: false, description: 'Remove user from role' }
});

// Brand endpoints
export const BRAND_ENDPOINTS = registerEndpoints('brands', {
  ...createStandardCrudEndpoints({ cacheable: true }),
  PRODUCTS: { path: ':id/products', requiresAuth: false, cacheable: true, description: 'Get brand products' },
  UPDATE_STATUS: { path: 'status', requiresAuth: true, cacheable: false, description: 'Update brand status' },
  DELETE_MANY: { path: 'batch-delete', requiresAuth: true, cacheable: false, description: 'Delete multiple brands' }
});

// Variation template endpoints
export const VARIATION_TEMPLATE_ENDPOINTS = registerEndpoints('variation-templates', {
  ...createStandardCrudEndpoints({ cacheable: true }),
  SET_DEFAULT: { path: ':id/default', requiresAuth: true, cacheable: false, description: 'Set variation template as default' },
  APPLY: { path: ':id/apply', requiresAuth: true, cacheable: false, description: 'Apply variation template' },
  DELETE_MANY: { path: 'batch-delete', requiresAuth: true, cacheable: false, description: 'Delete multiple variation templates' }
});

/**
 * Get the endpoint key for a standard operation on a resource
 *
 * @param resource The resource name
 * @param operation The operation type (list, detail, create, update, delete)
 * @returns The formatted endpoint key
 */
export function getStandardEndpointKey(
  resource: string,
  operation: 'list' | 'detail' | 'create' | 'update' | 'delete'
): string {
  const module = resource.toUpperCase();
  const operationMap: Record<string, string> = {
    list: 'LIST',
    detail: 'DETAIL',
    create: 'CREATE',
    update: 'UPDATE',
    delete: 'DELETE'
  };

  return `${module}_${operationMap[operation]}`;
}

/**
 * Get the full endpoint path for a specific module and endpoint key
 *
 * @param module - The module name (e.g., 'users', 'products')
 * @param endpoint - The endpoint key (e.g., 'LIST', 'DETAIL')
 * @returns The endpoint path or undefined if not found
 */
export function getModuleEndpoint(module: string, endpoint: string): string | undefined {
  if (endpointRegistry[module]?.endpoints) {
    return endpointRegistry[module].endpoints[endpoint];
  }
  return undefined;
}

/**
 * Get all endpoints for a specific module
 *
 * @param module - The module name
 * @returns The module endpoints or undefined if not found
 */
export function getModuleEndpoints(module: string): { [key: string]: string } | undefined {
  return endpointRegistry[module]?.endpoints;
}

/**
 * Get all endpoints that require authentication
 *
 * @returns Array of protected endpoint paths
 */
export function getProtectedEndpoints(): string[] {
  const protectedEndpoints: string[] = [];

  Object.keys(endpointRegistry).forEach(module => {
    const meta = endpointRegistry[module].meta;
    const endpoints = endpointRegistry[module].endpoints;

    Object.keys(meta).forEach(key => {
      if (meta[key].requiresAuth) {
        protectedEndpoints.push(endpoints[key]);
      }
    });
  });

  return protectedEndpoints;
}

/**
 * Get all endpoints that are cacheable
 *
 * @returns Array of cacheable endpoint paths
 */
export function getCacheableEndpoints(): string[] {
  const cacheableEndpoints: string[] = [];

  Object.keys(endpointRegistry).forEach(module => {
    const meta = endpointRegistry[module].meta;
    const endpoints = endpointRegistry[module].endpoints;

    Object.keys(meta).forEach(key => {
      if (meta[key].cacheable) {
        cacheableEndpoints.push(endpoints[key]);
      }
    });
  });

  return cacheableEndpoints;
}
