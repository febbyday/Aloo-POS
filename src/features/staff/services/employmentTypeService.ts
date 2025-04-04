/**
 * 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
 */

import { EmploymentType } from "../types/employmentType"
import { apiClient } from '@/lib/api/api-client'
import { getApiEndpoint } from '@/lib/api/config'

// API endpoint for employment types
const API_ENDPOINT = 'employment-types'

/**
 * Employment Type Service
 * 
 * This service handles all employment type-related operations
 * with the backend API.
 */
export const employmentTypeService = {
  /**
   * Fetches all employment types
   * @returns Promise with array of employment types
   */
  async getEmploymentTypes(): Promise<EmploymentType[]> {
    try {
      console.log("Fetching employment types from API:", getApiEndpoint(API_ENDPOINT))
      const response = await apiClient.get<EmploymentType[]>(API_ENDPOINT)
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch employment types')
      }
      
      return response.data
    } catch (error) {
      console.error("Error fetching employment types:", error)
      throw error
    }
  },
  
  /**
   * Creates a new employment type
   * @param data Employment type data without ID
   * @returns Promise with the created employment type
   */
  async createEmploymentType(data: Omit<EmploymentType, "id" | "createdAt" | "updatedAt" | "staffCount">): Promise<EmploymentType> {
    try {
      const response = await apiClient.post<EmploymentType, typeof data>(API_ENDPOINT, data)
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to create employment type')
      }
      
      return response.data
    } catch (error) {
      console.error("Error creating employment type:", error)
      throw error
    }
  },

  /**
   * Updates an existing employment type
   * @param id Employment type id
   * @param data Updated employment type data
   * @returns Promise with the updated employment type
   */
  async updateEmploymentType(id: string, data: Partial<EmploymentType>): Promise<EmploymentType> {
    try {
      const response = await apiClient.patch<EmploymentType, Partial<EmploymentType>>(`${API_ENDPOINT}/${id}`, data)
      
      if (!response.success) {
        throw new Error(response.error || `Failed to update employment type: ${id}`)
      }
      
      return response.data
    } catch (error) {
      console.error(`Error updating employment type ${id}:`, error)
      throw error
    }
  },
  
  /**
   * Deletes an employment type
   * @param id Employment type id
   * @returns Promise with success status
   */
  async deleteEmploymentType(id: string): Promise<{ success: boolean }> {
    try {
      const response = await apiClient.delete<void>(`${API_ENDPOINT}/${id}`)
      
      if (!response.success) {
        throw new Error(response.error || `Failed to delete employment type: ${id}`)
      }
      
      return { success: true }
    } catch (error) {
      console.error(`Error deleting employment type ${id}:`, error)
      throw error
    }
  }
}
