/**
 * Initialization Batch Manager
 * 
 * This module provides specialized batch request functionality for application initialization.
 * It prioritizes critical API requests and ensures they are executed first.
 */

import { v4 as uuidv4 } from 'uuid';
import { BatchRequestItem, BatchRequestManager, BatchRequestOptions, createBatchRequestManager } from './batch-request';
import { executeBatchWithMockSupport } from './batch-client';
import { logger } from '../logging/logger';
import { performanceMonitor } from '../performance/performance-monitor';
import { getApiUrl } from './enhanced-config';

// Priority levels for initialization requests
export enum RequestPriority {
  CRITICAL = 0,   // Authentication, core configuration
  HIGH = 1,       // User data, permissions
  MEDIUM = 2,     // UI configuration, settings
  LOW = 3,        // Non-essential data
  BACKGROUND = 4  // Data that can be loaded after initialization
}

// Extended batch request item with priority
export interface PrioritizedRequestItem extends Omit<BatchRequestItem, 'id'> {
  priority: RequestPriority;
}

// Initialization batch manager options
export interface InitBatchManagerOptions extends BatchRequestOptions {
  /**
   * Whether to automatically execute critical requests immediately
   * Default: true
   */
  autoExecuteCritical?: boolean;
  
  /**
   * Maximum number of requests to include in a critical batch
   * Default: 5
   */
  maxCriticalBatchSize?: number;
  
  /**
   * Whether to track performance metrics for initialization
   * Default: true
   */
  trackInitPerformance?: boolean;
}

/**
 * Initialization Batch Manager
 * 
 * Manages batched API requests during application initialization with priority support
 */
export class InitializationBatchManager {
  private batchManager: BatchRequestManager;
  private options: InitBatchManagerOptions;
  private criticalQueue: BatchRequestItem[] = [];
  private highQueue: BatchRequestItem[] = [];
  private mediumQueue: BatchRequestItem[] = [];
  private lowQueue: BatchRequestItem[] = [];
  private backgroundQueue: BatchRequestItem[] = [];
  private pendingPromises: Map<string, { resolve: (value: any) => void, reject: (reason: any) => void, priority: RequestPriority }> = new Map();
  private initId: string;
  private isExecutingCritical = false;
  
  /**
   * Create a new initialization batch manager
   * 
   * @param options Batch request options
   */
  constructor(options: InitBatchManagerOptions = {}) {
    this.options = {
      maxBatchSize: 10,
      autoExecute: true,
      autoExecuteCritical: true,
      maxCriticalBatchSize: 5,
      trackInitPerformance: true,
      trackPerformance: true,
      ...options
    };
    
    this.batchManager = createBatchRequestManager(executeBatchWithMockSupport, this.options);
    this.initId = uuidv4();
    
    logger.debug('Created initialization batch manager', { 
      initId: this.initId,
      options: this.options
    });
    
    if (this.options.trackInitPerformance) {
      performanceMonitor.markStart(`app:init:api:${this.initId}`);
    }
  }
  
  /**
   * Add a request to the appropriate queue based on priority
   * 
   * @param request Request to add
   * @param priority Priority level for the request
   * @returns Promise that resolves with the response
   */
  public add<T = any>(request: Omit<BatchRequestItem, 'id'>, priority: RequestPriority = RequestPriority.MEDIUM): Promise<T> {
    // Generate a unique ID for this request
    const id = uuidv4();
    
    // Create the request item
    const requestItem: BatchRequestItem = {
      id,
      ...request
    };
    
    // Add the request to the appropriate queue
    switch (priority) {
      case RequestPriority.CRITICAL:
        this.criticalQueue.push(requestItem);
        break;
      case RequestPriority.HIGH:
        this.highQueue.push(requestItem);
        break;
      case RequestPriority.MEDIUM:
        this.mediumQueue.push(requestItem);
        break;
      case RequestPriority.LOW:
        this.lowQueue.push(requestItem);
        break;
      case RequestPriority.BACKGROUND:
        this.backgroundQueue.push(requestItem);
        break;
    }
    
    logger.debug('Added request to initialization queue', { 
      initId: this.initId,
      requestId: id,
      method: request.method,
      url: request.url,
      priority
    });
    
    // Create a promise that will be resolved when the batch is executed
    const promise = new Promise<T>((resolve, reject) => {
      this.pendingPromises.set(id, { resolve, reject, priority });
    });
    
    // If auto-execute critical is enabled and this is a critical request,
    // execute the critical batch
    if (
      this.options.autoExecuteCritical && 
      priority === RequestPriority.CRITICAL &&
      this.criticalQueue.length >= (this.options.maxCriticalBatchSize || 5) &&
      !this.isExecutingCritical
    ) {
      this.executeCriticalBatch();
    }
    
    return promise;
  }
  
  /**
   * Execute only the critical batch requests
   */
  public async executeCriticalBatch(): Promise<void> {
    if (this.criticalQueue.length === 0 || this.isExecutingCritical) {
      return;
    }
    
    this.isExecutingCritical = true;
    
    try {
      // Get the current critical queue and clear it
      const batch = [...this.criticalQueue];
      this.criticalQueue = [];
      
      logger.debug('Executing critical batch request', { 
        initId: this.initId,
        batchSize: batch.length
      });
      
      // Start performance tracking
      if (this.options.trackPerformance) {
        performanceMonitor.markStart(`app:init:critical:${this.initId}`);
      }
      
      // Execute the batch request
      const responses = await executeBatchWithMockSupport(batch, this.options);
      
      // Process the responses
      this.processResponses(responses);
    } finally {
      this.isExecutingCritical = false;
      
      // End performance tracking
      if (this.options.trackPerformance) {
        performanceMonitor.markEnd(`app:init:critical:${this.initId}`);
      }
    }
  }
  
