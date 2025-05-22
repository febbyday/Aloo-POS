/**
 * 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
 * 
 * API Endpoint Utilities
 *
 * This module provides utilities for working with API endpoints consistently.
 * It ensures that all endpoints follow the same pattern and that API prefixes
 * are added consistently.
 */

import { apiConfig } from './config';

/**
 * Interface for endpoint configuration
 */
export interface EndpointConfig {
  path: string;
  requiresAuth?: boolean;
  cacheable?: boolean;
  idParam?: string;
}

/**
 * Interface for module endpoints configuration
 */
export interface ModuleEndpoints {
  [key: string]: EndpointConfig;
}

/**
 * Creates a standardized endpoint path
 * 
 * @param path - The relative path without API prefix
 * @returns The standardized path
 */
export const createEndpoint = (path: string): string => {
  // Ensure path starts with a slash
  const formattedPath = path.startsWith('/') ? path : `/${path}`;
  
  // Return the path without API prefix (added by API client)
  return formattedPath;
};

/**
 * Creates a parameterized endpoint path
 * 
 * @param basePath - The base path without API prefix
 * @param paramName - The parameter name
 * @returns The parameterized path
 */
export const createParamEndpoint = (basePath: string, paramName: string): string => {
  const base = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;
  return `${createEndpoint(base)}/:${paramName}`;
};

/**
 * Creates API endpoints for a feature module
 * 
 * @param moduleName - The module name
 * @param endpoints - The module endpoints configuration
 * @returns The configured module endpoints
 */
export const createModuleEndpoints = <T extends ModuleEndpoints>(
  moduleName: string, 
  endpoints: T
): { [K in keyof T]: string } => {
  const baseEndpoint = createEndpoint(moduleName);
  
  // Create a result object with the same keys but string values
  const result = {} as { [K in keyof T]: string };
  
  // Process each endpoint
  for (const key in endpoints) {
    const endpoint = endpoints[key];
    const path = endpoint.path ? `${baseEndpoint}/${endpoint.path}` : baseEndpoint;
    result[key as keyof T] = path;
  }
  
  return result;
};

/**
 * Example usage:
 * 
 * const USER_ENDPOINTS = createModuleEndpoints('users', {
 *   LIST: { path: '' },
 *   DETAIL: { path: ':id' },
 *   ROLES: { path: ':id/roles' },
 *   PERMISSIONS: { path: ':id/permissions' }
 * });
 * 
 * // USER_ENDPOINTS.LIST = '/users'
 * // USER_ENDPOINTS.DETAIL = '/users/:id'
 * // USER_ENDPOINTS.ROLES = '/users/:id/roles'
 * // USER_ENDPOINTS.PERMISSIONS = '/users/:id/permissions'
 */
