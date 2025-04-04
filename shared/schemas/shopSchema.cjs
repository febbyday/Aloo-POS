// CommonJS version of shopSchema for backend compatibility

const { z } = require('zod');

/**
 * Shared Shop Schema
 * 
 * This schema defines the structure and validation rules for shop data
 * and is shared between frontend and backend to ensure consistency.
 */

// Shop status enum
const SHOP_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  MAINTENANCE: 'MAINTENANCE',
  CLOSED: 'CLOSED',
  PENDING: 'PENDING'
};

// Shop type enum
const SHOP_TYPE = {
  RETAIL: 'RETAIL',
  WAREHOUSE: 'WAREHOUSE',
  OUTLET: 'OUTLET',
  MARKET: 'MARKET',
  ONLINE: 'ONLINE'
};

// Operating day schema
const operatingDaySchema = z.object({
  open: z.boolean(),
  openTime: z.string().optional().nullable(),
  closeTime: z.string().optional().nullable(),
  breakStart: z.string().optional().nullable(),
  breakEnd: z.string().optional().nullable()
});

// Operating hours schema
const operatingHoursSchema = z.object({
  monday: operatingDaySchema,
  tuesday: operatingDaySchema,
  wednesday: operatingDaySchema,
  thursday: operatingDaySchema,
  friday: operatingDaySchema,
  saturday: operatingDaySchema,
  sunday: operatingDaySchema,
  holidays: z.array(z.object({
    date: z.string(),
    name: z.string(),
    closed: z.boolean(),
    specialHours: z.object({
      openTime: z.string().optional().nullable(),
      closeTime: z.string().optional().nullable()
    }).optional()
  })).optional()
});

// Address schema
const addressSchema = z.object({
  street: z.string().min(1, 'Street is required'),
  street2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
  latitude: z.number().optional(),
  longitude: z.number().optional()
});

// Manager approval settings schema
const managerApprovalSchema = z.object({
  forDiscount: z.boolean().default(true),
  forVoid: z.boolean().default(true),
  forReturn: z.boolean().default(true),
  forRefund: z.boolean().default(true),
  forPriceChange: z.boolean().default(true)
});

// Threshold settings schema
const thresholdsSchema = z.object({
  lowStock: z.number().min(0).default(5),
  criticalStock: z.number().min(0).default(2),
  reorderPoint: z.number().min(0).default(10)
});

// Shop settings schema
const shopSettingsSchema = z.object({
  allowNegativeInventory: z.boolean().default(false),
  defaultTaxRate: z.number().min(0).default(0),
  requireStockCheck: z.boolean().default(true),
  autoPrintReceipt: z.boolean().default(true),
  receiptFooter: z.string().optional(),
  receiptHeader: z.string().optional(),
  defaultDiscountRate: z.number().min(0).default(0),
  enableCashierTracking: z.boolean().default(true),
  allowReturnWithoutReceipt: z.boolean().default(false),
  maxItemsPerTransaction: z.number().optional(),
  minPasswordLength: z.number().min(6).default(8),
  requireManagerApproval: managerApprovalSchema.default({}),
  thresholds: thresholdsSchema.default({})
});

// Inventory location schema
const inventoryLocationSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),
  createdAt: z.string().optional()
});

// Staff assignment schema
const staffAssignmentSchema = z.object({
  id: z.string().optional(),
  staffId: z.string(),
  shopId: z.string(),
  role: z.string(),
  isPrimary: z.boolean().default(false),
  startDate: z.string(),
  endDate: z.string().optional().nullable(),
  schedule: z.object({
    monday: z.object({ start: z.string().optional(), end: z.string().optional() }).optional(),
    tuesday: z.object({ start: z.string().optional(), end: z.string().optional() }).optional(),
    wednesday: z.object({ start: z.string().optional(), end: z.string().optional() }).optional(),
    thursday: z.object({ start: z.string().optional(), end: z.string().optional() }).optional(),
    friday: z.object({ start: z.string().optional(), end: z.string().optional() }).optional(),
    saturday: z.object({ start: z.string().optional(), end: z.string().optional() }).optional(),
    sunday: z.object({ start: z.string().optional(), end: z.string().optional() }).optional()
  }).optional()
});

