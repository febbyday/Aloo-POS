import { Request, Response } from 'express';
import { storeService } from '../services/storeService';
import { transformStoreToDto, transformToStoreListDto } from '../types/dto/storeDto';
import { Prisma } from '@prisma/client';

/**
 * StoreController
 * Handles HTTP requests related to stores
 */
export class StoreController {
  /**
   * Get all stores with optional filtering and pagination
   */
  async getAllStores(req: Request, res: Response): Promise<void> {
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

      res.json(transformToStoreListDto(result));
    } catch (error) {
      console.error('Error fetching stores:', error);
      res.status(500).json({ error: 'Failed to fetch stores' });
    }
  }

  /**
   * Get a store by ID
   */
  async getStoreById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const store = await storeService.getStoreById(id);

      if (!store) {
        res.status(404).json({ error: 'Store not found' });
        return;
      }

      res.json(transformStoreToDto(store));
    } catch (error) {
      console.error('Error fetching store:', error);
      res.status(500).json({ error: 'Failed to fetch store' });
    }
  }

  /**
   * Create a new store
   */
  async createStore(req: Request, res: Response): Promise<void> {
    try {
      const storeData = req.body;
      const store = await storeService.createStore(storeData);
      
      res.status(201).json(transformStoreToDto(store));
    } catch (error) {
      console.error('Error creating store:', error);
      
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Handle specific database errors
        if (error.code === 'P2002') {
          res.status(409).json({ 
            error: 'A store with this name already exists',
            field: error.meta?.target || 'unknown'
          });
          return;
        }
      }
      
      res.status(500).json({ error: 'Failed to create store' });
    }
  }

  /**
   * Update an existing store
   */
  async updateStore(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const storeData = req.body;
      
      // Check if store exists
      const existingStore = await storeService.getStoreById(id);
      if (!existingStore) {
        res.status(404).json({ error: 'Store not found' });
        return;
      }
      
      const updatedStore = await storeService.updateStore(id, storeData);
      res.json(transformStoreToDto(updatedStore));
    } catch (error) {
      console.error('Error updating store:', error);
      
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Handle specific database errors
        if (error.code === 'P2002') {
          res.status(409).json({ 
            error: 'A store with this name already exists',
            field: error.meta?.target || 'unknown'
          });
          return;
        }
      }
      
      res.status(500).json({ error: 'Failed to update store' });
    }
  }

  /**
   * Delete a store
   */
  async deleteStore(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // Check if store exists
      const existingStore = await storeService.getStoreById(id);
      if (!existingStore) {
        res.status(404).json({ error: 'Store not found' });
        return;
      }
      
      try {
        const deletedStore = await storeService.deleteStore(id);
        res.json(transformStoreToDto(deletedStore));
      } catch (error) {
        // Check if the error is due to a foreign key constraint
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
          res.status(409).json({ 
            error: 'Cannot delete store because it is referenced by other records',
            details: 'This store has associated products or orders. Please remove these associations before deleting the store.'
          });
          return;
        }
        throw error;
      }
    } catch (error) {
      console.error('Error deleting store:', error);
      res.status(500).json({ error: 'Failed to delete store' });
    }
  }

  /**
   * Get inventory for a specific store
   */
  async getStoreInventory(req: Request, res: Response): Promise<void> {
    try {
      const { storeId } = req.params;
      const { 
        page, 
        limit, 
        search, 
        lowStock, 
        sortBy, 
        sortOrder 
      } = req.query;

      const inventory = await storeService.getStoreInventory(
        storeId,
        {
          page: page ? parseInt(page as string, 10) : undefined,
          limit: limit ? parseInt(limit as string, 10) : undefined,
          search: search as string,
          lowStock: lowStock === 'true',
          sortBy: sortBy as string,
          sortOrder: (sortOrder as 'asc' | 'desc') || 'asc',
        }
      );

      res.json(inventory);
    } catch (error) {
      console.error('Error fetching store inventory:', error);
      
      if (error instanceof Error && error.message === 'Store not found') {
        res.status(404).json({ error: 'Store not found' });
        return;
      }
      
      res.status(500).json({ error: 'Failed to fetch store inventory' });
    }
  }

  /**
   * Update inventory for a specific product in a store
   */
  async updateInventory(req: Request, res: Response): Promise<void> {
    try {
      const { storeId, productId } = req.params;
      const inventoryData = req.body;
      
      const updatedInventory = await storeService.updateInventory(
        storeId,
        productId,
        inventoryData
      );
      
      res.json(updatedInventory);
    } catch (error) {
      console.error('Error updating inventory:', error);
      
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          res.status(404).json({ error: 'Store or product not found' });
          return;
        }
      }
      
      res.status(500).json({ error: 'Failed to update inventory' });
    }
  }
}

// Export singleton instance
export const storeController = new StoreController(); 