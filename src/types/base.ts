/**
 * Base Types
 * 
 * Core type definitions that serve as building blocks for more complex types.
 * These types are fundamental and are used across multiple modules.
 */

/**
 * ID type for all entities in the system
 */
export type ID = string;

/**
 * Status types used across the application
 */
export type Status = 'active' | 'inactive' | 'pending' | 'archived' | 'deleted';

/**
 * Base entity interface that all domain entities should extend
 */
export interface BaseEntity {
  id: ID;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Pagination parameters for API requests
 */
export interface PaginationParams {
  page: number;
  limit: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

/**
 * Standard response format for paginated data
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Standard API response envelope
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/**
 * Generic record type with string keys
 */
export type Record<T = unknown> = {
  [key: string]: T;
};

/**
 * Utility type for making all properties in T optional
 */
export type PartialDeep<T> = {
  [P in keyof T]?: T[P] extends object ? PartialDeep<T[P]> : T[P];
};

/**
 * Utility type for selecting specific keys from T
 */
export type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};

/**
 * Utility type for omitting specific keys from T
 */
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

/**
 * Utility type for required fields
 */
export type Required<T> = {
  [P in keyof T]-?: T[P];
}; 