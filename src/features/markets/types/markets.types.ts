/**
 * Markets Types
 * 
 * This file defines types for the markets feature.
 */

/**
 * Markets entity
 */
export interface Markets {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  // Add other properties specific to this entity
}

/**
 * Markets form values
 */
export interface MarketsFormValues {
  name: string;
  // Add other form fields
}

/**
 * Markets filter options
 */
export interface MarketsFilterOptions {
  search?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  // Add other filter options
}
