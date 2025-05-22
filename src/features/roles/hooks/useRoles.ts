/**
 * Use Roles Hook
 * 
 * Custom hook for managing roles across the application.
 * Provides functionality to load, create, update, and delete roles.
 */

import { useState, useEffect, useCallback } from "react";
import { toast } from "@/lib/toast";
import { roleService } from "../services/roleService";
import type { Role, CreateRoleData, UpdateRoleData } from "../types/role";

/**
 * Custom hook for managing roles
 * Provides functionality to load, create, update, and delete roles
 */
export function useRoles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  // Load all roles
  const loadRoles = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const roles = await roleService.getAllRoles();
      setRoles(roles);
    } catch (error) {
      setIsError(true);
      toast({
        title: "Error",
        description: "Failed to load roles",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create a new role
  const createRole = useCallback(async (roleData: CreateRoleData): Promise<Role> => {
    setIsLoading(true);
    try {
      const newRole = await roleService.createRole(roleData);
      setRoles(prevRoles => [...prevRoles, newRole]);
      return newRole;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create role";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update an existing role
  const updateRole = useCallback(async (id: string, roleData: UpdateRoleData): Promise<Role> => {
    setIsLoading(true);
    try {
      const updatedRole = await roleService.updateRole(id, roleData);
      setRoles(prevRoles => 
        prevRoles.map(role => role.id === id ? updatedRole : role)
      );
      return updatedRole;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update role";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Delete a role
  const deleteRole = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const success = await roleService.deleteRole(id);
      if (success) {
        setRoles(prevRoles => prevRoles.filter(role => role.id !== id));
      }
      return success;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete role";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get role by ID
  const getRoleById = useCallback((id: string) => {
    return roles.find(role => role.id === id);
  }, [roles]);

  // Get role name by ID
  const getRoleName = useCallback((id: string) => {
    return roles.find(role => role.id === id)?.name || "Unknown Role";
  }, [roles]);

  // Load roles on component mount
  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  return {
    roles,
    isLoading,
    isError,
    loadRoles,
    createRole,
    updateRole,
    deleteRole,
    getRoleById,
    getRoleName
  };
}
