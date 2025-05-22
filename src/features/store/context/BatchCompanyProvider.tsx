/**
 * BatchCompanyProvider
 * 
 * This provider manages company data with optimized batch requests during initialization.
 */

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { useProviderBatchInit } from '@/lib/hooks/useProviderBatchInit';
import { RequestPriority } from '@/lib/api/initialization-batch-manager';
import { logger } from '@/lib/logging/logger';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { performanceMonitor } from '@/lib/performance/performance-monitor';
import { CompanyInfo } from '@/types/common';

// Default company info
const defaultCompanyInfo: CompanyInfo = {
  name: "Your Company Name",
  address: "123 Business Street, City, Country",
  phone: "+1 234 567 890",
  email: "contact@company.com"
};

// Context type
interface BatchCompanyContextType {
  /**
   * Company information
   */
  companyInfo: CompanyInfo;
  
  /**
   * Current user information
   */
  currentUser: {
    name: string;
    role: string;
  };
  
  /**
   * Whether company data is loading
   */
  loading: boolean;
  
  /**
   * Error that occurred during loading
   */
  error: Error | null;
  
  /**
   * Refresh company data
   */
  refreshCompanyInfo: () => Promise<void>;
  
  /**
   * Update company information
   */
  updateCompanyInfo: (info: Partial<CompanyInfo>) => Promise<void>;
}

// Create context
const BatchCompanyContext = createContext<BatchCompanyContextType | undefined>(undefined);

// Provider props
interface BatchCompanyProviderProps {
  children: ReactNode;
}

/**
 * BatchCompanyProvider Component
 * 
 * Provides company data with optimized batch requests during initialization.
 */
export function BatchCompanyProvider({ children }: BatchCompanyProviderProps) {
  // State
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(defaultCompanyInfo);
  const [currentUser, setCurrentUser] = useState({
    name: "John Doe",
    role: "Administrator"
  });
  
  // Get auth context
  const { isAuthenticated, user } = useAuth();
  
  // Use provider batch initialization
  const {
    batchGet,
    batchPost,
    isInitializing,
    isInitialized,
    error,
    initialize
  } = useProviderBatchInit({
    providerName: 'company',
    autoInit: true,
    defaultPriority: RequestPriority.CRITICAL,
    dependencies: [isAuthenticated],
    onInitComplete: () => {
      logger.info('Company provider initialized successfully');
    },
    onInitError: (error) => {
      logger.error('Error initializing company provider', { error });
    }
  });
  
  // Fetch company info
  const fetchCompanyInfo = useCallback(async () => {
    performanceMonitor.markStart('company:fetchCompanyInfo');
    try {
      // Use batch request to fetch company info
      const companyData = await batchGet<CompanyInfo>('company/INFO', undefined, RequestPriority.CRITICAL);
      
      if (companyData) {
        setCompanyInfo(companyData);
      }
    } catch (err) {
      logger.error('Error fetching company info', { error: err });
    } finally {
      performanceMonitor.markEnd('company:fetchCompanyInfo');
    }
  }, [batchGet]);
  
  // Update company info
  const updateCompanyInfo = useCallback(async (info: Partial<CompanyInfo>) => {
    performanceMonitor.markStart('company:updateCompanyInfo');
    try {
      // Use batch request to update company info
      await batchPost<CompanyInfo>('company/UPDATE', {
        ...companyInfo,
        ...info
      }, RequestPriority.HIGH);
      
      // Update local state
      setCompanyInfo(prevInfo => ({
        ...prevInfo,
        ...info
      }));
    } catch (err) {
      logger.error('Error updating company info', { error: err });
      throw err;
    } finally {
      performanceMonitor.markEnd('company:updateCompanyInfo');
    }
  }, [batchPost, companyInfo]);
  
  // Refresh company info
  const refreshCompanyInfo = useCallback(async () => {
    await fetchCompanyInfo();
  }, [fetchCompanyInfo]);
  
  // Update current user when auth user changes
  useEffect(() => {
    if (user) {
      setCurrentUser({
        name: `${user.firstName} ${user.lastName}`,
        role: user.role
      });
    }
  }, [user]);
  
  // Initialize data when authenticated
  useEffect(() => {
    if (isAuthenticated && !isInitialized && !isInitializing) {
      logger.info('Initializing company provider');
      
      // Add requests to the batch
      fetchCompanyInfo();
      
      // Execute the batch
      initialize();
    }
  }, [isAuthenticated, isInitialized, isInitializing, fetchCompanyInfo, initialize]);
  
  // Context value
  const contextValue: BatchCompanyContextType = {
    companyInfo,
    currentUser,
    loading: isInitializing,
    error,
    refreshCompanyInfo,
    updateCompanyInfo
  };
  
  return (
    <BatchCompanyContext.Provider value={contextValue}>
      {children}
    </BatchCompanyContext.Provider>
  );
}

/**
 * Hook to use the batch company context
 */
export function useBatchCompany(): BatchCompanyContextType {
  const context = useContext(BatchCompanyContext);
  
  if (!context) {
    throw new Error('useBatchCompany must be used within a BatchCompanyProvider');
  }
  
  return context;
}

export default BatchCompanyProvider;
