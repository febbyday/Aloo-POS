/**
 * Frontend-only hook for managing employment types
 * No API connections - all data is managed in memory
 */

import { useEffect, useState, useCallback } from "react"
import { EmploymentType } from "../types/employmentType"
import { employmentTypeService } from "../services/employmentTypeService"

/**
 * Custom hook for fetching and managing employment types
 * @returns Object containing employment types data, loading state, error state, and CRUD functions
 */
export const useEmploymentTypes = () => {
  const [data, setData] = useState<EmploymentType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [isRefetching, setIsRefetching] = useState(false)

  /**
   * Fetch all employment types from the API
   */
  const fetchEmploymentTypes = useCallback(async (showRefetching = false) => {
    if (showRefetching) {
      setIsRefetching(true)
    } else {
      setIsLoading(true)
    }
    setError(null)
    
    try {
      const typesData = await employmentTypeService.getEmploymentTypes()
      setData(typesData)
    } catch (err) {
      console.error("Error fetching employment types:", err)
      setError(err as Error)
    } finally {
      setIsLoading(false)
      setIsRefetching(false)
    }
  }, [])

  // Initial data fetch
  useEffect(() => {
    fetchEmploymentTypes()
  }, [fetchEmploymentTypes])

  /**
   * Create a new employment type
   */
  const createEmploymentType = useCallback(async (typeData: Omit<EmploymentType, "id">) => {
    try {
      const newType = await employmentTypeService.createEmploymentType(typeData)
      // Refetch data to ensure we have the latest from the server
      await fetchEmploymentTypes(true)
      return newType
    } catch (err) {
      console.error("Error creating employment type:", err)
      setError(err as Error)
      throw err
    }
  }, [fetchEmploymentTypes])

  /**
   * Update an existing employment type
   */
  const updateEmploymentType = useCallback(async (id: string, typeData: Partial<EmploymentType>) => {
    try {
      const updatedType = await employmentTypeService.updateEmploymentType(id, typeData)
      // Refetch data to ensure we have the latest from the server
      await fetchEmploymentTypes(true)
      return updatedType
    } catch (err) {
      console.error("Error updating employment type:", err)
      setError(err as Error)
      throw err
    }
  }, [fetchEmploymentTypes])

  /**
   * Delete an employment type
   */
  const deleteEmploymentType = useCallback(async (id: string) => {
    try {
      await employmentTypeService.deleteEmploymentType(id)
      // Refetch data to ensure we have the latest from the server
      await fetchEmploymentTypes(true)
      return true
    } catch (err) {
      console.error("Error deleting employment type:", err)
      setError(err as Error)
      throw err
    }
  }, [fetchEmploymentTypes])

  return { 
    data, 
    isLoading,
    isRefetching,
    error,
    refetch: () => fetchEmploymentTypes(true),
    createEmploymentType,
    updateEmploymentType,
    deleteEmploymentType
  }
}