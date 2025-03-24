// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤

import { Request, Response } from 'express';
import { storeService } from '../services/storeService';
import { sendSuccessResponse, sendErrorResponse } from '../utils/errorHandling';
import { mapStoreDtoToShop, mapShopToStoreInput } from '../types/mappers/shopMappers';
import { Prisma } from '@prisma/client';
import { transformStoreToDto } from '../types/dto/storeDto';
import { ZodError } from 'zod';

/**
 * ShopController
 * Handles HTTP requests related to shops
 */
export class ShopController {
  /**
   * Get all shops with optional filtering and pagination
   */
  async getAllShops(req: Request, res: Response): Promise<void> {
    try {
      const { 
        page, 
        limit, 
        search, 
        type, 
        isActive, 
        sortBy, 
        sortOrder 
      } = req.query;

      const result = await storeService.getAllStores({
        page: page ? parseInt(page as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
        search: search as string,
        type: type as string,
        isActive: isActive !== undefined ? isActive === 'true' : undefined,
        sortBy: sortBy as string,
        sortOrder: (sortOrder as 'asc' | 'desc') || 'asc',
      });

      // Map store DTOs to shop format expected by frontend
      const shops = result.stores.map(store => mapStoreDtoToShop(transformStoreToDto(store)));
      
      sendSuccessResponse(res, {
        shops,
        total: result.total,
        page: result.page,
        limit: result.limit
      });
    } catch (error) {
      console.error('Error fetching shops:', error);
      sendErrorResponse(res, error instanceof Error ? error : String(error), 500);
    }
  }

  /**
   * Get a shop by ID
   */
  async getShopById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const store = await storeService.getStoreById(id);

      if (!store) {
        sendErrorResponse(res, 'Shop not found', 404);
        return;
      }

      // Map store DTO to shop format
      const shop = mapStoreDtoToShop(transformStoreToDto(store));
      
      sendSuccessResponse(res, shop);
    } catch (error) {
      console.error(`Error fetching shop ${req.params.id}:`, error);
      sendErrorResponse(res, error instanceof Error ? error : String(error), 500);
    }
  }

  /**
   * Create a new shop
   */
  async createShop(req: Request, res: Response): Promise<void> {
    try {
      // Convert from frontend shop format to backend store format
      const storeData = mapShopToStoreInput(req.body);
      
      const newStore = await storeService.createStore(storeData);
      
      // Convert back to frontend shop format
      const newShop = mapStoreDtoToShop(transformStoreToDto(newStore));
      
      sendSuccessResponse(res, newShop, 'Shop created successfully', 201);
    } catch (error) {
      console.error('Error creating shop:', error);
      
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          sendErrorResponse(res, 'A shop with that name already exists', 409);
          return;
        }
      }
      
      sendErrorResponse(res, error instanceof Error ? error : String(error), 500);
    }
  }

  /**
   * Update an existing shop
   */
  async updateShop(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // Check if shop exists
      const existingStore = await storeService.getStoreById(id);
      
      if (!existingStore) {
        sendErrorResponse(res, 'Shop not found', 404);
        return;
      }
      
      // Convert from frontend shop format to backend store format
      const storeData = mapShopToStoreInput(req.body);
      
      const updatedStore = await storeService.updateStore(id, storeData);
      
      // Convert back to frontend shop format
      const updatedShop = mapStoreDtoToShop(transformStoreToDto(updatedStore));
      
      sendSuccessResponse(res, updatedShop, 'Shop updated successfully');
    } catch (error) {
      console.error(`Error updating shop ${req.params.id}:`, error);
      
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          sendErrorResponse(res, 'A shop with that name already exists', 409);
          return;
        }
      }
      
      sendErrorResponse(res, error instanceof Error ? error : String(error), 500);
    }
  }

  /**
   * Delete a shop
   */
  async deleteShop(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // Check if shop exists
      const existingStore = await storeService.getStoreById(id);
      
      if (!existingStore) {
        sendErrorResponse(res, 'Shop not found', 404);
        return;
      }
      
      await storeService.deleteStore(id);
      
      sendSuccessResponse(res, { id }, 'Shop deleted successfully');
    } catch (error) {
      console.error(`Error deleting shop ${req.params.id}:`, error);
      
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          sendErrorResponse(res, 'Cannot delete shop as it has associated records', 409);
          return;
        }
      }
      
      sendErrorResponse(res, error instanceof Error ? error : String(error), 500);
    }
  }

  /**
   * Get inventory for a specific shop
   */
  async getShopInventory(req: Request, res: Response): Promise<void> {
    try {
      const { storeId } = req.params;
      const { page, limit, search } = req.query;
      
      // Check if shop exists
      const existingStore = await storeService.getStoreById(storeId);
      
      if (!existingStore) {
        sendErrorResponse(res, 'Shop not found', 404);
        return;
      }
      
      const inventory = await storeService.getStoreInventory(
        storeId,
        {
          page: page ? parseInt(page as string, 10) : undefined,
          limit: limit ? parseInt(limit as string, 10) : undefined,
          search: search as string,
        }
      );
      
      sendSuccessResponse(res, inventory);
    } catch (error) {
      console.error(`Error fetching inventory for shop ${req.params.storeId}:`, error);
      sendErrorResponse(res, error instanceof Error ? error : String(error), 500);
    }
  }

  /**
   * Update inventory for a specific product in a shop
   */
  async updateInventory(req: Request, res: Response): Promise<void> {
    try {
      const { storeId, productId } = req.params;
      const { stock, minStock, maxStock } = req.body;
      
      // Validate input
      if (stock === undefined) {
        sendErrorResponse(res, 'Stock quantity is required', 400);
        return;
      }
      
      // Check if shop exists
      const existingStore = await storeService.getStoreById(storeId);
      
      if (!existingStore) {
        sendErrorResponse(res, 'Shop not found', 404);
        return;
      }
      
      const updatedInventory = await storeService.updateInventory(
        storeId,
        productId,
        {
          stock: parseInt(stock as string),
          minStock: minStock !== undefined ? parseInt(minStock as string) : undefined,
          maxStock: maxStock !== undefined ? parseInt(maxStock as string) : undefined,
        }
      );
      
      sendSuccessResponse(res, updatedInventory, 'Inventory updated successfully');
    } catch (error) {
      console.error(`Error updating inventory for shop ${req.params.storeId}:`, error);
      sendErrorResponse(res, error instanceof Error ? error : String(error), 500);
    }
  }
}

// Export singleton instance
export const shopController = new ShopController();
