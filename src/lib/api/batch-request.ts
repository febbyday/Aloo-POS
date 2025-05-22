/**
 * API Batch Request Utility
 * 
 * This utility allows multiple API requests to be combined into a single
 * HTTP request, reducing network overhead and improving performance.
 */

import { v4 as uuidv4 } from 'uuid';
import { performanceMonitor } from '../performance/performance-monitor';
import { API_CONSTANTS } from './config';
import { ApiError, ApiErrorType } from './error-handler';
import { logger } from '../logging/logger';

// Types for batch requests
export interface BatchRequestItem {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  body?: any;
  headers?: Record<string, string>;
}

export interface BatchResponse<T = any> {
  id: string;
  status: number;
  data: T;
  headers?: Record<string, string>;
  error?: ApiError;
}

export interface BatchRequestOptions {
  /**
   * Maximum number of requests to include in a single batch
   * Default: 10
   */
  maxBatchSize?: number;
  
  /**
   * Whether to automatically execute the batch when it reaches maxBatchSize
   * Default: true
   */
  autoExecute?: boolean;
  
  /**
   * Timeout in milliseconds for the batch request
   * Default: API_CONSTANTS.TIMEOUT
   */
  timeout?: number;
  
  /**
   * Whether to track performance metrics
   * Default: true
   */
  trackPerformance?: boolean;
  
  /**
   * Custom headers to include in the batch request
   */
  headers?: Record<string, string>;
}

// Default options
const DEFAULT_BATCH_OPTIONS: BatchRequestOptions = {
  maxBatchSize: 10,
  autoExecute: true,
  timeout: API_CONSTANTS.TIMEOUT,
  trackPerformance: true
};

/**
 * Batch Request Manager
 * 
 * Manages a queue of API requests to be executed in a single batch
 */
export class BatchRequestManager {
  private queue: BatchRequestItem[] = [];
  private pendingPromises: Map<string, { resolve: (value: any) => void, reject: (reason: any) => void }> = new Map();
  private options: BatchRequestOptions;
  private batchId: string;
  private executeBatchFn: (batch: BatchRequestItem[], options: BatchRequestOptions) => Promise<BatchResponse[]>;
  
  /**
   * Create a new batch request manager
   * 
   * @param executeBatchFn Function to execute the batch request
   * @param options Batch request options
   */
  constructor(
    executeBatchFn: (batch: BatchRequestItem[], options: BatchRequestOptions) => Promise<BatchResponse[]>,
    options: BatchRequestOptions = {}
  ) {
    this.executeBatchFn = executeBatchFn;
    this.options = { ...DEFAULT_BATCH_OPTIONS, ...options };
    this.batchId = uuidv4();
    
    logger.debug('Created batch request manager', { 
      batchId: this.batchId,
      options: this.options
    });
  }
  
  /**
   * Add a request to the batch queue
   * 
   * @param request Request to add to the batch
   * @returns Promise that resolves with the response
   */
  public add<T = any>(request: Omit<BatchRequestItem, 'id'>): Promise<T> {
    // Generate a unique ID for this request
    const id = uuidv4();
    
    // Create the request item
    const requestItem: BatchRequestItem = {
      id,
      ...request
    };
    
    // Add the request to the queue
    this.queue.push(requestItem);
    
    logger.debug('Added request to batch queue', { 
      batchId: this.batchId,
      requestId: id,
      method: request.method,
      url: request.url,
      queueSize: this.queue.length
    });
    
    // Create a promise that will be resolved when the batch is executed
    const promise = new Promise<T>((resolve, reject) => {
      this.pendingPromises.set(id, { resolve, reject });
    });
    
    // If auto-execute is enabled and the queue has reached the maximum batch size,
    // execute the batch
    if (this.options.autoExecute && this.queue.length >= (this.options.maxBatchSize || 10)) {
      this.execute();
    }
    
    return promise;
  }
  
  /**
   * Execute the batch request
   * 
   * @returns Promise that resolves when the batch is complete
   */
  public async execute(): Promise<void> {
    // If the queue is empty, there's nothing to do
    if (this.queue.length === 0) {
      return;
    }
    
    // Get the current queue and clear it
    const batch = [...this.queue];
    this.queue = [];
    
    logger.debug('Executing batch request', { 
      batchId: this.batchId,
      batchSize: batch.length
    });
    
    // Start performance tracking
    if (this.options.trackPerformance) {
      performanceMonitor.markStart(`api:batch:${this.batchId}`);
    }
    
    try {
      // Execute the batch request
      const responses = await this.executeBatchFn(batch, this.options);
      
      // Process the responses
      for (const response of responses) {
        const { id, status, data, error } = response;
        const pendingPromise = this.pendingPromises.get(id);
        
        if (!pendingPromise) {
          logger.warn('Received response for unknown request', { 
            batchId: this.batchId,
            requestId: id
          });
          continue;
        }
        
        // Remove the pending promise
        this.pendingPromises.delete(id);
        
        // If there was an error, reject the promise
        if (error || status >= 400) {
          pendingPromise.reject(error || new ApiError(`Request failed with status ${status}`, {
            type: ApiErrorType.SERVER,
            status
          }));
          continue;
        }
        
        // Otherwise, resolve the promise with the data
        pendingPromise.resolve(data);
      }
    } catch (error) {
      // If the entire batch failed, reject all pending promises
      logger.error('Batch request failed', { 
        batchId: this.batchId,
        error
      });
      
      for (const requestItem of batch) {
        const pendingPromise = this.pendingPromises.get(requestItem.id);
        if (pendingPromise) {
          this.pendingPromises.delete(requestItem.id);
          pendingPromise.reject(error);
        }
      }
    } finally {
      // End performance tracking
      if (this.options.trackPerformance) {
        performanceMonitor.markEnd(`api:batch:${this.batchId}`);
      }
    }
  }
  
  /**
   * Get the number of requests in the queue
   */
  public get queueSize(): number {
    return this.queue.length;
  }
  
  /**
   * Get the batch ID
   */
  public get id(): string {
    return this.batchId;
  }
}

// Export a function to create a new batch request manager
export function createBatchRequestManager(
  executeBatchFn: (batch: BatchRequestItem[], options: BatchRequestOptions) => Promise<BatchResponse[]>,
  options: BatchRequestOptions = {}
): BatchRequestManager {
  return new BatchRequestManager(executeBatchFn, options);
}
