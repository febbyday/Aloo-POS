/**
 * Order Module Route Configuration
 * 
 * This file defines all routes related to the Orders module in a centralized way,
 * following the route registry pattern established for the application.
 */

import { getIconByName } from './routeUtils';

/**
 * Base route path for the orders module
 */
export const ORDERS_BASE_PATH = '/orders';

/**
 * Route paths relative to the base path
 */
export const ORDERS_ROUTES = {
  // Main routes
  LIST: '',
  DETAILS: '/:orderId',
  CREATE: '/new',
  EDIT: '/:orderId/edit',
  
  // Order status related routes
  PENDING: '/pending',
  PROCESSING: '/processing',
  COMPLETED: '/completed',
  CANCELED: '/canceled',
  
  // Order management routes
  RETURNS: '/returns',
  REFUNDS: '/refunds',
  INVOICES: '/invoices',
  
  // Reporting routes
  REPORTS: '/reports',
  REVENUE: '/reports/revenue',
  PERFORMANCE: '/reports/performance',
};

/**
 * Full absolute paths for the orders module
 */
export const ORDERS_FULL_ROUTES = Object.entries(ORDERS_ROUTES).reduce(
  (acc, [key, path]) => ({
    ...acc,
    [key]: `${ORDERS_BASE_PATH}${path}`,
  }),
  {} as Record<keyof typeof ORDERS_ROUTES, string>
);

/**
 * Route configuration for the orders module including metadata
 */
export const ORDERS_ROUTE_CONFIG = {
  // Main routes
  LIST: {
    path: ORDERS_FULL_ROUTES.LIST,
    label: 'All Orders',
    icon: getIconByName('ShoppingCart'),
    description: 'View and manage all orders',
    showInNav: true,
    order: 10,
  },
  DETAILS: {
    path: ORDERS_FULL_ROUTES.DETAILS,
    label: 'Order Details',
    icon: getIconByName('Info'),
    description: 'View order details',
    showInNav: false,
  },
  CREATE: {
    path: ORDERS_FULL_ROUTES.CREATE,
    label: 'New Order',
    icon: getIconByName('Plus'),
    description: 'Create a new order',
    showInNav: false,
  },
  EDIT: {
    path: ORDERS_FULL_ROUTES.EDIT,
    label: 'Edit Order',
    icon: getIconByName('Edit'),
    description: 'Edit order details',
    showInNav: false,
  },
  
  // Order status routes
  PENDING: {
    path: ORDERS_FULL_ROUTES.PENDING,
    label: 'Pending Orders',
    icon: getIconByName('Clock'),
    description: 'View pending orders',
    showInNav: true,
    order: 20,
  },
  PROCESSING: {
    path: ORDERS_FULL_ROUTES.PROCESSING,
    label: 'Processing Orders',
    icon: getIconByName('RefreshCw'),
    description: 'View processing orders',
    showInNav: true,
    order: 30,
  },
  COMPLETED: {
    path: ORDERS_FULL_ROUTES.COMPLETED,
    label: 'Completed Orders',
    icon: getIconByName('CheckCircle'),
    description: 'View completed orders',
    showInNav: true,
    order: 40,
  },
  CANCELED: {
    path: ORDERS_FULL_ROUTES.CANCELED,
    label: 'Canceled Orders',
    icon: getIconByName('XCircle'),
    description: 'View canceled orders',
    showInNav: true,
    order: 50,
  },
  
  // Order management routes
  RETURNS: {
    path: ORDERS_FULL_ROUTES.RETURNS,
    label: 'Returns',
    icon: getIconByName('CornerUpLeft'),
    description: 'Manage returned orders',
    showInNav: true,
    order: 60,
  },
  REFUNDS: {
    path: ORDERS_FULL_ROUTES.REFUNDS,
    label: 'Refunds',
    icon: getIconByName('DollarSign'),
    description: 'Manage order refunds',
    showInNav: true,
    order: 70,
  },
  INVOICES: {
    path: ORDERS_FULL_ROUTES.INVOICES,
    label: 'Invoices',
    icon: getIconByName('FileText'),
    description: 'View order invoices',
    showInNav: true,
    order: 80,
  },
  
  // Reporting routes
  REPORTS: {
    path: ORDERS_FULL_ROUTES.REPORTS,
    label: 'Order Reports',
    icon: getIconByName('BarChart2'),
    description: 'View order reports',
    showInNav: true,
    order: 90,
  },
  REVENUE: {
    path: ORDERS_FULL_ROUTES.REVENUE,
    label: 'Revenue Reports',
    icon: getIconByName('TrendingUp'),
    description: 'View revenue reports',
    showInNav: false,
  },
  PERFORMANCE: {
    path: ORDERS_FULL_ROUTES.PERFORMANCE,
    label: 'Performance Reports',
    icon: getIconByName('Activity'),
    description: 'View performance reports',
    showInNav: false,
  },
}; 