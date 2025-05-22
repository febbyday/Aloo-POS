/**
 * Batch Controller
 * 
 * Handles batch API requests by processing multiple requests in a single HTTP call.
 */

import { Request, Response } from 'express';
import axios, { AxiosRequestConfig, Method } from 'axios';
import { logger } from '../utils/logger';
import { AppError, ErrorType } from '../utils/errorHandling';

// Types for batch requests
interface BatchRequestItem {
  id: string;
  method: Method;
  url: string;
  body?: any;
  headers?: Record<string, string>;
}

interface BatchResponse {
  id: string;
  status: number;
  data: any;
  headers?: Record<string, string>;
  error?: {
    message: string;
    type: string;
    status: number;
    details?: any;
  };
}

/**
 * Process a batch of API requests
 */
export async function processBatch(req: Request, res: Response): Promise<void> {
  const { requests } = req.body;
  
  // Validate request
  if (!requests || !Array.isArray(requests)) {
    res.status(400).json({
      success: false,
      error: 'Invalid batch request format. Expected an array of requests.',
      errorCode: ErrorType.VALIDATION
    });
    return;
  }
  
  logger.info(`Processing batch request with ${requests.length} requests`);
  
  // Process each request in parallel
  const responses: BatchResponse[] = await Promise.all(
    requests.map(async (request: BatchRequestItem) => {
      try {
        // Extract request details
        const { id, method, url, body, headers = {} } = request;
        
        // Create request config
        const config: AxiosRequestConfig = {
          method,
          url,
          data: body,
          headers: {
            ...headers,
            // Copy authentication headers from the original request
            'Authorization': req.headers.authorization,
            'Cookie': req.headers.cookie
          }
        };
        
        // Execute the request
        const response = await axios(config);
        
        // Return the response
        return {
          id,
          status: response.status,
          data: response.data,
          headers: response.headers as Record<string, string>
        };
      } catch (error: any) {
        logger.error(`Error processing batch request item ${request.id}:`, error);
        
        // Handle Axios errors
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          return {
            id: request.id,
            status: error.response.status,
            data: null,
            error: {
              message: error.response.data?.error || error.message,
              type: error.response.data?.errorCode || ErrorType.SERVER,
              status: error.response.status,
              details: error.response.data
            }
          };
        } else if (error.request) {
          // The request was made but no response was received
          return {
            id: request.id,
            status: 0,
            data: null,
            error: {
              message: 'No response received from server',
              type: ErrorType.NETWORK,
              status: 0,
              details: { request: error.request }
            }
          };
        } else {
          // Something happened in setting up the request that triggered an Error
          return {
            id: request.id,
            status: 500,
            data: null,
            error: {
              message: error.message,
              type: ErrorType.INTERNAL,
              status: 500,
              details: { error: error.toString() }
            }
          };
        }
      }
    })
  );
  
  // Return all responses
  res.status(200).json(responses);
}

// Export the controller
export const batchController = {
  processBatch
};
