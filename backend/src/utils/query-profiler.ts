/**
 * Query Profiler
 * 
 * Provides tools for profiling and analyzing database queries:
 * - Query timing
 * - Slow query detection
 * - Query pattern analysis
 * - Optimization recommendations
 */

import { performance } from 'perf_hooks';
import { logger } from './logger';
import { PrismaClient } from '@prisma/client';

// Thresholds for query performance
const PERFORMANCE_THRESHOLDS = {
  SLOW_QUERY: 500, // ms
  VERY_SLOW_QUERY: 1000, // ms
  EXCESSIVE_ROWS: 1000, // number of rows
  EXCESSIVE_RELATIONS: 5, // number of relations
};

// Store query profiles
interface QueryProfile {
  query: string;
  params: any;
  duration: number;
  timestamp: number;
  stackTrace?: string;
}

const queryProfiles: QueryProfile[] = [];
const MAX_PROFILES = 1000;

/**
 * Initialize query profiling for a Prisma client
 * 
 * @param prisma Prisma client instance
 */
export function initQueryProfiling(prisma: PrismaClient): void {
  // Add middleware to profile queries
  prisma.$use(async (params, next) => {
    const startTime = performance.now();
    
    // Get stack trace for debugging
    const stackTrace = new Error().stack;
    
    // Execute the query
    const result = await next(params);
    
    // Calculate duration
    const duration = performance.now() - startTime;
    
    // Record query profile
    recordQueryProfile({
      query: `${params.model}.${params.action}`,
      params: params.args,
      duration,
      timestamp: Date.now(),
      stackTrace,
    });
    
    // Log slow queries
    if (duration > PERFORMANCE_THRESHOLDS.SLOW_QUERY) {
      const severity = duration > PERFORMANCE_THRESHOLDS.VERY_SLOW_QUERY ? 'warn' : 'debug';
      
      logger[severity](`Slow query detected: ${params.model}.${params.action} (${duration.toFixed(2)}ms)`, {
        model: params.model,
        action: params.action,
        duration,
        args: params.args,
      });
    }
    
    return result;
  });
  
  logger.info('Query profiling initialized');
}

/**
 * Record a query profile
 * 
 * @param profile Query profile
 */
function recordQueryProfile(profile: QueryProfile): void {
  queryProfiles.unshift(profile);
  
  // Limit size of profiles
  if (queryProfiles.length > MAX_PROFILES) {
    queryProfiles.pop();
  }
}

/**
 * Get recent query profiles
 * 
 * @param limit Maximum number of profiles to return
 * @returns Recent query profiles
 */
export function getRecentProfiles(limit: number = 100): QueryProfile[] {
  return queryProfiles.slice(0, limit);
}

/**
 * Get slow query profiles
 * 
 * @param threshold Duration threshold in milliseconds
 * @param limit Maximum number of profiles to return
 * @returns Slow query profiles
 */
export function getSlowQueries(threshold: number = PERFORMANCE_THRESHOLDS.SLOW_QUERY, limit: number = 100): QueryProfile[] {
  return queryProfiles
    .filter(profile => profile.duration > threshold)
    .slice(0, limit);
}

/**
 * Analyze query patterns
 * 
 * @returns Query pattern analysis
 */
export function analyzeQueryPatterns(): {
  frequentQueries: Array<{ query: string; count: number; avgDuration: number }>;
  slowestQueries: Array<{ query: string; avgDuration: number; count: number }>;
} {
  // Group queries by type
  const queryGroups = new Map<string, { count: number; totalDuration: number }>();
  
  for (const profile of queryProfiles) {
    const key = profile.query;
    
    if (!queryGroups.has(key)) {
      queryGroups.set(key, { count: 0, totalDuration: 0 });
    }
    
    const group = queryGroups.get(key)!;
    group.count++;
    group.totalDuration += profile.duration;
  }
  
  // Convert to arrays for sorting
  const queryStats = Array.from(queryGroups.entries()).map(([query, stats]) => ({
    query,
    count: stats.count,
    avgDuration: stats.totalDuration / stats.count,
  }));
  
  // Sort by frequency and duration
  const frequentQueries = [...queryStats]
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  
  const slowestQueries = [...queryStats]
    .sort((a, b) => b.avgDuration - a.avgDuration)
    .slice(0, 10);
  
  return {
    frequentQueries,
    slowestQueries,
  };
}

