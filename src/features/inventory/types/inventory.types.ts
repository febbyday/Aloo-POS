/**
 * Inventory Types
 * 
 * This file defines types for the inventory feature.
 */

/**
 * Inventory entity
 */
export interface Inventory {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  // Add other properties specific to this entity
}

/**
 * Inventory form values
 */
export interface InventoryFormValues {
  name: string;
  // Add other form fields
}

/**
 * Inventory filter options
 */
export interface InventoryFilterOptions {
  search?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  // Add other filter options
}
