/**
 * Auth Types
 * 
 * This file defines types for the auth feature.
 */

/**
 * Auth entity
 */
export interface Auth {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  // Add other properties specific to this entity
}

/**
 * Auth form values
 */
export interface AuthFormValues {
  name: string;
  // Add other form fields
}

/**
 * Auth filter options
 */
export interface AuthFilterOptions {
  search?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  // Add other filter options
}
