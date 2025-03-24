import { Request, Response } from 'express';
import { supplierService } from '../services/supplierService';
import { transformSupplierToDto, transformToSupplierListDto } from '../types/dto/supplierDto';
import { Prisma } from '@prisma/client';

/**
 * SupplierController
 * Handles HTTP requests related to suppliers
 */
export class SupplierController {
  /**
   * Get all suppliers with optional filtering and pagination
   */
  async getAllSuppliers(req: Request, res: Response): Promise<void> {
    try {
      const { 
        page, 
        limit, 
        search, 
        isActive, 
        sortBy, 
        sortOrder 
      } = req.query;

      const result = await supplierService.getAllSuppliers({
        page: page ? parseInt(page as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
        search: search as string,
        isActive: isActive !== undefined ? isActive === 'true' : undefined,
        sortBy: sortBy as string,
        sortOrder: (sortOrder as 'asc' | 'desc') || 'asc',
      });

      res.json(transformToSupplierListDto(result));
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      res.status(500).json({ error: 'Failed to fetch suppliers' });
    }
  }

  /**
   * Get a supplier by ID
   */
  async getSupplierById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const supplier = await supplierService.getSupplierById(id);

      if (!supplier) {
        res.status(404).json({ error: 'Supplier not found' });
        return;
      }

      res.json(transformSupplierToDto(supplier));
    } catch (error) {
      console.error('Error fetching supplier:', error);
      res.status(500).json({ error: 'Failed to fetch supplier' });
    }
  }

  /**
   * Create a new supplier
   */
  async createSupplier(req: Request, res: Response): Promise<void> {
    try {
      const supplierData = req.body;
      const supplier = await supplierService.createSupplier(supplierData);
      
      res.status(201).json(transformSupplierToDto(supplier));
    } catch (error) {
      console.error('Error creating supplier:', error);
      
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Unique constraint violation
        if (error.code === 'P2002') {
          res.status(409).json({ 
            error: 'A supplier with this name already exists',
            field: error.meta?.target || 'unknown'
          });
          return;
        }
      }
      
      res.status(500).json({ error: 'Failed to create supplier' });
    }
  }

  /**
   * Update an existing supplier
   */
  async updateSupplier(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const supplierData = req.body;
      
      // Check if supplier exists
      const existingSupplier = await supplierService.getSupplierById(id);
      if (!existingSupplier) {
        res.status(404).json({ error: 'Supplier not found' });
        return;
      }
      
      const updatedSupplier = await supplierService.updateSupplier(id, supplierData);
      res.json(transformSupplierToDto(updatedSupplier));
    } catch (error) {
      console.error('Error updating supplier:', error);
      
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Unique constraint violation
        if (error.code === 'P2002') {
          res.status(409).json({ 
            error: 'A supplier with this name already exists',
            field: error.meta?.target || 'unknown'
          });
          return;
        }
      }
      
      res.status(500).json({ error: 'Failed to update supplier' });
    }
  }

  /**
   * Delete a supplier
   */
  async deleteSupplier(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // Check if supplier exists
      const existingSupplier = await supplierService.getSupplierById(id);
      if (!existingSupplier) {
        res.status(404).json({ error: 'Supplier not found' });
        return;
      }
      
      try {
        const deletedSupplier = await supplierService.deleteSupplier(id);
        res.json(transformSupplierToDto(deletedSupplier));
      } catch (error) {
        // Check if the error is due to a foreign key constraint
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
          res.status(409).json({ 
            error: 'Cannot delete supplier because it is referenced by other records',
            details: 'This supplier has associated products. Please remove or reassign these products before deleting the supplier.'
          });
          return;
        }
        throw error;
      }
    } catch (error) {
      console.error('Error deleting supplier:', error);
      res.status(500).json({ error: 'Failed to delete supplier' });
    }
  }
}

// Export singleton instance
export const supplierController = new SupplierController(); 