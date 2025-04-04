/**
 * Enhanced Shop Service
 * 
 * This service extends the base shop service with validation for JSON fields
 * and better type safety.
 */

import { Shop, Prisma } from '@prisma/client';
import { shopRepository } from '../repositories/shopRepository';
import { 
  validateShopAddress, 
  validateOperatingHours, 
  validateShopSettings, 
  validateShopActivities 
} from '../validators/shopValidators';
import { ZodError } from 'zod';

/**
 * Enhanced Shop Service with validation
 */
export class EnhancedShopService {
  /**
   * Create a new shop with validation
   * @param data The shop data to create
   * @returns The created shop
   */
  async createShop(data: Prisma.ShopCreateInput): Promise<Shop> {
    try {
      // Validate JSON fields
      if (data.address) {
        validateShopAddress(data.address);
      }
      
      if (data.operatingHours) {
        validateOperatingHours(data.operatingHours);
      }
      
      if (data.settings) {
        validateShopSettings(data.settings);
      }
      
      if (data.recentActivity) {
        validateShopActivities(data.recentActivity);
      }
      
      // Create the shop
      return shopRepository.create(data);
    } catch (error) {
      if (error instanceof ZodError) {
        console.error('Validation error creating shop:', error.errors);
        throw new Error(`Validation error: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw error;
    }
  }
  
  /**
   * Update a shop with validation
   * @param id The ID of the shop to update
   * @param data The shop data to update
   * @returns The updated shop
   */
  async updateShop(id: string, data: Prisma.ShopUpdateInput): Promise<Shop> {
    try {
      // Validate JSON fields
      if (data.address) {
        validateShopAddress(data.address);
      }
      
      if (data.operatingHours) {
        validateOperatingHours(data.operatingHours);
      }
      
      if (data.settings) {
        validateShopSettings(data.settings);
      }
      
      if (data.recentActivity) {
        validateShopActivities(data.recentActivity);
      }
      
      // Update the shop
      return shopRepository.update(id, data);
    } catch (error) {
      if (error instanceof ZodError) {
        console.error('Validation error updating shop:', error.errors);
        throw new Error(`Validation error: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw error;
    }
  }
}

// Export singleton instance
export const enhancedShopService = new EnhancedShopService();
