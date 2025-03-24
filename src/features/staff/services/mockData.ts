/**
 * 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
 */

import { EmploymentType } from "../types/employmentType";

/**
 * Mock employment types data for development
 */
export const mockEmploymentTypes: EmploymentType[] = [
  {
    id: "1",
    name: "Full-time",
    description: "Standard 40-hour work week with full benefits package",
    color: "#4CAF50",
    benefits: ["Health Insurance", "Paid Time Off", "401(k)", "Dental Coverage"],
    staffCount: 24,
    isActive: true,
    createdAt: "2023-01-15T08:30:00Z",
    updatedAt: "2023-06-22T14:15:00Z"
  },
  {
    id: "2",
    name: "Part-time",
    description: "Less than 30 hours per week with limited benefits",
    color: "#2196F3",
    benefits: ["Flexible Schedule", "Paid Time Off"],
    staffCount: 18,
    isActive: true,
    createdAt: "2023-01-15T09:45:00Z",
    updatedAt: "2023-05-18T11:20:00Z"
  },
  {
    id: "3",
    name: "Seasonal",
    description: "Temporary employment during peak business periods",
    color: "#FF9800",
    benefits: ["Flexible Schedule", "Employee Discount"],
    staffCount: 7,
    isActive: true,
    createdAt: "2023-02-10T10:15:00Z",
    updatedAt: "2023-04-05T16:30:00Z"
  },
  {
    id: "4",
    name: "Contract",
    description: "Fixed-term employment with specific deliverables",
    color: "#9C27B0",
    benefits: ["Higher Pay Rate", "Remote Work Option"],
    staffCount: 5,
    isActive: true,
    createdAt: "2023-03-20T13:45:00Z",
    updatedAt: "2023-07-12T09:10:00Z"
  },
  {
    id: "5",
    name: "Internship",
    description: "Training position for students or recent graduates",
    color: "#607D8B",
    benefits: ["Academic Credit", "Professional Development", "Mentorship"],
    staffCount: 3,
    isActive: true,
    createdAt: "2023-05-05T11:30:00Z",
    updatedAt: "2023-08-01T15:45:00Z"
  }
];
