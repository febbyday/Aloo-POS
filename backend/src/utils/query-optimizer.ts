/**
 * Query Optimizer
 * 
 * Utilities for optimizing database queries:
 * - Selective field loading
 * - Pagination optimization
 * - Relation loading optimization
 * - Query performance monitoring
 */

import { Prisma } from '@prisma/client';
import { logger } from './logger';
import { performance } from 'perf_hooks';
import { queryCache, generateQueryCacheKey } from '../middleware/query-cache';

// Query performance threshold in milliseconds
const SLOW_QUERY_THRESHOLD = 500;

// Default pagination limits
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

/**
 * Query performance metrics
 */
interface QueryMetrics {
  model: string;
  operation: string;
  duration: number;
  timestamp: number;
  cached: boolean;
  params?: any;
}

// Store recent query metrics
const recentQueries: QueryMetrics[] = [];
const MAX_RECENT_QUERIES = 100;

/**
 * Optimize select fields for a query
 * 
 * @param select Current select object
 * @param defaultFields Default fields to select if none specified
 * @param requiredFields Fields that must always be selected
 * @returns Optimized select object
 */
export function optimizeSelect<T extends Record<string, any>>(
  select: T | undefined,
  defaultFields: string[],
  requiredFields: string[] = ['id']
): T {
  if (!select || Object.keys(select).length === 0) {
    // If no fields specified, use defaults
    const optimizedSelect = {} as T;
    
    [...defaultFields, ...requiredFields].forEach(field => {
      optimizedSelect[field as keyof T] = true;
    });
    
    return optimizedSelect;
  }
  
  // Ensure required fields are included
  const optimizedSelect = { ...select };
  
  requiredFields.forEach(field => {
    if (!(field in optimizedSelect)) {
      optimizedSelect[field as keyof T] = true;
    }
  });
  
  return optimizedSelect;
}

/**
 * Optimize include for a query
 * 
 * @param include Current include object
 * @param maxDepth Maximum relation depth
 * @returns Optimized include object
 */
export function optimizeInclude<T extends Record<string, any>>(
  include: T | undefined,
  maxDepth: number = 2
): T | undefined {
  if (!include) {
    return undefined;
  }
  
  // Helper function to limit relation depth
  function limitDepth(obj: any, currentDepth: number): any {
    if (currentDepth >= maxDepth) {
      return {};
    }
    
    const result: any = {};
    
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null) {
        if ('include' in value) {
          result[key] = {
            ...value,
            include: limitDepth(value.include, currentDepth + 1)
          };
        } else {
          result[key] = limitDepth(value, currentDepth + 1);
        }
      } else {
        result[key] = value;
      }
    }
    
    return result;
  }
  
  return limitDepth(include, 0) as T;
}

/**
 * Optimize pagination parameters
 * 
 * @param page Page number
 * @param pageSize Page size
 * @returns Optimized skip and take values
 */
export function optimizePagination(
  page?: number,
  pageSize?: number
): { skip: number; take: number } {
  const sanitizedPage = Math.max(1, page || 1);
  let sanitizedPageSize = pageSize || DEFAULT_PAGE_SIZE;
  
  // Limit page size to prevent performance issues
  sanitizedPageSize = Math.min(sanitizedPageSize, MAX_PAGE_SIZE);
  
  return {
    skip: (sanitizedPage - 1) * sanitizedPageSize,
    take: sanitizedPageSize
  };
}

/**
 * Execute a database query with performance monitoring and caching
 * 
 * @param model Model name
 * @param operation Operation name
 * @param queryFn Function that executes the query
 * @param params Query parameters
 * @param options Options for caching and monitoring
 * @returns Query result
 */
export async function executeQuery<T>(
  model: string,
  operation: string,
  queryFn: () => Promise<T>,
  params?: any,
  options: {
    cache?: boolean;
    ttl?: number;
    monitor?: boolean;
  } = {}
): Promise<T> {
  const { cache = true, ttl, monitor = true } = options;
  
  // Generate cache key if caching is enabled
  let cacheKey: string | undefined;
  if (cache) {
    cacheKey = generateQueryCacheKey(model, operation, params);
    
    // Check cache
    const cachedResult = queryCache.get<T>(cacheKey);
    if (cachedResult !== undefined) {
      // Record metrics for cached query
      if (monitor) {
        recordQueryMetrics(model, operation, 0, true, params);
      }
      
      return cachedResult;
    }
  }
  
  // Start timing
  const startTime = performance.now();
  
  try {
    // Execute query
    const result = await queryFn();
    
    // Calculate duration
    const duration = performance.now() - startTime;
    
    // Record metrics
    if (monitor) {
      recordQueryMetrics(model, operation, duration, false, params);
    }
    
    // Log slow queries
    if (duration > SLOW_QUERY_THRESHOLD) {
      logger.warn(`Slow query detected: ${model}.${operation} (${duration.toFixed(2)}ms)`, {
        model,
        operation,
        duration,
        params
      });
    }
    
    // Cache result if caching is enabled
    if (cache && cacheKey) {
      queryCache.set(cacheKey, result, ttl, [model]);
    }
    
    return result;
  } catch (error) {
    // Log error
    logger.error(`Query error in ${model}.${operation}:`, error);
    
    // Rethrow
    throw error;
  }
}

/**
 * Record query metrics
 * 
 * @param model Model name
 * @param operation Operation name
 * @param duration Query duration in milliseconds
 * @param cached Whether the result was from cache
 * @param params Query parameters
 */
function recordQueryMetrics(
  model: string,
  operation: string,
  duration: number,
  cached: boolean,
  params?: any
): void {
  // Add to recent queries
  recentQueries.unshift({
    model,
    operation,
    duration,
    timestamp: Date.now(),
    cached,
    params
  });
  
  // Limit size of recent queries
  if (recentQueries.length > MAX_RECENT_QUERIES) {
    recentQueries.pop();
  }
}

/**
 * Get recent query metrics
 * 
 * @param limit Maximum number of metrics to return
 * @returns Recent query metrics
 */
export function getRecentQueries(limit: number = MAX_RECENT_QUERIES): QueryMetrics[] {
  return recentQueries.slice(0, limit);
}

/**
 * Get query performance statistics
 * 
 * @returns Query performance statistics
 */
export function getQueryStats(): {
  totalQueries: number;
  averageDuration: number;
  slowQueries: number;
  cachedQueries: number;
  cacheHitRate: number;
} {
  const totalQueries = recentQueries.length;
  
  if (totalQueries === 0) {
    return {
      totalQueries: 0,
      averageDuration: 0,
      slowQueries: 0,
      cachedQueries: 0,
      cacheHitRate: 0
    };
  }
  
  const cachedQueries = recentQueries.filter(q => q.cached).length;
  const nonCachedQueries = totalQueries - cachedQueries;
  const slowQueries = recentQueries.filter(q => q.duration > SLOW_QUERY_THRESHOLD).length;
  
  // Calculate average duration for non-cached queries only
  const totalDuration = recentQueries
    .filter(q => !q.cached)
    .reduce((sum, q) => sum + q.duration, 0);
  
  const averageDuration = nonCachedQueries > 0 ? totalDuration / nonCachedQueries : 0;
  const cacheHitRate = totalQueries > 0 ? cachedQueries / totalQueries : 0;
  
  return {
    totalQueries,
    averageDuration,
    slowQueries,
    cachedQueries,
    cacheHitRate
  };
}

export default {
  optimizeSelect,
  optimizeInclude,
  optimizePagination,
  executeQuery,
  getRecentQueries,
  getQueryStats
};
