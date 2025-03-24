/**
 * Products Types
 * 
 * This file defines types for the products feature.
 */

/**
 * Products entity
 */
export interface Products {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  // Add other properties specific to this entity
}

/**
 * Products form values
 */
export interface ProductsFormValues {
  name: string;
  // Add other form fields
}

/**
 * Products filter options
 */
export interface ProductsFilterOptions {
  search?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  // Add other filter options
}
