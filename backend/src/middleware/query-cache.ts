/**
 * Query Cache Middleware
 * 
 * This middleware provides caching for database queries to improve performance.
 * It implements:
 * - In-memory LRU cache for query results
 * - Automatic cache invalidation based on entity changes
 * - Cache statistics for monitoring
 */

import { logger } from '../utils/logger';
import LRUCache from 'lru-cache';

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
  
  // Default TTL (30 minutes)
  ttl: 1000 * 60 * 30,
  
  // Function to call when items are evicted from cache
  dispose: (value: any, key: string) => {
    logger.debug(`Cache item evicted: ${key}`);
  },
  
  // Update TTL on get
  updateAgeOnGet: true,
  
  // Update TTL on has
  updateAgeOnHas: false,
  
  // Allow stale items
  allowStale: false,
};

// Cache statistics
interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  evictions: number;
  hitRate: number;
}

/**
 * Query Cache Manager
 * 
 * Manages caching of database query results
 */
export class QueryCache {
  private static instance: QueryCache;
  private cache: LRUCache<string, any>;
  private stats: {
    hits: number;
    misses: number;
    sets: number;
    evictions: number;
  };
  private entityCacheMap: Map<string, Set<string>>;
  
  private constructor() {
    this.cache = new LRUCache(CACHE_OPTIONS);
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      evictions: 0,
    };
    this.entityCacheMap = new Map();
    
    // Set up eviction listener
    this.cache.on('evict', () => {
      this.stats.evictions++;
    });
  }
  
  /**
   * Get the singleton instance
   */
  public static getInstance(): QueryCache {
    if (!QueryCache.instance) {
      QueryCache.instance = new QueryCache();
    }
    return QueryCache.instance;
  }
  
  /**
   * Get a value from the cache
   * 
   * @param key Cache key
   * @returns Cached value or undefined if not found
   */
  public get<T>(key: string): T | undefined {
    const value = this.cache.get(key) as T | undefined;
    
    if (value === undefined) {
      this.stats.misses++;
      return undefined;
    }
    
    this.stats.hits++;
    return value;
  }
  
  /**
   * Set a value in the cache
   * 
   * @param key Cache key
   * @param value Value to cache
   * @param ttl Time to live in milliseconds (optional)
   * @param entities Entities associated with this cache entry (for invalidation)
   */
  public set<T>(key: string, value: T, ttl?: number, entities?: string[]): void {
    this.cache.set(key, value, { ttl });
    this.stats.sets++;
    
    // Associate cache key with entities for invalidation
    if (entities && entities.length > 0) {
      for (const entity of entities) {
        if (!this.entityCacheMap.has(entity)) {
          this.entityCacheMap.set(entity, new Set());
        }
        this.entityCacheMap.get(entity)!.add(key);
      }
    }
  }
  
  /**
   * Check if a key exists in the cache
   * 
   * @param key Cache key
   * @returns True if key exists in cache
   */
  public has(key: string): boolean {
    return this.cache.has(key);
  }
  
  /**
   * Remove a value from the cache
   * 
   * @param key Cache key
   */
  public delete(key: string): void {
    this.cache.delete(key);
  }
  
  /**
   * Invalidate cache entries associated with an entity
   * 
   * @param entity Entity name
   */
  public invalidateEntity(entity: string): void {
    const keys = this.entityCacheMap.get(entity);
    
    if (keys) {
      logger.debug(`Invalidating ${keys.size} cache entries for entity: ${entity}`);
      
      for (const key of keys) {
        this.cache.delete(key);
      }
      
      // Clear the entity's cache map
      this.entityCacheMap.delete(entity);
    }
  }
  
  /**
   * Clear the entire cache
   */
  public clear(): void {
    this.cache.clear();
    this.entityCacheMap.clear();
  }
  
  /**
   * Get cache statistics
   */
  public getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? this.stats.hits / total : 0;
    
    return {
      ...this.stats,
      hitRate,
    };
  }
  
  /**
   * Reset cache statistics
   */
  public resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      evictions: 0,
    };
  }
}

// Export singleton instance
export const queryCache = QueryCache.getInstance();

/**
 * Generate a cache key for a query
 * 
 * @param model Model name
 * @param operation Operation name
 * @param params Query parameters
 * @returns Cache key
 */
export function generateQueryCacheKey(
  model: string,
  operation: string,
  params?: any
): string {
  const paramsString = params ? JSON.stringify(params) : '';
  return `${model}:${operation}:${paramsString}`;
}

export default queryCache;
