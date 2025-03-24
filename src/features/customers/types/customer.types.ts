/**
 * Customer Types
 * 
 * Defines the types and interfaces for customer-related data
 */

export interface LoyaltyTier {
  id: string;
  name: string;
  level: number;
  minPoints: number;
  maxPoints: number;
  benefits: string[];
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  loyaltyPoints: number;
  loyaltyTier?: LoyaltyTier;
  createdAt: Date;
  updatedAt: Date;
  lastPurchaseDate?: Date;
  totalPurchases: number;
  status: 'active' | 'inactive' | 'blocked';
  notes?: string;
  tags?: string[];
}

export interface ApiCustomer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
  };
  loyalty_points: number;
  loyalty_tier_id?: string;
  created_at: string;
  updated_at: string;
  last_purchase_date?: string;
  total_purchases: number;
  status: string;
  notes?: string;
  tags?: string[];
}

export interface CustomerFilters {
  search?: string;
  status?: string[];
  loyaltyTier?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  tags?: string[];
}

export interface CustomerSortOptions {
  field: keyof Customer;
  direction: 'asc' | 'desc';
}

export interface CustomerPagination {
  page: number;
  limit: number;
  total: number;
}
