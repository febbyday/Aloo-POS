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

// Repair status enum
export enum REPAIR_STATUS {
  PENDING = 'PENDING',
  DIAGNOSED = 'DIAGNOSED',
  IN_PROGRESS = 'IN_PROGRESS',
  WAITING_FOR_PARTS = 'WAITING_FOR_PARTS',
  WAITING_FOR_CUSTOMER = 'WAITING_FOR_CUSTOMER',
  COMPLETED = 'COMPLETED',
  CANCELED = 'CANCELED',
  PICKED_UP = 'PICKED_UP'
}

// Repair priority enum
export enum REPAIR_PRIORITY {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

// Repair Device Type enum
export enum DEVICE_TYPE {
  COMPUTER = 'COMPUTER',
  LAPTOP = 'LAPTOP',
  TABLET = 'TABLET',
  PHONE = 'PHONE',
  PRINTER = 'PRINTER',
  OTHER = 'OTHER'
}

// Diagnosis Report Schema
export const DiagnosisReportSchema = z.object({
  id: z.string().optional(),
  repairId: z.string(),
  findings: z.string().min(1, 'Findings are required'),
  recommendation: z.string().min(1, 'Recommendation is required'),
  technicianId: z.string(),
  technicianName: z.string().optional(),
  estimatedCompletionTime: z.string().optional(),
  estimatedCost: z.number().nonnegative().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});

// Repair Part Schema
export const RepairPartSchema = z.object({
  id: z.string().optional(),
  repairId: z.string(),
  productId: z.string(),
  productName: z.string().optional(),
  quantity: z.number().int().positive(),
  unitCost: z.number().nonnegative(),
  totalCost: z.number().nonnegative().optional(),
  isOrdered: z.boolean().default(false),
  isReceived: z.boolean().default(false),
  isInstalled: z.boolean().default(false),
  notes: z.string().optional(),
  orderedAt: z.string().optional(),
  receivedAt: z.string().optional()
});

// Service Charge Schema
export const ServiceChargeSchema = z.object({
  id: z.string().optional(),
  repairId: z.string(),
  description: z.string().min(1, 'Description is required'),
  amount: z.number().nonnegative(),
  category: z.string(),
  isBillable: z.boolean().default(true),
  isTaxable: z.boolean().default(true),
  taxRate: z.number().nonnegative().optional(),
  totalWithTax: z.number().nonnegative().optional(),
  createdAt: z.string().optional(),
  technicianId: z.string().optional()
});

// Repair Status Update Schema
export const StatusUpdateSchema = z.object({
  id: z.string().optional(),
  repairId: z.string(),
  status: z.nativeEnum(REPAIR_STATUS),
  notes: z.string().optional(),
  updatedById: z.string(),
  updatedByName: z.string().optional(),
  createdAt: z.string().optional()
});

// Repair Ticket Schema
export const RepairTicketSchema = z.object({
  id: z.string().optional(),
  ticketNumber: z.string().optional(),
  customerId: z.string(),
  customerName: z.string().optional(),
  deviceType: z.nativeEnum(DEVICE_TYPE),
  brand: z.string().optional(),
  model: z.string().optional(),
  serialNumber: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
  problemDescription: z.string().min(1, 'Problem description is required'),
  status: z.nativeEnum(REPAIR_STATUS).default(REPAIR_STATUS.PENDING),
  priority: z.nativeEnum(REPAIR_PRIORITY).default(REPAIR_PRIORITY.MEDIUM),
  assignedToId: z.string().optional(),
  assignedToName: z.string().optional(),
  estimatedCompletionDate: z.string().optional(),
  actualCompletionDate: z.string().optional(),
  createdById: z.string(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  diagnosis: z.array(DiagnosisReportSchema).optional(),
  parts: z.array(RepairPartSchema).optional(),
  charges: z.array(ServiceChargeSchema).optional(),
  statusHistory: z.array(StatusUpdateSchema).optional(),
  customerContact: z.string().optional(),
  customerEmail: z.string().email().optional(),
  customerPhone: z.string().optional(),
  notes: z.string().optional(),
  depositAmount: z.number().nonnegative().default(0),
  isWarranty: z.boolean().default(false),
  warrantyDetails: z.string().optional(),
  isInsurance: z.boolean().default(false),
  insuranceDetails: z.string().optional(),
  isUnderContract: z.boolean().default(false),
  contractDetails: z.string().optional()
});

// Form schema for creating a repair
export const CreateRepairSchema = RepairTicketSchema.omit({ 
  id: true, 
  ticketNumber: true,
  createdAt: true,
  updatedAt: true,
  statusHistory: true 
});

// Form schema for updating a repair
export const UpdateRepairSchema = RepairTicketSchema.partial().omit({
  id: true,
  ticketNumber: true,
  createdAt: true,
  updatedAt: true,
  createdById: true
});

// Form schema for creating a diagnosis
export const CreateDiagnosisSchema = DiagnosisReportSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Form schema for adding a part
export const AddPartSchema = RepairPartSchema.omit({
  id: true,
  orderedAt: true,
  receivedAt: true
});

// Form schema for adding a service charge
export const AddServiceChargeSchema = ServiceChargeSchema.omit({
  id: true,
  createdAt: true
});

// Form schema for updating repair status
export const UpdateStatusSchema = StatusUpdateSchema.omit({
  id: true,
  createdAt: true
});

// Inferred Types
export type DiagnosisReport = z.infer<typeof DiagnosisReportSchema>;
export type RepairPart = z.infer<typeof RepairPartSchema>;
export type ServiceCharge = z.infer<typeof ServiceChargeSchema>;
export type StatusUpdate = z.infer<typeof StatusUpdateSchema>;
export type RepairTicket = z.infer<typeof RepairTicketSchema>;
export type CreateRepairInput = z.infer<typeof CreateRepairSchema>;
export type UpdateRepairInput = z.infer<typeof UpdateRepairSchema>;
export type CreateDiagnosisInput = z.infer<typeof CreateDiagnosisSchema>;
export type AddPartInput = z.infer<typeof AddPartSchema>;
export type AddServiceChargeInput = z.infer<typeof AddServiceChargeSchema>;
export type UpdateStatusInput = z.infer<typeof UpdateStatusSchema>;