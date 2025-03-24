import { z } from 'zod'
import { supplierSchema } from '@/features/suppliers/types'

/**
 * Enum for leather product types
 */
export enum LeatherProductType {
  BAG = 'Bag',
  WALLET = 'Wallet',
  BELT = 'Belt',
  JACKET = 'Jacket',
  SHOES = 'Shoes',
  OTHER = 'Other'
}

/**
 * Enum for common leather repair issues
 */
export enum RepairIssueType {
  TORN_LEATHER = 'Torn Leather',
  BROKEN_ZIPPER = 'Broken Zipper',
  FADED_COLOR = 'Faded Color',
  STITCHING_DAMAGE = 'Stitching Damage',
  BROKEN_STRAP = 'Broken Strap',
  HARDWARE_DAMAGE = 'Hardware Damage',
  LINING_DAMAGE = 'Lining Damage',
  WATER_DAMAGE = 'Water Damage',
  OTHER = 'Other'
}

/**
 * Enum for repair status
 */
export enum RepairStatus {
  PENDING = 'Pending',
  IN_PROGRESS = 'In Progress',
  WAITING_PARTS = 'Waiting for Parts',
  READY_FOR_TESTING = 'Ready for Testing',
  COMPLETED = 'Completed',
  DELIVERED = 'Delivered',
  CANCELLED = 'Cancelled'
}

/**
 * Enum for repair priority
 */
export enum RepairPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  URGENT = 'Urgent'
}

/**
 * Enum for payment methods
 */
export enum PaymentMethod {
  CASH = 'Cash',
  CARD = 'Card',
  MOBILE_MONEY = 'Mobile Money',
  BANK_TRANSFER = 'Bank Transfer'
}

/**
 * Schema for supplier reference
 */
export const supplierReferenceSchema = supplierSchema.pick({
  id: true,
  name: true,
  code: true,
})

/**
 * Schema for repair items (parts or services needed for the repair)
 */
export const repairItemSchema = z.object({
  id: z.string(),
  type: z.enum(['PART', 'SERVICE']),
  name: z.string(),
  description: z.string().optional(),
  quantity: z.number().min(1),
  unitPrice: z.number().min(0),
  supplier: supplierReferenceSchema.optional(),
  status: z.enum(['PENDING', 'ORDERED', 'RECEIVED', 'INSTALLED']),
  estimatedArrival: z.date().optional(),
})

/**
 * Schema for repair diagnostics
 */
export const repairDiagnosticsSchema = z.object({
  id: z.string(),
  timestamp: z.date(),
  technician: z.string(),
  findings: z.string(),
  recommendations: z.string(),
  estimatedCost: z.number().min(0),
  estimatedDuration: z.number().min(0), // in hours
  images: z.array(z.string()).optional(),
})

/**
 * Schema for repair work logs
 */
export const repairWorkLogSchema = z.object({
  id: z.string(),
  timestamp: z.date(),
  technician: z.string(),
  description: z.string(),
  hoursWorked: z.number().min(0),
  status: z.nativeEnum(RepairStatus),
  notes: z.string().optional(),
})

/**
 * Schema for payment records
 */
export const paymentRecordSchema = z.object({
  id: z.string(),
  timestamp: z.date(),
  amount: z.number().min(0),
  method: z.nativeEnum(PaymentMethod),
  reference: z.string().optional(),
  notes: z.string().optional(),
  isDeposit: z.boolean().default(false),
})

/**
 * Main repair schema
 */
export const repairSchema = z.object({
  id: z.string(),
  ticketNumber: z.string(),
  
  // Customer details
  customerName: z.string(),
  customerPhone: z.string(),
  customerEmail: z.string().email().optional(),
  
  // Product details
  productType: z.nativeEnum(LeatherProductType),
  productDescription: z.string(),
  productImages: z.array(z.string()).optional(),
  color: z.string().optional(),
  brand: z.string().optional(),
  serialNumber: z.string().optional(),
  
  // Repair details
  issueType: z.nativeEnum(RepairIssueType),
  issueDescription: z.string(),
  additionalNotes: z.string().optional(),
  technicianAssigned: z.string(),
  priority: z.nativeEnum(RepairPriority),
  status: z.nativeEnum(RepairStatus),
  
  // Timestamps
  createdAt: z.date(),
  updatedAt: z.date(),
  estimatedCompletionDate: z.date(),
  completedAt: z.date().optional(),
  deliveredAt: z.date().optional(),
  
  // Related data
  diagnostics: z.array(repairDiagnosticsSchema),
  items: z.array(repairItemSchema),
  workLogs: z.array(repairWorkLogSchema),
  payments: z.array(paymentRecordSchema),
  
  // Financial
  estimatedCost: z.number().min(0),
  actualCost: z.number().min(0).optional(),
  depositAmount: z.number().min(0).default(0),
  balanceDue: z.number().min(0).optional(),
  
  // Additional fields
  warranty: z.boolean().default(false),
  notifyCustomer: z.boolean().default(true),
  notes: z.string().optional(),
  cancellationReason: z.string().optional(),
})

// Types inferred from schemas
export type RepairItem = z.infer<typeof repairItemSchema>
export type RepairDiagnostics = z.infer<typeof repairDiagnosticsSchema>
export type RepairWorkLog = z.infer<typeof repairWorkLogSchema>
export type PaymentRecord = z.infer<typeof paymentRecordSchema>
export type Repair = z.infer<typeof repairSchema>

// DTOs for creating and updating repairs
export type CreateRepairDTO = Omit<Repair, 'id' | 'createdAt' | 'updatedAt' | 'actualCost' | 'completedAt' | 'deliveredAt' | 'balanceDue'>
export type UpdateRepairDTO = Partial<Omit<Repair, 'id' | 'createdAt' | 'ticketNumber'>> & { id: string }
