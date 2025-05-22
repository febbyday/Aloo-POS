import { BaseService, QueryParams } from './base-service';

// Define Supplier interface here since we removed the mock data file
export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isDefault: boolean;
  };
  taxId: string;
  website: string;
  notes: string;
  paymentTerms: string;
  accountNumber: string;
  categories: string[];
  rating: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export class SupplierService extends BaseService<Supplier> {
  constructor() {
    super({
      endpoint: '/suppliers',
      entityName: 'suppliers',
      usePersistence: true,
    });
  }



  // Get suppliers by category
  public async getByCategory(categoryId: string, params?: QueryParams): Promise<Supplier[]> {
    try {
      const response = await this.getAll({
        ...params,
        filters: { ...params?.filters, categories: categoryId },
      });

      return response.data.filter(supplier =>
        supplier.categories.includes(categoryId)
      );
    } catch (error) {
      console.error(`Error fetching suppliers by category ${categoryId}:`, error);
      throw error;
    }
  }

  // Get top suppliers by rating
  public async getTopSuppliers(limit: number = 10): Promise<Supplier[]> {
    try {
      const response = await this.getAll({
        sortBy: 'rating',
        sortOrder: 'desc',
        pageSize: limit,
      });

      return response.data;
    } catch (error) {
      console.error(`Error fetching top ${limit} suppliers:`, error);
      throw error;
    }
  }

  // Get suppliers with recent activity
  public async getRecentSuppliers(days: number = 30, limit: number = 10): Promise<Supplier[]> {
    try {
      const response = await this.getAll({
        sortBy: 'updatedAt',
        sortOrder: 'desc',
        pageSize: limit,
      });

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      return response.data.filter(supplier => {
        const updatedAt = new Date(supplier.updatedAt);
        return updatedAt >= cutoffDate;
      });
    } catch (error) {
      console.error(`Error fetching suppliers with activity in last ${days} days:`, error);
      throw error;
    }
  }

  // Update supplier rating
  public async updateRating(supplierId: string, rating: number): Promise<Supplier> {
    try {
      if (rating < 0 || rating > 5) {
        throw new Error('Rating must be between 0 and 5');
      }

      const supplier = await this.getById(supplierId);

      if (!supplier.data) {
        throw new Error(`Supplier with ID ${supplierId} not found`);
      }

      const updatedSupplier = {
        ...supplier.data,
        rating,
        updatedAt: new Date().toISOString(),
      };

      return (await this.update(supplierId, updatedSupplier)).data;
    } catch (error) {
      console.error(`Error updating rating for supplier ${supplierId}:`, error);
      throw error;
    }
  }

  // Add category to supplier
  public async addCategory(supplierId: string, categoryId: string): Promise<Supplier> {
    try {
      const supplier = await this.getById(supplierId);

      if (!supplier.data) {
        throw new Error(`Supplier with ID ${supplierId} not found`);
      }

      if (supplier.data.categories.includes(categoryId)) {
        return supplier.data; // Category already exists
      }

      const updatedSupplier = {
        ...supplier.data,
        categories: [...supplier.data.categories, categoryId],
        updatedAt: new Date().toISOString(),
      };

      return (await this.update(supplierId, updatedSupplier)).data;
    } catch (error) {
      console.error(`Error adding category ${categoryId} to supplier ${supplierId}:`, error);
      throw error;
    }
  }

  // Remove category from supplier
  public async removeCategory(supplierId: string, categoryId: string): Promise<Supplier> {
    try {
      const supplier = await this.getById(supplierId);

      if (!supplier.data) {
        throw new Error(`Supplier with ID ${supplierId} not found`);
      }

      if (!supplier.data.categories.includes(categoryId)) {
        return supplier.data; // Category doesn't exist
      }

      const updatedSupplier = {
        ...supplier.data,
        categories: supplier.data.categories.filter(id => id !== categoryId),
        updatedAt: new Date().toISOString(),
      };

      return (await this.update(supplierId, updatedSupplier)).data;
    } catch (error) {
      console.error(`Error removing category ${categoryId} from supplier ${supplierId}:`, error);
      throw error;
    }
  }

  // Search suppliers by name or contact info
  public async searchSuppliers(query: string, params?: QueryParams): Promise<Supplier[]> {
    try {
      const response = await this.getAll({
        ...params,
        search: query,
      });

      const searchLower = query.toLowerCase();

      return response.data.filter(supplier =>
        supplier.name.toLowerCase().includes(searchLower) ||
        supplier.contactPerson.toLowerCase().includes(searchLower) ||
        supplier.email.toLowerCase().includes(searchLower) ||
        supplier.phone.includes(query)
      );
    } catch (error) {
      console.error(`Error searching suppliers with query "${query}":`, error);
      throw error;
    }
  }
}

// Create and export singleton instance
export const supplierService = new SupplierService();

export default supplierService;
