/**
 * Support Types
 * 
 * This file defines types for the support feature.
 */

/**
 * Support entity
 */
export interface Support {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  // Add other properties specific to this entity
}

/**
 * Support form values
 */
export interface SupportFormValues {
  name: string;
  // Add other form fields
}

/**
 * Support filter options
 */
export interface SupportFilterOptions {
  search?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  // Add other filter options
}
