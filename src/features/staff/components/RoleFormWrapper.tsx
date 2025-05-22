import React from 'react';
import { RoleHistoryProvider } from '@/features/users/context/RoleHistoryContext';

/**
 * RoleFormWrapper component
 *
 * This component wraps role form pages with the RoleHistoryProvider
 * to share form state and history tracking between add and edit role pages.
 *
 * @deprecated Use the RoleFormWrapper from '@/features/users/components/roles/RoleFormWrapper' instead.
 */
export function RoleFormWrapper({ children }: { children: React.ReactNode }) {
  return (
    <RoleHistoryProvider>
      {children}
    </RoleHistoryProvider>
  );
}
