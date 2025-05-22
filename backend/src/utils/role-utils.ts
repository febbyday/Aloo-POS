import { UserRole } from '../repositories/UserRepository';

/**
 * Determines if a user role should have PIN authentication enabled by default.
 * 
 * PIN authentication is enabled for staff roles that need quick access to the POS system:
 * - CASHIER: Needs PIN for quick POS access during shifts
 * - MANAGER: Needs PIN for quick POS access and management functions
 * - ADMIN: Needs PIN for system-wide access
 * - STORE_MANAGER: Needs PIN for store-specific management
 * 
 * Regular USER roles do not need PIN authentication as they typically use
 * the standard username/password login flow.
 * 
 * @param role The user role to check
 * @returns True if the role should have PIN authentication enabled, false otherwise
 */
export function isStaffRoleWithPin(role: string): boolean {
  return [
    UserRole.CASHIER,
    UserRole.MANAGER,
    UserRole.ADMIN,
    'STORE_MANAGER' // Add this if it exists in your schema
  ].includes(role as UserRole);
}
