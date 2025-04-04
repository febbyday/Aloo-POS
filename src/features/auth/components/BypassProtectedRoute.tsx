/**
 * Bypass Protected Route Component
 * 
 * This is a modified version of the ProtectedRoute component that always allows access.
 * It completely bypasses authentication checks for all routes.
 */

import React from 'react';
import { DevelopmentModeIndicator } from './DevelopmentModeIndicator';

interface ProtectedRouteProps {
  children: React.ReactNode;
  permissions?: string[];
  roles?: string[];
  redirectPath?: string;
}

/**
 * Bypass Protected Route Component
 * Always allows access to the route regardless of authentication status
 */
export function ProtectedRoute({ 
  children, 
  permissions = [], 
  roles = [], 
  redirectPath = '/login' 
}: ProtectedRouteProps) {
  // Log that we're using the bypass version
  console.log('[AUTH BYPASS] Using bypass ProtectedRoute - Authentication checks disabled');
  
  // Log permissions and roles that would normally be required
  if (permissions.length > 0 || roles.length > 0) {
    const permissionMessage = permissions.length > 0
      ? `Permissions needed: ${permissions.join(', ')}`
      : '';

    const rolesMessage = roles.length > 0
      ? `Roles needed: ${roles.join(', ')}`
      : '';

    console.log(
      '[AUTH BYPASS] Access requirements bypassed.',
      permissionMessage,
      rolesMessage
    );
  }

  // Always render the children with a development mode indicator
  return (
    <>
      {children}
      <DevelopmentModeIndicator />
    </>
  );
}
