/**
 * Market Routes
 * 
 * This file defines all routes for the Markets module.
 */

import { getIconByName } from './routeUtils';

// Base routes
export const MARKETS_ROUTES = {
  ROOT: 'markets',
  LIST: 'list',
  DETAILS: ':id',
  NEW: 'new',
  EDIT: ':id/edit',
  STOCK: ':id/stock',
  STAFF: ':id/staff',
  PERFORMANCE: ':id/performance',
  LOCATION: ':id/location',
  REPORTS: 'reports',
  SETTINGS: 'settings',
  CONNECTION: 'connection',
};

// Full paths constructed by joining routes
export const MARKETS_FULL_ROUTES = {
  ROOT: `/${MARKETS_ROUTES.ROOT}`,
  LIST: `/${MARKETS_ROUTES.ROOT}/${MARKETS_ROUTES.LIST}`,
  DETAILS: `/${MARKETS_ROUTES.ROOT}/${MARKETS_ROUTES.DETAILS}`,
  NEW: `/${MARKETS_ROUTES.ROOT}/${MARKETS_ROUTES.NEW}`,
  EDIT: `/${MARKETS_ROUTES.ROOT}/${MARKETS_ROUTES.EDIT}`,
  STOCK: `/${MARKETS_ROUTES.ROOT}/${MARKETS_ROUTES.STOCK}`,
  STAFF: `/${MARKETS_ROUTES.ROOT}/${MARKETS_ROUTES.STAFF}`,
  PERFORMANCE: `/${MARKETS_ROUTES.ROOT}/${MARKETS_ROUTES.PERFORMANCE}`,
  LOCATION: `/${MARKETS_ROUTES.ROOT}/${MARKETS_ROUTES.LOCATION}`,
  REPORTS: `/${MARKETS_ROUTES.ROOT}/${MARKETS_ROUTES.REPORTS}`,
  SETTINGS: `/${MARKETS_ROUTES.ROOT}/${MARKETS_ROUTES.SETTINGS}`,
  CONNECTION: `/${MARKETS_ROUTES.ROOT}/${MARKETS_ROUTES.CONNECTION}`,
};

// Dynamic route generation helpers
export const getMarketRoute = (marketId: string) => 
  MARKETS_FULL_ROUTES.DETAILS.replace(':id', marketId);

export const getMarketEditRoute = (marketId: string) => 
  MARKETS_FULL_ROUTES.EDIT.replace(':id', marketId);

export const getMarketStockRoute = (marketId: string) => 
  MARKETS_FULL_ROUTES.STOCK.replace(':id', marketId);

export const getMarketStaffRoute = (marketId: string) => 
  MARKETS_FULL_ROUTES.STAFF.replace(':id', marketId);
  
export const getMarketPerformanceRoute = (marketId: string) => 
  MARKETS_FULL_ROUTES.PERFORMANCE.replace(':id', marketId);
  
export const getMarketLocationRoute = (marketId: string) => 
  MARKETS_FULL_ROUTES.LOCATION.replace(':id', marketId);

// Route configuration with metadata
export const MARKETS_ROUTE_CONFIG = {
  ROOT: {
    path: MARKETS_ROUTES.ROOT,
    label: 'Markets',
    icon: getIconByName('Store'),
    description: 'Manage your market events',
    showInNav: true,
    order: 5,
  },
  LIST: {
    path: MARKETS_ROUTES.LIST,
    label: 'All Markets',
    icon: getIconByName('List'),
    description: 'View and manage all markets',
    showInNav: true,
    order: 1,
  },
  DETAILS: {
    path: MARKETS_ROUTES.DETAILS,
    label: 'Market Details',
    icon: getIconByName('Info'),
    description: 'View market details',
    showInNav: false,
  },
  NEW: {
    path: MARKETS_ROUTES.NEW,
    label: 'Add Market',
    icon: getIconByName('PlusCircle'),
    description: 'Add a new market',
    showInNav: true,
    order: 2,
  },
  EDIT: {
    path: MARKETS_ROUTES.EDIT,
    label: 'Edit Market',
    icon: getIconByName('Edit'),
    description: 'Edit market details',
    showInNav: false,
  },
  STOCK: {
    path: MARKETS_ROUTES.STOCK,
    label: 'Market Stock',
    icon: getIconByName('Package'),
    description: 'Manage stock for this market',
    showInNav: false,
  },
  STAFF: {
    path: MARKETS_ROUTES.STAFF,
    label: 'Market Staff',
    icon: getIconByName('Users'),
    description: 'Manage staff for this market',
    showInNav: false,
  },
  PERFORMANCE: {
    path: MARKETS_ROUTES.PERFORMANCE,
    label: 'Market Performance',
    icon: getIconByName('BarChart'),
    description: 'View market performance metrics',
    showInNav: false,
  },
  LOCATION: {
    path: MARKETS_ROUTES.LOCATION,
    label: 'Market Location',
    icon: getIconByName('MapPin'),
    description: 'View and edit market location details',
    showInNav: false,
  },
  REPORTS: {
    path: MARKETS_ROUTES.REPORTS,
    label: 'Market Reports',
    icon: getIconByName('FileText'),
    description: 'Generate market reports',
    showInNav: true,
    order: 3,
  },
  SETTINGS: {
    path: MARKETS_ROUTES.SETTINGS,
    label: 'Market Settings',
    icon: getIconByName('Settings'),
    description: 'Configure market settings',
    showInNav: true,
    order: 4,
  },
  CONNECTION: {
    path: MARKETS_ROUTES.CONNECTION,
    label: 'Market Connection',
    icon: getIconByName('Link'),
    description: 'Connect to market systems',
    showInNav: true,
    order: 5,
  },
}; 