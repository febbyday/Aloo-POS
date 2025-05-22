/**
 * Batch-Enabled Base Service
 * 
 * This module provides a base class for API services that use batch requests
 * during initialization to improve performance.
 */

import { 
  InitializationBatchManager, 
  getInitializationBatchManager, 
  RequestPriority,
  initBatchClient
} from '../initialization-batch-manager';
import { logger } from '../../logging/logger';
import { performanceMonitor } from '../../performance/performance-monitor';
import { getApiUrl } from '../enhanced-config';

export interface BatchServiceOptions {
  /**
   * Service name for logging and performance tracking
   */
  serviceName: string;
  
  /**
   * API endpoint for this service
   */
  endpoint: string;
  
  /**
   * Default priority for requests
   * Default: RequestPriority.MEDIUM
   */
  defaultPriority?: RequestPriority;
  
  /**
   * Whether to track performance metrics
   * Default: true
   */
  trackPerformance?: boolean;
  
  /**
   * Whether to use the initialization batch manager
   * Default: true
   */
  useBatchManager?: boolean;
  
  /**
   * Custom initialization batch manager to use
   * If not provided, the global initialization batch manager will be used
   */
  initManager?: InitializationBatchManager;
}

/**
 * Base class for batch-enabled API services
 */
export class BatchBaseService<T = any> {
  protected serviceName: string;
  protected endpoint: string;
  protected defaultPriority: RequestPriority;
  protected trackPerformance: boolean;
  protected useBatchManager: boolean;
  protected initManager: InitializationBatchManager;
  
  /**
   * Create a new batch-enabled base service
   * 
   * @param options Service options
   */
  constructor(options: BatchServiceOptions) {
    this.serviceName = options.serviceName;
    this.endpoint = options.endpoint;
    this.defaultPriority = options.defaultPriority || RequestPriority.MEDIUM;
    this.trackPerformance = options.trackPerformance !== false;
    this.useBatchManager = options.useBatchManager !== false;
    this.initManager = options.initManager || getInitializationBatchManager();
    
    logger.debug(`Created batch-enabled service: ${this.serviceName}`, { 
      serviceName: this.serviceName,
      endpoint: this.endpoint,
      defaultPriority: this.defaultPriority,
      useBatchManager: this.useBatchManager
    });
  }
  
  /**
   * Get the full URL for an endpoint
   * 
   * @param path Path to append to the base endpoint
   * @returns Full URL
   */
  protected getUrl(path?: string): string {
    const fullPath = path ? `${this.endpoint}/${path}` : this.endpoint;
    return getApiUrl(fullPath);
  }
  
  /**
   * Execute a GET request
   * 
   * @param path Path to append to the base endpoint
   * @param params Query parameters
   * @param priority Priority level for the request
   * @returns Promise that resolves with the response
   */
  protected async get<R = T>(
    path?: string,
    params?: Record<string, any>,
    priority?: RequestPriority
  ): Promise<R> {
    const url = path ? `${this.endpoint}/${path}` : this.endpoint;
    const requestPriority = priority || this.defaultPriority;
    
    if (this.trackPerformance) {
      performanceMonitor.markStart(`service:${this.serviceName}:get:${path || ''}`);
    }
    
    try {
      if (this.useBatchManager) {
        return await initBatchClient.get<R>(url, params, requestPriority, this.initManager);
      } else {
        // Use regular fetch if batch manager is disabled
        const fullUrl = this.getUrl(path);
        const response = await fetch(fullUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
      }
    } catch (error) {
      logger.error(`Error in ${this.serviceName}.get`, { 
        serviceName: this.serviceName,
        path,
        params,
        error
      });
      throw error;
    } finally {
      if (this.trackPerformance) {
        performanceMonitor.markEnd(`service:${this.serviceName}:get:${path || ''}`);
      }
    }
  }
  
  /**
   * Execute a POST request
   * 
   * @param path Path to append to the base endpoint
   * @param data Request body
   * @param priority Priority level for the request
   * @returns Promise that resolves with the response
   */
  protected async post<R = T>(
    path?: string,
    data?: any,
    priority?: RequestPriority
  ): Promise<R> {
    const url = path ? `${this.endpoint}/${path}` : this.endpoint;
    const requestPriority = priority || this.defaultPriority;
    
    if (this.trackPerformance) {
      performanceMonitor.markStart(`service:${this.serviceName}:post:${path || ''}`);
    }
    
    try {
      if (this.useBatchManager) {
        return await initBatchClient.post<R>(url, data, requestPriority, this.initManager);
      } else {
        // Use regular fetch if batch manager is disabled
        const fullUrl = this.getUrl(path);
        const response = await fetch(fullUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(data)
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
      }
    } catch (error) {
      logger.error(`Error in ${this.serviceName}.post`, { 
        serviceName: this.serviceName,
        path,
        data,
        error
      });
      throw error;
    } finally {
      if (this.trackPerformance) {
        performanceMonitor.markEnd(`service:${this.serviceName}:post:${path || ''}`);
      }
    }
  }
  
  /**
   * Execute a PUT request
   * 
   * @param path Path to append to the base endpoint
   * @param data Request body
   * @param priority Priority level for the request
   * @returns Promise that resolves with the response
   */
  protected async put<R = T>(
    path?: string,
    data?: any,
    priority?: RequestPriority
  ): Promise<R> {
    // For batch requests, we'll use POST with a _method parameter
    if (this.useBatchManager) {
      return this.post<R>(path, {
        ...data,
        _method: 'PUT'
      }, priority);
    } else {
      // Use regular fetch if batch manager is disabled
      const fullUrl = this.getUrl(path);
      
      if (this.trackPerformance) {
        performanceMonitor.markStart(`service:${this.serviceName}:put:${path || ''}`);
      }
      
      try {
        const response = await fetch(fullUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(data)
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
      } catch (error) {
        logger.error(`Error in ${this.serviceName}.put`, { 
          serviceName: this.serviceName,
          path,
          data,
          error
        });
        throw error;
      } finally {
        if (this.trackPerformance) {
          performanceMonitor.markEnd(`service:${this.serviceName}:put:${path || ''}`);
        }
      }
    }
  }
  
  /**
   * Execute a DELETE request
   * 
   * @param path Path to append to the base endpoint
   * @param data Request body
   * @param priority Priority level for the request
   * @returns Promise that resolves with the response
   */
  protected async delete<R = T>(
    path?: string,
    data?: any,
    priority?: RequestPriority
  ): Promise<R> {
    // For batch requests, we'll use POST with a _method parameter
    if (this.useBatchManager) {
      return this.post<R>(path, {
        ...data,
        _method: 'DELETE'
      }, priority);
    } else {
      // Use regular fetch if batch manager is disabled
      const fullUrl = this.getUrl(path);
      
      if (this.trackPerformance) {
        performanceMonitor.markStart(`service:${this.serviceName}:delete:${path || ''}`);
      }
      
      try {
        const response = await fetch(fullUrl, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: data ? JSON.stringify(data) : undefined
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
      } catch (error) {
        logger.error(`Error in ${this.serviceName}.delete`, { 
          serviceName: this.serviceName,
          path,
          data,
          error
        });
        throw error;
      } finally {
        if (this.trackPerformance) {
          performanceMonitor.markEnd(`service:${this.serviceName}:delete:${path || ''}`);
        }
      }
    }
  }
}

export default BatchBaseService;
