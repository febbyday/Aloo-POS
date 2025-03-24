/**
 * Expenses Types
 * 
 * This file defines types for the expenses feature.
 */

/**
 * Expenses entity
 */
export interface Expenses {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  // Add other properties specific to this entity
}

/**
 * Expenses form values
 */
export interface ExpensesFormValues {
  name: string;
  // Add other form fields
}

/**
 * Expenses filter options
 */
export interface ExpensesFilterOptions {
  search?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  // Add other filter options
}
