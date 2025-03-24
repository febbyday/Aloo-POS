import { useState, useEffect, useCallback, useRef } from 'react';
import { Role } from '../types/role';
import { roleService } from '../services/roleService';
import { toast } from '@/components/ui/use-toast';

interface UseRolesReturn {
  roles: Role[];
  isLoading: boolean;
  error: Error | null;
  refreshRoles: () => Promise<void>;
  getRoleById: (id: string | number) => Role | undefined;
  createRole: (roleData: Omit<Role, "id">) => Promise<Role>;
  updateRole: (id: string | number, roleData: Partial<Role>) => Promise<Role>;
  deleteRole: (id: string | number) => Promise<boolean>;
}

export function useRoles(): UseRolesReturn {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  // Add a mounted ref to track component lifecycle
  const isMounted = useRef(true);

  // Set isMounted to false when component unmounts
  useEffect(() => {
    // Set to true when the component mounts
    isMounted.current = true;
    
    // Clean up function runs when the component unmounts
    return () => {
      isMounted.current = false;
    };
  }, []);

  /**
   * Fetches all roles from the API
   */
  const fetchRoles = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const rolesData = await roleService.getAllRoles();
      // Only update state if component is still mounted
      if (isMounted.current) {
        setRoles(rolesData);
      }
      return rolesData;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch roles');
      // Only update state if component is still mounted
      if (isMounted.current) {
        setError(error);
        toast({
          title: 'Error fetching roles',
          description: error.message,
          variant: 'destructive',
        });
      }
      return [];
    } finally {
      // Only update state if component is still mounted
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, []);

  /**
   * Fetch roles on component mount
   */
  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  /**
   * Get a role by its ID
   */
  const getRoleById = useCallback((id: string | number) => {
    return roles.find(role => role.id === id);
  }, [roles]);

  /**
   * Create a new role
   */
  const createRole = useCallback(async (roleData: Omit<Role, "id">) => {
    try {
      console.log("useRoles: Creating role with data:", roleData);
      
      // Add the new role to the UI immediately with a temporary ID
      // This ensures users see instant feedback while the API request is processing
      const tempRole: Role = {
        ...roleData,
        id: `temp_${Math.random().toString(36).substring(2, 9)}`,
        staffCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Update the UI immediately with the temporary role
      if (isMounted.current) {
        setRoles(prevRoles => [...prevRoles, tempRole]);
        
        toast({
          title: 'Creating role...',
          description: `Adding "${roleData.name}" role.`,
        });
      }
      
      // Make the actual API call to create the role
      const newRole = await roleService.createRole(roleData);
      console.log("useRoles: Role service returned new role:", newRole);
      
      // Update the local state with the real role from the API (replacing the temp one)
      if (isMounted.current) {
        console.log("useRoles: Component is mounted, updating roles state");
        setRoles(prevRoles => {
          // Remove the temporary role and add the real one
          const filteredRoles = prevRoles.filter(role => role.id !== tempRole.id);
          const updatedRoles = [...filteredRoles, newRole];
          console.log("useRoles: Updated roles state:", updatedRoles);
          return updatedRoles;
        });
        
        toast({
          title: 'Role created',
          description: `Role "${newRole.name}" created successfully.`,
        });
      } else {
        console.log("useRoles: Component is not mounted, skipping state update");
      }
      
      return newRole;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create role');
      console.error('Error creating role:', error);
      
      // Keep the temporary role in the UI if we failed to get the real one
      // This ensures users don't lose their data if the API call fails
      
      toast({
        title: 'Error creating role',
        description: error.message,
        variant: 'destructive',
      });
      
      throw error;
    }
  }, []);

  /**
   * Update an existing role
   */
  const updateRole = useCallback(async (id: string | number, roleData: Partial<Role>) => {
    try {
      const updatedRole = await roleService.updateRole(id, roleData);
      
      // Update local state only if component is still mounted
      if (isMounted.current) {
        setRoles(prevRoles => 
          prevRoles.map(role => role.id === id ? updatedRole : role)
        );
        
        toast({
          title: 'Role updated',
          description: `Role "${updatedRole.name}" updated successfully.`,
        });
      }
      
      return updatedRole;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update role');
      
      // Only show toast if component is still mounted
      if (isMounted.current) {
        toast({
          title: 'Error updating role',
          description: error.message,
          variant: 'destructive',
        });
      }
      
      throw error;
    }
  }, []);

  /**
   * Delete a role
   */
  const deleteRole = useCallback(async (id: string | number) => {
    try {
      await roleService.deleteRole(id);
      
      // Update local state only if component is still mounted
      if (isMounted.current) {
        setRoles(prevRoles => prevRoles.filter(role => role.id !== id));
        
        toast({
          title: 'Role deleted',
          description: 'Role deleted successfully.',
        });
      }
      
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete role');
      
      // Only show toast if component is still mounted
      if (isMounted.current) {
        toast({
          title: 'Error deleting role',
          description: error.message,
          variant: 'destructive',
        });
      }
      
      return false;
    }
  }, []);

  return {
    roles,
    isLoading,
    error,
    refreshRoles: fetchRoles,
    getRoleById,
    createRole,
    updateRole,
    deleteRole,
  };
} 