import { Request, Response } from 'express';
import { productService } from '../services/productService';
import { transformProductToDto, transformToProductListDto } from '../types/dto/productDto';
import { Prisma } from '@prisma/client';

/**
 * ProductController
 * Handles HTTP requests for products
 */
export class ProductController {
  /**
   * Get all products with filtering and pagination
   */
  async getAllProducts(req: Request, res: Response): Promise<void> {
    try {
      console.log('GET /products request received with query:', req.query);

      const {
        page,
        limit,
        search,
        categoryId,
        supplierId,
        minPrice,
        maxPrice,
        status,
        lowStock,
        sortBy,
        sortOrder,
      } = req.query;

      // Log the parsed parameters for debugging
      const params = {
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        search: search as string,
        categoryId: categoryId as string,
        supplierId: supplierId as string,
        minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
        status: status as any,
        lowStock: lowStock === 'true',
        sortBy: sortBy as string,
        sortOrder: (sortOrder as 'asc' | 'desc') || 'desc',
      };

      console.log('Parsed parameters:', params);

      try {
        const result = await productService.getAllProducts(params);
        console.log(`Successfully retrieved ${result.products.length} products out of ${result.total} total`);

        const transformedResult = transformToProductListDto(result);
        res.json(transformedResult);
      } catch (serviceError) {
        console.error('Error in productService.getAllProducts:', serviceError);

        // Check for specific Prisma errors
        if (serviceError instanceof Prisma.PrismaClientKnownRequestError) {
          console.error('Prisma error code:', serviceError.code);

          if (serviceError.code === 'P2021') {
            return res.status(500).json({
              error: 'Database table not found. The database schema might be outdated.',
              code: 'DB_TABLE_NOT_FOUND'
            });
          }

          if (serviceError.code === 'P1001') {
            return res.status(500).json({
              error: 'Cannot reach database server. Please check your database connection.',
              code: 'DB_CONNECTION_FAILED'
            });
          }
        }

        throw serviceError; // Re-throw to be caught by the outer catch block
      }
    } catch (error) {
      console.error('Error getting products:', error);

      // Provide more detailed error information
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;

      console.error('Error details:', { message: errorMessage, stack: errorStack });

      res.status(500).json({
        error: 'Failed to get products',
        message: errorMessage,
        // Only include stack trace in development
        ...(process.env.NODE_ENV === 'development' && { stack: errorStack })
      });
    }
  }

  /**
   * Get a product by ID
   */
  async getProductById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const product = await productService.getProductById(id);

      if (!product) {
        res.status(404).json({ error: 'Product not found' });
        return;
      }

