/**
 * Optimized Repository Base Class
 * 
 * Provides a base repository with query optimization and caching:
 * - Automatic query caching
 * - Performance monitoring
 * - Query optimization
 * - Standardized error handling
 */

import { Prisma, PrismaClient } from '@prisma/client';
import { executeQuery, optimizePagination, optimizeInclude } from '../../utils/query-optimizer';
import { queryCache } from '../../middleware/query-cache';
import { logger } from '../../utils/logger';
import { handleDatabaseError } from '../../utils/databaseErrorHandler';

/**
 * Base repository interface
 */
export interface IRepository<T, TWhereInput, TOrderByInput, TInclude> {
  findAll(params: {
    skip?: number;
    take?: number;
    where?: TWhereInput;
    orderBy?: TOrderByInput;
    include?: TInclude;
  }): Promise<T[]>;
  
  findById(id: string, include?: TInclude): Promise<T | null>;
  
  create(data: any): Promise<T>;
  
  update(id: string, data: any): Promise<T>;
  
  delete(id: string): Promise<T>;
  
  count(where?: TWhereInput): Promise<number>;
}

/**
 * Optimized repository base class
 */
export abstract class OptimizedRepository<
  T,
  TWhereInput = any,
  TOrderByInput = any,
  TInclude = any
> implements IRepository<T, TWhereInput, TOrderByInput, TInclude> {
  protected readonly prisma: PrismaClient;
  protected readonly modelName: string;
  
  /**
   * Create a new optimized repository
   * 
   * @param prisma Prisma client instance
   * @param modelName Model name
   */
  constructor(prisma: PrismaClient, modelName: string) {
    this.prisma = prisma;
    this.modelName = modelName;
  }
  
  /**
   * Find all entities with optional filtering and pagination
   */
  async findAll(params: {
    skip?: number;
    take?: number;
    where?: TWhereInput;
    orderBy?: TOrderByInput;
    include?: TInclude;
    cacheable?: boolean;
    cacheTTL?: number;
  }): Promise<T[]> {
    const { 
      skip, 
      take, 
      where, 
      orderBy, 
      include,
      cacheable = true,
      cacheTTL
    } = params;
    
    // Optimize include to prevent excessive relation loading
    const optimizedInclude = optimizeInclude(include);
    
    try {
      return await executeQuery<T[]>(
        this.modelName,
        'findMany',
        () => (this.prisma[this.modelName] as any).findMany({
          skip,
          take,
          where,
          orderBy,
          include: optimizedInclude,
        }),
        { skip, take, where, orderBy, include: optimizedInclude },
        { cache: cacheable, ttl: cacheTTL }
      );
    } catch (error) {
      throw handleDatabaseError(error, 'findAll', this.modelName);
    }
  }
  
  /**
   * Find an entity by ID
   */
  async findById(
    id: string,
    include?: TInclude,
    options: { cacheable?: boolean; cacheTTL?: number } = {}
  ): Promise<T | null> {
    const { cacheable = true, cacheTTL } = options;
    
    // Optimize include to prevent excessive relation loading
    const optimizedInclude = optimizeInclude(include);
    
    try {
      return await executeQuery<T | null>(
        this.modelName,
        'findUnique',
        () => (this.prisma[this.modelName] as any).findUnique({
          where: { id },
          include: optimizedInclude,
        }),
        { id, include: optimizedInclude },
        { cache: cacheable, ttl: cacheTTL }
      );
    } catch (error) {
      throw handleDatabaseError(error, 'findById', this.modelName);
    }
  }
  
  /**
   * Create a new entity
   */
  async create(data: any): Promise<T> {
    try {
      const result = await executeQuery<T>(
        this.modelName,
        'create',
        () => (this.prisma[this.modelName] as any).create({
          data,
        }),
        { data },
        { cache: false }
      );
      
      // Invalidate cache for this entity
      queryCache.invalidateEntity(this.modelName);
      
      return result;
    } catch (error) {
      throw handleDatabaseError(error, 'create', this.modelName);
    }
  }
  
  /**
   * Update an entity
   */
  async update(id: string, data: any): Promise<T> {
    try {
      const result = await executeQuery<T>(
        this.modelName,
        'update',
        () => (this.prisma[this.modelName] as any).update({
          where: { id },
          data,
        }),
        { id, data },
        { cache: false }
      );
      
      // Invalidate cache for this entity
      queryCache.invalidateEntity(this.modelName);
      
      return result;
    } catch (error) {
      throw handleDatabaseError(error, 'update', this.modelName);
    }
  }
  
  /**
   * Delete an entity
   */
  async delete(id: string): Promise<T> {
    try {
      const result = await executeQuery<T>(
        this.modelName,
        'delete',
        () => (this.prisma[this.modelName] as any).delete({
          where: { id },
        }),
        { id },
        { cache: false }
      );
      
      // Invalidate cache for this entity
      queryCache.invalidateEntity(this.modelName);
      
      return result;
    } catch (error) {
      throw handleDatabaseError(error, 'delete', this.modelName);
    }
  }
  
  /**
   * Count entities
   */
  async count(where?: TWhereInput): Promise<number> {
    try {
      return await executeQuery<number>(
        this.modelName,
        'count',
        () => (this.prisma[this.modelName] as any).count({
          where,
        }),
        { where },
        { cache: true, ttl: 60000 } // Cache for 1 minute
      );
    } catch (error) {
      throw handleDatabaseError(error, 'count', this.modelName);
    }
  }
  
  /**
   * Find entities with pagination
   */
  async findWithPagination(params: {
    page?: number;
    pageSize?: number;
    where?: TWhereInput;
    orderBy?: TOrderByInput;
    include?: TInclude;
    cacheable?: boolean;
    cacheTTL?: number;
  }): Promise<{ data: T[]; total: number; page: number; pageSize: number; pageCount: number }> {
    const { 
      page = 1, 
      pageSize = 20, 
      where, 
      orderBy, 
      include,
      cacheable = true,
      cacheTTL
    } = params;
    
    // Optimize pagination
    const { skip, take } = optimizePagination(page, pageSize);
    
    try {
      // Execute queries in parallel
      const [data, total] = await Promise.all([
        this.findAll({
          skip,
          take,
          where,
          orderBy,
          include,
          cacheable,
          cacheTTL
        }),
        this.count(where),
      ]);
      
      const pageCount = Math.ceil(total / take);
      
      return {
        data,
        total,
        page,
        pageSize: take,
        pageCount,
      };
    } catch (error) {
      throw handleDatabaseError(error, 'findWithPagination', this.modelName);
    }
  }
  
  /**
   * Invalidate cache for this entity
   */
  invalidateCache(): void {
    queryCache.invalidateEntity(this.modelName);
    logger.debug(`Cache invalidated for ${this.modelName}`);
  }
}

export default OptimizedRepository;
