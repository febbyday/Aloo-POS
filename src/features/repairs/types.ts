import { z } from 'zod'

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

export enum RepairStatus {
  PENDING = 'Pending',
  IN_PROGRESS = 'In Progress',
  WAITING_PARTS = 'Waiting for Parts',
  READY_FOR_TESTING = 'Ready for Testing',
  COMPLETED = 'Completed',
  DELIVERED = 'Delivered',
  CANCELLED = 'Cancelled'
}

export enum RepairPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  URGENT = 'Urgent'
}

export enum LeatherProductType {
  SHOES = 'Shoes',
  BOOTS = 'Boots',
  BAGS = 'Bags',
  WALLETS = 'Wallets',
  BELTS = 'Belts',
  JACKETS = 'Jackets',
  OTHER = 'Other'
}

export interface DiagnosticEntry {
  id: string
  timestamp: Date
  technician: string
  findings: string
  recommendations: string
  estimatedCost: number
  estimatedDuration: number
}

export interface WorkLogEntry {
  id: string
  timestamp: Date
  technician: string
  description: string
}

export interface RepairItem {
  name: string
  quantity: number
  unitPrice: number
}

export interface Repair {
  id: string
  ticketNumber: string
  customerName: string
  customerPhone: string
  customerEmail: string
  productName: string
  productBrand: string
  productModel: string
  productType: LeatherProductType
  productSerial?: string
  issueDescription: string
  status: RepairStatus
  priority: RepairPriority
  estimatedCost: number
  actualCost: number
  createdAt: Date
  dueDate: Date
  completedAt?: Date
  paymentDate?: Date
  isPaid: boolean
  workLogs: WorkLogEntry[]
  items: RepairItem[]
  notes?: string
  technician?: string
  workLog?: WorkLogEntry[]
}

export const diagnosticEntrySchema = z.object({
  id: z.string().min(1, 'Id is required'),
  timestamp: z.date(),
  technician: z.string().min(1, 'Technician is required'),
  findings: z.string().min(1, 'Findings are required'),
  recommendations: z.string().min(1, 'Recommendations are required'),
  estimatedCost: z.number().min(0, 'Estimated cost must be non-negative'),
  estimatedDuration: z.number().min(0, 'Estimated duration must be non-negative')
})

export const workLogEntrySchema = z.object({
  id: z.string().min(1, 'Id is required'),
  timestamp: z.date(),
  technician: z.string().min(1, 'Technician is required'),
  description: z.string().min(1, 'Description is required')
})

export const repairItemSchema = z.object({
  name: z.string().min(1, 'Item name is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unitPrice: z.number().min(0, 'Unit price must be non-negative')
})

export const repairSchema = z.object({
  id: z.string().optional(),
  ticketNumber: z.string().min(1, 'Ticket number is required'),
  customerName: z.string().min(1, 'Customer name is required'),
  customerPhone: z.string().min(1, 'Customer phone is required'),
  customerEmail: z.string().email('Invalid email address'),
  productName: z.string().min(1, 'Product name is required'),
  productBrand: z.string().min(1, 'Product brand is required'),
  productModel: z.string().min(1, 'Product model is required'),
  productType: z.nativeEnum(LeatherProductType),
  productSerial: z.string().optional(),
  issueDescription: z.string().min(1, 'Issue description is required'),
  status: z.nativeEnum(RepairStatus).default(RepairStatus.PENDING),
  priority: z.nativeEnum(RepairPriority).default(RepairPriority.MEDIUM),
  estimatedCost: z.number().min(0, 'Estimated cost must be non-negative'),
  actualCost: z.number().min(0, 'Actual cost must be non-negative'),
  createdAt: z.date().default(() => new Date()),
  dueDate: z.date(),
  completedAt: z.date().optional(),
  paymentDate: z.date().optional(),
  isPaid: z.boolean().default(false),
  workLogs: z.array(workLogEntrySchema).default([]),
  items: z.array(repairItemSchema).default([]),
  notes: z.string().optional(),
  technician: z.string().optional(),
  workLog: z.array(workLogEntrySchema).optional()
})