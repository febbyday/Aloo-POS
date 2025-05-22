import { useState, useEffect, useCallback } from "react"
import { useToast } from "@/lib/toast"
import { roleService } from "@/features/users/services/roleService"
import type { Role } from "@/features/users/types/role"

/**
 * Custom hook for managing staff roles
 * Provides functionality to load roles and get role names by ID
 */
export function useRoles() {
  const [roles, setRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const { toast } = useToast()

  const loadRoles = useCallback(async () => {
    setIsLoading(true)
    setIsError(false)
    try {
      const roles = await roleService.getAllRoles()
      setRoles(roles)
    } catch (error) {
      setIsError(true)
      toast({
        title: "Error",
        description: "Failed to load roles",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadRoles()
  }, [loadRoles])

  return {
    roles,
    isLoading,
    isError,
    loadRoles,
    getRoleName: useCallback((roleId: string) => roles.find(r => r.id === roleId)?.name, [roles])
  }
}
