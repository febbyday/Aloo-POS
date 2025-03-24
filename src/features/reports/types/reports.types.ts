/**
 * Reports Types
 * 
 * This file defines types for the reports feature.
 */

/**
 * Reports entity
 */
export interface Reports {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  // Add other properties specific to this entity
}

/**
 * Reports form values
 */
export interface ReportsFormValues {
  name: string;
  // Add other form fields
}

/**
 * Reports filter options
 */
export interface ReportsFilterOptions {
  search?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  // Add other filter options
}
