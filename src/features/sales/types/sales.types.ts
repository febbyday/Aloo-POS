/**
 * Sales Types
 * 
 * This file defines types for the sales feature.
 */

/**
 * Sales entity
 */
export interface Sales {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  // Add other properties specific to this entity
}

/**
 * Sales form values
 */
export interface SalesFormValues {
  name: string;
  // Add other form fields
}

/**
 * Sales filter options
 */
export interface SalesFilterOptions {
  search?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  // Add other filter options
}
