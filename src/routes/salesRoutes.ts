/**
 * Sales Module Route Configuration
 * 
 * This file defines all routes related to the Sales module in a centralized way,
 * following the route registry pattern established for the application.
 */

import { getIconByName } from './routeUtils';

/**
 * Base route path for the sales module
 */
export const SALES_BASE_PATH = '/sales';

/**
 * Route paths relative to the base path
 */
export const SALES_ROUTES = {
  // Main routes
  LIST: '',
  DETAILS: '/:saleId',
  CREATE: '/new',
  EDIT: '/:saleId/edit',
  
  // Gift card routes
  GIFT_CARDS: '/gift-cards',
  GIFT_CARD_DETAILS: '/gift-cards/:giftCardId',
  GIFT_CARD_CREATE: '/gift-cards/new',
  GIFT_CARD_EDIT: '/gift-cards/:giftCardId/edit',
  
  // Sales management routes
  RETURNS: '/returns',
  REFUNDS: '/refunds',
  INVOICES: '/invoices',
  
  // Reporting routes
  REPORTS: '/reports',
  REVENUE: '/reports/revenue',
  PERFORMANCE: '/reports/performance',
};

/**
 * Full route paths including the base path
 */
export const SALES_FULL_ROUTES = {
  LIST: `${SALES_BASE_PATH}${SALES_ROUTES.LIST}`,
  DETAILS: `${SALES_BASE_PATH}${SALES_ROUTES.DETAILS}`,
  CREATE: `${SALES_BASE_PATH}${SALES_ROUTES.CREATE}`,
  EDIT: `${SALES_BASE_PATH}${SALES_ROUTES.EDIT}`,
  
  // Gift card routes
  GIFT_CARDS: `${SALES_BASE_PATH}${SALES_ROUTES.GIFT_CARDS}`,
  GIFT_CARD_DETAILS: `${SALES_BASE_PATH}${SALES_ROUTES.GIFT_CARD_DETAILS}`,
  GIFT_CARD_CREATE: `${SALES_BASE_PATH}${SALES_ROUTES.GIFT_CARD_CREATE}`,
  GIFT_CARD_EDIT: `${SALES_BASE_PATH}${SALES_ROUTES.GIFT_CARD_EDIT}`,
  
  // Sales management routes
  RETURNS: `${SALES_BASE_PATH}${SALES_ROUTES.RETURNS}`,
  REFUNDS: `${SALES_BASE_PATH}${SALES_ROUTES.REFUNDS}`,
  INVOICES: `${SALES_BASE_PATH}${SALES_ROUTES.INVOICES}`,
  
  // Reporting routes
  REPORTS: `${SALES_BASE_PATH}${SALES_ROUTES.REPORTS}`,
  REVENUE: `${SALES_BASE_PATH}${SALES_ROUTES.REVENUE}`,
  PERFORMANCE: `${SALES_BASE_PATH}${SALES_ROUTES.PERFORMANCE}`,
};

/**
 * Route configuration for the sales module including metadata
 */
export const SALES_ROUTE_CONFIG = {
  // Main routes
  LIST: {
    path: SALES_FULL_ROUTES.LIST,
    label: 'All Sales',
    icon: getIconByName('ShoppingCart'),
    description: 'View and manage all sales',
    showInNav: true,
    order: 10,
  },
  DETAILS: {
    path: SALES_FULL_ROUTES.DETAILS,
    label: 'Sale Details',
    icon: getIconByName('Info'),
    description: 'View sale details',
    showInNav: false,
  },
  CREATE: {
    path: SALES_FULL_ROUTES.CREATE,
    label: 'New Sale',
    icon: getIconByName('Plus'),
    description: 'Create a new sale',
    showInNav: false,
  },
  EDIT: {
    path: SALES_FULL_ROUTES.EDIT,
    label: 'Edit Sale',
    icon: getIconByName('Edit'),
    description: 'Edit sale details',
    showInNav: false,
  },
  
  // Gift card routes
  GIFT_CARDS: {
    path: SALES_FULL_ROUTES.GIFT_CARDS,
    label: 'Gift Cards',
    icon: getIconByName('Gift'),
    description: 'Manage gift cards',
    showInNav: true,
    order: 20,
  },
  GIFT_CARD_DETAILS: {
    path: SALES_FULL_ROUTES.GIFT_CARD_DETAILS,
    label: 'Gift Card Details',
    icon: getIconByName('Info'),
    description: 'View gift card details',
    showInNav: false,
  },
  GIFT_CARD_CREATE: {
    path: SALES_FULL_ROUTES.GIFT_CARD_CREATE,
    label: 'New Gift Card',
    icon: getIconByName('Plus'),
    description: 'Create a new gift card',
    showInNav: false,
  },
  GIFT_CARD_EDIT: {
    path: SALES_FULL_ROUTES.GIFT_CARD_EDIT,
    label: 'Edit Gift Card',
    icon: getIconByName('Edit'),
    description: 'Edit gift card details',
    showInNav: false,
  },
  
  // Sales management routes
  RETURNS: {
    path: SALES_FULL_ROUTES.RETURNS,
    label: 'Returns',
    icon: getIconByName('CornerUpLeft'),
    description: 'Manage returned items',
    showInNav: true,
    order: 30,
  },
  REFUNDS: {
    path: SALES_FULL_ROUTES.REFUNDS,
    label: 'Refunds',
    icon: getIconByName('DollarSign'),
    description: 'Manage refunds',
    showInNav: true,
    order: 40,
  },
  INVOICES: {
    path: SALES_FULL_ROUTES.INVOICES,
    label: 'Invoices',
    icon: getIconByName('FileText'),
    description: 'View and manage invoices',
    showInNav: true,
    order: 50,
  },
  
  // Reporting routes
  REPORTS: {
    path: SALES_FULL_ROUTES.REPORTS,
    label: 'Sales Reports',
    icon: getIconByName('BarChart2'),
    description: 'View sales reports',
    showInNav: true,
    order: 60,
  },
  REVENUE: {
    path: SALES_FULL_ROUTES.REVENUE,
    label: 'Revenue Reports',
    icon: getIconByName('TrendingUp'),
    description: 'View revenue reports',
    showInNav: false,
  },
  PERFORMANCE: {
    path: SALES_FULL_ROUTES.PERFORMANCE,
    label: 'Performance Reports',
    icon: getIconByName('Activity'),
    description: 'View performance reports',
    showInNav: false,
  },
}; 