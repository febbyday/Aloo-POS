/**
 * Customer Module Route Configuration
 * 
 * This file defines all routes related to the Customers module in a centralized way,
 * following the route registry pattern established for the application.
 */

import { getIconByName } from './routeUtils';

/**
 * Base route path for the customers module
 */
export const CUSTOMERS_BASE_PATH = '/customers';

/**
 * Route paths relative to the base path
 */
export const CUSTOMERS_ROUTES = {
  // Main routes
  LIST: '',
  DETAILS: '/:customerId',
  CREATE: '/new',
  EDIT: '/:customerId/edit',
  
  // Customer segmentation routes
  GROUPS: '/groups',
  GROUP_DETAILS: '/groups/:groupId',
  GROUP_EDIT: '/groups/:groupId/edit',
  GROUP_CREATE: '/groups/new',
  
  // Customer engagement routes
  REWARDS: '/rewards',
  LOYALTY: '/loyalty',
  FEEDBACK: '/feedback',
  
  // Analytics and reporting
  INSIGHTS: '/insights',
  REPORTS: '/reports',
  PURCHASE_HISTORY: '/:customerId/purchases',
  
  // Customization routes
  PREFERENCES: '/preferences',
  COMMUNICATIONS: '/communications',
};

/**
 * Full absolute paths for the customers module
 */
export const CUSTOMERS_FULL_ROUTES = Object.entries(CUSTOMERS_ROUTES).reduce(
  (acc, [key, path]) => ({
    ...acc,
    [key]: `${CUSTOMERS_BASE_PATH}${path}`,
  }),
  {} as Record<keyof typeof CUSTOMERS_ROUTES, string>
);

/**
 * Route configuration for the customers module including metadata
 */
export const CUSTOMERS_ROUTE_CONFIG = {
  // Main routes
  LIST: {
    path: CUSTOMERS_FULL_ROUTES.LIST,
    label: 'All Customers',
    icon: getIconByName('Users'),
    description: 'View and manage all customers',
    showInNav: true,
    order: 10,
  },
  DETAILS: {
    path: CUSTOMERS_FULL_ROUTES.DETAILS,
    label: 'Customer Details',
    icon: getIconByName('User'),
    description: 'View customer details',
    showInNav: false,
  },
  CREATE: {
    path: CUSTOMERS_FULL_ROUTES.CREATE,
    label: 'New Customer',
    icon: getIconByName('UserPlus'),
    description: 'Create a new customer',
    showInNav: false,
  },
  EDIT: {
    path: CUSTOMERS_FULL_ROUTES.EDIT,
    label: 'Edit Customer',
    icon: getIconByName('Edit'),
    description: 'Edit customer details',
    showInNav: false,
  },
  
  // Customer segmentation routes
  GROUPS: {
    path: CUSTOMERS_FULL_ROUTES.GROUPS,
    label: 'Customer Groups',
    icon: getIconByName('UsersRound'),
    description: 'Manage customer groups and segments',
    showInNav: true,
    order: 20,
  },
  GROUP_DETAILS: {
    path: CUSTOMERS_FULL_ROUTES.GROUP_DETAILS,
    label: 'Group Details',
    icon: getIconByName('UserRound'),
    description: 'View customer group details',
    showInNav: false,
  },
  GROUP_EDIT: {
    path: CUSTOMERS_FULL_ROUTES.GROUP_EDIT,
    label: 'Edit Group',
    icon: getIconByName('Edit'),
    description: 'Edit customer group',
    showInNav: false,
  },
  GROUP_CREATE: {
    path: CUSTOMERS_FULL_ROUTES.GROUP_CREATE,
    label: 'New Group',
    icon: getIconByName('Plus'),
    description: 'Create a new customer group',
    showInNav: false,
  },
  
  // Customer engagement routes
  REWARDS: {
    path: CUSTOMERS_FULL_ROUTES.REWARDS,
    label: 'Rewards Program',
    icon: getIconByName('Gift'),
    description: 'Manage customer rewards and incentives',
    showInNav: true,
    order: 30,
  },
  LOYALTY: {
    path: CUSTOMERS_FULL_ROUTES.LOYALTY,
    label: 'Loyalty Program',
    icon: getIconByName('Heart'),
    description: 'Manage customer loyalty program',
    showInNav: true,
    order: 40,
  },
  FEEDBACK: {
    path: CUSTOMERS_FULL_ROUTES.FEEDBACK,
    label: 'Customer Feedback',
    icon: getIconByName('MessageSquare'),
    description: 'View and respond to customer feedback',
    showInNav: true,
    order: 50,
  },
  
  // Analytics and reporting
  INSIGHTS: {
    path: CUSTOMERS_FULL_ROUTES.INSIGHTS,
    label: 'Customer Insights',
    icon: getIconByName('LineChart'),
    description: 'View customer analytics and insights',
    showInNav: true,
    order: 60,
  },
  REPORTS: {
    path: CUSTOMERS_FULL_ROUTES.REPORTS,
    label: 'Customer Reports',
    icon: getIconByName('FileText'),
    description: 'Generate customer reports',
    showInNav: true,
    order: 70,
  },
  PURCHASE_HISTORY: {
    path: CUSTOMERS_FULL_ROUTES.PURCHASE_HISTORY,
    label: 'Purchase History',
    icon: getIconByName('ShoppingBag'),
    description: 'View customer purchase history',
    showInNav: false,
  },
  
  // Customization routes
  PREFERENCES: {
    path: CUSTOMERS_FULL_ROUTES.PREFERENCES,
    label: 'Customer Preferences',
    icon: getIconByName('Settings'),
    description: 'Manage customer preference settings',
    showInNav: true,
    order: 80,
  },
  COMMUNICATIONS: {
    path: CUSTOMERS_FULL_ROUTES.COMMUNICATIONS,
    label: 'Communications',
    icon: getIconByName('Mail'),
    description: 'Manage customer communications',
    showInNav: true,
    order: 90,
  },
}; 