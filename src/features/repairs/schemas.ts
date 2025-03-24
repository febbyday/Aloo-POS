import { z } from "zod"
import { RepairStatus, RepairPriority, LeatherProductType } from "./types"

export const workLogEntrySchema = z.object({
  title: z.string(),
  description: z.string(),
  technician: z.string(),
  timestamp: z.date()
})

export const repairItemSchema = z.object({
  name: z.string(),
  quantity: z.number().positive(),
  unitPrice: z.number().positive()
})

export const repairSchema = z.object({
  id: z.string(),
  ticketNumber: z.string(),
  customerName: z.string(),
  customerPhone: z.string(),
  customerEmail: z.string().email(),
  productName: z.string(),
  productBrand: z.string(),
  productModel: z.string(),
  productType: z.nativeEnum(LeatherProductType),
  issueDescription: z.string(),
  status: z.nativeEnum(RepairStatus),
  priority: z.nativeEnum(RepairPriority),
  estimatedCost: z.number().positive(),
  actualCost: z.number().positive(),
  createdAt: z.date(),
  dueDate: z.date(),
  completedAt: z.date().optional(),
  paymentDate: z.date().optional(),
  isPaid: z.boolean(),
  workLogs: z.array(workLogEntrySchema),
  items: z.array(repairItemSchema),
  notes: z.string().optional(),
  technician: z.string().optional()
})