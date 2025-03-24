/**
 * Store Types
 * 
 * This file defines types for the store feature.
 */

/**
 * Store entity
 */
export interface Store {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  // Add other properties specific to this entity
}

/**
 * Store form values
 */
export interface StoreFormValues {
  name: string;
  // Add other form fields
}

/**
 * Store filter options
 */
export interface StoreFilterOptions {
  search?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  // Add other filter options
}
