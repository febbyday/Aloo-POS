/**
 * 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
 *
 * Employment Type Service
 *
 * This service uses the enhanced API client and endpoint registry for improved error handling and consistency.
 */

import { EmploymentType } from "../types/employmentType"
import { enhancedApiClient } from '@/lib/api/enhanced-api-client'
import { EMPLOYMENT_ENDPOINTS } from '@/lib/api/endpoint-registry'

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
      console.log("Fetching employment types from API using enhanced client")
      const response = await enhancedApiClient.get('employment/TYPES')

      return response
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
      const response = await enhancedApiClient.post('employment/CREATE_TYPE', data)

      return response
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
      const response = await enhancedApiClient.patch('employment/UPDATE_TYPE', data, { id })

      return response
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
      await enhancedApiClient.delete('employment/DELETE_TYPE', { id })

      return { success: true }
    } catch (error) {
      console.error(`Error deleting employment type ${id}:`, error)
      throw error
    }
  }
}
