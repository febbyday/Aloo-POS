import { BaseService, QueryParams } from './base-service';
import { Product } from '../mock-data/products';
import { products as mockProducts } from '../mock-data/products';
import { generateId } from '@/lib/utils';

export class ProductService extends BaseService<Product> {
  constructor() {
    super({
      endpoint: '/products',
      entityName: 'products',
      usePersistence: true,
    });
  }

  // Override mock data methods
  protected getMockData(params?: QueryParams): Product[] {
    // Return a copy of the mock data to prevent modifications
    return JSON.parse(JSON.stringify(mockProducts));
  }

  // Get products by category
  public async getByCategory(categoryId: string, params?: QueryParams): Promise<Product[]> {
    try {
      const response = await this.getAll({
        ...params,
        filters: { ...params?.filters, categoryId },
      });
      
      return response.data.filter(product => product.categoryId === categoryId);
    } catch (error) {
      console.error(`Error fetching products by category ${categoryId}:`, error);
      throw error;
    }
  }

  // Get products with low inventory
  public async getLowInventory(threshold?: number, params?: QueryParams): Promise<Product[]> {
    try {
      const allProducts = await this.getAll(params);
      
      return allProducts.data.filter(product => 
        product.trackInventory && 
        product.inventoryLevel !== undefined && 
        product.reorderLevel !== undefined && 
        product.inventoryLevel <= (threshold || product.reorderLevel)
      );
    } catch (error) {
      console.error('Error fetching low inventory products:', error);
      throw error;
    }
  }

  // Get product variants
  public async getVariants(productId: string): Promise<Product['variants']> {
    try {
      const product = await this.getById(productId);
      return product.data.variants || [];
    } catch (error) {
      console.error(`Error fetching variants for product ${productId}:`, error);
      throw error;
    }
  }

  // Add product variant
  public async addVariant(productId: string, variantData: Omit<Product['variants'][0], 'id' | 'productId'>): Promise<Product> {
    try {
      const product = await this.getById(productId);
      
      if (!product.data) {
        throw new Error(`Product with ID ${productId} not found`);
      }
      
      const variants = product.data.variants || [];
      const newVariant = {
        ...variantData,
        id: generateId('var_'),
        productId,
      };
      
      const updatedProduct = {
        ...product.data,
        variants: [...variants, newVariant],
        updatedAt: new Date().toISOString(),
      };
      
      return (await this.update(productId, updatedProduct)).data;
    } catch (error) {
      console.error(`Error adding variant to product ${productId}:`, error);
      throw error;
    }
  }

  // Update product variant
  public async updateVariant(productId: string, variantId: string, variantData: Partial<Product['variants'][0]>): Promise<Product> {
    try {
      const product = await this.getById(productId);
      
      if (!product.data) {
        throw new Error(`Product with ID ${productId} not found`);
      }
      
      const variants = product.data.variants || [];
      const variantIndex = variants.findIndex(v => v.id === variantId);
      
      if (variantIndex === -1) {
        throw new Error(`Variant with ID ${variantId} not found`);
      }
      
      const updatedVariants = [...variants];
      updatedVariants[variantIndex] = {
        ...updatedVariants[variantIndex],
        ...variantData,
      };
      
      const updatedProduct = {
        ...product.data,
        variants: updatedVariants,
        updatedAt: new Date().toISOString(),
      };
      
      return (await this.update(productId, updatedProduct)).data;
    } catch (error) {
      console.error(`Error updating variant ${variantId} for product ${productId}:`, error);
      throw error;
    }
  }

  // Delete product variant
  public async deleteVariant(productId: string, variantId: string): Promise<Product> {
    try {
      const product = await this.getById(productId);
      
      if (!product.data) {
        throw new Error(`Product with ID ${productId} not found`);
      }
      
      const variants = product.data.variants || [];
      const updatedVariants = variants.filter(v => v.id !== variantId);
      
      if (variants.length === updatedVariants.length) {
        throw new Error(`Variant with ID ${variantId} not found`);
      }
      
      const updatedProduct = {
        ...product.data,
        variants: updatedVariants,
        updatedAt: new Date().toISOString(),
      };
      
      return (await this.update(productId, updatedProduct)).data;
    } catch (error) {
      console.error(`Error deleting variant ${variantId} for product ${productId}:`, error);
      throw error;
    }
  }

  // Update product inventory
  public async updateInventory(productId: string, quantity: number, isIncrement = true): Promise<Product> {
    try {
      const product = await this.getById(productId);
      
      if (!product.data) {
        throw new Error(`Product with ID ${productId} not found`);
      }
      
      if (!product.data.trackInventory) {
        throw new Error(`Product ${productId} does not track inventory`);
      }
      
      const currentLevel = product.data.inventoryLevel || 0;
      const newLevel = isIncrement ? currentLevel + quantity : quantity;
      
      if (newLevel < 0) {
        throw new Error(`Cannot reduce inventory below 0`);
      }
      
      const updatedProduct = {
        ...product.data,
        inventoryLevel: newLevel,
        updatedAt: new Date().toISOString(),
      };
      
      return (await this.update(productId, updatedProduct)).data;
    } catch (error) {
      console.error(`Error updating inventory for product ${productId}:`, error);
      throw error;
    }
  }

  // Update variant inventory
  public async updateVariantInventory(productId: string, variantId: string, quantity: number, isIncrement = true): Promise<Product> {
    try {
      const product = await this.getById(productId);
      
      if (!product.data) {
        throw new Error(`Product with ID ${productId} not found`);
      }
      
      if (!product.data.trackInventory) {
        throw new Error(`Product ${productId} does not track inventory`);
      }
      
      const variants = product.data.variants || [];
      const variantIndex = variants.findIndex(v => v.id === variantId);
      
      if (variantIndex === -1) {
        throw new Error(`Variant with ID ${variantId} not found`);
      }
      
      const variant = variants[variantIndex];
      const currentLevel = variant.inventoryLevel || 0;
      const newLevel = isIncrement ? currentLevel + quantity : quantity;
      
      if (newLevel < 0) {
        throw new Error(`Cannot reduce inventory below 0`);
      }
      
      const updatedVariants = [...variants];
      updatedVariants[variantIndex] = {
        ...variant,
        inventoryLevel: newLevel,
      };
      
      const updatedProduct = {
        ...product.data,
        variants: updatedVariants,
        updatedAt: new Date().toISOString(),
      };
      
      return (await this.update(productId, updatedProduct)).data;
    } catch (error) {
      console.error(`Error updating inventory for variant ${variantId} of product ${productId}:`, error);
      throw error;
    }
  }
}

// Create and export singleton instance
export const productService = new ProductService();

export default productService;
