/**
 * API Permission Utilities
 * 
 * Utility functions for working with permissions in API calls.
 * These functions help standardize permission handling when communicating with the API.
 */

import { Permissions, getDefaultPermissions } from '../schemas/permissions';
import { 
  enhancedPermissionsToStringArray, 
  enhancedStringArrayToPermissions,
  unifiedPermissionConverter
} from './enhancedPermissionUtils';

/**
 * Prepare permissions for sending to the API
 * @param data Object containing data to send to the API
 * @param permissionField Name of the field containing permissions (default: 'permissions')
 * @returns Object with permissions converted to string array format
 */
export function preparePermissionsForApi<T extends Record<string, any>>(
  data: T, 
  permissionField: keyof T = 'permissions' as keyof T
): T {
  // Create a copy of the data
  const result = { ...data };
  
  // Check if the data contains permissions
  if (result[permissionField]) {
    try {
      // Convert permissions to string array format
      const permissions = result[permissionField];
      result[permissionField] = enhancedPermissionsToStringArray(permissions as unknown as Permissions) as any;
    } catch (error) {
      console.error('Error preparing permissions for API:', error);
      // Keep the original permissions on error
    }
  }
  
  return result;
}

/**
 * Process permissions received from the API
 * @param data Object containing data received from the API
 * @param permissionField Name of the field containing permissions (default: 'permissions')
 * @returns Object with permissions converted to standardized object format
 */
export function processPermissionsFromApi<T extends Record<string, any>>(
  data: T, 
  permissionField: keyof T = 'permissions' as keyof T
): T {
  // Create a copy of the data
  const result = { ...data };
  
  // Check if the data contains permissions
  if (result[permissionField]) {
    try {
      // Convert permissions to standardized object format
      const permissions = result[permissionField];
      result[permissionField] = unifiedPermissionConverter(permissions) as any;
    } catch (error) {
      console.error('Error processing permissions from API:', error);
      // Set default permissions on error
      result[permissionField] = getDefaultPermissions() as any;
    }
  }
  
  return result;
}

/**
 * Process an array of items with permissions received from the API
 * @param items Array of items containing permissions
 * @param permissionField Name of the field containing permissions (default: 'permissions')
 * @returns Array of items with permissions converted to standardized object format
 */
export function processItemsWithPermissions<T extends Record<string, any>>(
  items: T[], 
  permissionField: keyof T = 'permissions' as keyof T
): T[] {
  if (!Array.isArray(items)) {
    return [];
  }
  
  return items.map(item => processPermissionsFromApi(item, permissionField));
}

/**
 * Create a wrapper for API service methods that handle permissions
 * @param apiMethod API service method to wrap
 * @param options Configuration options
 * @returns Wrapped API method that handles permission conversion
 */
export function createPermissionApiWrapper<T extends (...args: any[]) => Promise<any>>(
  apiMethod: T,
  options: {
    convertRequestPermissions?: boolean;
    convertResponsePermissions?: boolean;
    requestPermissionField?: string;
    responsePermissionField?: string;
    isResponseArray?: boolean;
  } = {}
): T {
  const {
    convertRequestPermissions = true,
    convertResponsePermissions = true,
    requestPermissionField = 'permissions',
    responsePermissionField = 'permissions',
    isResponseArray = false
  } = options;
  
  // Create the wrapper function
  const wrappedMethod = async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    try {
      // Convert request permissions if needed
      let processedArgs = [...args];
      if (convertRequestPermissions && args.length > 0 && typeof args[0] === 'object' && args[0] !== null) {
        processedArgs[0] = preparePermissionsForApi(args[0], requestPermissionField as any);
      }
      
      // Call the original API method
      const response = await apiMethod(...processedArgs as Parameters<T>);
      
      // Convert response permissions if needed
      if (convertResponsePermissions && response) {
        if (isResponseArray && Array.isArray(response)) {
          return processItemsWithPermissions(response, responsePermissionField as any) as ReturnType<T>;
        } else if (typeof response === 'object' && response !== null) {
          return processPermissionsFromApi(response, responsePermissionField as any) as ReturnType<T>;
        }
      }
      
      return response;
    } catch (error) {
      console.error('Error in permission API wrapper:', error);
      throw error;
    }
  };
  
  return wrappedMethod as T;
}
