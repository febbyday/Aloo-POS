/**
 * Product Module Route Configuration
 * 
 * This file defines all routes related to the Products module in a centralized way,
 * following the route registry pattern established in the Finance module.
 */

import { getIconByName } from './routeUtils';

/**
 * Base route path for the products module
 */
export const PRODUCTS_BASE_PATH = '/products';

/**
 * Route paths relative to the base path
 */
export const PRODUCTS_ROUTES = {
  // Main routes
  LIST: '',
  DETAILS: '/:productId',
  EDIT: '/:productId/edit',
  CREATE: '/new',
  
  // Category related routes
  CATEGORIES: '/categories',
  CATEGORY_DETAILS: '/categories/:categoryId',
  
  // Inventory related routes
  INVENTORY: '/inventory',
  STOCK_LEVEL: '/stock-levels',
  ADJUSTMENTS: '/adjustments',
  
  // Report routes
  REPORTS: '/reports',
  SALES_PERFORMANCE: '/reports/sales-performance',
  INVENTORY_VALUATION: '/reports/inventory-valuation',
};

/**
 * Full absolute paths for the products module
 */
export const PRODUCTS_FULL_ROUTES = Object.entries(PRODUCTS_ROUTES).reduce(
  (acc, [key, path]) => ({
    ...acc,
    [key]: `${PRODUCTS_BASE_PATH}${path}`,
  }),
  {} as Record<keyof typeof PRODUCTS_ROUTES, string>
);

/**
 * Route configuration for the products module including metadata
 */
export const PRODUCTS_ROUTE_CONFIG = {
  // Main routes
  LIST: {
    path: PRODUCTS_FULL_ROUTES.LIST,
    label: 'Products',
    icon: getIconByName('Package'),
    description: 'View and manage all products',
    showInNav: true,
    order: 10,
  },
  DETAILS: {
    path: PRODUCTS_FULL_ROUTES.DETAILS,
    label: 'Product Details',
    icon: getIconByName('Info'),
    description: 'View product details',
    showInNav: false,
  },
  EDIT: {
    path: PRODUCTS_FULL_ROUTES.EDIT,
    label: 'Edit Product',
    icon: getIconByName('Edit'),
    description: 'Edit product details',
    showInNav: false,
  },
  CREATE: {
    path: PRODUCTS_FULL_ROUTES.CREATE,
    label: 'New Product',
    icon: getIconByName('Plus'),
    description: 'Create a new product',
    showInNav: false,
  },
  
  // Category routes
  CATEGORIES: {
    path: PRODUCTS_FULL_ROUTES.CATEGORIES,
    label: 'Categories',
    icon: getIconByName('Folder'),
    description: 'View and manage product categories',
    showInNav: true,
    order: 20,
  },
  CATEGORY_DETAILS: {
    path: PRODUCTS_FULL_ROUTES.CATEGORY_DETAILS,
    label: 'Category Details',
    icon: getIconByName('Folder'),
    description: 'View category details',
    showInNav: false,
  },
  
  // Inventory routes
  INVENTORY: {
    path: PRODUCTS_FULL_ROUTES.INVENTORY,
    label: 'Inventory',
    icon: getIconByName('Box'),
    description: 'View inventory status',
    showInNav: true,
    order: 30,
  },
  STOCK_LEVEL: {
    path: PRODUCTS_FULL_ROUTES.STOCK_LEVEL,
    label: 'Stock Levels',
    icon: getIconByName('BarChart'),
    description: 'View and manage stock levels',
    showInNav: true,
    order: 40,
  },
  ADJUSTMENTS: {
    path: PRODUCTS_FULL_ROUTES.ADJUSTMENTS,
    label: 'Inventory Adjustments',
    icon: getIconByName('Edit3'),
    description: 'Process inventory adjustments',
    showInNav: true,
    order: 50,
  },
  
  // Report routes
  REPORTS: {
    path: PRODUCTS_FULL_ROUTES.REPORTS,
    label: 'Product Reports',
    icon: getIconByName('FileText'),
    description: 'View product reports',
    showInNav: true,
    order: 60,
  },
  SALES_PERFORMANCE: {
    path: PRODUCTS_FULL_ROUTES.SALES_PERFORMANCE,
    label: 'Sales Performance',
    icon: getIconByName('TrendingUp'),
    description: 'View product sales performance reports',
    showInNav: false,
  },
  INVENTORY_VALUATION: {
    path: PRODUCTS_FULL_ROUTES.INVENTORY_VALUATION,
    label: 'Inventory Valuation',
    icon: getIconByName('DollarSign'),
    description: 'View inventory valuation reports',
    showInNav: false,
  },
}; 