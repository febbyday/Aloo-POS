/**
 * Shop Types
 *
 * This file defines TypeScript interfaces for JSON fields in the Shop model
 * to provide better type safety when working with these fields.
 */

// Import address types from local file
import { Address, isAddress } from './addressTypes';

/**
 * Type for the address JSON field in the Shop model
 */
export type ShopAddress = Address;

/**
 * Re-export the address type guard
 */
export { isAddress };

/**
 * Operating day type for the Shop model
 */
export interface OperatingDay {
  open: boolean;
  openTime?: string | null;
  closeTime?: string | null;
  breakStart?: string | null;
  breakEnd?: string | null;
}

/**
 * Operating hours type for the Shop model
 */
export interface ShopOperatingHours {
  monday: OperatingDay;
  tuesday: OperatingDay;
  wednesday: OperatingDay;
  thursday: OperatingDay;
  friday: OperatingDay;
  saturday: OperatingDay;
  sunday: OperatingDay;
  holidays?: {
    date: string;
    name: string;
    closed: boolean;
    specialHours?: {
      openTime?: string | null;
      closeTime?: string | null;
    };
  }[];
}

/**
 * Manager approval settings type for the Shop model
 */
export interface ManagerApprovalSettings {
  forDiscount: boolean;
  forVoid: boolean;
  forReturn: boolean;
  forRefund: boolean;
  forPriceChange: boolean;
}

/**
 * Threshold settings type for the Shop model
 */
export interface ThresholdSettings {
  lowStock: number;
  criticalStock: number;
  reorderPoint: number;
}

/**
 * Shop settings type for the Shop model
 */
export interface ShopSettingsData {
  allowNegativeInventory: boolean;
  defaultTaxRate: number;
  requireStockCheck: boolean;
  autoPrintReceipt: boolean;
  receiptFooter?: string;
  receiptHeader?: string;
  defaultDiscountRate: number;
  enableCashierTracking: boolean;
  allowReturnWithoutReceipt: boolean;
  maxItemsPerTransaction?: number;
  minPasswordLength: number;
  requireManagerApproval: ManagerApprovalSettings;
  thresholds: ThresholdSettings;
}

/**
 * Shop activity type for the Shop model
 */
export interface ShopActivityItem {
  type: 'inventory' | 'staff' | 'sales' | 'system';
  message: string;
  timestamp: string;
}

/**
 * Type for the recentActivity JSON field in the Shop model
 */
export type ShopActivityData = ShopActivityItem[];

/**
 * Type guard to check if a value is a valid ShopAddress
 */
export function isShopAddress(value: unknown): value is ShopAddress {
  return isAddress(value);
}

/**
 * Type guard to check if a value is a valid ShopOperatingHours
 */
export function isShopOperatingHours(value: unknown): value is ShopOperatingHours {
  if (!value || typeof value !== 'object') return false;
  const obj = value as Record<string, unknown>;
  return (
    obj.monday !== undefined &&
    obj.tuesday !== undefined &&
    obj.wednesday !== undefined &&
    obj.thursday !== undefined &&
    obj.friday !== undefined &&
    obj.saturday !== undefined &&
    obj.sunday !== undefined
  );
}

/**
 * Type guard to check if a value is a valid ShopSettingsData
 */
export function isShopSettingsData(value: unknown): value is ShopSettingsData {
  if (!value || typeof value !== 'object') return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.allowNegativeInventory === 'boolean' &&
    typeof obj.defaultTaxRate === 'number' &&
    typeof obj.requireStockCheck === 'boolean' &&
    typeof obj.autoPrintReceipt === 'boolean'
  );
}

/**
 * Type guard to check if a value is a valid ShopActivityData
 */
export function isShopActivityData(value: unknown): value is ShopActivityData {
  if (!Array.isArray(value)) return false;
  return value.every(item =>
    item &&
    typeof item === 'object' &&
    typeof (item as ShopActivityItem).type === 'string' &&
    typeof (item as ShopActivityItem).message === 'string' &&
    typeof (item as ShopActivityItem).timestamp === 'string'
  );
}
