/**
 * Cache Middleware
 * 
 * This middleware provides HTTP response caching for Express routes:
 * - In-memory LRU cache for API responses
 * - Cache control headers
 * - ETag support
 * - Conditional requests
 */

import { Request, Response, NextFunction } from 'express';
import LRUCache from 'lru-cache';
import { createHash } from 'crypto';
import { logger } from '../utils/logger';

// Cache options
const CACHE_OPTIONS = {
  // Maximum number of items in the cache
  max: 500,
  
  // Maximum size of cache in bytes (100MB)
  maxSize: 100 * 1024 * 1024,
  
  // Size calculation function
  sizeCalculation: (value: any, key: string) => {
    // Estimate size of value in bytes
    return JSON.stringify(value).length;
  },
  
  // Default TTL (5 minutes)
  ttl: 1000 * 60 * 5,
  
  // Function to call when items are evicted from cache
  dispose: (value: any, key: string) => {
    logger.debug(`Cache item evicted: ${key}`);
  },
  
  // Update TTL on get
  updateAgeOnGet: true,
};

// Cache entry
interface CacheEntry {
  data: any;
  etag: string;
  timestamp: number;
}

// Cache instance
const cache = new LRUCache<string, CacheEntry>(CACHE_OPTIONS);

/**
 * Generate a cache key from request
 * 
 * @param req Express request
 * @returns Cache key
 */
function generateCacheKey(req: Request): string {
  const { method, originalUrl, query, body } = req;
  
  // For GET requests, use method and URL with query params
  if (method === 'GET') {
    return `${method}:${originalUrl}`;
  }
  
  // For other methods, include body in the key
  const bodyString = body ? JSON.stringify(body) : '';
  return `${method}:${originalUrl}:${bodyString}`;
}

/**
 * Generate ETag for data
 * 
 * @param data Data to generate ETag for
 * @returns ETag string
 */
function generateETag(data: any): string {
  const hash = createHash('md5');
  hash.update(JSON.stringify(data));
  return `"${hash.digest('hex')}"`;
}

/**
 * Cache middleware factory
 * 
 * @param ttl Time to live in milliseconds (optional)
 * @returns Express middleware
 */
export function cacheMiddleware(ttl?: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }
    
    // Generate cache key
    const cacheKey = generateCacheKey(req);
    
    // Check if response is in cache
    const cachedEntry = cache.get(cacheKey);
    
    if (cachedEntry) {
      // Get If-None-Match header
      const ifNoneMatch = req.headers['if-none-match'];
      
      // If ETag matches, return 304 Not Modified
      if (ifNoneMatch && ifNoneMatch === cachedEntry.etag) {
        return res.status(304).end();
      }
      
      // Set cache headers
      res.setHeader('Cache-Control', 'public, max-age=300');
      res.setHeader('ETag', cachedEntry.etag);
      
      // Return cached response
      return res.json(cachedEntry.data);
    }
    
    // Override res.json to cache the response
    const originalJson = res.json;
    res.json = function(data: any) {
      // Only cache successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Generate ETag
        const etag = generateETag(data);
        
        // Set cache headers
        res.setHeader('Cache-Control', 'public, max-age=300');
        res.setHeader('ETag', etag);
        
        // Store in cache
        cache.set(
          cacheKey,
          {
            data,
            etag,
            timestamp: Date.now(),
          },
          { ttl: ttl || CACHE_OPTIONS.ttl }
        );
      }
      
      // Call original json method
      return originalJson.call(this, data);
    };
    
    next();
  };
}

/**
 * Clear cache for a specific route
 * 
 * @param route Route to clear cache for
 */
export function clearRouteCache(route: string): void {
  // Get all cache keys
  const keys = Array.from(cache.keys());
  
  // Filter keys that match the route
  const matchingKeys = keys.filter(key => key.includes(route));
  
  // Delete matching keys
  matchingKeys.forEach(key => {
    cache.delete(key);
  });
  
  logger.debug(`Cleared cache for route: ${route} (${matchingKeys.length} entries)`);
}

/**
 * Clear entire cache
 */
export function clearCache(): void {
  cache.clear();
  logger.debug('Cleared entire cache');
}

/**
 * Get cache statistics
 */
export function getCacheStats(): {
  size: number;
  itemCount: number;
  maxSize: number;
} {
  return {
    size: cache.calculatedSize || 0,
    itemCount: cache.size,
    maxSize: CACHE_OPTIONS.maxSize,
  };
}

export default {
  cacheMiddleware,
  clearRouteCache,
  clearCache,
  getCacheStats,
};