      res.json(transformProductToDto(product));
    } catch (error) {
      console.error('Error getting product:', error);
      res.status(500).json({ error: 'Failed to get product' });
    }
  }

  /**
   * Get a product by SKU
   */
  async getProductBySku(req: Request, res: Response): Promise<void> {
    try {
      const { sku } = req.params;
      const product = await productService.getProductBySku(sku);

      if (!product) {
        res.status(404).json({ error: 'Product not found' });
        return;
      }

      res.json(transformProductToDto(product));
    } catch (error) {
      console.error('Error getting product:', error);
      res.status(500).json({ error: 'Failed to get product' });
    }
  }

  /**
   * Get a product by barcode
   */
  async getProductByBarcode(req: Request, res: Response): Promise<void> {
    try {
      const { barcode } = req.params;
      const product = await productService.getProductByBarcode(barcode);

      if (!product) {
        res.status(404).json({ error: 'Product not found' });
        return;
      }

      res.json(transformProductToDto(product));
    } catch (error) {
      console.error('Error getting product by barcode:', error);
      res.status(500).json({ error: 'Failed to get product' });
    }
  }

  /**
   * Create a new product
   */
  async createProduct(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body;

      // Transform data for Prisma (handle nested creates)
      const createData: Prisma.ProductCreateInput = {
        name: data.name,
        description: data.description,
        shortDescription: data.shortDescription,
        sku: data.sku,
        barcode: data.barcode,
        retailPrice: data.retailPrice,
        costPrice: data.costPrice,
        salePrice: data.salePrice,
        status: data.status,
        productType: data.productType,
        brand: data.brand,
        stock: data.stock || 0,
        reorderPoint: data.reorderPoint,
      };

      // Handle category relation
      if (data.categoryId) {
        createData.category = {
          connect: { id: data.categoryId }
        };
      }

      // Handle supplier relation
      if (data.supplierId) {
        createData.supplier = {
          connect: { id: data.supplierId }
        };
      }

      // Handle locations
      if (data.locations && Array.isArray(data.locations) && data.locations.length > 0) {
        createData.locations = {
          create: data.locations.map((location: any) => ({
            stock: location.stock || 0,
            minStock: location.minStock || 0,
            maxStock: location.maxStock || 100,
            store: {
              connect: { id: location.storeId }
            }
          }))
        };
      }

      const product = await productService.createProduct(createData);
      res.status(201).json(transformProductToDto(product));
    } catch (error) {
      console.error('Error creating product:', error);

      // Check for unique constraint violations
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          const field = error.meta?.target as string[];
          if (field.includes('sku')) {
            res.status(409).json({ error: 'A product with this SKU already exists' });
            return;
          }
          if (field.includes('barcode')) {
            res.status(409).json({ error: 'A product with this barcode already exists' });
            return;
          }
        }
      }

      res.status(500).json({ error: 'Failed to create product' });
    }
  }

  /**
   * Update an existing product
   */
  async updateProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data = req.body;

      // Check if product exists
      const existingProduct = await productService.getProductById(id);
      if (!existingProduct) {
        res.status(404).json({ error: 'Product not found' });
        return;
      }

      // Transform data for Prisma (handle nested updates)
      const updateData: Prisma.ProductUpdateInput = {
        name: data.name,
        description: data.description,
        shortDescription: data.shortDescription,
        sku: data.sku,
        barcode: data.barcode,
        retailPrice: data.retailPrice,
        costPrice: data.costPrice,
        salePrice: data.salePrice,
        status: data.status,
        productType: data.productType,
        brand: data.brand,
        stock: data.stock,
        reorderPoint: data.reorderPoint,
      };

      // Handle category relation
      if (data.categoryId) {
        updateData.category = {
          connect: { id: data.categoryId }
        };
      } else if (data.categoryId === null) {
        updateData.category = {
          disconnect: true
        };
      }

      // Handle supplier relation
      if (data.supplierId) {
        updateData.supplier = {
          connect: { id: data.supplierId }
        };
      } else if (data.supplierId === null) {
        updateData.supplier = {
          disconnect: true
        };
      }

      // Note: Locations updates would be handled separately
      // as they need more complex logic for create/update/delete operations

      const product = await productService.updateProduct(id, updateData);
      res.json(transformProductToDto(product));
    } catch (error) {
      console.error('Error updating product:', error);

      // Check for unique constraint violations
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          const field = error.meta?.target as string[];
          if (field.includes('sku')) {
            res.status(409).json({ error: 'A product with this SKU already exists' });
            return;
          }
          if (field.includes('barcode')) {
            res.status(409).json({ error: 'A product with this barcode already exists' });
            return;
          }
        }
      }

      res.status(500).json({ error: 'Failed to update product' });
    }
  }

  /**
   * Delete a product
   */
  async deleteProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Check if product exists
      const existingProduct = await productService.getProductById(id);
      if (!existingProduct) {
        res.status(404).json({ error: 'Product not found' });
        return;
      }

      try {
        const product = await productService.deleteProduct(id);
        res.json(transformProductToDto(product));
      } catch (error) {
        // Check if the error is due to a foreign key constraint
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
          res.status(409).json({
            error: 'Cannot delete product because it is referenced by other records',
            details: 'This product might be included in orders. Consider deactivating it instead of deleting it.'
          });
          return;
        }
        throw error;
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({ error: 'Failed to delete product' });
    }
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(req: Request, res: Response): Promise<void> {
    try {
      const { categoryId } = req.params;
      const { page, limit } = req.query;

      const result = await productService.getProductsByCategory(
        categoryId,
        page ? parseInt(page as string) : undefined,
        limit ? parseInt(limit as string) : undefined
      );

      res.json({
        products: result.products.map(transformProductToDto),
        total: result.total
      });
    } catch (error) {
      console.error('Error getting products by category:', error);
      res.status(500).json({ error: 'Failed to get products by category' });
    }
  }

  /**
   * Get products by supplier
   */
  async getProductsBySupplier(req: Request, res: Response): Promise<void> {
    try {
      const { supplierId } = req.params;
      const { page, limit } = req.query;

      const result = await productService.getProductsBySupplier(
        supplierId,
        page ? parseInt(page as string) : undefined,
        limit ? parseInt(limit as string) : undefined
      );

      res.json({
        products: result.products.map(transformProductToDto),
        total: result.total
      });
    } catch (error) {
      console.error('Error getting products by supplier:', error);
      res.status(500).json({ error: 'Failed to get products by supplier' });
    }
  }

  /**
   * Quick search for products (used for autocomplete)
   */
  async quickSearch(req: Request, res: Response): Promise<void> {
    try {
      const { query, limit } = req.query;

      if (!query) {
        res.status(400).json({ error: 'Search query is required' });
        return;
      }

      const products = await productService.quickSearch(
        query as string,
        limit ? parseInt(limit as string) : undefined
      );

      res.json(products.map(transformProductToDto));
    } catch (error) {
      console.error('Error performing quick search:', error);
      res.status(500).json({ error: 'Failed to search products' });
    }
  }

  /**
   * Update product stock
   */
  async updateStock(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { quantity, operation } = req.body;

      if (quantity === undefined) {
        res.status(400).json({ error: 'Quantity is required' });
        return;
      }

      // Check if product exists
      const existingProduct = await productService.getProductById(id);
      if (!existingProduct) {
        res.status(404).json({ error: 'Product not found' });
        return;
      }

      const updatedProduct = await productService.updateStock(
        id,
        parseInt(quantity.toString()),
        operation as 'add' | 'subtract' | 'set'
      );

      res.json(transformProductToDto(updatedProduct));
    } catch (error) {
      console.error('Error updating product stock:', error);
      res.status(500).json({ error: 'Failed to update product stock' });
    }
  }

  /**
   * Adjust stock across multiple locations
   */
  async adjustStockAcrossLocations(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { adjustments } = req.body;

      if (!adjustments || !Array.isArray(adjustments) || adjustments.length === 0) {
        res.status(400).json({ error: 'Valid stock adjustments are required' });
        return;
      }

      // Check if product exists
      const existingProduct = await productService.getProductById(id);
      if (!existingProduct) {
        res.status(404).json({ error: 'Product not found' });
        return;
      }

      const result = await productService.adjustStockAcrossLocations(id, adjustments);

      if (result.success) {
        const updatedProduct = await productService.getProductById(id);
        res.json(transformProductToDto(updatedProduct!));
      } else {
        res.status(500).json({ error: 'Failed to adjust stock' });
      }
    } catch (error) {
      console.error('Error adjusting product stock across locations:', error);
      res.status(500).json({ error: 'Failed to adjust product stock' });
    }
  }

  /**
   * Get all product attributes
   * @route GET /api/v1/products/attributes
   */
  async getProductAttributes(req: Request, res: Response): Promise<void> {
    try {
      // For now, return a mock response
      const mockAttributes = [
        {
          id: '1',
          name: 'Color',
          values: ['Red', 'Blue', 'Green', 'Black', 'White'],
          displayOrder: 1,
          isVisibleOnProductPage: true,
          isUsedForVariations: true
        },
        {
          id: '2',
          name: 'Size',
          values: ['Small', 'Medium', 'Large', 'XL', 'XXL'],
          displayOrder: 2,
          isVisibleOnProductPage: true,
          isUsedForVariations: true
        },
        {
          id: '3',
          name: 'Material',
          values: ['Cotton', 'Polyester', 'Wool', 'Silk', 'Leather'],
          displayOrder: 3,
          isVisibleOnProductPage: true,
          isUsedForVariations: true
        }
      ];

      res.json({
        success: true,
        data: mockAttributes
      });
    } catch (error) {
      console.error('Error getting product attributes:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get product attributes'
      });
    }
  }

  /**
   * Save product attributes
   * @route POST /api/v1/products/attributes
   */
  async saveProductAttributes(req: Request, res: Response): Promise<void> {
    try {
      const attributes = req.body;

      if (!attributes || !Array.isArray(attributes)) {
        res.status(400).json({
          success: false,
          error: 'Invalid attributes data'
        });
        return;
      }

      // For now, just return the attributes as if they were saved
      res.status(200).json({
        success: true,
        data: attributes
      });
    } catch (error) {
      console.error('Error saving product attributes:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to save product attributes'
      });
    }
  }
}

// Export singleton instance
export const productController = new ProductController();