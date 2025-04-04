/**
 * Address Types
 * 
 * This file defines TypeScript interfaces for address-related fields
 * to provide better type safety when working with these fields.
 */

/**
 * Address type for the Shop model
 */
export interface Address {
  street: string;
  street2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

/**
 * Type guard to check if a value is a valid Address
 */
export function isAddress(value: unknown): value is Address {
  if (!value || typeof value !== 'object') return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.street === 'string' &&
    typeof obj.city === 'string' &&
    typeof obj.state === 'string' &&
    typeof obj.postalCode === 'string' &&
    typeof obj.country === 'string'
  );
}
