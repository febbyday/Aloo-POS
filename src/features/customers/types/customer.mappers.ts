/**
 * Customer Mappers
 * 
 * Functions to map between UI and API customer models
 */

import type { Customer, ApiCustomer } from './customer.types';

/**
 * Safely converts string date to Date object
 * Returns the original string if conversion fails
 */
const safelyParseDate = (dateStr: string | null | undefined): Date | string | null => {
  if (!dateStr) return null;
  
  try {
    const date = new Date(dateStr);
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn(`Invalid date string: ${dateStr}`);
      return dateStr; // Return original string if parsing fails
    }
    return date;
  } catch (error) {
    console.error(`Error parsing date: ${dateStr}`, error);
    return dateStr; // Return original string if parsing throws
  }
};

/**
 * Maps an API customer model to a UI customer model
 */
export const toUiModel = (apiCustomer: ApiCustomer): Customer => {
  // Debug log the input
  console.log('Mapping API customer to UI model:', apiCustomer);
  
  if (!apiCustomer) {
    console.error('Received null or undefined apiCustomer in toUiModel');
    // Create minimal valid customer to prevent UI errors
    return {
      id: '',
      firstName: '',
      lastName: '',
      email: '',
      loyaltyPoints: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      totalPurchases: 0,
      status: 'active',
    };
  }

  // Map with defensive coding for all fields
  const result = {
    id: apiCustomer.id || '',
    firstName: apiCustomer.first_name || '',
    lastName: apiCustomer.last_name || '',
    email: apiCustomer.email || '',
    phone: apiCustomer.phone,
    address: apiCustomer.address ? {
      street: apiCustomer.address.street || '',
      city: apiCustomer.address.city || '',
      state: apiCustomer.address.state || '',
      zipCode: apiCustomer.address.zip_code || '',
      country: apiCustomer.address.country || '',
    } : undefined,
    loyaltyPoints: Number(apiCustomer.loyalty_points || 0),
    loyaltyTierId: apiCustomer.loyalty_tier_id,
    createdAt: safelyParseDate(apiCustomer.created_at) || new Date(),
    updatedAt: safelyParseDate(apiCustomer.updated_at) || new Date(),
    lastPurchaseDate: safelyParseDate(apiCustomer.last_purchase_date),
    totalPurchases: Number(apiCustomer.total_purchases || 0),
    status: (apiCustomer.status || 'active') as Customer['status'],
    notes: apiCustomer.notes,
    tags: apiCustomer.tags || [],
  };
  
  console.log('Mapped to UI customer:', result);
  return result;
};

/**
 * Maps a UI customer model to an API customer model
 */
export const toApiModel = (customer: Partial<Customer>): Partial<ApiCustomer> => {
  // Safe date to ISO string conversion
  const dateToISOString = (date: Date | string | null | undefined): string | undefined => {
    if (!date) return undefined;
    
    if (typeof date === 'string') return date;
    
    try {
      if (date instanceof Date && !isNaN(date.getTime())) {
        return date.toISOString();
      }
      return undefined;
    } catch (error) {
      console.error('Error converting date to ISO string:', error);
      return undefined;
    }
  };

  return {
    ...(customer.id && { id: customer.id }),
    ...(customer.firstName && { first_name: customer.firstName }),
    ...(customer.lastName && { last_name: customer.lastName }),
    ...(customer.email && { email: customer.email }),
    ...(customer.phone && { phone: customer.phone }),
    ...(customer.address && {
      address: {
        street: customer.address.street,
        city: customer.address.city,
        state: customer.address.state,
        zip_code: customer.address.zipCode,
        country: customer.address.country,
      }
    }),
    ...(customer.loyaltyPoints !== undefined && { loyalty_points: customer.loyaltyPoints }),
    ...(customer.loyaltyTierId && { loyalty_tier_id: customer.loyaltyTierId }),
    ...(customer.lastPurchaseDate && { last_purchase_date: dateToISOString(customer.lastPurchaseDate) }),
    ...(customer.totalPurchases !== undefined && { total_purchases: customer.totalPurchases }),
    ...(customer.status && { status: customer.status }),
    ...(customer.notes && { notes: customer.notes }),
    ...(customer.tags && { tags: customer.tags }),
  };
}; 