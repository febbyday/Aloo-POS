/**
 * Repairs Types
 * 
 * This file defines types for the repairs feature.
 */

/**
 * Repairs entity
 */
export interface Repairs {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  // Add other properties specific to this entity
}

/**
 * Repairs form values
 */
export interface RepairsFormValues {
  name: string;
  // Add other form fields
}

/**
 * Repairs filter options
 */
export interface RepairsFilterOptions {
  search?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  // Add other filter options
}
