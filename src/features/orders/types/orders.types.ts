/**
 * Orders Types
 * 
 * This file defines types for the orders feature.
 */

/**
 * Orders entity
 */
export interface Orders {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  // Add other properties specific to this entity
}

/**
 * Orders form values
 */
export interface OrdersFormValues {
  name: string;
  // Add other form fields
}

/**
 * Orders filter options
 */
export interface OrdersFilterOptions {
  search?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  // Add other filter options
}
