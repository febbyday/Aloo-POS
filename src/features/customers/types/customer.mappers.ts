/**
 * Customer Mappers
 * 
 * Functions to map between UI and API customer models
 */

import type { Customer, ApiCustomer } from './customer.types';

/**
 * Maps an API customer model to a UI customer model
 */
export const toUiModel = (apiCustomer: ApiCustomer): Customer => {
  return {
    id: apiCustomer.id,
    firstName: apiCustomer.first_name,
    lastName: apiCustomer.last_name,
    email: apiCustomer.email,
    phone: apiCustomer.phone,
    address: apiCustomer.address ? {
      street: apiCustomer.address.street,
      city: apiCustomer.address.city,
      state: apiCustomer.address.state,
      zipCode: apiCustomer.address.zip_code,
      country: apiCustomer.address.country,
    } : undefined,
    loyaltyPoints: apiCustomer.loyalty_points,
    loyaltyTierId: apiCustomer.loyalty_tier_id,
    createdAt: new Date(apiCustomer.created_at),
    updatedAt: new Date(apiCustomer.updated_at),
    lastPurchaseDate: apiCustomer.last_purchase_date ? new Date(apiCustomer.last_purchase_date) : undefined,
    totalPurchases: apiCustomer.total_purchases,
    status: apiCustomer.status as Customer['status'],
    notes: apiCustomer.notes,
    tags: apiCustomer.tags,
  };
};

/**
 * Maps a UI customer model to an API customer model
 */
export const toApiModel = (customer: Partial<Customer>): Partial<ApiCustomer> => {
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
    ...(customer.lastPurchaseDate && { last_purchase_date: customer.lastPurchaseDate.toISOString() }),
    ...(customer.totalPurchases !== undefined && { total_purchases: customer.totalPurchases }),
    ...(customer.status && { status: customer.status }),
    ...(customer.notes && { notes: customer.notes }),
    ...(customer.tags && { tags: customer.tags }),
  };
}; 