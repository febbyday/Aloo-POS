import type { SpecialPrice, PriceHistory, CustomerGroup } from '../types'

export const mockSpecialPrices: SpecialPrice[] = [
  {
    id: "sp1",
    productId: "prod1",
    price: 19.99,
    startDate: "2025-02-23",
    endDate: "2025-03-23",
    description: "Spring Sale",
    status: "active"
  },
  {
    id: "sp2",
    productId: "prod2",
    price: 29.99,
    startDate: "2025-03-01",
    endDate: "2025-03-15",
    customerGroupId: "group1",
    description: "VIP Customer Discount",
    status: "scheduled"
  },
  {
    id: "sp3",
    productId: "prod3",
    price: 15.99,
    startDate: "2025-01-01",
    endDate: "2025-02-01",
    description: "New Year Sale",
    status: "expired"
  }
]

export const mockPriceHistory: PriceHistory[] = [
  {
    id: "ph1",
    productId: "prod1",
    price: 24.99,
    date: "2025-02-01",
    reason: "Regular price adjustment",
    userId: "user1"
  },
  {
    id: "ph2",
    productId: "prod1",
    price: 22.99,
    date: "2025-02-10",
    reason: "Competitive pricing",
    userId: "user1"
  },
  {
    id: "ph3",
    productId: "prod1",
    price: 19.99,
    date: "2025-02-20",
    reason: "Spring sale preparation",
    userId: "user2"
  }
]

export const mockCustomerGroups: CustomerGroup[] = [
  {
    id: "group1",
    name: "VIP Customers",
    description: "Our most valued customers",
    discountType: "percentage",
    discountValue: 15
  },
  {
    id: "group2",
    name: "Wholesale",
    description: "Bulk buyers and resellers",
    discountType: "percentage",
    discountValue: 25
  },
  {
    id: "group3",
    name: "Senior Citizens",
    description: "Special discount for seniors",
    discountType: "fixed",
    discountValue: 5
  }
]
