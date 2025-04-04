import { z } from "zod"

export const staffSchema = z.object({
  id: z.string().optional(),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  role: z.string().min(2, "Role must be at least 2 characters"),
  status: z.enum(["active", "inactive", "on_leave"]).default("active"),
  hireDate: z.string(),
  department: z.string().min(1, "Department is required"),
  position: z.string().min(1, "Position is required"),
  employmentType: z.string().min(1, "Employment type is required"),
  bankingDetails: z.object({
    accountName: z.string().min(1, "Account name is required"),
    accountNumber: z.string().min(1, "Account number is required"),
    bankName: z.string().min(1, "Bank name is required"),
    accountType: z.string().min(1, "Account type is required"),
    branchLocation: z.string().min(1, "Branch location is required"),
    branchCode: z.string().optional(),
    swiftCode: z.string().optional(),
    iban: z.string().optional(),
    bankAddress: z.string().optional(),
  }).optional(),
  emergencyContact: z.object({
    name: z.string().min(1, "Emergency contact name is required"),
    relationship: z.string().min(1, "Relationship is required"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
  }),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  updatedBy: z.string().optional(),
})

export type Staff = z.infer<typeof staffSchema>

export type StaffStatus = "active" | "inactive" | "on_leave"
export type EmploymentType = "full-time" | "part-time" | "contract" | "temporary"

// Staff form validation messages
export const staffValidationMessages = {
  firstName: {
    required: "First name is required",
    minLength: "First name must be at least 2 characters"
  },
  lastName: {
    required: "Last name is required",
    minLength: "Last name must be at least 2 characters"
  },
  email: {
    required: "Email is required",
    invalid: "Invalid email address"
  },
  phone: {
    required: "Phone number is required",
    minLength: "Phone number must be at least 10 digits"
  },
  role: {
    required: "Role is required",
    minLength: "Role must be at least 2 characters"
  },
  department: {
    required: "Department is required"
  },
  position: {
    required: "Position is required"
  },
  emergencyContact: {
    name: {
      required: "Emergency contact name is required"
    },
    relationship: {
      required: "Relationship is required"
    },
    phone: {
      required: "Emergency contact phone is required",
      minLength: "Phone number must be at least 10 digits"
    }
  },
  bankingDetails: {
    accountName: {
      required: "Account name is required"
    },
    accountNumber: {
      required: "Account number is required"
    },
    bankName: {
      required: "Bank name is required"
    },
    accountType: {
      required: "Account type is required"
    },
    branchLocation: {
      required: "Branch location is required"
    }
  }
}
