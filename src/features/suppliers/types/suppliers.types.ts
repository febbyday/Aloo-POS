/**
 * Suppliers Types
 * 
 * This file defines types for the suppliers feature.
 */

/**
 * Suppliers entity
 */
export interface Suppliers {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  // Add other properties specific to this entity
}

/**
 * Suppliers form values
 */
export interface SuppliersFormValues {
  name: string;
  // Add other form fields
}

/**
 * Suppliers filter options
 */
export interface SuppliersFilterOptions {
  search?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  // Add other filter options
}