/**
 * Generate optimization recommendations
 * 
 * @returns Optimization recommendations
 */
export function generateOptimizationRecommendations(): Array<{
  query: string;
  recommendation: string;
  priority: 'high' | 'medium' | 'low';
}> {
  const recommendations: Array<{
    query: string;
    recommendation: string;
    priority: 'high' | 'medium' | 'low';
  }> = [];
  
  // Analyze query patterns
  const { frequentQueries, slowestQueries } = analyzeQueryPatterns();
  
  // Recommend caching for frequent queries
  for (const { query, count, avgDuration } of frequentQueries) {
    if (count > 10 && !query.includes('create') && !query.includes('update') && !query.includes('delete')) {
      recommendations.push({
        query,
        recommendation: `Consider caching results for this frequent query (called ${count} times)`,
        priority: avgDuration > PERFORMANCE_THRESHOLDS.SLOW_QUERY ? 'high' : 'medium',
      });
    }
  }
  
  // Recommend optimization for slow queries
  for (const { query, avgDuration } of slowestQueries) {
    if (avgDuration > PERFORMANCE_THRESHOLDS.VERY_SLOW_QUERY) {
      recommendations.push({
        query,
        recommendation: `Optimize this slow query (avg ${avgDuration.toFixed(2)}ms)`,
        priority: 'high',
      });
    }
  }
  
  // Look for N+1 query patterns
  const potentialNPlus1 = findPotentialNPlus1Queries();
  for (const { query, count } of potentialNPlus1) {
    recommendations.push({
      query,
      recommendation: `Potential N+1 query pattern detected (${count} sequential queries). Consider using include or select.`,
      priority: 'high',
    });
  }
  
  return recommendations;
}

/**
 * Find potential N+1 query patterns
 * 
 * @returns Potential N+1 query patterns
 */
function findPotentialNPlus1Queries(): Array<{ query: string; count: number }> {
  const results: Array<{ query: string; count: number }> = [];
  const timeThreshold = 100; // ms
  
  // Group queries by timestamp (within threshold)
  const timeGroups: QueryProfile[][] = [];
  let currentGroup: QueryProfile[] = [];
  
  // Sort profiles by timestamp
  const sortedProfiles = [...queryProfiles].sort((a, b) => a.timestamp - b.timestamp);
  
  for (let i = 0; i < sortedProfiles.length; i++) {
    const profile = sortedProfiles[i];
    
    if (currentGroup.length === 0) {
      currentGroup.push(profile);
    } else {
      const lastProfile = currentGroup[currentGroup.length - 1];
      
      if (profile.timestamp - lastProfile.timestamp < timeThreshold) {
        currentGroup.push(profile);
      } else {
        if (currentGroup.length > 1) {
          timeGroups.push(currentGroup);
        }
        currentGroup = [profile];
      }
    }
  }
  
  if (currentGroup.length > 1) {
    timeGroups.push(currentGroup);
  }
  
  // Analyze each group for N+1 patterns
  for (const group of timeGroups) {
    // Count queries by type
    const queryCounts = new Map<string, number>();
    
    for (const profile of group) {
      const key = profile.query;
      queryCounts.set(key, (queryCounts.get(key) || 0) + 1);
    }
    
    // Look for repeated queries
    for (const [query, count] of queryCounts.entries()) {
      if (count > 3 && query.includes('findUnique')) {
        results.push({ query, count });
      }
    }
  }
  
  return results;
}

export default {
  initQueryProfiling,
  getRecentProfiles,
  getSlowQueries,
  analyzeQueryPatterns,
  generateOptimizationRecommendations,
};
