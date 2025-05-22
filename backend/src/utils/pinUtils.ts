/**
 * PIN Authentication Utilities
 * 
 * This file contains utility functions for PIN authentication.
 * These functions are shared between frontend and backend to ensure consistent behavior.
 */

import { UserRole } from '@prisma/client';

/**
 * Determines if PIN authentication should be enabled for a given role
 * 
 * PIN authentication is enabled for staff roles that need quick access to the POS system:
 * - CASHIER: Needs PIN for quick POS access during shifts
 * - MANAGER: Needs PIN for quick POS access and management functions
 * - ADMIN: Needs PIN for system-wide access
 * 
 * Regular USER roles do not need PIN authentication as they typically use
 * the standard username/password login flow.
 * 
 * @param role User role
 * @returns Boolean indicating if PIN should be enabled
 */
export function shouldEnablePinForRole(role: UserRole | string): boolean {
  // Convert string role to enum if needed
  const userRole = typeof role === 'string' ? role : role.toString();
  
  return [
    UserRole.CASHIER,
    UserRole.MANAGER,
    UserRole.ADMIN
  ].includes(userRole as UserRole);
}

/**
 * Updates user data with correct PIN enablement based on role
 * 
 * @param userData User data to update
 * @returns Updated user data with correct isPinEnabled value
 */
export function updatePinEnablement<T extends { role: UserRole | string; isPinEnabled?: boolean }>(userData: T): T {
  return {
    ...userData,
    isPinEnabled: userData.isPinEnabled !== undefined 
      ? userData.isPinEnabled 
      : shouldEnablePinForRole(userData.role)
  };
}

/**
 * Validates a PIN format
 * 
 * @param pin PIN to validate
 * @returns Boolean indicating if PIN format is valid
 */
export function isValidPinFormat(pin: string): boolean {
  // PIN must be exactly 4 digits
  return /^\d{4}$/.test(pin);
}

/**
 * Checks if a PIN is common and should be rejected
 * 
 * @param pin PIN to check
 * @returns Boolean indicating if PIN is common
 */
export function isCommonPin(pin: string): boolean {
  // List of common PINs to reject
  const commonPins = [
    '0000', '1111', '2222', '3333', '4444', '5555', '6666', '7777', '8888', '9999',
    '1234', '4321', '1212', '2121', '1122', '2211', '1313', '3131', '1414', '4141',
    '2000', '2001', '2002', '2003', '2004', '2005', '2006', '2007', '2008', '2009',
    '2010', '2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019',
    '2020', '2021', '2022', '2023', '2024'
  ];
  
  return commonPins.includes(pin);
}
