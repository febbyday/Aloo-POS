import React, { useEffect } from 'react';
import { useDataOperation } from '@/hooks/useDataOperation';
import { DataState, Skeleton } from '@/components/ui/loading-state';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

/**
 * StandardDataFetchingExample
 *
 * This component demonstrates the standard pattern for data fetching
 * using the useDataOperation hook and LoadingState components.
 *
 * It serves as a reference implementation for the patterns described
 * in the component-patterns.md documentation.
 */
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

// This would normally be in a service file
const apiService = {
  getUsers: async (): Promise<User[]> => {
    try {
      // In a real implementation, this would call an API endpoint
      const response = await fetch('/api/users');

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new Error('Failed to fetch users. Server error.');
    }
  }
};

export function StandardDataFetchingExample() {
  // Set up data fetching with useDataOperation
  const {
    execute: fetchUsers,
    loading,
    error,
    data: users,
    reset
  } = useDataOperation({
    operation: apiService.getUsers,
    // Configure toast notifications
    showSuccessToast: true,
    successTitle: 'Users Loaded',
    successMessage: 'User data has been loaded successfully',
    // Configure error handling
    showErrorToast: true,
    errorTitle: 'Error Loading Users',
  });

  // Fetch data on component mount
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Function to retry loading on error
  const handleRetry = () => {
    reset(); // Clear previous error
    fetchUsers(); // Retry the operation
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>User List</CardTitle>
        <CardDescription>
          Example of standardized data fetching pattern
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Use DataState to handle loading, error, and data states */}
        <DataState
          loading={loading}
          error={error}
          text="Loading users..."
          errorComponent={
            <div className="p-4 border border-red-200 rounded bg-red-50 dark:bg-red-900/20 dark:border-red-800">
              <h3 className="text-red-800 dark:text-red-400 font-medium">Error Loading Users</h3>
              <p className="text-red-600 dark:text-red-300 text-sm mt-1">{error?.message}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={handleRetry}
              >
                <RefreshCw className="h-3 w-3 mr-2" /> Retry
              </Button>
            </div>
          }
        >
          {users ? (
            <div className="space-y-3">
              {users.map(user => (
                <div
                  key={user.id}
                  className="p-3 border rounded shadow-sm flex justify-between items-center"
                >
                  <div>
                    <h3 className="font-medium">{user.name}</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                    {user.role}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            // Show skeleton while waiting for initial data load
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="p-3 border rounded">
                  <Skeleton className="h-5 w-40 mb-2" />
                  <Skeleton className="h-4 w-60" />
                </div>
              ))}
            </div>
          )}
        </DataState>
      </CardContent>

      <CardFooter className="flex justify-between">
        <p className="text-xs text-muted-foreground">
          Last updated: {new Date().toLocaleTimeString()}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchUsers()}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardFooter>
    </Card>
  );
}