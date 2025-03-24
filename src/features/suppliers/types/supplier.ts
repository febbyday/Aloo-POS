import { z } from 'zod'

/**
 * Base supplier schema that defines the core fields and their validation rules.
 * This schema is used for both data validation and type inference.
 */
export const supplierSchema = z.object({
  /** Unique identifier for the supplier */
  id: z.string(),
  
  /** Supplier's business code (e.g., SUP001). Must be at least 3 characters and uppercase */
  code: z.string().min(3, "Code must be at least 3 characters").toUpperCase(),
  
  /** Supplier's business or trading name */
  name: z.string().min(2, "Name must be at least 2 characters"),
  
  /** Type of supplier (e.g., Manufacturer, Wholesaler) */
  type: z.string().min(1, "Please select a supplier type"),
  
  /** Name of the primary contact person */
  contactPerson: z.string().min(2, "Contact person must be at least 2 characters"),
  
  /** Business email address for the supplier */
  email: z.string().email("Invalid email address"),
  
  /** Contact phone number */
  phone: z.string().min(8, "Phone number must be at least 8 characters"),
  
  /** Physical or mailing address */
  address: z.string().min(5, "Address must be at least 5 characters"),
  
  /** Business website URL (optional) */
  website: z.string().url("Invalid URL").optional(),
  
  /** Tax identification number */
  taxId: z.string().min(5, "Tax ID must be at least 5 characters"),
  
  /** Additional notes or comments about the supplier */
  notes: z.string().optional(),
  
  /** Current status of the supplier relationship */
  status: z.enum(["Active", "Inactive"]),
  
  /** Number of products supplied by this supplier */
  products: z.number().default(0),
  
  /** Supplier rating (0-5) based on performance metrics */
  rating: z.number().min(0).max(5).default(0),
  
  /** Date of the last order placed with this supplier */
  lastOrder: z.string().optional(),
  
  /** Banking details for the supplier */
  bankingDetails: z.object({
    accountName: z.string(),
    accountNumber: z.string(),
    bankName: z.string(),
    branchCode: z.string(),
    swiftCode: z.string().optional(),
    iban: z.string().optional(),
    bankAddress: z.string().optional(),
  }).optional(),
})

/** 
 * Core supplier type that represents a supplier entity in the system.
 * This type is inferred from the supplierSchema and includes all possible fields.
 */
export type Supplier = z.infer<typeof supplierSchema>

/** 
 * Data transfer object type for creating a new supplier.
 * Excludes auto-generated fields that shouldn't be provided during creation.
 */
export type CreateSupplierDTO = Omit<Supplier, 'id' | 'products' | 'rating' | 'lastOrder'>

/** 
 * Data transfer object type for updating an existing supplier.
 * Makes all fields optional except the ID, allowing partial updates.
 */
export type UpdateSupplierDTO = Partial<Omit<Supplier, 'id'>> & { id: string }

/** 
 * Type used for supplier form handling.
 * Excludes system-managed fields that shouldn't be edited through forms.
 */
export type SupplierFormValues = Omit<Supplier, 'id' | 'products' | 'rating' | 'lastOrder'>

/** 
 * Minimal supplier reference type used when referencing a supplier from other models.
 * Contains only the essential identifying information.
 */
export type SupplierReference = Pick<Supplier, 'id' | 'name' | 'code'>

/** 
 * Enumeration of possible supplier types.
 * Used to ensure consistency in supplier categorization.
 */
export enum SupplierType {
  /** Produces goods directly */
  MANUFACTURER = 'Manufacturer',
  /** Sells goods in large quantities */
  WHOLESALER = 'Wholesaler',
  /** Distributes goods to retailers */
  DISTRIBUTOR = 'Distributor',
  /** Imports goods from foreign markets */
  IMPORTER = 'Importer',
  /** Other types of suppliers */
  OTHER = 'Other',
}

/** 
 * Constants for supplier status values.
 * Used to ensure consistency in status references.
 */
export const SUPPLIER_STATUS = {
  /** Supplier is currently active and available for orders */
  ACTIVE: 'Active',
  /** Supplier is temporarily or permanently inactive */
  INACTIVE: 'Inactive',
} as const

/** 
 * Interface for tracking supplier performance metrics.
 * Used for evaluating and monitoring supplier reliability and efficiency.
 */
export interface SupplierPerformanceMetrics {
  /** ID of the supplier these metrics belong to */
  supplierId: string
  
  /** Average delivery time in days */
  deliveryTimeAvg: number
  
  /** Quality score (0-100) based on product quality and returns */
  qualityScore: number
  
  /** Percentage of orders fulfilled completely and on time */
  orderFulfillmentRate: number
  
  /** Average response time to inquiries in hours */
  responseTime: number
  
  /** Date of the last performance evaluation */
  lastEvaluation: Date
}

/**
 * Interface for supplier sales reporting data.
 * Used for generating performance reports and analytics.
 */
export interface SupplierSalesData extends SupplierReference {
  /** Total sales value for the reporting period */
  totalSales: number
  
  /** Performance metrics for the reporting period */
  performance: {
    /** Sales from the previous period for comparison */
    previousPeriodSales: number
    /** Percentage change in sales from previous period */
    percentChange: number
    /** Achievement percentage against target (if applicable) */
    targetAchievement?: number
    /** Inventory-related metrics */
    inventoryMetrics: {
      /** Total value of current stock */
      totalStockValue: number
      /** Average inventory turnover rate */
      averageTurnoverRate: number
      /** Number of products with low stock */
      lowStockCount: number
      /** Number of products with excess stock */
      overstockCount: number
    }
  }
  
  /** List of products and their performance */
  products: Array<{
    /** Product name */
    name: string
    /** Stock keeping unit */
    sku: string
    /** Total sales for the product */
    sales: number
    /** Current stock level */
    stock: number
    /** Current stock status */
    status: 'In Stock' | 'Low Stock' | 'Out of Stock'
  }>
}
