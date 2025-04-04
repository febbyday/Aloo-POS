/**
 * Central Route Registry
 * 
 * This file serves as the main entry point for all route definitions in the application.
 * It combines routes from different modules and provides utilities for route management.
 */

import { FINANCE_ROUTES, FINANCE_FULL_ROUTES, FINANCE_ROUTE_CONFIG } from './financeRoutes';
import { PRODUCTS_ROUTES, PRODUCTS_FULL_ROUTES, PRODUCTS_ROUTE_CONFIG } from './productRoutes';
import { ORDERS_ROUTES, ORDERS_FULL_ROUTES, ORDERS_ROUTE_CONFIG } from './orderRoutes';
import { CUSTOMERS_ROUTES, CUSTOMERS_FULL_ROUTES, CUSTOMERS_ROUTE_CONFIG } from './customerRoutes';
import { SALES_ROUTES, SALES_FULL_ROUTES, SALES_ROUTE_CONFIG } from './salesRoutes';
import { SUPPLIERS_ROUTES, SUPPLIERS_FULL_ROUTES, SUPPLIERS_ROUTE_CONFIG } from './supplierRoutes';
import { SHOPS_ROUTES, SHOPS_FULL_ROUTES, SHOPS_ROUTE_CONFIG } from './shopRoutes';
import { getIconByName } from './routeUtils';

// Export all route definitions
export {
  // Finance module routes
  FINANCE_ROUTES,
  FINANCE_FULL_ROUTES,
  FINANCE_ROUTE_CONFIG,
  
  // Products module routes
  PRODUCTS_ROUTES,
  PRODUCTS_FULL_ROUTES,
  PRODUCTS_ROUTE_CONFIG,
  
  // Orders module routes
  ORDERS_ROUTES,
  ORDERS_FULL_ROUTES,
  ORDERS_ROUTE_CONFIG,
  
  // Customers module routes
  CUSTOMERS_ROUTES,
  CUSTOMERS_FULL_ROUTES,
  CUSTOMERS_ROUTE_CONFIG,
  
  // Sales module routes
  SALES_ROUTES,
  SALES_FULL_ROUTES,
  SALES_ROUTE_CONFIG,
  
  // Suppliers module routes
  SUPPLIERS_ROUTES,
  SUPPLIERS_FULL_ROUTES,
  SUPPLIERS_ROUTE_CONFIG,
  
  // Shops module routes
  SHOPS_ROUTES,
  SHOPS_FULL_ROUTES,
  SHOPS_ROUTE_CONFIG,
  
  // Utilities
  getIconByName,
};

// Utility for validating routes
export const validateRoutes = (): string[] => {
  const allRoutes = [
    ...Object.values(FINANCE_FULL_ROUTES),
    ...Object.values(PRODUCTS_FULL_ROUTES),
    ...Object.values(ORDERS_FULL_ROUTES),
    ...Object.values(CUSTOMERS_FULL_ROUTES),
    ...Object.values(SALES_FULL_ROUTES),
    ...Object.values(SUPPLIERS_FULL_ROUTES),
    ...Object.values(SHOPS_FULL_ROUTES).map(route => typeof route === 'function' ? route() : route),
    // Add routes from other modules as they're created
  ];
  
  // Check for duplicate routes
  const duplicates: string[] = [];
  const routeMap = new Map<string, number>();
  
  allRoutes.forEach(route => {
    const count = routeMap.get(route as string) || 0;
    routeMap.set(route as string, count + 1);
    
    if (count > 0) {
      duplicates.push(route as string);
    }
  });
  
  return duplicates;
};

// Run validation in development mode
if (process.env.NODE_ENV === 'development') {
  const duplicates = validateRoutes();
  if (duplicates.length > 0) {
    console.warn('Route conflicts detected:', duplicates);
  }
}

// Constant to be used in route definitions
export const ROUTE_CONSTANTS = {
  ROOT: '/',
  NOT_FOUND: '*',
}; 