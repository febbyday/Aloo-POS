/**
 * Customers Types
 * 
 * This file defines types for the customers feature.
 */

/**
 * Customer entity
 */
export type Customer = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  createdAt: string;
  updatedAt?: string;
  loyaltyPoints: number;
  membershipLevel?: 'bronze' | 'silver' | 'gold' | 'platinum';
  totalSpent: number;
  lastOrderDate?: string | null;
  isActive: boolean;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  notes?: string;
  tags?: string[];
  birthdate?: string;
};

/**
 * Customer filter options
 */
export type CustomerFilterOptions = {
  search?: string;
  membershipLevel?: Customer['membershipLevel'];
  isActive?: boolean;
  minPoints?: number;
  maxPoints?: number;
  minSpent?: number;
  maxSpent?: number;
  tags?: string[];
  dateJoinedFrom?: string;
  dateJoinedTo?: string;
};

/**
 * Customer form values
 */
export interface CustomerFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  membershipLevel?: Customer['membershipLevel'];
  isActive?: boolean;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  notes?: string;
  tags?: string[];
}

/**
 * Loyalty related types
 */

export type LoyaltyTier = {
  id: string;
  name: string;
  minimumSpend: number;
  discount: number;
  benefits: string[];
  color: string;
};

export type LoyaltyReward = {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  isActive: boolean;
};

export type LoyaltyEvent = {
  id: string;
  name: string;
  description: string;
  pointsAwarded: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
};

export type LoyaltyTransaction = {
  id: string;
  customerId: string;
  type: 'EARN' | 'REDEEM' | 'TIER_CHANGE';
  points: number;
  source: 'PURCHASE' | 'REWARD' | 'EVENT' | 'MANUAL' | 'REFERRAL' | 'TIER_UPGRADE' | 'TIER_DOWNGRADE';
  sourceId?: string;
  description: string;
  createdAt: string;
  previousTierId?: string;
  newTierId?: string;
  spendAmount?: number;
};

export type LoyaltySettings = {
  pointsPerDollar: number;
  pointValueInCents: number;
  minimumRedemption: number;
  expiryPeriodInDays: number;
  welcomeBonus: number;
  referralBonus: number;
  birthdayBonus: number;
  isEnabled: boolean;
  termsAndConditions: string;
};
