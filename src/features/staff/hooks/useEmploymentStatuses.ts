import { useState, useEffect, useCallback } from "react"
import { useToast } from "@/components/ui/use-toast"
import { employmentStatusService } from "../services/employmentStatusService"
import type { EmploymentStatus } from "../types/employmentStatus"

export function useEmploymentStatuses() {
  const [statuses, setStatuses] = useState<EmploymentStatus[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const { toast } = useToast()

  const loadStatuses = useCallback(async () => {
    setIsLoading(true)
    setIsError(false)
    try {
      const statuses = await employmentStatusService.getAllStatuses()
      setStatuses(statuses)
    } catch (error) {
      setIsError(true)
      toast({
        title: "Error",
        description: "Failed to load employment statuses",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadStatuses()
  }, [loadStatuses])

  const addStatus = useCallback(async (status: Omit<EmploymentStatus, "id">) => {
    try {
      const newStatus = await employmentStatusService.createStatus(status)
      setStatuses(prev => [...prev, newStatus])
      return newStatus
    } catch (error) {
      throw error
    }
  }, [])

  const updateStatus = useCallback(async (id: string | number, status: Partial<EmploymentStatus>) => {
    try {
      const updatedStatus = await employmentStatusService.updateStatus(id, status)
      setStatuses(prev => prev.map(s => s.id === id ? updatedStatus : s))
      return updatedStatus
    } catch (error) {
      throw error
    }
  }, [])

  const deleteStatus = useCallback(async (id: string | number) => {
    try {
      await employmentStatusService.deleteStatus(id)
      setStatuses(prev => prev.filter(s => s.id !== id))
    } catch (error) {
      throw error
    }
  }, [])

  return {
    statuses,
    isLoading,
    isError,
    loadStatuses,
    addStatus,
    updateStatus,
    deleteStatus,
  }
}
