import React from 'react';
import { RoleHistoryProvider } from '../../context/RoleHistoryContext';

/**
 * RoleFormWrapper component
 *
 * This component wraps role form pages with the RoleHistoryProvider
 * to share form state and history tracking between add and edit role pages.
 */
export function RoleFormWrapper({ children }: { children: React.ReactNode }) {
  return (
    <RoleHistoryProvider>
      {children}
    </RoleHistoryProvider>
  );
}
