/**
 * PurchaseOrders Types
 * 
 * This file defines types for the purchaseOrders feature.
 */

/**
 * PurchaseOrders entity
 */
export interface PurchaseOrders {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  // Add other properties specific to this entity
}

/**
 * PurchaseOrders form values
 */
export interface PurchaseOrdersFormValues {
  name: string;
  // Add other form fields
}

/**
 * PurchaseOrders filter options
 */
export interface PurchaseOrdersFilterOptions {
  search?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  // Add other filter options
}