// Shop activity schema
const shopActivitySchema = z.object({
  type: z.enum(['inventory', 'staff', 'sales', 'system']),
  message: z.string(),
  timestamp: z.string().or(z.date().transform(d => d.toISOString()))
});

// Shop inventory item schema
const shopInventoryItemSchema = z.object({
  id: z.string().optional(),
  shopId: z.string(),
  productId: z.string(),
  quantity: z.number().default(0),
  minLevel: z.number().default(0),
  maxLevel: z.number().default(0),
  reorderPoint: z.number().default(0),
  reorderQuantity: z.number().default(0),
  locationId: z.string().optional(),
  lastUpdated: z.string().optional()
});

// Shop transfer schema
const shopTransferSchema = z.object({
  id: z.string().optional(),
  fromShopId: z.string(),
  toShopId: z.string(),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number(),
    notes: z.string().optional()
  })),
  status: z.enum(['PENDING', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED']),
  createdBy: z.string(),
  createdAt: z.string().optional(),
  completedAt: z.string().optional(),
  notes: z.string().optional()
});

// Base shop schema with common fields
const baseShopSchema = z.object({
  code: z.string().min(2, 'Code must be at least 2 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  address: addressSchema,
  phone: z.string().min(1, 'Phone is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  status: z.enum([SHOP_STATUS.ACTIVE, SHOP_STATUS.INACTIVE, SHOP_STATUS.MAINTENANCE, SHOP_STATUS.CLOSED, SHOP_STATUS.PENDING]).default(SHOP_STATUS.ACTIVE),
  type: z.enum([SHOP_TYPE.RETAIL, SHOP_TYPE.WAREHOUSE, SHOP_TYPE.OUTLET, SHOP_TYPE.MARKET, SHOP_TYPE.ONLINE]).default(SHOP_TYPE.RETAIL),
  manager: z.string().optional(),
  operatingHours: operatingHoursSchema.optional(),
  settings: shopSettingsSchema.optional(),
  isHeadOffice: z.boolean().default(false),
  timezone: z.string().default('UTC'),
  taxId: z.string().optional(),
  licenseNumber: z.string().optional(),
  website: z.string().optional(),
  logoUrl: z.string().optional()
});

// Schema for creating a new shop
const createShopSchema = baseShopSchema;

// Schema for updating an existing shop
const updateShopSchema = baseShopSchema.partial();

// Complete shop schema with all fields
const shopSchema = baseShopSchema.extend({
  id: z.string().optional(),
  inventoryLocations: z.array(inventoryLocationSchema).optional(),
  staffAssignments: z.array(staffAssignmentSchema).optional(),
  inventoryCount: z.number().int().optional(),
  salesLastMonth: z.number().optional(),
  averageOrderValue: z.number().optional(),
  topSellingCategories: z.array(z.string()).optional(),
  recentActivity: z.array(shopActivitySchema).optional(),
  createdAt: z.string().or(z.date().transform(d => d.toISOString())).optional(),
  updatedAt: z.string().or(z.date().transform(d => d.toISOString())).optional(),
  lastSync: z.string().or(z.date().transform(d => d.toISOString())).optional()
});

module.exports = {
  SHOP_STATUS,
  SHOP_TYPE,
  operatingDaySchema,
  operatingHoursSchema,
  addressSchema,
  managerApprovalSchema,
  thresholdsSchema,
  shopSettingsSchema,
  inventoryLocationSchema,
  staffAssignmentSchema,
  shopActivitySchema,
  shopInventoryItemSchema,
  shopTransferSchema,
  baseShopSchema,
  createShopSchema,
  updateShopSchema,
  shopSchema
};