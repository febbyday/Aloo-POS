/**
 * 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
 */

import { EmploymentType } from "../types/employmentType"
import { getApiEndpoint } from '@/lib/api/config';

// API URL for employment types
const API_URL = getApiEndpoint('employment-types');
console.log('Employment Types API URL:', API_URL);

// Mock data for fallback when API fails
const mockEmploymentTypes: EmploymentType[] = [
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

// Track if we're in mock mode due to API failure
let useMockData = false;

/**
 * Employment Type Service
 * 
 * This service handles all employment type-related operations
 * and falls back to mock data when API calls fail.
 */
export const employmentTypeService = {
  /**
   * Returns whether the service is currently using mock data
   */
  isUsingMockData(): boolean {
    return useMockData;
  },

  /**
   * Fetches all employment types
   * @returns Promise with array of employment types
   */
  async getEmploymentTypes(): Promise<EmploymentType[]> {
    // If we've already determined the API is failing, use mock data
    if (useMockData) {
      console.log("Using mock data for employment types (API previously failed)");
      return Promise.resolve([...mockEmploymentTypes]);
    }
    
    try {
      const response = await fetch(API_URL);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch employment types: ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.warn("API call failed, falling back to mock data:", error);
      useMockData = true;
      return [...mockEmploymentTypes];
    }
  },
  
  /**
   * Creates a new employment type
   * @param data Employment type data without ID
   * @returns Promise with the created employment type
   */
  async createEmploymentType(data: Omit<EmploymentType, "id">): Promise<EmploymentType> {
    // If we've already determined the API is failing, use mock data
    if (useMockData) {
      console.log("Using mock data for employment type creation (API previously failed)");
      const newType: EmploymentType = {
        ...data,
        id: Math.random().toString(36).substring(2, 9),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        staffCount: 0,
        isActive: true
      };
      
      mockEmploymentTypes.push(newType);
      return Promise.resolve(newType);
    }
    
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create employment type: ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.warn("API call failed, falling back to mock data:", error);
      useMockData = true;
      
      // Create with mock data instead
      const newType: EmploymentType = {
        ...data,
        id: Math.random().toString(36).substring(2, 9),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        staffCount: 0,
        isActive: true
      };
      
      mockEmploymentTypes.push(newType);
      return newType;
    }
  },

  /**
   * Updates an existing employment type
   * @param id Employment type id
   * @param data Updated employment type data
   * @returns Promise with the updated employment type
   */
  async updateEmploymentType(id: string, data: Partial<EmploymentType>): Promise<EmploymentType> {
    // If we've already determined the API is failing, use mock data
    if (useMockData) {
      console.log("Using mock data for employment type update (API previously failed)");
      const index = mockEmploymentTypes.findIndex(type => type.id === id);
      
      if (index === -1) {
        throw new Error("Employment type not found");
      }
      
      const updatedType = {
        ...mockEmploymentTypes[index],
        ...data,
        updatedAt: new Date().toISOString()
      };
      
      mockEmploymentTypes[index] = updatedType;
      return Promise.resolve(updatedType);
    }
    
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update employment type: ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.warn("API call failed, falling back to mock data:", error);
      useMockData = true;
      
      // Update with mock data instead
      const index = mockEmploymentTypes.findIndex(type => type.id === id);
      
      if (index === -1) {
        throw new Error("Employment type not found");
      }
      
      const updatedType = {
        ...mockEmploymentTypes[index],
        ...data,
        updatedAt: new Date().toISOString()
      };
      
      mockEmploymentTypes[index] = updatedType;
      return updatedType;
    }
  },
  
  /**
   * Deletes an employment type
   * @param id Employment type id
   * @returns Promise with success status
   */
  async deleteEmploymentType(id: string): Promise<{ success: boolean }> {
    // If we've already determined the API is failing, use mock data
    if (useMockData) {
      console.log("Using mock data for employment type deletion (API previously failed)");
      const index = mockEmploymentTypes.findIndex(type => type.id === id);
      
      if (index === -1) {
        throw new Error("Employment type not found");
      }
      
      mockEmploymentTypes.splice(index, 1);
      return Promise.resolve({ success: true });
    }
    
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE"
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete employment type: ${response.statusText}`);
      }
      
      return { success: true };
    } catch (error) {
      console.warn("API call failed, falling back to mock data:", error);
      useMockData = true;
      
      // Delete with mock data instead
      const index = mockEmploymentTypes.findIndex(type => type.id === id);
      
      if (index === -1) {
        throw new Error("Employment type not found");
      }
      
      mockEmploymentTypes.splice(index, 1);
      return { success: true };
    }
  }
}