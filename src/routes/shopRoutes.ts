import { getIconByName } from './routeUtils';

// Base route
export const SHOPS_ROUTES = {
  ROOT: '/shops',
  LIST: '/shops/list',
  DETAILS: '/shops/:id',
  NEW: '/shops/new',
  EDIT: '/shops/:id/edit',
  INVENTORY: '/shops/:id/inventory',
  STAFF: '/shops/:id/staff',
  TRANSFERS: '/shops/:id/transfers',
  SETTINGS: '/shops/:id/settings',
  OPERATING_HOURS: '/shops/:id/hours',
  REPORTS: '/shops/reports',
  CONNECTION: '/shops/connection',
};

// Full routes with resolved paths
export const SHOPS_FULL_ROUTES = {
  ROOT: '/shops',
  LIST: '/shops/list',
  DETAILS: (id: string = ':id') => `/shops/${id}`,
  NEW: '/shops/new',
  EDIT: (id: string = ':id') => `/shops/${id}/edit`,
  INVENTORY: (id: string = ':id') => `/shops/${id}/inventory`,
  STAFF: (id: string = ':id') => `/shops/${id}/staff`,
  TRANSFERS: (id: string = ':id') => `/shops/${id}/transfers`,
  SETTINGS: (id: string = ':id') => `/shops/${id}/settings`,
  OPERATING_HOURS: (id: string = ':id') => `/shops/${id}/hours`,
  REPORTS: '/shops/reports',
  CONNECTION: '/shops/connection',
};

// Route configurations with metadata
export const SHOPS_ROUTE_CONFIG = {
  // Main routes
  ROOT: {
    path: SHOPS_ROUTES.ROOT,
    label: 'Shops',
    icon: getIconByName('Store'),
    description: 'Manage your retail locations',
    showInNav: true,
    order: 5, // Positioned after core modules
  },
  LIST: {
    path: SHOPS_ROUTES.LIST,
    label: 'All Shops',
    icon: getIconByName('ListFilter'),
    description: 'View and manage all shop locations',
    showInNav: true,
    order: 1,
  },
  DETAILS: {
    path: SHOPS_ROUTES.DETAILS,
    label: 'Shop Details',
    icon: getIconByName('Info'),
    description: 'View detailed information about a shop',
    showInNav: false,
  },
  NEW: {
    path: SHOPS_ROUTES.NEW,
    label: 'New Shop',
    icon: getIconByName('PlusCircle'),
    description: 'Create a new shop location',
    showInNav: false,
  },
  EDIT: {
    path: SHOPS_ROUTES.EDIT,
    label: 'Edit Shop',
    icon: getIconByName('Edit'),
    description: 'Edit shop details',
    showInNav: false,
  },
  
  // Inventory routes
  INVENTORY: {
    path: SHOPS_ROUTES.INVENTORY,
    label: 'Inventory',
    icon: getIconByName('Package'),
    description: 'Manage shop inventory',
    showInNav: false,
  },
  
  // Staff routes
  STAFF: {
    path: SHOPS_ROUTES.STAFF,
    label: 'Staff',
    icon: getIconByName('Users'),
    description: 'Manage shop staff and assignments',
    showInNav: false,
  },
  
  // Transfer routes
  TRANSFERS: {
    path: SHOPS_ROUTES.TRANSFERS,
    label: 'Transfers',
    icon: getIconByName('ArrowLeftRight'),
    description: 'Manage inventory transfers between shops',
    showInNav: true,
    order: 3,
  },
  
  // Settings routes
  SETTINGS: {
    path: SHOPS_ROUTES.SETTINGS,
    label: 'Settings',
    icon: getIconByName('Settings'),
    description: 'Configure shop settings',
    showInNav: false,
  },
  
  // Operating hours routes
  OPERATING_HOURS: {
    path: SHOPS_ROUTES.OPERATING_HOURS,
    label: 'Operating Hours',
    icon: getIconByName('Clock'),
    description: 'Set shop operating hours',
    showInNav: false,
  },
  
  // Reports routes
  REPORTS: {
    path: SHOPS_ROUTES.REPORTS,
    label: 'Reports',
    icon: getIconByName('BarChart'),
    description: 'View shop performance reports',
    showInNav: true,
    order: 4,
  },
  
  // Connection routes
  CONNECTION: {
    path: SHOPS_ROUTES.CONNECTION,
    label: 'Connection',
    icon: getIconByName('Link'),
    description: 'Configure shop data connections and integrations',
    showInNav: true,
    order: 5,
  },
}; 