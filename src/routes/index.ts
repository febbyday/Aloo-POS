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
    // Add routes from other modules as they're created
  ];
  
  // Check for duplicate routes
  const duplicates: string[] = [];
  const routeMap = new Map<string, number>();
  
  allRoutes.forEach(route => {
    const count = routeMap.get(route) || 0;
    routeMap.set(route, count + 1);
    
    if (count > 0) {
      duplicates.push(route);
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