  /**
   * Execute all pending batch requests in priority order
   */
  public async executeAll(): Promise<void> {
    // First execute critical requests if any
    if (this.criticalQueue.length > 0) {
      await this.executeCriticalBatch();
    }
    
    // Then execute all other requests in priority order
    const allRequests = [
      ...this.highQueue,
      ...this.mediumQueue,
      ...this.lowQueue,
      ...this.backgroundQueue
    ];
    
    // Clear all queues
    this.highQueue = [];
    this.mediumQueue = [];
    this.lowQueue = [];
    this.backgroundQueue = [];
    
    if (allRequests.length === 0) {
      return;
    }
    
    logger.debug('Executing all remaining initialization requests', { 
      initId: this.initId,
      batchSize: allRequests.length
    });
    
    // Start performance tracking
    if (this.options.trackPerformance) {
      performanceMonitor.markStart(`app:init:remaining:${this.initId}`);
    }
    
    try {
      // Execute the batch request
      const responses = await executeBatchWithMockSupport(allRequests, this.options);
      
      // Process the responses
      this.processResponses(responses);
    } finally {
      // End performance tracking
      if (this.options.trackPerformance) {
        performanceMonitor.markEnd(`app:init:remaining:${this.initId}`);
      }
      
      // Mark initialization complete
      if (this.options.trackInitPerformance) {
        performanceMonitor.markEnd(`app:init:api:${this.initId}`);
      }
    }
  }
  
  /**
   * Process batch responses and resolve/reject promises
   */
  private processResponses(responses: any[]): void {
    for (const response of responses) {
      const { id, status, data, error } = response;
      const pendingPromise = this.pendingPromises.get(id);
      
      if (!pendingPromise) {
        logger.warn('Received response for unknown request', { 
          initId: this.initId,
          requestId: id
        });
        continue;
      }
      
      // Remove the pending promise
      this.pendingPromises.delete(id);
      
      // If there was an error, reject the promise
      if (error || status >= 400) {
        pendingPromise.reject(error || new Error(`Request failed with status ${status}`));
        continue;
      }
      
      // Otherwise, resolve the promise with the data
      pendingPromise.resolve(data);
    }
  }
  
  /**
   * Get the number of requests in each queue
   */
  public get queueSizes(): Record<string, number> {
    return {
      critical: this.criticalQueue.length,
      high: this.highQueue.length,
      medium: this.mediumQueue.length,
      low: this.lowQueue.length,
      background: this.backgroundQueue.length,
      total: this.criticalQueue.length + this.highQueue.length + 
             this.mediumQueue.length + this.lowQueue.length + 
             this.backgroundQueue.length
    };
  }
  
  /**
   * Get the initialization ID
   */
  public get id(): string {
    return this.initId;
  }
}

// Create a singleton instance for the application initialization
let globalInitManager: InitializationBatchManager | null = null;

/**
 * Get the global initialization batch manager
 * 
 * @param options Initialization batch manager options
 * @returns Global initialization batch manager
 */
export function getInitializationBatchManager(options: InitBatchManagerOptions = {}): InitializationBatchManager {
  if (!globalInitManager) {
    globalInitManager = new InitializationBatchManager(options);
  }
  
  return globalInitManager;
}

/**
 * Reset the global initialization batch manager
 * This is useful for testing
 */
export function resetInitializationBatchManager(): void {
  globalInitManager = null;
}

/**
 * Helper functions for common initialization requests
 */
export const initBatchClient = {
  /**
   * Add a GET request to the initialization batch
   * 
   * @param endpoint API endpoint
   * @param params Query parameters
   * @param priority Priority level for the request
   * @param initManager Initialization batch manager to use (defaults to global)
   * @returns Promise that resolves with the response
   */
  get: <T = any>(
    endpoint: string,
    params?: Record<string, any>,
    priority: RequestPriority = RequestPriority.MEDIUM,
    initManager?: InitializationBatchManager
  ): Promise<T> => {
    const manager = initManager || getInitializationBatchManager();
    const url = getApiUrl(endpoint);
    
    // Add query parameters to URL if provided
    const urlWithParams = params 
      ? `${url}${url.includes('?') ? '&' : '?'}${new URLSearchParams(params).toString()}`
      : url;
    
    return manager.add<T>({
      method: 'GET',
      url: urlWithParams
    }, priority);
  },
  
  /**
   * Add a POST request to the initialization batch
   * 
   * @param endpoint API endpoint
   * @param data Request body
   * @param priority Priority level for the request
   * @param initManager Initialization batch manager to use (defaults to global)
   * @returns Promise that resolves with the response
   */
  post: <T = any>(
    endpoint: string,
    data?: any,
    priority: RequestPriority = RequestPriority.MEDIUM,
    initManager?: InitializationBatchManager
  ): Promise<T> => {
    const manager = initManager || getInitializationBatchManager();
    
    return manager.add<T>({
      method: 'POST',
      url: getApiUrl(endpoint),
      body: data
    }, priority);
  },
  
  /**
   * Execute all pending initialization requests
   * 
   * @param initManager Initialization batch manager to use (defaults to global)
   */
  executeAll: async (initManager?: InitializationBatchManager): Promise<void> => {
    const manager = initManager || getInitializationBatchManager();
    await manager.executeAll();
  },
  
  /**
   * Execute only critical initialization requests
   * 
   * @param initManager Initialization batch manager to use (defaults to global)
   */
  executeCritical: async (initManager?: InitializationBatchManager): Promise<void> => {
    const manager = initManager || getInitializationBatchManager();
    await manager.executeCriticalBatch();
  }
};
