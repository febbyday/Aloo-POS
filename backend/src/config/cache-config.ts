/**
 * Cache Configuration
 * 
 * This file defines caching strategies for different routes and resources.
 * It specifies TTL (time to live) values and cache invalidation rules.
 */

// Cache TTL values in milliseconds
export const CACHE_TTL = {
  // Very short-lived cache (10 seconds)
  VERY_SHORT: 10 * 1000,
  
  // Short-lived cache (1 minute)
  SHORT: 60 * 1000,
  
  // Medium-lived cache (5 minutes)
  MEDIUM: 5 * 60 * 1000,
  
  // Long-lived cache (30 minutes)
  LONG: 30 * 60 * 1000,
  
  // Very long-lived cache (1 hour)
  VERY_LONG: 60 * 60 * 1000,
  
  // Persistent cache (1 day)
  PERSISTENT: 24 * 60 * 60 * 1000,
};

// Cache configuration by route pattern
export const ROUTE_CACHE_CONFIG: Record<string, {
  ttl: number;
  condition?: (req: any) => boolean;
}> = {
  // Products
  'GET /products': {
    ttl: CACHE_TTL.MEDIUM,
  },
  'GET /products/:id': {
    ttl: CACHE_TTL.MEDIUM,
  },
  'GET /products/category/:id': {
    ttl: CACHE_TTL.MEDIUM,
  },
  'GET /products/supplier/:id': {
    ttl: CACHE_TTL.MEDIUM,
  },
  'GET /products/low-stock': {
    ttl: CACHE_TTL.SHORT,
  },
  
  // Categories
  'GET /categories': {
    ttl: CACHE_TTL.LONG,
  },
  'GET /categories/:id': {
    ttl: CACHE_TTL.LONG,
  },
  
  // Suppliers
  'GET /suppliers': {
    ttl: CACHE_TTL.LONG,
  },
  'GET /suppliers/:id': {
    ttl: CACHE_TTL.LONG,
  },
  
  // Customers
  'GET /customers': {
    ttl: CACHE_TTL.MEDIUM,
  },
  'GET /customers/:id': {
    ttl: CACHE_TTL.MEDIUM,
  },
  
  // Orders
  'GET /orders': {
    ttl: CACHE_TTL.SHORT,
    // Only cache if not filtering by recent date
    condition: (req) => {
      const { startDate, endDate } = req.query;
      if (!startDate && !endDate) return true;
      
      // Don't cache if filtering by recent dates
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      if (startDate) {
        const startDateObj = new Date(startDate);
        if (startDateObj > oneWeekAgo) return false;
      }
      
      return true;
    },
  },
  'GET /orders/:id': {
    ttl: CACHE_TTL.MEDIUM,
  },
  
  // Stores
  'GET /stores': {
    ttl: CACHE_TTL.LONG,
  },
  'GET /stores/:id': {
    ttl: CACHE_TTL.LONG,
  },
  
  // Settings
  'GET /settings/:module': {
    ttl: CACHE_TTL.VERY_LONG,
  },
  
  // Reports
  'GET /reports/sales': {
    ttl: CACHE_TTL.SHORT,
  },
  'GET /reports/inventory': {
    ttl: CACHE_TTL.SHORT,
  },
  'GET /reports/customers': {
    ttl: CACHE_TTL.MEDIUM,
  },
  
  // Static data
  'GET /countries': {
    ttl: CACHE_TTL.PERSISTENT,
  },
  'GET /currencies': {
    ttl: CACHE_TTL.PERSISTENT,
  },
  'GET /timezones': {
    ttl: CACHE_TTL.PERSISTENT,
  },
};

// Cache invalidation rules
export const CACHE_INVALIDATION_RULES: Record<string, string[]> = {
  // When a product is created/updated/deleted, invalidate these routes
  'product': [
    'GET /products',
    'GET /products/:id',
    'GET /products/category/:id',
    'GET /products/supplier/:id',
    'GET /products/low-stock',
  ],
  
  // When a category is created/updated/deleted, invalidate these routes
  'category': [
    'GET /categories',
    'GET /categories/:id',
    'GET /products',
    'GET /products/category/:id',
  ],
  
  // When a supplier is created/updated/deleted, invalidate these routes
  'supplier': [
    'GET /suppliers',
    'GET /suppliers/:id',
    'GET /products/supplier/:id',
  ],
  
  // When an order is created/updated/deleted, invalidate these routes
  'order': [
    'GET /orders',
    'GET /orders/:id',
    'GET /reports/sales',
  ],
  
  // When a customer is created/updated/deleted, invalidate these routes
  'customer': [
    'GET /customers',
    'GET /customers/:id',
    'GET /reports/customers',
  ],
  
  // When a store is created/updated/deleted, invalidate these routes
  'store': [
    'GET /stores',
    'GET /stores/:id',
  ],
  
  // When a setting is updated, invalidate these routes
  'setting': [
    'GET /settings/:module',
  ],
};

/**
 * Get cache TTL for a route
 * 
 * @param method HTTP method
 * @param path Route path
 * @param req Express request
 * @returns TTL in milliseconds or undefined if route should not be cached
 */
export function getRouteCacheTTL(method: string, path: string, req: any): number | undefined {
  const routeKey = `${method} ${path}`;
  
  // Check if route has a cache configuration
  const cacheConfig = ROUTE_CACHE_CONFIG[routeKey];
  
  if (!cacheConfig) {
    return undefined;
  }
  
  // Check if route has a condition
  if (cacheConfig.condition && !cacheConfig.condition(req)) {
    return undefined;
  }
  
  return cacheConfig.ttl;
}

/**
 * Get routes to invalidate when an entity is modified
 * 
 * @param entity Entity name
 * @returns Array of route patterns to invalidate
 */
export function getRoutesToInvalidate(entity: string): string[] {
  return CACHE_INVALIDATION_RULES[entity] || [];
}

export default {
  CACHE_TTL,
  ROUTE_CACHE_CONFIG,
  CACHE_INVALIDATION_RULES,
  getRouteCacheTTL,
  getRoutesToInvalidate,
};
