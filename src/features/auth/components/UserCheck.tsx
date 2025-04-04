// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { apiClient } from '@/lib/api/api-client';
import { authService } from '../services/authService';
import { User } from '../types/auth.types';
import { Loader2, UserPlus, RefreshCw, AlertCircle } from 'lucide-react';

// API endpoints
const API_VERSION = '/api/v1';
const USERS_ENDPOINT = `${API_VERSION}/users`;

/**
 * User Check Component
 * 
 * This component checks for existing users in the database and displays them.
 * It also provides options to create a default admin user if none exists.
 */
export function UserCheck() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creatingAdmin, setCreatingAdmin] = useState(false);
  const [adminCreated, setAdminCreated] = useState(false);

  // Function to check for existing users
  const checkUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Check if we're authenticated
      if (!authService.isAuthenticated()) {
        setError('Not authenticated. Please log in first.');
        setLoading(false);
        return;
      }
      
      // Fetch users from API
      const response = await apiClient.get(USERS_ENDPOINT);
      
      if (response.success && Array.isArray(response.data)) {
        setUsers(response.data);
      } else {
        setError('Failed to fetch users or unexpected response format.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Error checking users: ${errorMessage}`);
      
      if (errorMessage.includes('401')) {
        setError('Authentication error. Please make sure you are logged in.');
      } else if (errorMessage.includes('403')) {
        setError('Permission denied. Your account may not have permission to view users.');
      } else if (errorMessage.includes('404')) {
        setError('Users endpoint not found. The API may not support this operation.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Function to create a default admin user
  const createAdminUser = async () => {
    setCreatingAdmin(true);
    setError(null);
    
    try {
      const adminData = {
        username: 'admin',
        password: 'admin123',
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User'
      };
      
      const user = await authService.register(adminData);
      
      if (user) {
        setAdminCreated(true);
        // Refresh user list
        checkUsers();
      } else {
        setError('Failed to create admin user.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Error creating admin user: ${errorMessage}`);
    } finally {
      setCreatingAdmin(false);
    }
  };

  // Check for users on component mount
  useEffect(() => {
    checkUsers();
  }, []);

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>Check existing users and create an admin user if needed</CardDescription>
      </CardHeader>
      
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {adminCreated && (
          <Alert className="mb-4">
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>
              Admin user created successfully! You can now log in with:
              <div className="mt-2 p-2 bg-slate-100 rounded">
                <div><strong>Username:</strong> admin</div>
                <div><strong>Password:</strong> admin123</div>
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Existing Users</h3>
            <Button 
              variant="outline" 
              size="sm"
              onClick={checkUsers}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </>
              )}
            </Button>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : users.length > 0 ? (
            <div className="border rounded-md">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="p-2 text-left font-medium">Username</th>
                    <th className="p-2 text-left font-medium">Email</th>
                    <th className="p-2 text-left font-medium">Name</th>
                    <th className="p-2 text-left font-medium">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-t">
                      <td className="p-2">{user.username}</td>
                      <td className="p-2">{user.email}</td>
                      <td className="p-2">{user.firstName} {user.lastName}</td>
                      <td className="p-2">{user.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 border rounded-md bg-muted/10">
              <p className="text-muted-foreground">No users found in the database.</p>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          {users.length > 0 ? `${users.length} users found` : 'No users found'}
        </div>
        
        {users.length === 0 && (
          <Button 
            onClick={createAdminUser}
            disabled={creatingAdmin || loading}
          >
            {creatingAdmin ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Admin...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Create Admin User
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export default UserCheck;
