/**
 * Database Error Handler
 *
 * This utility provides functions to handle database errors in a consistent way.
 * It maps Prisma errors to application errors and logs them appropriately.
 * It also provides utilities for optimized database operations with caching.
 */

import { Prisma } from '@prisma/client';
import { logger } from './logger';
import { AppError, ErrorType } from './errorHandling';
import { queryCache } from '../middleware/query-cache';
import { performance } from 'perf_hooks';

/**
 * Handle Prisma errors and convert them to application errors
 *
 * @param error The Prisma error to handle
 * @param operation The database operation that failed
 * @param resource The resource being accessed (e.g., 'user', 'product')
 * @returns An AppError with appropriate status code and error type
 */
export function handleDatabaseError(
  error: any,
  operation: string,
  resource: string
): AppError {
  // Log the error with context
  logger.error(`Database error during ${operation} on ${resource}`, error, {
    operation,
    resource,
    prismaError: true
  });

  // Handle known Prisma error types
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Unique constraint violation
    if (error.code === 'P2002') {
      const field = error.meta?.target as string[] || ['unknown field'];
      return new AppError(
        `A ${resource} with this ${field.join(', ')} already exists.`,
        409,
        ErrorType.CONFLICT,
        { fields: field }
      );
    }

    // Record not found
    if (error.code === 'P2001' || error.code === 'P2018' || error.code === 'P2025') {
      return new AppError(
        `The ${resource} you are looking for does not exist.`,
        404,
        ErrorType.NOT_FOUND
      );
    }

    // Foreign key constraint failed
    if (error.code === 'P2003') {
      const field = error.meta?.field_name || 'field';
      return new AppError(
        `The ${field} you referenced does not exist.`,
        400,
        ErrorType.VALIDATION,
        { field }
      );
    }

    // Required field constraint failed
    if (error.code === 'P2011') {
      const field = error.meta?.constraint || 'field';
      return new AppError(
        `The ${field} is required.`,
        400,
        ErrorType.VALIDATION,
        { field }
      );
    }
  }

  // Handle validation errors
  if (error instanceof Prisma.PrismaClientValidationError) {
    return new AppError(
      `Invalid data provided for ${resource}.`,
      400,
      ErrorType.VALIDATION,
      { message: error.message }
    );
  }

  // Handle connection errors
  if (error instanceof Prisma.PrismaClientInitializationError) {
    logger.error('Database connection error', error, { critical: true });
    return new AppError(
      'Unable to connect to the database. Please try again later.',
      503,
      ErrorType.DATABASE,
      null,
      false // Not operational, requires admin intervention
    );
  }

  // Handle unknown errors
  return new AppError(
    `An unexpected error occurred while ${operation} the ${resource}.`,
    500,
    ErrorType.DATABASE,
    { originalError: error.message },
    false // Not operational, requires investigation
  );
}

/**
 * Safely execute a database operation with error handling
 *
 * @param operation Function that performs the database operation
 * @param operationName Name of the operation for logging
 * @param resourceName Name of the resource being accessed
 * @returns Result of the operation or throws an AppError
 */
export async function executeDbOperation<T>(
  operation: () => Promise<T>,
  operationName: string,
  resourceName: string
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    throw handleDatabaseError(error, operationName, resourceName);
  }
}

/**
 * Execute a database operation with caching and performance monitoring
 *
 * @param operation Function that performs the database operation
 * @param cacheKey Key to use for caching
 * @param options Options for caching and monitoring
 * @returns Result of the operation
 */
export async function executeDbOperationWithCache<T>(
  operation: () => Promise<T>,
  cacheKey: string,
  options: {
    ttl?: number;
    entities?: string[];
    operationName?: string;
    resourceName?: string;
    skipCache?: boolean;
  } = {}
): Promise<T> {
  const {
    ttl,
    entities = [],
    operationName = 'unknown',
    resourceName = 'resource',
    skipCache = false
  } = options;

  // Check cache if not skipping
  if (!skipCache) {
    const cachedResult = queryCache.get<T>(cacheKey);
    if (cachedResult !== undefined) {
      logger.debug(`Cache hit for ${operationName} on ${resourceName}`, { cacheKey });
      return cachedResult;
    }
  }

  // Start timing
  const startTime = performance.now();

  try {
    // Execute operation
    const result = await operation();

    // Calculate duration
    const duration = performance.now() - startTime;

    // Log slow operations
    if (duration > 500) {
      logger.warn(`Slow database operation: ${operationName} on ${resourceName} (${duration.toFixed(2)}ms)`, {
        operationName,
        resourceName,
        duration
      });
    }

    // Cache result if not skipping
    if (!skipCache) {
      queryCache.set(cacheKey, result, ttl, entities);
      logger.debug(`Cached result for ${operationName} on ${resourceName}`, { cacheKey, ttl });
    }

    return result;
  } catch (error) {
    throw handleDatabaseError(error, operationName, resourceName);
  }
}

/**
 * Invalidate cache for entities
 *
 * @param entities Entities to invalidate
 */
export function invalidateCache(entities: string[]): void {
  for (const entity of entities) {
    queryCache.invalidateEntity(entity);
    logger.debug(`Invalidated cache for entity: ${entity}`);
  }
}

export default {
  handleDatabaseError,
  executeDbOperation,
  executeDbOperationWithCache,
  invalidateCache
};
