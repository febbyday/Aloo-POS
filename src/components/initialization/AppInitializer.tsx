/**
 * AppInitializer Component
 * 
 * This component handles the initialization of critical API data during application startup.
 * It uses the initialization batch manager to prioritize and batch critical API requests.
 */

import React, { useEffect, useState } from 'react';
import { useInitialization } from '@/lib/providers/InitializationProvider';
import { criticalApiInitService } from '@/lib/api/critical-api-init';
import { logger } from '@/lib/logging/logger';
import { performanceMonitor } from '@/lib/performance/performance-monitor';
import { useAuth } from '@/features/auth/hooks/useAuth';

interface AppInitializerProps {
  /**
   * Whether to show a loading indicator
   * Default: false
   */
  showLoading?: boolean;
  
  /**
   * Component to render while initializing
   */
  loadingComponent?: React.ReactNode;
  
  /**
   * Component to render when initialization fails
   */
  errorComponent?: React.ReactNode;
  
  /**
   * Children to render when initialization is complete
   */
  children: React.ReactNode;
  
  /**
   * Whether to wait for initialization to complete before rendering children
   * Default: false
   */
  waitForInitialization?: boolean;
}

/**
 * AppInitializer Component
 * 
 * This component handles the initialization of critical API data during application startup.
 */
export function AppInitializer({
  showLoading = false,
  loadingComponent = <div>Loading application...</div>,
  errorComponent = <div>Failed to initialize application. Please try again.</div>,
  children,
  waitForInitialization = false
}: AppInitializerProps) {
  // State
  const [isInitializing, setIsInitializing] = useState(false);
  const [initError, setInitError] = useState<Error | null>(null);
  
  // Get initialization context
  const { isInitialized, error: initContextError, executeAll } = useInitialization();
  
  // Get auth context
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  
  // Initialize critical API data
  useEffect(() => {
    const initializeApp = async () => {
      // Skip if already initialized or initializing
      if (isInitialized || isInitializing || !isAuthenticated || isAuthLoading) {
        return;
      }
      
      setIsInitializing(true);
      performanceMonitor.markStart('app:initialization');
      
      try {
        logger.info('Initializing application');
        
        // Check if we're in development mode
        const isDevelopment = import.meta.env.DEV;
        
        // Check if API is available with improved error handling
        const isApiAvailable = await criticalApiInitService.isApiAvailable()
          .catch(error => {
            logger.warn('API health check failed', { error });
            return false;
          });
        
        if (!isApiAvailable) {
          logger.warn('API is not available, using fallback mode');
          
          if (isDevelopment) {
            // In development mode, we continue initialization with mock data
            logger.info('Development mode - continuing with limited functionality');
            // Still allow the app to initialize even without the API in development
            await executeAll().catch(err => {
              logger.warn('Failed to execute some initialization tasks', { err });
            });
          } else {
            // In production, this is still an error condition
            throw new Error('API is not available');
          }
        } else {
          // API is available, proceed with normal initialization
          logger.info('API is available, initializing critical data');
          
          try {
            // Initialize critical API data
            await criticalApiInitService.initializeCriticalApiData();
            
            // Execute all pending initialization requests
            await executeAll();
            
            logger.info('Application initialized successfully');
          } catch (initError) {
            // Handle initialization errors gracefully
            logger.error('Error during data initialization', { initError });
            
            if (isDevelopment) {
              // Don't throw in development mode
              logger.info('Development mode - continuing despite initialization errors');
            } else {
              // Re-throw in production
              throw initError;
            }
          }
        }
      } catch (error) {
        logger.error('Error initializing application', { error });
        setInitError(error instanceof Error ? error : new Error('Unknown error initializing application'));
      } finally {
        setIsInitializing(false);
        performanceMonitor.markEnd('app:initialization');
      }
    };
    
    initializeApp();
  }, [isInitialized, isInitializing, isAuthenticated, isAuthLoading, executeAll]);
  
  // Handle error state
  const hasError = initError || initContextError;
  
  // Handle loading state
  const isLoading = isInitializing || isAuthLoading;
  
  // Render loading component if waiting for initialization
  if (waitForInitialization && (isLoading || !isInitialized)) {
    return showLoading ? <>{loadingComponent}</> : null;
  }
  
  // Render error component if there's an error
  if (hasError && waitForInitialization) {
    return <>{errorComponent}</>;
  }
  
  // Render children
  return <>{children}</>;
}

export default AppInitializer;
