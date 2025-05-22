/**
 * API Health Check Utilities
 *
 * This file provides utilities to check the health of the API
 * and diagnose connection issues.
 */

// No imports needed for our simplified API health check implementation

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

  /**
   * Create a new ApiHealth instance
   */
  constructor() {
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
      console.warn('[ApiHealth] Error in checkHealth:', error);
      this.lastStatus = ApiStatus.UNAVAILABLE;
      this.lastChecked = new Date();
      
      // Return a clean error result without throwing
      return {
        status: ApiStatus.UNAVAILABLE,
        message: 'Error checking API health',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Ping the API (alias for checkHealth)
   * @returns Promise with the health check result
   */
  public async ping(): Promise<ApiHealthCheckResult> {
    return this.checkHealth();
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
  
  // Try multiple endpoints to maximize chance of success
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const endpoints = [
    `${baseUrl}/api/v1/health`,  // Designated health endpoint
    `${baseUrl}/api/v1`,         // Base API path
    baseUrl                      // Root as fallback
  ];
  
  // Create default result object
  let result: ApiHealthCheckResult = {
    status: ApiStatus.UNKNOWN,
    message: 'API health check in progress',
    timestamp: new Date().toISOString(),
    endpoint: endpoints[0] || 'unknown' // Provide fallback for undefined
  };

  // Create abort controller for timeout management
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5-second timeout

  try {
    // Try each endpoint in sequence until one succeeds
    for (const endpoint of endpoints) {
      try {
        console.debug(`[ApiHealth] Checking endpoint: ${endpoint}`);
        
        // Use fetch directly for more control
        // Remove headers that might cause CORS issues in development
        const isDev = import.meta.env.DEV;
        
        await fetch(endpoint, {
          method: 'GET',
          signal: controller.signal,
          // Include credentials for auth cookies
          credentials: 'include',
          // Only include minimal headers to avoid CORS issues
          headers: isDev ? {
            'Accept': 'application/json'
          } : {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });
        
        // Clear timeout since request succeeded
        clearTimeout(timeoutId);
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        // If any endpoint responds, consider the API available
        result = {
          status: ApiStatus.AVAILABLE,
          message: `API is available (${responseTime}ms)`,
          timestamp: new Date().toISOString(),
          endpoint: endpoint,
          responseTime
        };
        
        console.debug(`[ApiHealth] API is available at ${endpoint}`);
        return result;
      } catch (endpointError) {
        // Try next endpoint if this one fails
        console.debug(`[ApiHealth] Endpoint ${endpoint} failed, trying next...`, endpointError);
      }
    }
    
    // If all endpoints failed, the API is unavailable
    clearTimeout(timeoutId);
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    result = {
      status: ApiStatus.UNAVAILABLE,
      message: 'All API endpoints are unreachable',
      timestamp: new Date().toISOString(),
      endpoint: endpoints.join(', '),
      responseTime,
      error: 'Multiple connection attempts failed'
    };
  } catch (error: any) {
    // Clear timeout if we encounter an error
    clearTimeout(timeoutId);
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    console.warn('[ApiHealth] Health check failed:', error);
    
    result = {
      status: ApiStatus.UNAVAILABLE,
      message: 'API health check failed due to an unexpected error',
      timestamp: new Date().toISOString(),
      endpoint: endpoints.join(', '),
      responseTime,
      error: error?.message || 'Unknown error'
    };
  }
  
  return result;
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