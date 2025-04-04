import { useState, useEffect, useCallback } from "react"
import { useToast } from "@/components/ui/use-toast"
import { employmentStatusService } from "../services/employmentStatusService"
import type { EmploymentStatus } from "../types/employmentStatus"

export function useEmploymentStatuses() {
  const [statuses, setStatuses] = useState<EmploymentStatus[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isUsingMockData, setIsUsingMockData] = useState(false)
  const [isRefetching, setIsRefetching] = useState(false)
  const [backendStatus, setBackendStatus] = useState<'online' | 'offline' | 'checking'>('checking')
  const { toast } = useToast()

  const checkBackendStatus = useCallback(async () => {
    setBackendStatus('checking')
    try {
      await loadStatuses(true)
      setBackendStatus('online')
    } catch (error) {
      setBackendStatus('offline')
    }
  }, [])

  const loadStatuses = useCallback(async (silent = false) => {
    if (!silent) {
      const wasEmpty = statuses.length === 0
      setIsLoading(wasEmpty)
      setIsRefetching(!wasEmpty)
      setIsError(false)
      setErrorMessage(null)
    }
    
    try {
      const statuses = await employmentStatusService.getAllStatuses()
      setStatuses(statuses)
      const usingMock = employmentStatusService.isUsingMockData()
      setIsUsingMockData(usingMock)
      
      if (usingMock && !silent) {
        toast({
          title: "Using Mock Data",
          description: "Backend API unavailable. Using sample data instead.",
          variant: "default"
        })
      }
      
      return statuses
    } catch (error) {
      setIsError(true)
      const message = error instanceof Error ? error.message : "Failed to load employment statuses"
      setErrorMessage(message)
      
      if (!silent) {
        toast({
          title: "Error",
          description: message,
          variant: "destructive"
        })
      }
      
      throw error
    } finally {
      if (!silent) {
        setIsLoading(false)
        setIsRefetching(false)
      }
    }
  }, [toast, statuses.length])

  useEffect(() => {
    loadStatuses()
    
    // Set up periodic backend status checks
    const statusCheckInterval = setInterval(() => {
      checkBackendStatus()
    }, 60000) // Check every minute
    
    return () => clearInterval(statusCheckInterval)
  }, [loadStatuses, checkBackendStatus])

  const addStatus = useCallback(async (status: Omit<EmploymentStatus, "id">) => {
    try {
      const newStatus = await employmentStatusService.createStatus(status)
      setStatuses(prev => [...prev, newStatus])
      setIsUsingMockData(employmentStatusService.isUsingMockData())
      return newStatus
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create employment status"
      toast({
        title: "Error",
        description: message,
        variant: "destructive"
      })
      throw error
    }
  }, [toast])

  const updateStatus = useCallback(async (id: string | number, status: Partial<EmploymentStatus>) => {
    try {
      const updatedStatus = await employmentStatusService.updateStatus(id, status)
      setStatuses(prev => prev.map(s => s.id === id ? updatedStatus : s))
      setIsUsingMockData(employmentStatusService.isUsingMockData())
      return updatedStatus
    } catch (error) {
      const message = error instanceof Error ? error.message : `Failed to update employment status (ID: ${id})`
      toast({
        title: "Error",
        description: message,
        variant: "destructive"
      })
      throw error
    }
  }, [toast])

  const deleteStatus = useCallback(async (id: string | number) => {
    try {
      await employmentStatusService.deleteStatus(id)
      setStatuses(prev => prev.filter(s => s.id !== id))
      setIsUsingMockData(employmentStatusService.isUsingMockData())
    } catch (error) {
      const message = error instanceof Error ? error.message : `Failed to delete employment status (ID: ${id})`
      toast({
        title: "Error",
        description: message,
        variant: "destructive"
      })
      throw error
    }
  }, [toast])

  return {
    statuses,
    isLoading,
    isRefetching,
    isError,
    errorMessage,
    isUsingMockData,
    backendStatus,
    loadStatuses,
    addStatus,
    updateStatus,
    deleteStatus,
    checkBackendStatus
  }
}
