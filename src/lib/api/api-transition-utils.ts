/**
 * 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
 * API Transition Utilities
 *
 * Utility functions to help with transitioning from mock data to real API endpoints.
 * These utilities provide graceful fallbacks, error handling, and smooth transitions.
 */

import { apiClient, ApiResponse } from './api-client';
import { showApiErrorToast, ApiErrorType, ApiError } from './api-error-handler';
import { toast } from '@/lib/toast';

/**
 * Wrap an API function to handle errors gracefully during transition
 * @param apiFunc Function that calls the API
 * @param mockData Optional mock data to return if the API call fails
 * @param options Configuration options
 * @returns The API response or mock data with error information
 */
export async function withApiTransition<T>(
  apiFunc: () => Promise<ApiResponse<T>>,
  mockData?: T,
  options: {
    endpoint?: string;
    silent?: boolean;
    showToast?: boolean;
    mockIsSuccess?: boolean;
  } = {}
): Promise<ApiResponse<T> & { isMock: boolean; originalError?: Error }> {
  const {
    endpoint = 'unknown',
    silent = false,
    showToast = !silent,
    mockIsSuccess = true
  } = options;

  try {
    // Try the real API endpoint
    const response = await apiFunc();
    return { ...response, isMock: false };
  } catch (error) {
    // Handle error and use mock data if available
    if (!silent) {
      console.error(`API transition error for ${endpoint}:`, error);
    }

    // Convert to an ApiError for consistent handling
    const apiError = error instanceof ApiError
      ? error
      : new ApiError(
          error instanceof Error ? error.message : 'Unknown error',
          ApiErrorType.UNKNOWN,
          undefined,
          endpoint,
          error instanceof Error ? error : undefined
        );

    // Show toast notification if enabled
    if (showToast) {
      // Don't show toast for mock data errors during transition
      if (apiError.type !== ApiErrorType.MOCK_DISABLED) {
        showApiErrorToast(apiError);
      }
    }

    // Return mock data if available
    if (mockData !== undefined) {
      return {
        success: mockIsSuccess,
        data: mockData,
        error: apiError.message,
        message: `Using mock data for ${endpoint}`,
        isMock: true,
        originalError: apiError
      };
    }

    // Otherwise, return error response
    return {
      success: false,
      data: null as unknown as T,
      error: apiError.message,
      message: apiError.getUserFriendlyMessage(),
      isMock: false,
      originalError: apiError
    };
  }
}

/**
 * Create a version of the API client that handles transitions from mock to real endpoints
 * @param mockData Map of endpoint names to mock data
 * @returns API client with transition handling
 */
export function createTransitionApiClient<T = any>(mockData: Record<string, any> = {}) {
  // Create a proxy around the API client
  return new Proxy(apiClient, {
    get(target, prop) {
      // If the property exists on the target and is a function
      if (typeof target[prop as keyof typeof target] === 'function') {
        // Return a wrapper function that handles the transition
        return function(...args: any[]) {
          const endpoint = args[0];

          // Check if we have mock data for this endpoint
          const mockDataForEndpoint = mockData[endpoint];

          // Call the original method with transition handling
          return withApiTransition<T>(
            () => (target[prop as keyof typeof target] as Function).apply(target, args),
            mockDataForEndpoint,
            { endpoint }
          );
        };
      }

      // Otherwise, return the property as-is
      return target[prop as keyof typeof target];
    }
  });
}

/**
 * Register available real API endpoints to check their status
 * @param endpoints List of endpoints to check
 * @returns Map of endpoint status (available or not)
 */
export async function checkApiEndpointsAvailability(
  endpoints: string[]
): Promise<Record<string, boolean>> {
  const results: Record<string, boolean> = {};

  // Convert to a set for faster lookups
  const endpointSet = new Set(endpoints);

  // Check each endpoint in parallel
  const checks = Array.from(endpointSet).map(async (endpoint) => {
    try {
      const response = await apiClient.get(`${endpoint}/health-check`, {}, 0);
      results[endpoint] = response.success;
    } catch (error) {
      results[endpoint] = false;
    }
  });

  await Promise.allSettled(checks);

  if (!Object.values(results).some(Boolean)) {
    if (endpoints.length > 0) {
      toast({
        title: "API Connection Issues",
        description: "Unable to connect to any API endpoints. Some features may be limited.",
        variant: "destructive",
        duration: 5000,
      });
    }
  }

  return results;
}

export default {
  withApiTransition,
  createTransitionApiClient,
  checkApiEndpointsAvailability
};
