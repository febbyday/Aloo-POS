// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤

import { NetworkErrorCode, NetworkError } from '../utils/errorTypes';

// Configuration
const DEFAULT_TIMEOUT = 5000; // 5 seconds
const HEALTH_CHECK_INTERVAL = 30000; // 30 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

/**
 * Health status type
 */
export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy' | 'unknown';

/**
 * Health check result interface
 */
export interface HealthCheckResult {
  status: HealthStatus;
  timestamp: Date;
  services: Record<string, {
    status: HealthStatus;
    responseTime?: number;
    message?: string;
    lastChecked: Date;
  }>;
  environment: string;
  version: string;
}

/**
 * Health Check Service
 * Provides functionality to check system health
 */
export class HealthCheckService {
  private static instance: HealthCheckService;
  private healthStatus: HealthCheckResult;
  private checkInterval: NodeJS.Timeout | null = null;
  private endpoints: Map<string, string> = new Map();
  private eventListeners: Map<string, Set<Function>> = new Map();

  private constructor() {
    this.healthStatus = {
      status: 'unknown',
      timestamp: new Date(),
      services: {},
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0'
    };
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): HealthCheckService {
    if (!HealthCheckService.instance) {
      HealthCheckService.instance = new HealthCheckService();
    }
    return HealthCheckService.instance;
  }

  /**
   * Register a service endpoint to be health-checked
   * 
   * @param serviceName Service identifier
   * @param endpoint Health check endpoint URL
   */
  public registerEndpoint(serviceName: string, endpoint: string): void {
    this.endpoints.set(serviceName, endpoint);
    this.healthStatus.services[serviceName] = {
      status: 'unknown',
      lastChecked: new Date()
    };
  }

  /**
   * Start periodic health checks
   * 
   * @param interval Check interval in milliseconds
   */
  public startMonitoring(interval: number = HEALTH_CHECK_INTERVAL): void {
    // Clear existing interval if any
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    // Set up new interval
    this.checkInterval = setInterval(() => {
      this.checkAllServices().catch(err => 
        console.error('Error during health check:', err)
      );
    }, interval);

    // Initial check
    this.checkAllServices().catch(err => 
      console.error('Error during initial health check:', err)
    );
  }

  /**
   * Stop health check monitoring
   */
  public stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * Check all registered services
   */
  public async checkAllServices(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    let overallStatus: HealthStatus = 'healthy';

    // Check each endpoint
    for (const [serviceName, endpoint] of this.endpoints.entries()) {
      try {
        const status = await this.checkServiceHealth(endpoint);
        this.healthStatus.services[serviceName] = {
          ...status,
          lastChecked: new Date()
        };

        // Update overall status based on service status
        if (status.status === 'unhealthy' && overallStatus !== 'unhealthy') {
          overallStatus = 'unhealthy';
        } else if (status.status === 'degraded' && overallStatus === 'healthy') {
          overallStatus = 'degraded';
        }
      } catch (error) {
        console.error(`Health check failed for ${serviceName}:`, error);
        this.healthStatus.services[serviceName] = {
          status: 'unhealthy',
          message: error instanceof Error ? error.message : 'Unknown error',
          lastChecked: new Date()
        };
        overallStatus = 'unhealthy';
      }
    }

    // Update overall status
    this.healthStatus = {
      ...this.healthStatus,
      status: overallStatus,
      timestamp: new Date()
    };

    // Emit health changed event
    this.emitEvent('healthChanged', this.healthStatus);

    return this.healthStatus;
  }

  /**
   * Check health of a specific service
   * 
   * @param endpoint Service health endpoint
   * @param timeout Request timeout in milliseconds
   * @param retries Number of retries on failure
   * @returns Health status information
   */
  private async checkServiceHealth(
    endpoint: string,
    timeout: number = DEFAULT_TIMEOUT,
    retries: number = MAX_RETRIES
  ): Promise<{ status: HealthStatus; responseTime?: number; message?: string }> {
    let attempt = 0;
    
    while (attempt < retries) {
      const startTime = Date.now();
      
      try {
        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        // Make request
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          },
          signal: controller.signal
        });
        
        // Clear timeout
        clearTimeout(timeoutId);
        
        // Calculate response time
        const responseTime = Date.now() - startTime;
        
        // Check response
        if (!response.ok) {
          throw new NetworkError(
            `Service returned status ${response.status}`,
            NetworkErrorCode.API_UNAVAILABLE,
            response.status
          );
        }
        
        // Try to parse response as JSON
        let responseData;
        try {
          responseData = await response.json();
        } catch (e) {
          // Not JSON, but status was OK
          return {
            status: 'healthy',
            responseTime,
            message: 'Service is up but did not return JSON'
          };
        }
        
        // Check if response has status field
        if (responseData.status) {
          return {
            status: this.mapStatusString(responseData.status),
            responseTime,
            message: responseData.message || 'Service is healthy'
          };
        }
        
        // Default to healthy if status code is OK
        return {
          status: 'healthy',
          responseTime,
          message: 'Service responded with OK status'
        };
      } catch (error) {
        attempt++;
        
        // Check if this was final attempt
        if (attempt >= retries) {
          // Determine error type
          if (error.name === 'AbortError') {
            return {
              status: 'unhealthy',
              responseTime: timeout,
              message: `Service timed out after ${timeout}ms`
            };
          }
          
          return {
            status: 'unhealthy',
            message: error instanceof Error ? error.message : 'Unknown error occurred'
          };
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      }
    }
    
    // Should not reach here, but just in case
    return {
      status: 'unknown',
      message: 'Could not determine service status'
    };
  }

  /**
   * Get current health status
   */
  public getHealthStatus(): HealthCheckResult {
    return this.healthStatus;
  }

  /**
   * Register event listener
   * 
   * @param event Event name
   * @param callback Callback function
   */
  public on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);
  }

  /**
   * Remove event listener
   * 
   * @param event Event name
   * @param callback Callback function
   */
  public off(event: string, callback: Function): void {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event)!.delete(callback);
    }
  }

  /**
   * Emit event to all listeners
   * 
   * @param event Event name
   * @param data Event data
   */
  private emitEvent(event: string, data: any): void {
    if (this.eventListeners.has(event)) {
      for (const callback of this.eventListeners.get(event)!) {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} event listener:`, error);
        }
      }
    }
  }

  /**
   * Map various status string formats to standard status
   * 
   * @param status Original status string
   * @returns Standardized health status
   */
  private mapStatusString(status: string): HealthStatus {
    const lowerStatus = String(status).toLowerCase();
    
    if (['ok', 'up', 'healthy', 'available', 'green'].includes(lowerStatus)) {
      return 'healthy';
    }
    
    if (['degraded', 'warning', 'limited', 'yellow', 'partial'].includes(lowerStatus)) {
      return 'degraded';
    }
    
    if (['down', 'unhealthy', 'unavailable', 'red', 'critical', 'error'].includes(lowerStatus)) {
      return 'unhealthy';
    }
    
    return 'unknown';
  }
}
