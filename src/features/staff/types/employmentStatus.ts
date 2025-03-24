import { z } from "zod"

export const employmentStatusSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(2, "Description must be at least 2 characters"),
  color: z.string().min(4, "Color must be a valid hex code"),
  benefits: z.array(z.string()).default([]),
  staffCount: z.number().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  updatedBy: z.string().optional(),
})

export type EmploymentStatus = z.infer<typeof employmentStatusSchema>

export const defaultEmploymentStatuses: EmploymentStatus[] = [
  {
    id: "1",
    name: "Full-Time",
    description: "Regular full-time employee with complete benefits",
    color: "#10B981",
    benefits: ["Health Insurance", "Paid Time Off", "401k", "Dental"],
    staffCount: 12
  },
  {
    id: "2",
    name: "Part-Time",
    description: "Part-time employee with limited benefits",
    color: "#6366F1",
    benefits: ["Limited Health Insurance", "Limited Paid Time Off"],
    staffCount: 5
  },
  {
    id: "3",
    name: "Contract",
    description: "Fixed-term contract employee",
    color: "#F59E0B",
    benefits: ["Performance Bonus"],
    staffCount: 3
  },
  {
    id: "4",
    name: "Probation",
    description: "New employee under probationary period",
    color: "#EF4444",
    benefits: ["Basic Health Insurance"],
    staffCount: 2
  }
]
