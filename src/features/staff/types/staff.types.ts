/**
 * Staff Types
 * 
 * This file defines types for the staff feature.
 */

/**
 * Staff entity
 */
export interface Staff {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  // Add other properties specific to this entity
}

/**
 * Staff form values
 */
export interface StaffFormValues {
  name: string;
  // Add other form fields
}

/**
 * Staff filter options
 */
export interface StaffFilterOptions {
  search?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  // Add other filter options
}
