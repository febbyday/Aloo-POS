/**
 * API Cache Manager
 * 
 * Provides caching functionality for API requests to improve performance
 * and reduce redundant network requests.
 */

export interface CacheOptions {
  /**
   * Time to live in milliseconds
   */
  ttl?: number;
  
  /**
   * Cache key
   */
  key?: string;
  
  /**
   * Query parameters to include in the cache key
   */
  queryParams?: string[];
  
  /**
   * Cache tag for invalidation
   */
  tag?: string | string[];
}

export interface CacheEntry<T> {
  /**
   * Cached data
   */
  data: T;
  
  /**
   * Expiration timestamp
   */
  expires: number;
  
  /**
   * Tags for cache invalidation
   */
  tags: Set<string>;
}

/**
 * Cache manager for API requests
 */
export class CacheManager {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private tagMap: Map<string, Set<string>> = new Map();
  private readonly defaultTTL: number;
  
  /**
   * Create a new cache manager
   * 
   * @param defaultTTL Default time to live in milliseconds (5 minutes)
   */
  constructor(defaultTTL = 5 * 60 * 1000) {
    this.defaultTTL = defaultTTL;
    
    // Set up periodic cleanup of expired entries
    setInterval(() => this.cleanup(), 60 * 1000);
  }
  
  /**
   * Generate a cache key from endpoint and parameters
   */
  private generateKey(endpoint: string, params?: Record<string, any>, filteredParams?: string[]): string {
    let key = endpoint;
    
    if (params && Object.keys(params).length > 0) {
      // If filtered params specified, only include those in the key
      const relevantParams = filteredParams
        ? Object.fromEntries(
            Object.entries(params).filter(([key]) => filteredParams.includes(key))
          )
        : params;
      
      // Sort keys to ensure consistent order
      const sortedParams = Object.keys(relevantParams).sort().reduce(
        (result, key) => {
          result[key] = relevantParams[key];
          return result;
        },
        {} as Record<string, any>
      );
      
      key += `?${JSON.stringify(sortedParams)}`;
    }
    
    return key;
  }
  
  /**
   * Get entry from cache
   */
  get<T>(endpoint: string, params?: Record<string, any>, options: CacheOptions = {}): T | null {
    // Use provided key or generate one
    const key = options.key || this.generateKey(endpoint, params, options.queryParams);
    
    const entry = this.cache.get(key);
    
    // Return null if entry not found or expired
    if (!entry || entry.expires < Date.now()) {
      return null;
    }
    
    return entry.data as T;
  }
  
  /**
   * Set entry in cache
   */
  set<T>(
    endpoint: string,
    data: T,
    params?: Record<string, any>,
    options: CacheOptions = {}
  ): void {
    // Use provided key or generate one
    const key = options.key || this.generateKey(endpoint, params, options.queryParams);
    
    // Calculate expiration
    const ttl = options.ttl || this.defaultTTL;
    const expires = Date.now() + ttl;
    
    // Process tags
    const tags = new Set<string>();
    
    if (options.tag) {
      const tagList = Array.isArray(options.tag) ? options.tag : [options.tag];
      
      tagList.forEach(tag => {
        tags.add(tag);
        
        // Add key to tag map
        if (!this.tagMap.has(tag)) {
          this.tagMap.set(tag, new Set());
        }
        this.tagMap.get(tag)!.add(key);
      });
    }
    
    // Store in cache
    this.cache.set(key, { data, expires, tags });
  }
  
  /**
   * Check if key exists in cache
   */
  has(endpoint: string, params?: Record<string, any>, options: CacheOptions = {}): boolean {
    const key = options.key || this.generateKey(endpoint, params, options.queryParams);
    
    if (!this.cache.has(key)) {
      return false;
    }
    
    const entry = this.cache.get(key)!;
    return entry.expires >= Date.now();
  }
  
  /**
   * Remove entry from cache
   */
  remove(endpoint: string, params?: Record<string, any>, options: CacheOptions = {}): void {
    const key = options.key || this.generateKey(endpoint, params, options.queryParams);
    
    // Remove key from all associated tags
    const entry = this.cache.get(key);
    if (entry) {
      entry.tags.forEach(tag => {
        const tagSet = this.tagMap.get(tag);
        if (tagSet) {
          tagSet.delete(key);
          
          // Clean up empty tag sets
          if (tagSet.size === 0) {
            this.tagMap.delete(tag);
          }
        }
      });
    }
    
    this.cache.delete(key);
  }
  
  /**
   * Invalidate cache entries by tag
   */
  invalidateByTag(tag: string | string[]): void {
    const tags = Array.isArray(tag) ? tag : [tag];
    
    tags.forEach(t => {
      const keys = this.tagMap.get(t);
      if (keys) {
        keys.forEach(key => {
          this.cache.delete(key);
        });
        this.tagMap.delete(t);
      }
    });
  }
  
  /**
   * Clear the entire cache
   */
  clear(): void {
    this.cache.clear();
    this.tagMap.clear();
  }
  
  /**
   * Remove expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];
    
    // Find expired entries
    this.cache.forEach((entry, key) => {
      if (entry.expires < now) {
        expiredKeys.push(key);
      }
    });
    
    // Remove expired entries
    expiredKeys.forEach(key => {
      this.remove(key);
    });
  }
}

// Create and export singleton instance
export const cacheManager = new CacheManager(); 