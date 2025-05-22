/**
 * User Module Wrapper
 *
 * This component wraps the user module to ensure authentication is maintained
 * when navigating to the user module.
 */

import React, { useEffect, useRef } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { UserManagementPage } from '@/features/auth/pages/UserManagementPage';
import { Loader2 } from 'lucide-react';

export function UserModuleWrapper() {
  const { isAuthenticated, isLoading, refreshAuth } = useAuth();

  // Use a ref to track if the component is mounted
  const isMountedRef = useRef<boolean>(true);

  // Use a ref to track if we've already attempted a refresh
  const refreshAttemptedRef = useRef<boolean>(false);

  // Ensure authentication is refreshed when the component mounts
  useEffect(() => {
    // Set mounted flag
    isMountedRef.current = true;

    const ensureAuthentication = async () => {
      // Skip if we've already attempted a refresh or component unmounted
      if (refreshAttemptedRef.current || !isMountedRef.current) {
        return;
      }

      // Mark that we've attempted a refresh
      refreshAttemptedRef.current = true;

      if (isAuthenticated) {
        // If already authenticated, still refresh in the background
        // to ensure the token is fresh
        try {
          console.log('[USER_MODULE] Refreshing authentication in the background');
          await refreshAuth();
        } catch (error) {
          // Only log error if component is still mounted
          if (isMountedRef.current) {
            console.error('[USER_MODULE] Error refreshing authentication:', error);
          }
        }
      }
    };

    // Only run if not already loading
    if (!isLoading) {
      ensureAuthentication();
    }

    // Cleanup function
    return () => {
      isMountedRef.current = false;
    };
  }, [isAuthenticated, isLoading, refreshAuth]);

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
