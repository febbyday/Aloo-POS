import { apiClient, ApiResponse, PaginatedApiResponse } from '../api-client';
import { EntityStorage } from '../storage';

export interface BaseServiceOptions {
  endpoint: string;
  entityName: string;
  usePersistence?: boolean;
  storagePrefix?: string;
}

export interface QueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
  [key: string]: any;
}

export class BaseService<T extends { id: string }> {
  protected endpoint: string;
  protected entityName: string;
  protected storage: EntityStorage<T> | null = null;

  constructor(options: BaseServiceOptions) {
    this.endpoint = options.endpoint;
    this.entityName = options.entityName;

    // Initialize local storage if persistence is enabled
    if (options.usePersistence) {
      const storageKey = `${options.storagePrefix || 'pos_'}${options.entityName}`;
      this.storage = new EntityStorage<T>(storageKey);
    }
  }

  // Get all entities
  public async getAll(params?: QueryParams): Promise<PaginatedApiResponse<T>> {
    try {
      // Get from API
      const response = await apiClient.getPaginated<T>(
        this.endpoint,
        params
      );

      // Update local storage if enabled
      if (this.storage && !params?.page) {
        this.storage.saveAll(response.data);
      }

      return response;
    } catch (error) {
      console.error(`Error fetching ${this.entityName} list:`, error);
      throw error;
    }
  }

  // Get entity by ID
  public async getById(id: string): Promise<ApiResponse<T>> {
    try {
      // Try to get from local storage first if available
      if (this.storage) {
        const cachedEntity = this.storage.getById(id);
        if (cachedEntity) {
          return {
            data: cachedEntity,
            status: 200,
            message: 'Success (from cache)',
            success: true,
          };
        }
      }

      // Get from API
      const response = await apiClient.get<T>(
        `${this.endpoint}/${id}`
      );

      // Update local storage if enabled
      if (this.storage && response.data) {
        this.storage.save(response.data);
      }

      return response;
    } catch (error) {
      console.error(`Error fetching ${this.entityName} with ID ${id}:`, error);
      throw error;
    }
  }

  // Create new entity
  public async create(data: Omit<T, 'id'>): Promise<ApiResponse<T>> {
    try {
      // Create via API
      const response = await apiClient.post<T, Omit<T, 'id'>>(
        this.endpoint,
        data
      );

      // Update local storage if enabled
      if (this.storage && response.data) {
        this.storage.save(response.data);
      }

      return response;
    } catch (error) {
      console.error(`Error creating ${this.entityName}:`, error);
      throw error;
    }
  }

  // Update entity
  public async update(id: string, data: Partial<T>): Promise<ApiResponse<T>> {
    try {
      // Update via API
      const response = await apiClient.put<T, Partial<T>>(
        `${this.endpoint}/${id}`,
        data
      );

      // Update local storage if enabled
      if (this.storage && response.data) {
        this.storage.save(response.data);
      }

      return response;
    } catch (error) {
      console.error(`Error updating ${this.entityName} with ID ${id}:`, error);
      throw error;
    }
  }

  // Delete entity
  public async delete(id: string): Promise<ApiResponse<boolean>> {
    try {
      // Delete via API
      const response = await apiClient.delete<boolean>(
        `${this.endpoint}/${id}`
      );

      // Update local storage if enabled
      if (this.storage && response.success) {
        this.storage.remove(id);
      }

      return response;
    } catch (error) {
      console.error(`Error deleting ${this.entityName} with ID ${id}:`, error);
      throw error;
    }
  }

  // Bulk create entities
  public async bulkCreate(items: Array<Omit<T, 'id'>>): Promise<ApiResponse<T[]>> {
    try {
      // Bulk create via API
      const response = await apiClient.post<T[], Array<Omit<T, 'id'>>>(
        `${this.endpoint}/bulk`,
        items
      );

      // Update local storage if enabled
      if (this.storage && response.data) {
        this.storage.saveMany(response.data);
      }

      return response;
    } catch (error) {
      console.error(`Error bulk creating ${this.entityName}:`, error);
      throw error;
    }
  }

  // Bulk update entities
  public async bulkUpdate(items: T[]): Promise<ApiResponse<T[]>> {
    try {
      // Bulk update via API
      const response = await apiClient.put<T[], T[]>(
        `${this.endpoint}/bulk`,
        items
      );

      // Update local storage if enabled
      if (this.storage && response.data) {
        this.storage.saveMany(response.data);
      }

      return response;
    } catch (error) {
      console.error(`Error bulk updating ${this.entityName}:`, error);
      throw error;
    }
  }

  // Bulk delete entities
  public async bulkDelete(ids: string[]): Promise<ApiResponse<boolean>> {
    try {
      // Bulk delete via API
      const response = await apiClient.post<boolean, string[]>(
        `${this.endpoint}/bulk-delete`,
        ids
      );

      // Update local storage if enabled
      if (this.storage && response.success) {
        this.storage.removeMany(ids);
      }

      return response;
    } catch (error) {
      console.error(`Error bulk deleting ${this.entityName}:`, error);
      throw error;
    }
  }

  // Refresh local cache from API
  public async refreshCache(): Promise<void> {
    if (!this.storage) {
      return;
    }

    try {
      const response = await apiClient.getPaginated<T>(
        this.endpoint,
        { pageSize: 1000 } // Get a large batch
      );

      if (response.success) {
        this.storage.saveAll(response.data);
      }
    } catch (error) {
      console.error(`Error refreshing ${this.entityName} cache:`, error);
    }
  }

  // Clear local cache
  public clearCache(): void {
    if (this.storage) {
      this.storage.clear();
    }
  }

  // Get entities from cache if available
  public getCachedEntities(): T[] {
    return this.storage ? this.storage.getAll() : [];
  }


}

export default BaseService;
