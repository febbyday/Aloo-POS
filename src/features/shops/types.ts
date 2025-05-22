/**
 * Shop types for frontend
 * 
 * This file imports the shared schema from the shared directory
 * to ensure consistency between frontend and backend.
 */

// Import shared schemas and types
import {
  shopSchema,
  baseShopSchema,
  createShopSchema,
  updateShopSchema,
  operatingDaySchema,
  operatingHoursSchema,
  addressSchema,
  shopSettingsSchema,
  inventoryLocationSchema,
  staffAssignmentSchema,
  shopActivitySchema,
  shopInventoryItemSchema,
  shopTransferSchema,
  SHOP_STATUS,
  SHOP_TYPE,
  OperatingDay,
  OperatingHours,
  Address,
  ShopSettings,
  InventoryLocation,
  StaffAssignment,
  ShopActivity,
  ShopInventoryItem,
  ShopTransfer,
  Shop,
  CreateShopInput,
  UpdateShopInput
} from '../../../shared/schemas/shopSchema';

// Re-export schemas and enums from the shared schema
export {
  shopSchema,
  baseShopSchema,
  createShopSchema,
  updateShopSchema,
  operatingDaySchema,
  operatingHoursSchema,
  addressSchema,
  shopSettingsSchema,
  inventoryLocationSchema,
  staffAssignmentSchema,
  shopActivitySchema,
  shopInventoryItemSchema,
  shopTransferSchema,
  SHOP_STATUS,
  SHOP_TYPE
};

// Re-export types from the shared schema
export type {
  OperatingDay,
  OperatingHours,
  Address,
  ShopSettings,
  InventoryLocation,
  StaffAssignment,
  ShopActivity,
  ShopInventoryItem,
  ShopTransfer,
  Shop,
  CreateShopInput,
  UpdateShopInput
};

// Form values type for shop create/edit
export type ShopFormValues = Omit<CreateShopInput, 'id' | 'createdAt' | 'updatedAt'>; 