/**
 * User Management Hook
 *
 * Custom hook for managing users and their role assignments
 * Provides functions to assign and remove users from roles
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { User } from '@/features/auth/types/auth.types';
import { useToast } from '@/lib/toast';
import { authService } from '@/features/auth/services/authService';
import { roleService } from '@/features/users/services';

interface UseUserManagementReturn {
  usersWithRole: User[];
  availableUsers: User[];
  isLoading: boolean;
  error: string | null;
  loadUsersWithRole: (roleId: string) => Promise<void>;
  assignUserToRole: (userId: string, roleId: string) => Promise<void>;
  removeUserFromRole: (userId: string, roleId: string) => Promise<void>;
}

export function useUserManagement(roleId?: string): UseUserManagementReturn {
  const [usersWithRole, setUsersWithRole] = useState<User[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Add a mounted ref to track component lifecycle
  const isMounted = useRef(true);

  // Set isMounted to false when component unmounts
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  /**
   * Load all users in the system
   */
  const loadAllUsers = useCallback(async () => {
    if (!isMounted.current) return;

    try {
      setIsLoading(true);
      const users = await authService.getAllUsers();

      if (isMounted.current) {
        setAllUsers(users);
      }
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err.message
        : 'Failed to fetch users';

      if (isMounted.current) {
        console.error('User fetch error:', err);
        setError(errorMessage);
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, []);

  /**
   * Load users with a specific role
   */
  const loadUsersWithRole = useCallback(async (roleId: string) => {
    if (!isMounted.current || !roleId) return;

    try {
      setIsLoading(true);
      setError(null);

      // First ensure we have all users loaded
      if (allUsers.length === 0) {
        await loadAllUsers();
      }

      // Get users with this role
      const usersWithRoleData = await roleService.getUsersWithRole(roleId);

      if (isMounted.current) {
        setUsersWithRole(usersWithRoleData);

        // Calculate available users (users not already assigned to this role)
        const usersWithRoleIds = new Set(usersWithRoleData.map(user => user.id));
        const availableUsersData = allUsers.filter(user => !usersWithRoleIds.has(user.id));
        setAvailableUsers(availableUsersData);
      }
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err.message
        : 'Failed to fetch users with role';

      if (isMounted.current) {
        console.error('User role fetch error:', err);
        setError(errorMessage);
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [allUsers, loadAllUsers]);

  /**
   * Assign a user to a role
   */
  const assignUserToRole = useCallback(async (userId: string, roleId: string) => {
    if (!isMounted.current) return;

    try {
      setIsLoading(true);
      setError(null);

      await roleService.assignUserToRole(userId, roleId);

      // Find the user in available users and move to users with role
      if (isMounted.current) {
        const userToMove = availableUsers.find(user => user.id === userId);

        if (userToMove) {
          setUsersWithRole(prev => [...prev, userToMove]);
          setAvailableUsers(prev => prev.filter(user => user.id !== userId));
        }

        // Refresh the lists to ensure they're up to date
        await loadUsersWithRole(roleId);
      }
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err.message
        : 'Failed to assign user to role';

      if (isMounted.current) {
        console.error('User role assignment error:', err);
        setError(errorMessage);
      }
      throw err;
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [availableUsers, loadUsersWithRole]);

  /**
   * Remove a user from a role
   */
  const removeUserFromRole = useCallback(async (userId: string, roleId: string) => {
    if (!isMounted.current) return;

    try {
      setIsLoading(true);
      setError(null);

      await roleService.removeUserFromRole(userId, roleId);

      // Find the user in users with role and move to available users
      if (isMounted.current) {
        const userToMove = usersWithRole.find(user => user.id === userId);

        if (userToMove) {
          setAvailableUsers(prev => [...prev, userToMove]);
          setUsersWithRole(prev => prev.filter(user => user.id !== userId));
        }

        // Refresh the lists to ensure they're up to date
        await loadUsersWithRole(roleId);
      }
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err.message
        : 'Failed to remove user from role';

      if (isMounted.current) {
        console.error('User role removal error:', err);
        setError(errorMessage);
      }
      throw err;
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [usersWithRole, loadUsersWithRole]);

  // Load all users on component mount
  useEffect(() => {
    loadAllUsers();
  }, [loadAllUsers]);

  // Load users with role when roleId changes
  useEffect(() => {
    if (roleId) {
      loadUsersWithRole(roleId);
    }
  }, [roleId, loadUsersWithRole]);

  return {
    usersWithRole,
    availableUsers,
    isLoading,
    error,
    loadUsersWithRole,
    assignUserToRole,
    removeUserFromRole
  };
}
