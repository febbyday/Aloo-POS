/**
 * User Module Wrapper
 * 
 * This component wraps the user module to ensure authentication is maintained
 * when navigating to the user module.
 */

import React, { useEffect } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { UserManagementPage } from '@/features/auth/pages/UserManagementPage';
import { Loader2 } from 'lucide-react';

export function UserModuleWrapper() {
  const { isAuthenticated, isLoading, refreshAuth } = useAuth();

  // Ensure authentication is refreshed when the component mounts
  useEffect(() => {
    const ensureAuthentication = async () => {
      if (isAuthenticated) {
        // If already authenticated, still refresh in the background
        // to ensure the token is fresh
        try {
          console.log('[USER_MODULE] Refreshing authentication in the background');
          await refreshAuth();
        } catch (error) {
          console.error('[USER_MODULE] Error refreshing authentication:', error);
        }
      }
    };

    ensureAuthentication();
  }, [isAuthenticated, refreshAuth]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <span className="text-muted-foreground">Loading user management...</span>
      </div>
    );
  }

  // Render the user management page
  return <UserManagementPage />;
}

export default UserModuleWrapper;
