import { useState, useCallback, useEffect, useRef } from 'react';
// Import the new factory-based user service
import userService from '../services/factory-user-service';
import { User, UserFilterOptions, CreateUserData, UpdateUserData } from '../types/user.types';
import { useToast } from '@/lib/toast';
import { formatErrorMessage } from '@/lib/api/utils/api-helpers';

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
  const [pagination, setPagination] = useState({
    page,
    pageSize,
    totalPages: 1,
    totalItems: 0,
  });
  const { toast } = useToast();

  // Create a ref to store the abort controller
  const abortControllerRef = useRef<AbortController | null>(null);

  // Add a reference to track if the component is mounted
  const isMountedRef = useRef<boolean>(true);

  // Fetch users with optional filtering
  const fetchUsers = useCallback(async (filters?: UserFilterOptions) => {
    // Don't proceed if the component is unmounted
    if (!isMountedRef.current) {
      console.log('[Users Hook] Component unmounted, not fetching users');
      return [];
    }

    try {
      // Cancel any ongoing request
      if (abortControllerRef.current) {
        console.log('[Users Hook] Cancelling previous request');
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }

      // Create a new abort controller for this request
      abortControllerRef.current = new AbortController();

      // Set loading state and clear any previous errors
      setLoading(true);
      setError(null);

      // Prepare the filters for the API call
      const apiFilters = {
        page,
        limit: pageSize,
        ...filters
      };

      console.log('[Users Hook] Fetching users with filters:', apiFilters);

      // Get users from the service
      const response = await userService.getAll(apiFilters);

      // Don't update state if the component is unmounted
      if (!isMountedRef.current) {
        console.log('[Users Hook] Component unmounted, not updating state');
        return [];
      }

      // Extract users and pagination info from the response
      let fetchedUsers: User[] = [];
      let totalCount = 0;

      // Handle different response formats from the factory-based service
      if (Array.isArray(response)) {
        fetchedUsers = response as User[];
        totalCount = response.length;
      } else if (response && typeof response === 'object') {
        // Handle paginated response object
        const responseObj = response as Record<string, any>;

        if ('data' in responseObj) {
          fetchedUsers = responseObj.data as User[];
        } else if ('users' in responseObj) {
          fetchedUsers = responseObj.users as User[];
        } else {
          fetchedUsers = [];
        }

        // Extract pagination metadata
        totalCount =
          ('total' in responseObj ? responseObj.total as number : 0) ||
          ('totalItems' in responseObj ? responseObj.totalItems as number : 0) ||
          fetchedUsers.length;
      }

      console.log('[Users Hook] Users fetched successfully:', fetchedUsers);

      // Update state with the fetched users
      setUsers(fetchedUsers);

      // Update total count for pagination
      setTotalUsers(totalCount);

      // Update pagination information for UI components
      setPagination({
        page,
        pageSize,
        totalPages: Math.ceil(totalCount / pageSize),
        totalItems: totalCount
      });

      return fetchedUsers;
    } catch (err: unknown) {
      // Handle aborted requests or unmounted component
      const error = err as Error;
      if (error.name === 'AbortError' || error.message === 'Request was cancelled') {
        console.log('[Users Hook] Request was cancelled:', error.message);
        return [];
      }

      // Don't update state if component unmounted
      if (!isMountedRef.current) {
        console.log('[Users Hook] Component unmounted during error handling');
        return [];
      }

      // Format and display the error
      const errorMessage = formatErrorMessage(error);
      console.error('[Users Hook] Error fetching users:', errorMessage);

      // Update state with the error
      setError(errorMessage);

      // Show toast notification
      toast({
        title: 'Failed to fetch users',
        description: errorMessage,
        variant: 'destructive',
      });

      return [];
    } finally {
      // Only update loading state if component is still mounted
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [page, pageSize, toast]);

  // Create a new user
  const createUser = useCallback(async (userData: CreateUserData) => {
    // Check if component is mounted before proceeding
    if (!isMountedRef.current) {
      console.log('[Users Hook] Component unmounted, not creating user');
      return null;
    }

    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    try {
      setLoading(true);
      setError(null);

      console.log('[Users Hook] Creating new user:', userData);

      // The factory-based service uses create instead of createUser
      const newUser = await userService.create(userData);

      console.log('[Users Hook] User created successfully:', newUser);

      // Update the users list with the new user
      setUsers(prevUsers => [...prevUsers, newUser]);

      // Show success toast
      toast({
        title: 'User Created',
        description: 'The user has been created successfully.',
        variant: 'default'
      });

      return newUser;
    } catch (err: unknown) {
      // Handle abort errors. If a creation request is cancelled, it might indicate
      // an issue elsewhere or expected behavior (e.g., component unmount).
      const error = err as Error;
      if (error.name === 'AbortError' || error.message === 'Request was cancelled') {
        console.log('[Users Hook] User creation request was cancelled or aborted:', error.message);

        // Only show error if component is still mounted and it's not due to component unmount
        if (isMountedRef.current) {
          toast({
            title: 'Request Cancelled',
            description: 'The user creation request was cancelled.',
            variant: 'destructive'
          });
        }

        // Re-throw the error so the calling component is aware
        throw error;
      }

      // Only show error if component is still mounted
      if (isMountedRef.current) {
        const errorMessage = formatErrorMessage(error) || 'Failed to create user';
        console.error('[Users Hook] Error creating user:', errorMessage);

        // Update error state
        setError(errorMessage);

        // Show error toast
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive'
        });
      }

      // Re-throw the error for the caller to handle
      throw err;
    } finally {
      // Clear any remaining timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Ensure loading state is reset if component is still mounted
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  // Update an existing user
  const updateUser = useCallback(async (userId: string, userData: UpdateUserData) => {
    try {
      setLoading(true);
      setError(null);

      console.log(`[Users Hook] Updating user ${userId}:`, userData);

      // The factory-based service uses update instead of updateUser
      const updatedUser = await userService.update(userId, userData as Record<string, any>);

      console.log('[Users Hook] User updated successfully:', updatedUser);

      // Update the users list with the updated user
      setUsers(prevUsers =>
        prevUsers.map(user => (user.id === userId ? updatedUser : user))
      );

      // Show success toast
      toast({
        title: 'User Updated',
        description: 'The user has been updated successfully.',
        variant: 'default'
      });

      return updatedUser;
    } catch (err: unknown) {
      const errorMessage = (err as Error).message || 'Failed to update user';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete a user
  const deleteUser = useCallback(async (userId: string) => {
    try {
      setLoading(true);
      setError(null);

      console.log(`[Users Hook] Deleting user ${userId}`);

      // The factory-based service uses delete instead of deleteUser
      await userService.delete(userId);

      console.log('[Users Hook] User deleted successfully');

      // Update the users list by removing the deleted user
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));

      // Show success toast
      toast({
        title: 'User Deleted',
        description: 'The user has been deleted successfully.',
        variant: 'default'
      });

      return true;
    } catch (err: unknown) {
      const errorMessage = (err as Error).message || 'Failed to delete user';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Reset a user's password
  const resetPassword = useCallback(async (userId: string, newPassword: string) => {
    try {
      setLoading(true);
      setError(null);

      console.log(`[Users Hook] Changing password for user ${userId}`);

      // The factory-based service uses changePassword with a different signature
      await userService.changePassword(
        undefined,
        {
          currentPassword: '',
          newPassword
        },
        { id: userId }
      );

      console.log('[Users Hook] Password changed successfully');

      // Show success toast
      toast({
        title: 'Password Changed',
        description: 'The password has been changed successfully.',
        variant: 'default'
      });

      return true;
    } catch (err: unknown) {
      const errorMessage = (err as Error).message || 'Failed to reset password';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

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
    // Set mounted flag to true when component mounts
    isMountedRef.current = true;
    console.log('[Users Hook] Component mounted, isMounted set to true');

    // Variable to track if the effect cleanup has run
    let isCleanedUp = false;

    // Function to load initial data
    const loadInitialData = async () => {
      try {
        if (isCleanedUp || !isMountedRef.current) {
          console.log('[Users Hook] Component already unmounted, skipping initial data load');
          return;
        }

        console.log('[Users Hook] Loading initial user data');
        await fetchUsers();
      } catch (err) {
        if (!isCleanedUp && isMountedRef.current) {
          console.error('[Users Hook] Error loading initial user data:', err);
        }
      }
    };

    if (autoLoad) {
      // Set initial loading state
      setLoading(true);

      // Use a small timeout to ensure the component is fully mounted
      // This helps avoid race conditions with other effects
      const timer = setTimeout(loadInitialData, 100);

      // Return cleanup function
      return () => {
        isCleanedUp = true;
        isMountedRef.current = false;
        clearTimeout(timer);

        console.log('[Users Hook] Component unmounting, cancelling any pending requests');
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
          abortControllerRef.current = null;
        }
      };
    }

    // If autoLoad is false, still provide cleanup function
    return () => {
      isCleanedUp = true;
      isMountedRef.current = false;

      console.log('[Users Hook] Component unmounting, cancelling any pending requests');
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
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
    pagination,
  };
}
