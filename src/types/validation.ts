/**
 * Type Validation Utilities
 * 
 * This file provides Zod schema helpers and utilities for type validation.
 * It helps create consistent validation schemas across the application.
 */

import { z } from 'zod';
import { isDate } from './utils';

/**
 * Common Zod schemas for reuse across the application
 */
export const schemas = {
  /**
   * ID schema - validates string IDs
   */
  id: z.string().uuid({ message: 'Invalid ID format' }),
  
  /**
   * Email schema with standard validation
   */
  email: z.string().email({ message: 'Invalid email address' }),
  
  /**
   * Phone number schema with basic validation
   */
  phone: z.string().regex(/^\+?[0-9\s()-]{8,20}$/, { message: 'Invalid phone number' }),
  
  /**
   * URL schema with validation
   */
  url: z.string().url({ message: 'Invalid URL' }),
  
  /**
   * Date schema that accepts Date objects or ISO strings
   */
  date: z.union([
    z.date(),
    z.string().refine(
      (val) => !isNaN(Date.parse(val)),
      { message: 'Invalid date format' }
    ).transform(val => new Date(val))
  ]),
  
  /**
   * Password schema with strength requirements
   */
  password: z.string()
    .min(8, { message: 'Password must be at least 8 characters' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number' })
    .regex(/[^A-Za-z0-9]/, { message: 'Password must contain at least one special character' }),

  /**
   * Status schema matching the Status type
   */
  status: z.enum(['active', 'inactive', 'pending', 'archived', 'deleted']),
  
  /**
   * Pagination parameters schema
   */
  pagination: z.object({
    page: z.number().int().positive().default(1),
    limit: z.number().int().positive().default(10),
    sort: z.string().optional(),
    order: z.enum(['asc', 'desc']).optional().default('asc')
  })
};

/**
 * Create a schema for a base entity
 */
export function createBaseEntitySchema<T extends z.ZodRawShape>(shape: T) {
  return z.object({
    id: schemas.id,
    createdAt: schemas.date,
    updatedAt: schemas.date,
    ...shape
  });
}

/**
 * Create a schema for a paginated response
 */
export function createPaginatedSchema<T extends z.ZodType>(itemSchema: T) {
  return z.object({
    data: z.array(itemSchema),
    meta: z.object({
      total: z.number().int().nonnegative(),
      page: z.number().int().positive(),
      limit: z.number().int().positive(),
      totalPages: z.number().int().nonnegative()
    })
  });
}

/**
 * Create an API response schema
 */
export function createApiResponseSchema<T extends z.ZodType>(dataSchema: T) {
  return z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z.object({
      code: z.string(),
      message: z.string(),
      details: z.unknown().optional()
    }).optional()
  });
}

/**
 * Validate data against a schema and return the result
 */
export function validateSchema<T extends z.ZodType>(
  schema: T,
  data: unknown,
  options?: { partial?: boolean }
): { success: boolean; data?: z.infer<T>; error?: z.ZodError } {
  try {
    // Use partial validation if requested
    const validationSchema = options?.partial ? schema.partial() : schema;
    
    // Parse and return the validated data
    const validData = validationSchema.parse(data);
    return { success: true, data: validData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error };
    }
    // Re-throw unexpected errors
    throw error;
  }
}

/**
 * Convert Zod errors to a friendly format
 */
export function formatZodError(
  error: z.ZodError
): Record<string, string> {
  const formattedErrors: Record<string, string> = {};
  
  for (const issue of error.errors) {
    const path = issue.path.join('.');
    formattedErrors[path || 'root'] = issue.message;
  }
  
  return formattedErrors;
} 