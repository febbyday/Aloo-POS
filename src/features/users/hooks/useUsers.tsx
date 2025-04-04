import { useState, useCallback, useEffect } from 'react';
import { userService } from '../services/userService';
import { User, UserFilterOptions, CreateUserData, UpdateUserData } from '../types/user.types';
import { useToast } from '@/components/ui/use-toast';

interface UseUsersOptions {
  initialPage?: number;
  initialPageSize?: number;
  autoLoad?: boolean;
}

export function useUsers(options: UseUsersOptions = {}) {
  const { initialPage = 1, initialPageSize = 10, autoLoad = true } = options;

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(autoLoad);
  const [error, setError] = useState<string | null>(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const { toast } = useToast();

  // Fetch users with optional filtering
  const fetchUsers = useCallback(async (filters?: UserFilterOptions) => {
    try {
      setLoading(true);
      setError(null);

      const response = await userService.getAllUsers({
        page,
        limit: pageSize,
        ...filters
      });

      setUsers(response.users || []);
      setTotalUsers(response.total || response.users?.length || 0);

      return response.users;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch users';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, toast]);

  // Create a new user
  const createUser = async (userData: CreateUserData) => {
    try {
      setLoading(true);
      const newUser = await userService.createUser(userData);

      // Refresh the user list
      await fetchUsers();

      toast({
        title: 'Success',
        description: 'User created successfully'
      });

      return newUser;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to create user';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update an existing user
  const updateUser = async (userId: string, userData: UpdateUserData) => {
    try {
      setLoading(true);
      const updatedUser = await userService.updateUser(userId, userData);

      // Refresh the user list
      await fetchUsers();

      toast({
        title: 'Success',
        description: 'User updated successfully'
      });

      return updatedUser;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update user';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Delete a user
  const deleteUser = async (userId: string) => {
    try {
      setLoading(true);
      await userService.deleteUser(userId);

      // Refresh the user list
      await fetchUsers();

      toast({
        title: 'Success',
        description: 'User deleted successfully'
      });

      return true;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to delete user';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Reset a user's password
  const resetPassword = async (userId: string, newPassword: string) => {
    try {
      setLoading(true);
      await userService.resetPassword(userId, newPassword);

      toast({
        title: 'Success',
        description: 'Password reset successfully'
      });

      return true;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to reset password';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchUsers({ page: newPage, limit: pageSize });
  };

  // Handle page size change
  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1); // Reset to first page
    fetchUsers({ page: 1, limit: newPageSize });
  };

  // Load users on mount if autoLoad is true
  useEffect(() => {
    if (autoLoad) {
      fetchUsers();
    }
  }, [autoLoad, fetchUsers]);

  return {
    users,
    loading,
    error,
    totalUsers,
    page,
    pageSize,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    resetPassword,
    handlePageChange,
    handlePageSizeChange,
    pagination: {
      page,
      pageSize,
      totalPages: Math.ceil(totalUsers / pageSize),
      totalItems: totalUsers,
    }
  };
}
