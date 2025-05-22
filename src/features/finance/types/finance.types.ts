import { z } from "zod";

// Payment method types
export const PaymentMethodSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Payment method name is required"),
  icon: z.string(),
  enabled: z.boolean().default(true),
  systemDefined: z.boolean().default(false),
});

export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;

// Revenue tracking types
export const RevenueSchema = z.object({
  id: z.string(),
  date: z.date(),
  amount: z.number().min(0, "Amount must be a positive number"),
  paymentMethod: z.string(),
  source: z.string(),
  description: z.string().optional(),
});

export type Revenue = z.infer<typeof RevenueSchema>;

// Sales data types
export const SalesDataSchema = z.object({
  id: z.string(),
  date: z.date(),
  invoiceNumber: z.string(),
  customer: z.string(),
  paymentMethod: z.string(),
  amount: z.number().min(0, "Amount must be a positive number"),
  status: z.enum(['completed', 'pending', 'cancelled']),
});

export type SalesData = z.infer<typeof SalesDataSchema>;

// Expense types
export const ExpenseSchema = z.object({
  id: z.string(),
  date: z.date(),
  amount: z.number().min(0, "Amount must be a positive number"),
  category: z.string(),
  supplier: z.string().optional(),
  description: z.string().optional(),
  recurring: z.boolean().default(false),
  recurringFrequency: z.enum(["daily", "weekly", "monthly", "quarterly", "yearly"]).optional(),
  nextDueDate: z.date().optional(),
});

export type Expense = z.infer<typeof ExpenseSchema>;

// Expense category types
export const ExpenseCategorySchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Category name is required"),
  description: z.string().optional(),
});

export type ExpenseCategory = z.infer<typeof ExpenseCategorySchema>;

// Tax configuration types
export const TaxRateSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Tax name is required"),
  rate: z.number().min(0, "Rate must be a positive number"),
  isDefault: z.boolean().default(false),
  appliesTo: z.array(z.string()).default([]),
  description: z.string().optional(),
});

export type TaxRate = z.infer<typeof TaxRateSchema>;

// Tax category types
export const TaxCategorySchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Category name is required"),
  description: z.string().optional(),
});

export type TaxCategory = z.infer<typeof TaxCategorySchema>;

// Tax report types
export const TaxReportSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Report name is required"),
  date: z.date(),
  amount: z.number().min(0, "Amount must be a positive number"),
});

export type TaxReport = z.infer<typeof TaxReportSchema>;

// Reconciliation types
export const ReconciliationSchema = z.object({
  id: z.string(),
  date: z.date(),
  cashInRegister: z.number().min(0, "Cash amount must be a positive number"),
  expectedCash: z.number().min(0, "Expected cash must be a positive number"),
  difference: z.number(),
  notes: z.string().optional(),
  status: z.enum(["pending", "completed", "discrepancy"]),
  completedBy: z.string().optional(),
});

export type Reconciliation = z.infer<typeof ReconciliationSchema>;

// Financial report types
export const ReportTypeSchema = z.enum([
  "sales",
  "expenses",
  "profit_loss",
  "tax",
  "reconciliation",
  "custom"
]);

export type ReportType = z.infer<typeof ReportTypeSchema>;

export const ReportSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Report name is required"),
  type: ReportTypeSchema,
  dateRange: z.object({
    startDate: z.date(),
    endDate: z.date(),
  }),
  filters: z.record(z.any()).optional(),
  createdBy: z.string(),
  createdAt: z.date(),
  format: z.enum(["pdf", "csv", "excel"]),
});

export type Report = z.infer<typeof ReportSchema>;

// Finance settings types
export const FinanceSettingsSchema = z.object({
  currency: z.string().default("USD"),
  taxEnabled: z.boolean().default(true),
  defaultTaxRate: z.string().optional(),
  fiscalizationEnabled: z.boolean().default(false),
  fiscalizationSettings: z.record(z.any()).optional(),
  paymentMethods: z.array(PaymentMethodSchema).default([]),
  receiptFooter: z.string().optional(),
  receiptHeader: z.string().optional(),
  showTaxOnReceipt: z.boolean().default(true),
  requireReconciliation: z.boolean().default(true),
  reconciliationFrequency: z.enum(["daily", "weekly", "custom"]).default("daily"),
});

export type FinanceSettings = z.infer<typeof FinanceSettingsSchema>;
