/**
 * Use Session Management Hook
 * 
 * Custom hook for accessing session management functionality from the auth context
 */

import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useSessionManagement = () => {
  const { 
    sessionManagement,
    getSessions, 
    getCurrentSession, 
    revokeSession, 
    revokeAllSessions, 
    refreshSession 
  } = useContext(AuthContext);

  return {
    // Session state from context
    activeSessions: sessionManagement.activeSessions,
    hasMultipleDevices: sessionManagement.hasMultipleDevices,
    isLoading: sessionManagement.isLoading,
    
    // Session management methods
    getSessions,
    getCurrentSession,
    revokeSession,
    revokeAllSessions,
    refreshSession
  };
};

export default useSessionManagement;
