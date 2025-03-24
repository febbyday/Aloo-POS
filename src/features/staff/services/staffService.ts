/**
 * Staff Service
 * Connects to backend API endpoints with fallback to mock data when API fails
 */

import { Staff } from "../types/staff"
import { getApiEndpoint } from '@/lib/api/config';

// API URL for staff data
const API_URL = getApiEndpoint('staff');
console.log('Staff API URL:', API_URL);

// Mock data for staff records
const mockStaffData: Staff[] = [
  {
    id: "1",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "123-456-7890",
    role: "Manager",
    status: "active",
    hireDate: "2022-01-15",
    department: "Sales",
    position: "Sales Manager",
    employmentType: "full-time",
    bankingDetails: {
      accountName: "John Doe",
      accountNumber: "1234567890",
      bankName: "Example Bank",
      accountType: "Checking"
    },
    emergencyContact: {
      name: "Jane Doe",
      relationship: "Spouse",
      phone: "098-765-4321",
    },
  },
  {
    id: "2",
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@example.com",
    phone: "234-567-8901",
    role: "Cashier",
    status: "active",
    hireDate: "2022-03-10",
    department: "Operations",
    position: "Senior Cashier",
    employmentType: "part-time",
    bankingDetails: {
      accountName: "Jane Smith",
      accountNumber: "0987654321",
      bankName: "Sample Bank",
      accountType: "Savings"
    },
    emergencyContact: {
      name: "John Smith",
      relationship: "Spouse",
      phone: "987-654-3210",
    },
  },
  {
    id: "3",
    firstName: "Michael",
    lastName: "Johnson",
    email: "michael.johnson@example.com",
    phone: "345-678-9012",
    role: "Staff",
    status: "active",
    hireDate: "2022-05-20",
    department: "IT",
    position: "Support Specialist",
    employmentType: "full-time",
    bankingDetails: {
      accountName: "Michael Johnson",
      accountNumber: "2345678901",
      bankName: "Tech Bank",
      accountType: "Checking"
    },
    emergencyContact: {
      name: "Sarah Johnson",
      relationship: "Spouse",
      phone: "456-789-0123",
    },
  },
  {
    id: "4",
    firstName: "Emily",
    lastName: "Brown",
    email: "emily.brown@example.com",
    phone: "456-789-0123",
    role: "HR Manager",
    status: "active",
    hireDate: "2022-02-10",
    department: "Human Resources",
    position: "HR Manager",
    employmentType: "full-time",
    bankingDetails: {
      accountName: "Emily Brown",
      accountNumber: "3456789012",
      bankName: "Global Bank",
      accountType: "Checking"
    },
    emergencyContact: {
      name: "David Brown",
      relationship: "Spouse",
      phone: "567-890-1234",
    },
  },
  {
    id: "5",
    firstName: "Robert",
    lastName: "Wilson",
    email: "robert.wilson@example.com",
    phone: "567-890-1234",
    role: "Inventory Specialist",
    status: "active",
    hireDate: "2022-04-15",
    department: "Warehouse",
    position: "Inventory Lead",
    employmentType: "full-time",
    bankingDetails: {
      accountName: "Robert Wilson",
      accountNumber: "4567890123",
      bankName: "City Bank",
      accountType: "Savings"
    },
    emergencyContact: {
      name: "Lisa Wilson",
      relationship: "Spouse",
      phone: "678-901-2345",
    },
  }
]

// Configure whether to use mock data by default
// Set to false to use real API by default with fallback to mock data on failure
let useMockData = false;

/**
 * Staff Service
 * Provides methods to interact with the staff API
 */
