import { z } from "zod"

export const employmentStatusSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(2, "Description must be at least 2 characters").nullable().optional(),
  color: z.string().min(4, "Color must be a valid hex code"),
  benefits: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  staffCount: z.number().default(0),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})

export type EmploymentStatus = z.infer<typeof employmentStatusSchema>

export interface EmploymentStatusWithBenefits extends EmploymentStatus {
  benefits: string[];
}

export const defaultEmploymentStatuses: EmploymentStatus[] = [
  {
    id: "1",
    name: "Full-Time",
    description: "Regular full-time employee with complete benefits package including health, dental, and retirement options",
    color: "#10B981", // Green
    isActive: true,
    benefits: ["Health Insurance", "Paid Time Off", "401k", "Dental", "Vision", "Life Insurance"],
    staffCount: 12,
    createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year ago
    updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days ago
  },
  {
    id: "2",
    name: "Part-Time",
    description: "Part-time employee working less than 30 hours per week with limited benefits based on hours worked",
    color: "#6366F1", // Indigo
    isActive: true,
    benefits: ["Limited Health Insurance", "Limited Paid Time Off", "Employee Discounts"],
    staffCount: 8,
    createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(), // 6 months ago
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days ago
  },
  {
    id: "3",
    name: "Contract",
    description: "Fixed-term contract employee with project-based assignments and performance incentives",
    color: "#F59E0B", // Amber
    isActive: true,
    benefits: ["Performance Bonus", "Flexible Hours", "Remote Work Option"],
    staffCount: 5,
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // 3 months ago
    updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString() // 14 days ago
  },
  {
    id: "4",
    name: "Probation",
    description: "New employee under 90-day probationary period with basic benefits and regular performance reviews",
    color: "#EF4444", // Red
    isActive: true,
    benefits: ["Basic Health Insurance", "Training Program", "Mentorship"],
    staffCount: 3,
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days ago
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago
  },
  {
    id: "5",
    name: "Seasonal",
    description: "Temporary employee hired for peak seasons or special projects with hourly compensation",
    color: "#8B5CF6", // Purple
    isActive: true,
    benefits: ["Flexible Scheduling", "Bonus Opportunities", "Rehire Priority"],
    staffCount: 6,
    createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(), // 4 months ago
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days ago
  }
]
