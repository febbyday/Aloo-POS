import * as z from "zod"

export enum SUPPLIER_STATUS {
  ACTIVE = "active",
  INACTIVE = "inactive",
  PENDING = "pending",
  BLOCKED = "blocked"
}

export enum SupplierType {
  MANUFACTURER = "MANUFACTURER",
  DISTRIBUTOR = "DISTRIBUTOR",
  WHOLESALER = "WHOLESALER",
  RETAILER = "RETAILER"
}

export enum CommissionType {
  FIXED = "fixed",
  PERCENTAGE = "percentage",
  TIERED = "tiered",
  PERFORMANCE_BASED = "performance_based"
}

// Schema Definitions
export const bankingDetailsSchema = z.object({
  accountName: z.string().min(1, "Account name is required"),
  accountNumber: z.string().min(1, "Account number is required"),
  bankName: z.string().min(1, "Bank name is required"),
  branchCode: z.string().optional(),
  swiftCode: z.string().optional(),
  iban: z.string().optional(),
  bankAddress: z.string().optional()
})

export const commissionTierSchema = z.object({
  minAmount: z.number().min(0),
  maxAmount: z.number().min(0),
  rate: z.number().min(0)
})

export const performanceMetricsSchema = z.object({
  qualityThreshold: z.number().min(0).max(100),
  deliveryTimeThreshold: z.number().min(0),
  baseRate: z.number().min(0),
  bonusRate: z.number().min(0)
})

export const commissionSchema = z.object({
  type: z.nativeEnum(CommissionType),
  rate: z.number().min(0, "Rate must be positive"),
  tiers: z.array(commissionTierSchema).optional(),
  performanceMetrics: performanceMetricsSchema.optional(),
  notes: z.string().optional()
})

export const supplierSchema = z.object({
  name: z.string().min(1, "Company name is required"),
  code: z.string().min(1, "Supplier code is required"),
  type: z.string().min(1, "Type is required"),
  contactPerson: z.string().min(1, "Contact person is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  address: z.string().min(1, "Address is required"),
  website: z.string().optional(),
  taxId: z.string().min(1, "Tax ID is required"),
  notes: z.string().optional(),
  status: z.string().min(1, "Status is required"),
  bankingDetails: bankingDetailsSchema.optional(),
  commission: commissionSchema.optional()
})

// Type Definitions
export interface CommissionTier {
  minAmount: number
  maxAmount: number
  rate: number
}

export interface PerformanceMetrics {
  qualityThreshold: number
  deliveryTimeThreshold: number
  baseRate: number
  bonusRate: number
}

export interface Commission {
  type: CommissionType
  rate: number
  tiers?: CommissionTier[]
  performanceMetrics?: PerformanceMetrics
  notes?: string
}

export interface BankingDetails {
  accountName: string
  accountNumber: string
  bankName: string
  branchCode?: string
  swiftCode?: string
  iban?: string
  bankAddress?: string
}

export interface OrderHistory {
  id: string
  date: string
  amount: number
  status: string
}

export interface TopProduct {
  id: string
  name: string
  sku: string
  price: number
  stock: number
}

export interface Performance {
  onTimeDelivery: number
  qualityRating: number
  responseTime: number
  returnRate: number
  priceCompetitiveness: number
}

export interface Supplier {
  id: string
  name: string
  type: SupplierType
  contactPerson: string
  email: string
  phone: string
  products: number
  rating: number
  status: SUPPLIER_STATUS
  lastOrder: string
  address?: string
  notes?: string
  website?: string
  yearEstablished?: number
  paymentTerms?: string
  creditLimit?: number
  taxId?: string
  bankingDetails?: BankingDetails
  orderHistory?: OrderHistory[]
  topProducts?: TopProduct[]
  performance?: Performance
  commission?: Commission
}

export interface ReportDateRange {
  from: Date
  to: Date
}

export interface ReportSettings {
  showLogo: boolean
  showHeader: boolean
  showFooter: boolean
  showPageNumbers: boolean
  showTimestamp: boolean
}

export type SupplierFormValues = z.infer<typeof supplierSchema>

// Connection-related types
export type ConnectionType = 'api' | 'sftp' | 'database' | 'webhook' | 'manual';

export type SyncFrequency = 'hourly' | 'daily' | 'weekly' | 'monthly' | 'manual';

export interface ConnectionConfig {
  type: ConnectionType;
  name: string;
  baseUrl?: string;
  apiKey?: string;
  username?: string;
  password?: string;
  hostName?: string;
  port?: string;
  databaseName?: string;
  webhookUrl?: string;
  sftpPath?: string;
  syncFrequency: SyncFrequency;
  enabled: boolean;
  lastSynced: string | null;
  fieldMapping: Record<string, string>;
}

export type ConnectionStatusType = 'connected' | 'disconnected' | 'error' | 'warning';

export interface ConnectionStatus {
  status: ConnectionStatusType;
  lastChecked: string | null;
  message: string;
  latency: string | null;
  health: number | null;
}

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
  warnings: Record<string, string>;
}

export interface ConnectionHistoryItem {
  id: string;
  timestamp: string;
  type: 'sync' | 'test' | 'config' | 'error';
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: Record<string, any>;
}

// Connection validation schemas
export const connectionConfigSchema = z.object({
  type: z.enum(['api', 'sftp', 'database', 'webhook', 'manual']),
  name: z.string().min(1, 'Connection name is required'),
  baseUrl: z.string().optional(),
  apiKey: z.string().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
  hostName: z.string().optional(),
  port: z.string().optional(),
  databaseName: z.string().optional(),
  webhookUrl: z.string().optional(),
  sftpPath: z.string().optional(),
  syncFrequency: z.enum(['hourly', 'daily', 'weekly', 'monthly', 'manual']),
  enabled: z.boolean(),
  lastSynced: z.string().nullable(),
  fieldMapping: z.record(z.string())
});
