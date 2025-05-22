/**
 * API Batch Client
 * 
 * This module provides functionality for executing batch API requests.
 */

import axios, { AxiosRequestConfig } from 'axios';
import { API_CONSTANTS } from './config';
import { BatchRequestItem, BatchResponse, BatchRequestOptions } from './batch-request';
import { handleApiError } from './error-handler';
import { logger } from '../logging/logger';
import { performanceMonitor } from '../performance/performance-monitor';

// Batch endpoint URL
const BATCH_ENDPOINT = `${API_CONSTANTS.FULL_URL}/batch`;

/**
 * Execute a batch of API requests
 * 
 * @param batch Array of batch request items
 * @param options Batch request options
 * @returns Array of batch responses
 */
export async function executeBatch(
  batch: BatchRequestItem[],
  options: BatchRequestOptions = {}
): Promise<BatchResponse[]> {
  // Start performance tracking
  const batchId = batch.length > 0 ? batch[0].id.split('-')[0] : 'unknown';
  performanceMonitor.markStart(`api:executeBatch:${batchId}`);
  
  try {
    logger.debug('Executing batch request', { 
      batchSize: batch.length,
      batchId
    });
    
    // Create the request config
    const config: AxiosRequestConfig = {
      timeout: options.timeout || API_CONSTANTS.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      withCredentials: true
    };
    
    // Execute the batch request
    const response = await axios.post<BatchResponse[]>(BATCH_ENDPOINT, { requests: batch }, config);
    
    // Return the responses
    return response.data;
  } catch (error) {
    // Handle API errors
    logger.error('Batch request failed', { 
      error,
      batchSize: batch.length,
      batchId
    });
    
    // If the error is from Axios, convert it to an API error
    const apiError = handleApiError(error);
    
    // Create error responses for each request in the batch
    return batch.map(request => ({
      id: request.id,
      status: apiError.status || 500,
      data: null,
      error: apiError
    }));
  } finally {
    // End performance tracking
    performanceMonitor.markEnd(`api:executeBatch:${batchId}`);
  }
}

/**
 * Create a mock batch response for development/testing
 * 
 * @param batch Array of batch request items
 * @returns Array of mock batch responses
 */
export function createMockBatchResponse(batch: BatchRequestItem[]): BatchResponse[] {
  return batch.map(request => {
    // Extract endpoint from URL
    const endpoint = request.url.split('/').pop() || '';
    
    // Create mock data based on the endpoint
    let mockData: any;
    
    if (endpoint.includes('LIST')) {
      mockData = [];
    } else if (endpoint.includes('DETAIL')) {
      mockData = { id: '123', name: 'Mock Item' };
    } else {
      mockData = { success: true };
    }
    
    return {
      id: request.id,
      status: 200,
      data: mockData,
      headers: {
        'content-type': 'application/json'
      }
    };
  });
}

/**
 * Execute a batch of API requests with mock support
 * 
 * @param batch Array of batch request items
 * @param options Batch request options
 * @returns Array of batch responses
 */
export async function executeBatchWithMockSupport(
  batch: BatchRequestItem[],
  options: BatchRequestOptions = {}
): Promise<BatchResponse[]> {
  // If mock mode is enabled, return mock responses
  if (API_CONSTANTS.USE_MOCK_DATA) {
    logger.debug('Using mock data for batch request', { 
      batchSize: batch.length
    });
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return createMockBatchResponse(batch);
  }
  
  // Otherwise, execute the real batch request
  return executeBatch(batch, options);
}
