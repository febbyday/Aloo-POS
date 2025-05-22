import { useCallback, useState, useRef, useEffect } from 'react';
import { toast } from '@/lib/toast';
import { roleService } from '../services/roleService';
import { IRole as Role, CreateRoleData, UpdateRoleData } from '../types/role';

interface UseRolesReturn {
  roles: Role[];
  isLoading: boolean;
  error: string | null;
  refreshRoles: () => Promise<void>;
  getRoleById: (id: string) => Role | undefined;
  createRole: (roleData: CreateRoleData) => Promise<Role>;
  updateRole: (id: string, roleData: UpdateRoleData) => Promise<Role>;
  deleteRole: (id: string) => Promise<boolean>;
}

export const useRoles = (): UseRolesReturn => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  // Fetch all roles
  const fetchRoles = useCallback(async (): Promise<Role[]> => {
    setIsLoading(true);
    setError(null);
    console.log('[ROLES_HOOK] Starting to fetch roles');
    
    // Debug API connectivity first
    try {
      console.log('[ROLES_HOOK] Checking API connectivity...');
      const connectionInfo = await roleService.debugApiConnectivity();
      console.log('[ROLES_HOOK] API connectivity check result:', connectionInfo);
    } catch (connErr) {
      console.error('[ROLES_HOOK] API connectivity check failed:', connErr);
    }

    try {
      console.log('[ROLES_HOOK] Calling roleService.getAllRoles()');
      const data = await roleService.getAllRoles();
      console.log('[ROLES_HOOK] Successfully fetched roles:', data);
      if (isMounted.current) {
        setRoles(data);
      }
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch roles';
      console.error('Role fetch error:', err); // Add detailed logging
      if (isMounted.current) {
        setError(errorMessage);
        toast({
          title: 'Error fetching roles',
          description: `${errorMessage}. Please check server connection.`
        });
      }
      throw err;
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, []);

  // Refresh roles
  const refreshRoles = useCallback(async (): Promise<void> => {
    try {
      await fetchRoles();
    } catch (error) {
      // Error is already handled in fetchRoles
    }
  }, [fetchRoles]);

  /**
   * Get a role by its ID
   */
  const getRoleById = useCallback((id: string) => {
    return roles.find(role => role.id === id);
  }, [roles]);

  // Create a new role
  const createRole = useCallback(async (roleData: CreateRoleData) => {
    setIsLoading(true);

    try {
      const newRole = await roleService.createRole(roleData);

      if (isMounted.current) {
        setRoles(prevRoles => [...prevRoles, newRole]);

        toast({
          title: 'Role Created',
          description: `Role "${newRole.name}" has been created successfully.`
        });
      }

      return newRole;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create role';

      if (isMounted.current) {
        setError(errorMessage);
        toast({
          title: 'Error creating role',
          description: errorMessage
        });
      }

      throw err;
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, []);

  // Update an existing role
  const updateRole = useCallback(async (id: string, roleData: UpdateRoleData) => {
    setIsLoading(true);

    try {
      const updatedRole = await roleService.updateRole(id, roleData);

      if (isMounted.current) {
        setRoles(prevRoles =>
          prevRoles.map(role =>
            role.id === id ? { ...role, ...updatedRole } : role
          )
        );

        toast({
          title: 'Role Updated',
          description: `Role "${updatedRole.name}" has been updated successfully.`
        });
      }

      return updatedRole;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update role';

      if (isMounted.current) {
        setError(errorMessage);
        toast({
          title: 'Error updating role',
          description: errorMessage
        });
      }

      throw err;
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, []);

  // Delete a role
  const deleteRole = useCallback(async (id: string) => {
    setIsLoading(true);

    try {
      await roleService.deleteRole(id);

      if (isMounted.current) {
        setRoles(prevRoles => prevRoles.filter(role => role.id !== id));

        toast({
          title: 'Role Deleted',
          description: 'The role has been deleted successfully.'
        });
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete role';

      if (isMounted.current) {
        setError(errorMessage);
        toast({
          title: 'Error deleting role',
          description: errorMessage
        });
      }

      throw err;
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, []);

  // Fetch roles on component mount
  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  return {
    roles,
    isLoading,
    error,
    refreshRoles,
    getRoleById,
    createRole,
    updateRole,
    deleteRole,
  };
};
