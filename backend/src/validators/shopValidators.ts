/**
 * Shop Validators
 * 
 * This file provides validation functions for Shop data using Zod schemas.
 */

const { 
  addressSchema, 
  operatingHoursSchema, 
  shopSettingsSchema, 
  shopActivitySchema,
  Address,
  OperatingHours,
  ShopSettings,
  ShopActivity
} = require('../../../shared/schemas/shopSchema.cjs');
import { z } from 'zod';

/**
 * Validate shop address data
 * @param address The address data to validate
 * @returns The validated address data
 * @throws {z.ZodError} If validation fails
 */
export function validateShopAddress(address: unknown): Address {
  return addressSchema.parse(address);
}

/**
 * Validate shop operating hours data
 * @param hours The operating hours data to validate
 * @returns The validated operating hours data
 * @throws {z.ZodError} If validation fails
 */
export function validateOperatingHours(hours: unknown): OperatingHours {
  return operatingHoursSchema.parse(hours);
}

/**
 * Validate shop settings data
 * @param settings The settings data to validate
 * @returns The validated settings data
 * @throws {z.ZodError} If validation fails
 */
export function validateShopSettings(settings: unknown): ShopSettings {
  return shopSettingsSchema.parse(settings);
}

/**
 * Validate shop activity data
 * @param activity The activity data to validate
 * @returns The validated activity data
 * @throws {z.ZodError} If validation fails
 */
export function validateShopActivity(activity: unknown): ShopActivity {
  return shopActivitySchema.parse(activity);
}

/**
 * Validate an array of shop activities
 * @param activities The array of activities to validate
 * @returns The validated activities array
 * @throws {z.ZodError} If validation fails
 */
export function validateShopActivities(activities: unknown): ShopActivity[] {
  return z.array(shopActivitySchema).parse(activities);
}
