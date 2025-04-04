import { z } from "zod";

// Market status enum
export enum MARKET_STATUS {
  PLANNING = "planning",
  PREPARING = "preparing",
  ACTIVE = "active",
  CLOSED = "closed",
  CANCELLED = "cancelled"
}

// Market schemas
export const MarketSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Market name must be at least 2 characters"),
  location: z.string().min(2, "Location must be at least 2 characters"),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()),
  status: z.nativeEnum(MARKET_STATUS).default(MARKET_STATUS.PLANNING),
  progress: z.number().min(0).max(100).default(0),
  stockAllocation: z.record(z.any()).optional(),
  staffAssigned: z.record(z.any()).optional(),
  settings: z.record(z.any()).optional(),
  createdAt: z.string().or(z.date()).optional(),
  updatedAt: z.string().or(z.date()).optional()
});

export const StockAllocationSchema = z.object({
  id: z.string().optional(),
  marketId: z.string(),
  productId: z.string(),
  allocated: z.number().min(0),
  total: z.number().min(0),
  sold: z.number().min(0).optional().default(0),
  returned: z.number().min(0).optional().default(0),
  damaged: z.number().min(0).optional().default(0),
  notes: z.string().optional(),
  lastUpdated: z.string().or(z.date()).optional()
});

export const StaffAssignmentSchema = z.object({
  id: z.string().optional(),
  marketId: z.string(),
  staffId: z.string(), 
  role: z.string(),
  assignedAt: z.string().or(z.date()),
  shiftStart: z.string().or(z.date()),
  shiftEnd: z.string().or(z.date()),
  notes: z.string().optional(),
  confirmed: z.boolean().default(false)
});

export const MarketSettingsSchema = z.object({
  marketId: z.string(),
  enableLocationTracking: z.boolean().default(false),
  defaultCurrency: z.string().default("USD"),
  marketCodePrefix: z.string().optional(),
  enableMarketAnalysis: z.boolean().default(true),
  analysisFrequency: z.string().default("daily"),
  demographicTracking: z.boolean().default(false),
  performanceMetrics: z.array(z.string()).default(["sales", "footTraffic", "conversion"]),
  paymentMethods: z.array(z.string()).default(["cash", "card", "mobile"]),
  requireStaffConfirmation: z.boolean().default(true),
  autoAllocateStock: z.boolean().default(false),
  notificationSettings: z.record(z.boolean()).optional()
});

export const MarketLocationSchema = z.object({
  marketId: z.string(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  coordinates: z.object({
    latitude: z.number().optional(),
    longitude: z.number().optional()
  }).optional(),
  venueNotes: z.string().optional(),
  setupInstructions: z.string().optional(),
  accessDetails: z.string().optional(),
  boothSize: z.object({
    width: z.number().optional(),
    length: z.number().optional(),
    height: z.number().optional(), 
    unit: z.string().default("m")
  }).optional()
});

export const MarketPerformanceSchema = z.object({
  id: z.string().optional(),
  marketId: z.string(),
  date: z.string().or(z.date()),
  salesTotal: z.number().min(0).default(0),
  transactionCount: z.number().min(0).default(0),
  averageTransactionValue: z.number().min(0).default(0),
  footTraffic: z.number().min(0).optional(),
  conversionRate: z.number().min(0).max(100).optional(),
  topSellingProducts: z.array(z.object({
    productId: z.string(),
    quantity: z.number(),
    revenue: z.number()
  })).optional(),
  staffPerformance: z.record(z.number()).optional(),
  weatherConditions: z.string().optional(),
  notes: z.string().optional()
});

export const MarketFilterSchema = z.object({
  status: z.nativeEnum(MARKET_STATUS).optional(),
  startDateFrom: z.string().or(z.date()).optional(),
  startDateTo: z.string().or(z.date()).optional(),
  location: z.string().optional(),
  searchTerm: z.string().optional(),
  sortBy: z.string().optional().default("startDate"),
  sortDirection: z.string().optional().default("asc"),
  page: z.number().min(1).optional().default(1),
  limit: z.number().min(1).optional().default(10)
});

// Form schemas
export const CreateMarketSchema = MarketSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const UpdateMarketSchema = MarketSchema.partial().omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const CreateStockAllocationSchema = StockAllocationSchema.omit({ 
  id: true, 
  lastUpdated: true 
});

export const CreateStaffAssignmentSchema = StaffAssignmentSchema.omit({ 
  id: true 
});

// Inferred types
export type Market = z.infer<typeof MarketSchema>;
export type StockAllocation = z.infer<typeof StockAllocationSchema>;
export type StaffAssignment = z.infer<typeof StaffAssignmentSchema>;
export type MarketSettings = z.infer<typeof MarketSettingsSchema>;
export type MarketLocation = z.infer<typeof MarketLocationSchema>;
export type MarketPerformance = z.infer<typeof MarketPerformanceSchema>;
export type MarketFilter = z.infer<typeof MarketFilterSchema>;

// Form types
export type CreateMarketInput = z.infer<typeof CreateMarketSchema>;
export type UpdateMarketInput = z.infer<typeof UpdateMarketSchema>;
export type CreateStockAllocationInput = z.infer<typeof CreateStockAllocationSchema>;
export type CreateStaffAssignmentInput = z.infer<typeof CreateStaffAssignmentSchema>; 