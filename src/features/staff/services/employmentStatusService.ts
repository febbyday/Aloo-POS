// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤

import { type EmploymentStatus } from "../types/employmentStatus"
import { apiClient } from "@/lib/api/api-client"
import { getApiEndpoint } from "@/lib/api/config"

// Use the configured endpoint instead of hardcoding the URL
const API_ENDPOINT = "employment-statuses"

class EmploymentStatusService {
  async getAllStatuses(): Promise<EmploymentStatus[]> {
    try {
      console.log("Fetching employment statuses from API:", getApiEndpoint(API_ENDPOINT))
      const response = await apiClient.get<EmploymentStatus[]>(API_ENDPOINT)
      
      if (response.success) {
        console.log("Successfully retrieved employment statuses from API")
        return response.data
      } else {
        console.error("API returned unsuccessful response:", response.error)
        throw new Error(response.error || "Failed to fetch employment statuses")
      }
    } catch (error) {
      console.error("Error fetching employment statuses:", error)
      throw error
    }
  }

  async getStatusById(id: string | number): Promise<EmploymentStatus | undefined> {
    try {
      const response = await apiClient.get<EmploymentStatus>(`${API_ENDPOINT}/${id}`)
      
      if (response.success) {
        return response.data
      } else {
        throw new Error(response.error || `Failed to fetch employment status ${id}`)
      }
    } catch (error) {
      console.error(`Error fetching employment status ${id}:`, error)
      throw error
    }
  }

  async createStatus(status: Omit<EmploymentStatus, "id">): Promise<EmploymentStatus> {
    try {
      const response = await apiClient.post<EmploymentStatus, Omit<EmploymentStatus, "id">>(
        API_ENDPOINT, 
        status
      )
      
      if (!response.success) {
        throw new Error(response.error || "Failed to create employment status")
      }
      
      return response.data
    } catch (error) {
      console.error("Error creating employment status:", error)
      throw error
    }
  }

  async updateStatus(id: string | number, status: Partial<EmploymentStatus>): Promise<EmploymentStatus> {
    try {
      const response = await apiClient.patch<EmploymentStatus, Partial<EmploymentStatus>>(
        `${API_ENDPOINT}/${id}`, 
        status
      )
      
      if (!response.success) {
        throw new Error(response.error || `Failed to update employment status ${id}`)
      }
      
      return response.data
    } catch (error) {
      console.error(`Error updating employment status ${id}:`, error)
      throw error
    }
  }

  async deleteStatus(id: string | number): Promise<void> {
    try {
      const response = await apiClient.delete<void>(`${API_ENDPOINT}/${id}`)
      
      if (!response.success) {
        throw new Error(response.error || `Failed to delete employment status ${id}`)
      }
    } catch (error) {
      console.error(`Error deleting employment status ${id}:`, error)
      throw error
    }
  }
}

// Export a singleton instance
export const employmentStatusService = new EmploymentStatusService()
