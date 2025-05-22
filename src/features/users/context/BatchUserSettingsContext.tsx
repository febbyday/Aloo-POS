/**
 * BatchUserSettingsProvider
 * 
 * This provider manages user settings with optimized batch requests during initialization.
 */

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { useProviderBatchInit } from '@/lib/hooks/useProviderBatchInit';
import { RequestPriority } from '@/lib/api/initialization-batch-manager';
import { logger } from '@/lib/logging/logger';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { performanceMonitor } from '@/lib/performance/performance-monitor';
import { useToast } from '@/lib/toast';

// Define user settings types
export interface UserSettings {
  // UI Settings
  theme: 'light' | 'dark' | 'system';
  sidebarCollapsed: boolean;
  tablePageSize: number;
  dateFormat: string;
  timeFormat: string;
  
  // Notification Settings
  emailNotifications: boolean;
  pushNotifications: boolean;
  notificationSounds: boolean;
  
  // Dashboard Settings
  dashboardLayout: string;
  dashboardWidgets: string[];
  
  // POS Settings
  defaultPaymentMethod: string;
  quickAddProducts: string[];
  receiptTemplate: string;
  
  // Other Settings
  language: string;
  timezone: string;
}

// Default user settings
const defaultSettings: UserSettings = {
  theme: 'system',
  sidebarCollapsed: false,
  tablePageSize: 10,
  dateFormat: 'MM/DD/YYYY',
  timeFormat: 'h:mm A',
  emailNotifications: true,
  pushNotifications: true,
  notificationSounds: true,
  dashboardLayout: 'default',
  dashboardWidgets: ['sales', 'inventory', 'customers', 'tasks'],
  defaultPaymentMethod: 'cash',
  quickAddProducts: [],
  receiptTemplate: 'default',
  language: 'en',
  timezone: 'UTC'
};

interface BatchUserSettingsContextType {
  /**
   * User settings
   */
  settings: UserSettings;
  
  /**
   * Whether settings are loading
   */
  loading: boolean;
  
  /**
   * Error that occurred during loading
   */
  error: Error | null;
  
  /**
   * Update user settings
   */
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
  
  /**
   * Reset user settings to defaults
   */
  resetSettings: () => Promise<void>;
  
  /**
   * Get a specific setting
   */
  getSetting: <K extends keyof UserSettings>(key: K) => UserSettings[K];
}

// Create context
const BatchUserSettingsContext = createContext<BatchUserSettingsContextType | undefined>(undefined);

// Provider props
interface BatchUserSettingsProviderProps {
  children: ReactNode;
}

/**
 * BatchUserSettingsProvider Component
 * 
 * Provides user settings with optimized batch requests during initialization.
 */
export function BatchUserSettingsProvider({ children }: BatchUserSettingsProviderProps) {
  // State
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  
  // Get auth context
  const { isAuthenticated, user } = useAuth();
  
  // Get toast
  const toast = useToast();
  
  // Use provider batch initialization
  const {
    batchGet,
    batchPost,
    isInitializing,
    isInitialized,
    error,
    initialize
  } = useProviderBatchInit({
    providerName: 'userSettings',
    autoInit: true,
    defaultPriority: RequestPriority.MEDIUM,
    dependencies: [isAuthenticated, user?.id],
    onInitComplete: () => {
      logger.info('User settings provider initialized successfully');
    },
    onInitError: (error) => {
      logger.error('Error initializing user settings provider', { error });
    }
  });
  
  // Fetch user settings
  const fetchSettings = useCallback(async () => {
    if (!isAuthenticated || !user?.id) return;
    
    performanceMonitor.markStart('userSettings:fetchSettings');
    try {
      // Use batch request to fetch user settings
      const settingsData = await batchGet<UserSettings>('users/SETTINGS', undefined, RequestPriority.MEDIUM);
      
      if (settingsData) {
        setSettings(settingsData);
      } else {
        // Use default settings as fallback
        setSettings(defaultSettings);
      }
    } catch (err) {
      logger.error('Error fetching user settings', { error: err });
      // Use default settings as fallback
      setSettings(defaultSettings);
    } finally {
      performanceMonitor.markEnd('userSettings:fetchSettings');
    }
  }, [isAuthenticated, user?.id, batchGet]);
  
  // Update user settings
  const updateSettings = useCallback(async (newSettings: Partial<UserSettings>) => {
    if (!isAuthenticated || !user?.id) return;
    
    performanceMonitor.markStart('userSettings:updateSettings');
    try {
      // Merge new settings with current settings
      const updatedSettings = {
        ...settings,
        ...newSettings
      };
      
      // Use batch request to update user settings
      await batchPost('users/UPDATE_SETTINGS', updatedSettings, RequestPriority.LOW);
      
      // Update local state
      setSettings(updatedSettings);
      
      toast.success('Success', 'User settings updated');
    } catch (err) {
      logger.error('Error updating user settings', { error: err });
      toast.error('Error', 'Failed to update user settings');
      throw err;
    } finally {
      performanceMonitor.markEnd('userSettings:updateSettings');
    }
  }, [isAuthenticated, user?.id, batchPost, settings, toast]);
  
  // Reset user settings to defaults
  const resetSettings = useCallback(async () => {
    if (!isAuthenticated || !user?.id) return;
    
    performanceMonitor.markStart('userSettings:resetSettings');
    try {
      // Use batch request to reset user settings
      await batchPost('users/RESET_SETTINGS', undefined, RequestPriority.LOW);
      
      // Update local state
      setSettings(defaultSettings);
      
      toast.success('Success', 'User settings reset to defaults');
    } catch (err) {
      logger.error('Error resetting user settings', { error: err });
      toast.error('Error', 'Failed to reset user settings');
      throw err;
    } finally {
      performanceMonitor.markEnd('userSettings:resetSettings');
    }
  }, [isAuthenticated, user?.id, batchPost, toast]);
  
  // Get a specific setting
  const getSetting = useCallback(<K extends keyof UserSettings>(key: K): UserSettings[K] => {
    return settings[key];
  }, [settings]);
  
  // Initialize data when authenticated
  useEffect(() => {
    if (isAuthenticated && user?.id && !isInitialized && !isInitializing) {
      logger.info('Initializing user settings provider');
      
      // Add requests to the batch
      fetchSettings();
      
      // Execute the batch
      initialize();
    }
  }, [isAuthenticated, user?.id, isInitialized, isInitializing, fetchSettings, initialize]);
  
  // Context value
  const contextValue: BatchUserSettingsContextType = {
    settings,
    loading: isInitializing,
    error,
    updateSettings,
    resetSettings,
    getSetting
  };
  
  return (
    <BatchUserSettingsContext.Provider value={contextValue}>
      {children}
    </BatchUserSettingsContext.Provider>
  );
}

/**
 * Hook to use the batch user settings context
 */
export function useBatchUserSettings(): BatchUserSettingsContextType {
  const context = useContext(BatchUserSettingsContext);
  
  if (!context) {
    throw new Error('useBatchUserSettings must be used within a BatchUserSettingsProvider');
  }
  
  return context;
}

export default BatchUserSettingsContext;