export const staffService = {
  /**
   * Returns whether the service is currently using mock data
   */
  isUsingMockData(): boolean {
    return useMockData
  },

  /**
   * Fetches all staff records
   * @returns Promise with array of staff members
   */
  async getAllStaff(): Promise<Staff[]> {
    // TEMPORARY: Skip API call and use mock data while backend is being set up
    if (useMockData) {
      console.log("Using mock data for staff (backend setup in progress)")
      return Promise.resolve([...mockStaffData])
    }

    try {
      const response = await fetch(API_URL)

      if (!response.ok) {
        throw new Error(`Failed to fetch staff data: ${response.statusText}`)
      }

      return response.json()
    } catch (error) {
      console.warn("API call failed, falling back to mock data:", error)
      useMockData = true
      return [...mockStaffData]
    }
  },

  /**
   * Gets a single staff member by ID
   * @param id Staff member ID
   * @returns Promise with the staff member details
   */
  async getStaffById(id: string): Promise<Staff> {
    // TEMPORARY: Skip API call and use mock data while backend is being set up
    if (useMockData) {
      console.log("Using mock data for staff details (backend setup in progress)")
      const staff = mockStaffData.find(s => s.id === id)
      
      if (!staff) {
        throw new Error("Staff member not found")
      }
      
      return Promise.resolve({...staff})
    }

    try {
      const response = await fetch(`${API_URL}/${id}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch staff details: ${response.statusText}`)
      }

      return response.json()
    } catch (error) {
      console.warn("API call failed, falling back to mock data:", error)
      useMockData = true
      
      // Find the staff in mock data
      const staff = mockStaffData.find(s => s.id === id)
      
      if (!staff) {
        throw new Error("Staff member not found")
      }
      
      return {...staff}
    }
  },

  /**
   * Creates a new staff member
   * @param data Staff data without ID
   * @returns Promise with the created staff
   */
  async createStaff(data: Omit<Staff, "id">): Promise<Staff> {
    // TEMPORARY: Skip API call and use mock data while backend is being set up
    if (useMockData) {
      console.log("Using mock data for staff creation (backend setup in progress)")
      const newStaff: Staff = {
        ...data,
        id: Math.random().toString(36).substring(2, 9)
      }
      
      mockStaffData.push(newStaff)
      return Promise.resolve({...newStaff})
    }

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error(`Failed to create staff: ${response.statusText}`)
      }

      return response.json()
    } catch (error) {
      console.warn("API call failed, falling back to mock data:", error)
      useMockData = true
      
      // Create with mock data instead
      const newStaff: Staff = {
        ...data,
        id: Math.random().toString(36).substring(2, 9)
      }
      
      mockStaffData.push(newStaff)
      return newStaff
    }
  },

  /**
   * Updates an existing staff member
   * @param id Staff ID
   * @param data Updated staff data
   * @returns Promise with the updated staff
   */
  async updateStaff(id: string, data: Partial<Staff>): Promise<Staff> {
    // TEMPORARY: Skip API call and use mock data while backend is being set up
    if (useMockData) {
      console.log("Using mock data for staff update (backend setup in progress)")
      const index = mockStaffData.findIndex(s => s.id === id)
      
      if (index === -1) {
        throw new Error("Staff member not found")
      }
      
      const updatedStaff = {
        ...mockStaffData[index],
        ...data
      }
      
      mockStaffData[index] = updatedStaff
      return Promise.resolve({...updatedStaff})
    }

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error(`Failed to update staff: ${response.statusText}`)
      }

      return response.json()
    } catch (error) {
      console.warn("API call failed, falling back to mock data:", error)
      useMockData = true
      
      // Update with mock data instead
      const index = mockStaffData.findIndex(s => s.id === id)
      
      if (index === -1) {
        throw new Error("Staff member not found")
      }
      
      const updatedStaff = {
        ...mockStaffData[index],
        ...data
      }
      
      mockStaffData[index] = updatedStaff
      return updatedStaff
    }
  },

  /**
   * Deletes a staff member
   * @param id Staff ID
   * @returns Promise with success status
   */
  async deleteStaff(id: string): Promise<{ success: boolean }> {
    // TEMPORARY: Skip API call and use mock data while backend is being set up
    if (useMockData) {
      console.log("Using mock data for staff deletion (backend setup in progress)")
      const index = mockStaffData.findIndex(s => s.id === id)
      
      if (index === -1) {
        throw new Error("Staff member not found")
      }
      
      mockStaffData.splice(index, 1)
      return Promise.resolve({ success: true })
    }

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE"
      })

      if (!response.ok) {
        throw new Error(`Failed to delete staff: ${response.statusText}`)
      }

      return { success: true }
    } catch (error) {
      console.warn("API call failed, falling back to mock data:", error)
      useMockData = true
      
      // Delete with mock data instead
      const index = mockStaffData.findIndex(s => s.id === id)
      
      if (index === -1) {
        throw new Error("Staff member not found")
      }
      
      mockStaffData.splice(index, 1)
      return { success: true }
    }
  }
}
