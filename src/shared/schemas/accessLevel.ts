/**
 * AccessLevel Enum
 * 
 * Standardized access level definitions for permission system.
 * This enum is used consistently across frontend and backend.
 */

export enum AccessLevel {
  NONE = 'none',         // No access
  SELF = 'self',         // Access to own resources only
  DEPARTMENT = 'dept',   // Access limited to department resources
  ALL = 'all'            // Access to all resources
}

/**
 * Convert legacy numeric access level to standardized string access level
 * @param numericLevel Legacy numeric access level
 * @returns Standardized string access level
 */
export function convertNumericAccessLevel(numericLevel: number): AccessLevel {
  switch (numericLevel) {
    case 0:
      return AccessLevel.NONE;
    case 1:
    case 2:
    case 3:
      return AccessLevel.SELF;
    case 5:
      return AccessLevel.DEPARTMENT;
    case 4:
    case 6:
    default:
      return AccessLevel.ALL;
  }
}

/**
 * Convert standardized string access level to legacy numeric access level
 * @param stringLevel Standardized string access level
 * @returns Legacy numeric access level
 */
export function convertStringAccessLevel(stringLevel: AccessLevel): number {
  switch (stringLevel) {
    case AccessLevel.NONE:
      return 0;
    case AccessLevel.SELF:
      return 6;
    case AccessLevel.DEPARTMENT:
      return 5;
    case AccessLevel.ALL:
    default:
      return 4;
  }
}
