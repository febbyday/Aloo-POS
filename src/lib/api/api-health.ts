/**
 * API Health Check Utilities
 *
 * This file provides utilities to check the health of the API
 * and diagnose connection issues.
 */

import { apiConfig } from './config';
import { apiClient } from './api-client';

// API status enum
export enum ApiStatus {
  AVAILABLE = 'available',
  UNAVAILABLE = 'unavailable',
  UNKNOWN = 'unknown'
}

// API health check result interface
export interface ApiHealthCheckResult {
  status: ApiStatus;
  message: string;
  timestamp: string;
  endpoint?: string;
  responseTime?: number;
  error?: string;
}

/**
 * ApiHealth class for monitoring API availability
 */
export class ApiHealth {
  private lastStatus: ApiStatus = ApiStatus.UNKNOWN;
  private lastChecked: Date | null = null;
  private checkInterval: number = 60000; // 1 minute
  private apiClient: any;

  /**
   * Create a new ApiHealth instance
   * @param apiClient The API client to use for requests
   */
  constructor(apiClient: any) {
    this.apiClient = apiClient;
    this.checkHealth(); // Initial check
  }

  /**
   * Get the current API status
   * @returns The current API status
   */
  getStatus(): ApiStatus {
    // If we haven't checked recently, check again
    if (!this.lastChecked || (Date.now() - this.lastChecked.getTime() > this.checkInterval)) {
      this.checkHealth();
    }
    return this.lastStatus;
  }

  /**
   * Check the health of the API
   * @returns Promise with the health check result
   */
  async checkHealth(): Promise<ApiHealthCheckResult> {
    try {
      const result = await checkApiHealth();
      this.lastStatus = result.status;
      this.lastChecked = new Date();
      return result;
    } catch (error) {
      this.lastStatus = ApiStatus.UNAVAILABLE;
      this.lastChecked = new Date();
      return {
        status: ApiStatus.UNAVAILABLE,
        message: 'Error checking API health',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Check if the API is available
   * @returns True if the API is available
   */
  async isAvailable(): Promise<boolean> {
    const result = await this.checkHealth();
    return result.status === ApiStatus.AVAILABLE;
  }

  /**
   * Get a human-readable status message
   * @returns Status message
   */
  getStatusMessage(): string {
    return getStatusMessage(this.lastStatus);
  }
}

/**
 * Check if the API is available
 * @returns Promise with API health check result
 */
export async function checkApiHealth(): Promise<ApiHealthCheckResult> {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();

  try {
    // Normalize the base URL
    const baseUrl = apiConfig.baseUrl.endsWith('/')
      ? apiConfig.baseUrl.slice(0, -1)
      : apiConfig.baseUrl;

    // Construct the health check URL
    const healthUrl = `${baseUrl}${apiConfig.apiPrefix}/health`;

    // Add a timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    // Make the request
    const response = await fetch(healthUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      signal: controller.signal,
      cache: 'no-cache' // Prevent caching
    });

    // Clear the timeout
    clearTimeout(timeoutId);

    // Calculate response time
    const responseTime = Date.now() - startTime;

    if (response.ok) {
      return {
        status: ApiStatus.AVAILABLE,
        message: 'API is available',
        timestamp,
        endpoint: healthUrl,
        responseTime
      };
    } else {
      return {
        status: ApiStatus.UNAVAILABLE,
        message: `API returned error status: ${response.status} ${response.statusText}`,
        timestamp,
        endpoint: healthUrl,
        responseTime,
        error: `HTTP ${response.status}`
      };
    }
  } catch (error) {
    // Calculate response time even for errors
    const responseTime = Date.now() - startTime;

    return {
      status: ApiStatus.UNAVAILABLE,
      message: 'Failed to connect to API',
      timestamp,
      responseTime,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Check if the API is available and log the result
 * @returns Promise with boolean indicating if API is available
 */
export async function isApiAvailable(): Promise<boolean> {
  try {
    const result = await checkApiHealth();
    console.log('API health check result:', result);
    return result.status === ApiStatus.AVAILABLE;
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
}

/**
 * Get a human-readable status message
 * @param status API status
 * @returns Human-readable status message
 */
export function getStatusMessage(status: ApiStatus): string {
  switch (status) {
    case ApiStatus.AVAILABLE:
      return 'API is available and responding normally';
    case ApiStatus.UNAVAILABLE:
      return 'API is currently unavailable';
    case ApiStatus.UNKNOWN:
      return 'API status is unknown';
    default:
      return 'Unknown API status';
  }
}

// Export a function to check API health that can be called from the browser console
(window as any).checkApiHealth = checkApiHealth;