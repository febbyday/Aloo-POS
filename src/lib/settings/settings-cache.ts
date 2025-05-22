/**
 * In-memory cache for settings
 * Provides caching for frequently accessed settings to reduce localStorage and API calls
 * Enhanced with longer TTL and preloading capabilities
 */
class SettingsCache {
  private static instance: SettingsCache;
  private cache: Map<string, {
    value: any;
    timestamp: number;
    accessCount: number;
    lastAccessed: number;
  }> = new Map();

  // Optimized TTL values for better performance
  private readonly DEFAULT_TTL = 30 * 60 * 1000; // 30 minutes (increased from 15)
  private readonly FREQUENTLY_USED_TTL = 60 * 60 * 1000; // 60 minutes for frequently used settings (increased from 30)
  private readonly ACCESS_THRESHOLD = 3; // Reduced threshold to consider a setting frequently used (from 5)

  // Track which modules are most frequently accessed
  private moduleAccessCounts: Record<string, number> = {};

  private constructor() {
    // Set up periodic cache cleanup to prevent memory leaks
    if (typeof window !== 'undefined') {
      setInterval(() => this.cleanupExpiredEntries(), 5 * 60 * 1000); // Clean up every 5 minutes
    }
  }

  /**
   * Get the singleton instance
   */
  static getInstance(): SettingsCache {
    if (!SettingsCache.instance) {
      SettingsCache.instance = new SettingsCache();
    }
    return SettingsCache.instance;
  }

  /**
   * Get a value from the cache
   * @param key The cache key
   * @returns The cached value or null if not found or expired
   */
  get<T>(key: string): T | null {
    const cached = this.cache.get(key);

    if (!cached) {
      return null;
    }

    const now = Date.now();

    // Determine TTL based on access frequency
    const ttl = cached.accessCount >= this.ACCESS_THRESHOLD
      ? this.FREQUENTLY_USED_TTL
      : this.DEFAULT_TTL;

    // Check if expired
    if (now - cached.timestamp > ttl) {
      this.cache.delete(key);
      return null;
    }

    // Update access statistics
    cached.accessCount++;
    cached.lastAccessed = now;

    // Track module access (assuming key format is settings_moduleName)
    const moduleMatch = key.match(/^settings_(.+)$/);
    if (moduleMatch && moduleMatch[1]) {
      const module = moduleMatch[1];
      this.moduleAccessCounts[module] = (this.moduleAccessCounts[module] || 0) + 1;
    }

    return cached.value as T;
  }

  /**
   * Get statistics about a specific cache entry
   * @param key The cache key
   * @returns Statistics about the entry or null if not found
   */
  getEntryStats(key: string): {
    accessCount: number;
    lastAccessed: number;
    timestamp: number;
    age: number
  } | null {
    const cached = this.cache.get(key);

    if (!cached) {
      return null;
    }

    return {
      accessCount: cached.accessCount,
      lastAccessed: cached.lastAccessed,
      timestamp: cached.timestamp,
      age: Date.now() - cached.timestamp
    };
  }

  /**
   * Set a value in the cache
   * @param key The cache key
   * @param value The value to cache
   * @param ttl Optional TTL in milliseconds (defaults to DEFAULT_TTL)
   */
  set<T>(key: string, value: T, ttl?: number): void {
    // Get existing entry if available to preserve access count
    const existing = this.cache.get(key);

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      accessCount: existing?.accessCount || 0,
      lastAccessed: existing?.lastAccessed || Date.now()
    });
  }

  /**
   * Invalidate a cached value
   * @param key The cache key to invalidate
   */
  invalidate(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Invalidate all cached values with keys starting with the given prefix
   * @param prefix The prefix to match
   */
  invalidateByPrefix(prefix: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear the entire cache
   */
  clear(): void {
    this.cache.clear();
    this.moduleAccessCounts = {};
  }

  /**
   * Clean up expired entries to prevent memory leaks
   */
  private cleanupExpiredEntries(): void {
    const now = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      const ttl = entry.accessCount >= this.ACCESS_THRESHOLD
        ? this.FREQUENTLY_USED_TTL
        : this.DEFAULT_TTL;

      if (now - entry.timestamp > ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get the most frequently accessed modules
   * @param limit Maximum number of modules to return
   * @returns Array of module names sorted by access frequency
   */
  getFrequentlyAccessedModules(limit: number = 5): string[] {
    return Object.entries(this.moduleAccessCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([module]) => module);
  }

  /**
   * Preload a module's settings into cache
   * This can be called for frequently accessed modules to improve performance
   * @param module The module name
   * @param settings The settings to cache
   */
  preloadModule(module: string, settings: any): void {
    const key = `settings_${module}`;
    this.set(key, settings);
  }

  /**
   * Get cache statistics
   * @returns Statistics about the cache
   */
  getStats(): {
    size: number;
    frequentlyUsedCount: number;
    moduleStats: Record<string, number>;
  } {
    let frequentlyUsedCount = 0;

    for (const entry of this.cache.values()) {
      if (entry.accessCount >= this.ACCESS_THRESHOLD) {
        frequentlyUsedCount++;
      }
    }

    return {
      size: this.cache.size,
      frequentlyUsedCount,
      moduleStats: { ...this.moduleAccessCounts }
    };
  }
}

// Export the singleton instance
export const settingsCache = SettingsCache.getInstance();
