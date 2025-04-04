/**
 * useRoleHistory hook
 * 
 * This is a re-export of the useRoleHistory function from the RoleHistoryContext
 * to make it easier to import.
 */

import { useRoleHistory as useRoleHistoryFromContext } from '../context/RoleHistoryContext';

export const useRoleHistory = useRoleHistoryFromContext;
