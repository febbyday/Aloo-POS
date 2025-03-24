/**
 * Type Utilities
 * 
 * Helper functions and utilities for type checking, validation, and manipulation.
 * These utilities help with runtime type safety and provide useful TypeScript helpers.
 */

import { z } from 'zod';

/**
 * Type guard to check if a value is defined (not null or undefined)
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Type guard to check if a value is a string
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * Type guard to check if a value is a number
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * Type guard to check if a value is a boolean
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

/**
 * Type guard to check if a value is an object
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Type guard to check if a value is an array
 */
export function isArray<T = unknown>(value: unknown): value is T[] {
  return Array.isArray(value);
}

/**
 * Type guard to check if a value is a function
 */
export function isFunction(value: unknown): value is Function {
  return typeof value === 'function';
}

/**
 * Type guard to check if a value is a date
 */
export function isDate(value: unknown): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}

/**
 * Assert that a value is defined, throw otherwise
 */
export function assertDefined<T>(value: T | null | undefined, message = 'Value is not defined'): asserts value is T {
  if (value === null || value === undefined) {
    throw new Error(message);
  }
}

/**
 * Assert that a condition is true, throw otherwise
 */
export function assert(condition: boolean, message = 'Assertion failed'): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

/**
 * Create a type-safe object from a schema
 */
export function createTypedObject<T extends z.ZodType>(schema: T, data: unknown): z.infer<T> {
  return schema.parse(data);
}

/**
 * Validate an object against a schema
 */
export function validateObject<T extends z.ZodType>(schema: T, data: unknown): boolean {
  try {
    schema.parse(data);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Safe type assertion - only asserts in development, regular cast in production
 */
export function safeAssert<T>(value: unknown, check: (value: unknown) => boolean): T {
  if (process.env.NODE_ENV !== 'production') {
    if (!check(value)) {
      throw new Error('Type assertion failed');
    }
  }
  return value as T;
}

/**
 * Type-safe object keys
 */
export function typedKeys<T extends object>(obj: T): Array<keyof T> {
  return Object.keys(obj) as Array<keyof T>;
}

/**
 * Type-safe object entries
 */
export function typedEntries<T extends object>(obj: T): Array<[keyof T, T[keyof T]]> {
  return Object.entries(obj) as Array<[keyof T, T[keyof T]]>;
}

/**
 * Type-safe object values
 */
export function typedValues<T extends object>(obj: T): Array<T[keyof T]> {
  return Object.values(obj) as Array<T[keyof T]>;
} 