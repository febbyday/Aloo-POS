/**
 * Supplier Routes
 * 
 * This file defines all routes for the Suppliers module.
 */

import { getIconByName } from './routeUtils';

// Base routes
export const SUPPLIERS_ROUTES = {
  ROOT: 'suppliers',
  LIST: 'list',
  DETAILS: ':id',
  NEW: 'new',
  EDIT: ':id/edit',
  ORDERS: ':id/orders',
  PRODUCTS: ':id/products',
  PERFORMANCE: ':id/performance',
  REPORTS: 'reports',
  SETTINGS: 'settings',
  CONNECTION: 'connection',
};

// Full paths constructed by joining routes
export const SUPPLIERS_FULL_ROUTES = {
  ROOT: `/${SUPPLIERS_ROUTES.ROOT}`,
  LIST: `/${SUPPLIERS_ROUTES.ROOT}/${SUPPLIERS_ROUTES.LIST}`,
  DETAILS: `/${SUPPLIERS_ROUTES.ROOT}/${SUPPLIERS_ROUTES.DETAILS}`,
  NEW: `/${SUPPLIERS_ROUTES.ROOT}/${SUPPLIERS_ROUTES.NEW}`,
  EDIT: `/${SUPPLIERS_ROUTES.ROOT}/${SUPPLIERS_ROUTES.EDIT}`,
  ORDERS: `/${SUPPLIERS_ROUTES.ROOT}/${SUPPLIERS_ROUTES.ORDERS}`,
  PRODUCTS: `/${SUPPLIERS_ROUTES.ROOT}/${SUPPLIERS_ROUTES.PRODUCTS}`,
  PERFORMANCE: `/${SUPPLIERS_ROUTES.ROOT}/${SUPPLIERS_ROUTES.PERFORMANCE}`,
  REPORTS: `/${SUPPLIERS_ROUTES.ROOT}/${SUPPLIERS_ROUTES.REPORTS}`,
  SETTINGS: `/${SUPPLIERS_ROUTES.ROOT}/${SUPPLIERS_ROUTES.SETTINGS}`,
  CONNECTION: `/${SUPPLIERS_ROUTES.ROOT}/${SUPPLIERS_ROUTES.CONNECTION}`,
};

// Dynamic route generation helpers
export const getSupplierRoute = (supplierId: string) => 
  SUPPLIERS_FULL_ROUTES.DETAILS.replace(':id', supplierId);

export const getSupplierEditRoute = (supplierId: string) => 
  SUPPLIERS_FULL_ROUTES.EDIT.replace(':id', supplierId);

export const getSupplierOrdersRoute = (supplierId: string) => 
  SUPPLIERS_FULL_ROUTES.ORDERS.replace(':id', supplierId);

export const getSupplierProductsRoute = (supplierId: string) => 
  SUPPLIERS_FULL_ROUTES.PRODUCTS.replace(':id', supplierId);
  
export const getSupplierPerformanceRoute = (supplierId: string) => 
  SUPPLIERS_FULL_ROUTES.PERFORMANCE.replace(':id', supplierId);
  
export const getSupplierReportsRoute = (supplierId: string) => 
  SUPPLIERS_FULL_ROUTES.REPORTS.replace(':id', supplierId);
  
export const getSupplierSettingsRoute = (supplierId: string) => 
  SUPPLIERS_FULL_ROUTES.SETTINGS.replace(':id', supplierId);

export const getSupplierConnectionRoute = (supplierId: string) => 
  SUPPLIERS_FULL_ROUTES.CONNECTION.replace(':id', supplierId);

// Route configuration with metadata
export const SUPPLIERS_ROUTE_CONFIG = {
  ROOT: {
    path: SUPPLIERS_ROUTES.ROOT,
    label: 'Suppliers',
    icon: getIconByName('Truck'),
    description: 'Manage your supplier relationships',
    showInNav: true,
    order: 4,
  },
  LIST: {
    path: SUPPLIERS_ROUTES.LIST,
    label: 'All Suppliers',
    icon: getIconByName('List'),
    description: 'View and manage all suppliers',
    showInNav: true,
    order: 1,
  },
  DETAILS: {
    path: SUPPLIERS_ROUTES.DETAILS,
    label: 'Supplier Details',
    icon: getIconByName('Info'),
    description: 'View supplier details',
    showInNav: false,
  },
  NEW: {
    path: SUPPLIERS_ROUTES.NEW,
    label: 'Add Supplier',
    icon: getIconByName('PlusCircle'),
    description: 'Add a new supplier',
    showInNav: true,
    order: 2,
  },
  EDIT: {
    path: SUPPLIERS_ROUTES.EDIT,
    label: 'Edit Supplier',
    icon: getIconByName('Edit'),
    description: 'Edit supplier details',
    showInNav: false,
  },
  ORDERS: {
    path: SUPPLIERS_ROUTES.ORDERS,
    label: 'Supplier Orders',
    icon: getIconByName('ShoppingCart'),
    description: 'View supplier orders',
    showInNav: false,
  },
  PRODUCTS: {
    path: SUPPLIERS_ROUTES.PRODUCTS,
    label: 'Supplier Products',
    icon: getIconByName('Package'),
    description: 'View products from this supplier',
    showInNav: false,
  },
  PERFORMANCE: {
    path: SUPPLIERS_ROUTES.PERFORMANCE,
    label: 'Supplier Performance',
    icon: getIconByName('BarChart'),
    description: 'View supplier performance metrics',
    showInNav: false,
  },
  REPORTS: {
    path: SUPPLIERS_ROUTES.REPORTS,
    label: 'Supplier Reports',
    icon: getIconByName('FileText'),
    description: 'Generate supplier reports',
    showInNav: true,
    order: 3,
  },
  SETTINGS: {
    path: SUPPLIERS_ROUTES.SETTINGS,
    label: 'Supplier Settings',
    icon: getIconByName('Settings'),
    description: 'Configure supplier settings',
    showInNav: true,
    order: 4,
  },
  CONNECTION: {
    path: SUPPLIERS_ROUTES.CONNECTION,
    label: 'Supplier Connection',
    icon: getIconByName('Link'),
    description: 'Connect to supplier systems',
    showInNav: true,
    order: 5,
  },
}; 