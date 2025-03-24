/**
 * Route Utilities
 * 
 * This file contains utility functions for route management.
 */

/**
 * Function to get icon component by name
 * @param iconName The name of the icon to get
 * @returns The icon name or a default value
 */
export const getIconByName = (iconName?: string) => {
  return iconName || 'Circle';
}; 