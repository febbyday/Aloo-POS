/**
 * InitializationProvider
 * 
 * This provider manages the initialization of critical API data during application startup.
 * It uses the initialization batch manager to prioritize and batch critical API requests.
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { 
  InitializationBatchManager, 
  getInitializationBatchManager, 
  RequestPriority,
  initBatchClient
} from '../api/initialization-batch-manager';
import { performanceMonitor } from '../performance/performance-monitor';
import { logger } from '../logging/logger';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { RefreshCw, Server, AlertTriangle } from 'lucide-react';

// Context type
interface InitializationContextType {
  /**
   * The initialization batch manager instance
   */
  initManager: InitializationBatchManager;
  
  /**
   * Execute a GET request with priority
   */
  get: <T = any>(
    endpoint: string, 
    params?: Record<string, any>, 
    priority?: RequestPriority
  ) => Promise<T>;
  
  /**
   * Execute a POST request with priority
   */
  post: <T = any>(
    endpoint: string, 
    data?: any, 
    priority?: RequestPriority
  ) => Promise<T>;
  
  /**
   * Execute all pending initialization requests
   */
  executeAll: () => Promise<void>;
  
  /**
   * Execute only critical initialization requests
   */
  executeCritical: () => Promise<void>;
  
  /**
   * Whether initialization has completed
   */
  isInitialized: boolean;
  
  /**
   * Whether initialization is in progress
   */
  isPending: boolean;
  
  /**
   * Any error that occurred during initialization
   */
  error: Error | null;
  
  /**
   * Current queue sizes by priority
   */
  queueSizes: Record<string, number>;
  
  /**
   * Reset and retry initialization
   */
  retry: () => void;
  
  /**
   * API connection status
   */
  connectionStatus: 'connecting' | 'connected' | 'failed';
}

// Create context
const InitializationContext = createContext<InitializationContextType | null>(null);

// Provider props
interface InitializationProviderProps {
  /**
   * Children components
   */
  children: React.ReactNode;
  
  /**
   * Whether to automatically execute critical requests
   * @default true
   */
  autoExecuteCritical?: boolean;
  
  /**
   * Whether to automatically execute all requests
   * @default true
   */
  autoExecuteAll?: boolean;
  
  /**
   * Delay before executing all requests (ms)
   * @default 500
   */
  executeAllDelay?: number;

  /**
   * Whether to wait for initialization before rendering children
   * @default false
   */
  waitForInitialization?: boolean;
}

/**
 * InitializationProvider Component
 * 
 * Provides initialization batch functionality to the application
 */
export function InitializationProvider({
  children,
  autoExecuteCritical = true,
  autoExecuteAll = true,
  executeAllDelay = 500,
  waitForInitialization = false
}: InitializationProviderProps) {
  // Get or create the initialization batch manager
  const initManagerRef = useRef<InitializationBatchManager>(
    getInitializationBatchManager({
      autoExecuteCritical,
      trackInitPerformance: true
    })
  );
  
  // State
  const [isInitialized, setIsInitialized] = useState(false);
  const [isPending, setIsPending] = useState(true);
  const [apiError, setApiError] = useState<Error | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'failed'>('connecting');
  const isInitializing = useRef(false);
  const [queueSizes, setQueueSizes] = useState<Record<string, number>>({
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    background: 0,
    total: 0
  });
  
  // Get auth context
  const auth = useAuth();
  
  // Update queue sizes
  useEffect(() => {
    // Update queue sizes initially
    setQueueSizes(initManagerRef.current.queueSizes);
    
    // Set up an interval to update the queue sizes
    const interval = setInterval(() => {
      setQueueSizes(initManagerRef.current.queueSizes);
    }, 100);
    
    return () => {
      clearInterval(interval);
    };
  }, []);
  
  // Initialize critical data
  const initializeCritical = useCallback(async () => {
    if (isInitializing.current) return;
    if (!auth.isAuthenticated && !import.meta.env.DEV) return;

    try {
      logger.debug('Starting critical initialization');
      performanceMonitor.markStart('initializeCritical');
      isInitializing.current = true;
      setIsPending(true);
      setConnectionStatus('connecting');

      // Test API connectivity before attempting initialization
      try {
        // First try the root API endpoint rather than a specific health endpoint
        // which may not exist in some API implementations
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        
        logger.debug(`Testing API connectivity to ${apiUrl}`);
        
        try {
          // First attempt - try the base API URL
          await fetch(`${apiUrl}/api/v1`, {
            method: 'GET',
            mode: 'cors',
            credentials: 'include',
            // Short timeout to avoid hanging
            signal: AbortSignal.timeout(3000)
          });
          
          setConnectionStatus('connected');
          logger.debug('API connectivity test successful');
        } catch (firstError) {
          // If first approach fails, try the root URL as fallback
          logger.debug('First API check failed, trying root URL', firstError);
          
          try {
            await fetch(apiUrl, {
              method: 'GET',
              mode: 'cors',
              // Short timeout to avoid hanging
              signal: AbortSignal.timeout(3000)
            });
            
            // If we can at least reach the server, consider it connected
            setConnectionStatus('connected');
            logger.debug('Root API connectivity test successful');
          } catch (rootError) {
            // Both attempts failed - API is likely down
            logger.error('All API connectivity tests failed', rootError);
            setConnectionStatus('failed');
            setApiError(new Error(
              `API server appears to be offline or inaccessible at ${apiUrl}. ` +
              `Please ensure the backend is running.`
            ));
          }
        }
      } catch (connectionError) {
        // This is the outer catch - should only happen for unexpected errors
        logger.error('Unexpected error during API connectivity check', connectionError);
        setConnectionStatus('failed');
        setApiError(connectionError instanceof Error 
          ? connectionError 
          : new Error('Failed to connect to API due to an unexpected error'));
        
        // Don't re-throw - allow the app to continue in degraded mode
        // This prevents the entire app from crashing
      }

      // Execute only critical requests
      await initManagerRef.current.executeCriticalBatch();

      logger.debug('Critical initialization completed');
      performanceMonitor.markEnd('initializeCritical');
    } catch (error) {
      logger.error('Critical initialization failed', error);
      setApiError(error instanceof Error ? error : new Error('Critical initialization failed'));
    } finally {
      isInitializing.current = false;
      setIsPending(false);
    }
  }, [auth.isAuthenticated, import.meta.env.DEV]);

  // Initialize all data
  const initializeAll = useCallback(async () => {
    if (!auth.isAuthenticated && !import.meta.env.DEV) return;
    if (connectionStatus === 'failed') {
      logger.warn('Skipping full initialization due to API connectivity issues');
      return;
    }

    try {
      logger.debug('Starting full initialization');
      performanceMonitor.markStart('initializeAll');

      // Execute all pending requests
      await initManagerRef.current.executeAll();

      logger.debug('Full initialization completed');
      performanceMonitor.markEnd('initializeAll');
      setIsInitialized(true);
    } catch (error) {
      logger.error('Full initialization failed', error);
      setApiError(error instanceof Error ? error : new Error('Full initialization failed'));
    }
  }, [auth.isAuthenticated, import.meta.env.DEV, connectionStatus]);

  // Auto-execute critical requests
  useEffect(() => {
    if (autoExecuteCritical && (auth.isAuthenticated || import.meta.env.DEV) && !isInitializing.current && !isInitialized) {
      initializeCritical();
    }
  }, [autoExecuteCritical, initializeCritical, auth.isAuthenticated, isInitialized]);

  // Auto-execute all requests
  useEffect(() => {
    if (
      autoExecuteAll && 
      (auth.isAuthenticated || import.meta.env.DEV) && 
      !isInitializing.current && 
      !isInitialized &&
      connectionStatus === 'connected'
    ) {
      const timer = setTimeout(() => {
        initializeAll();
      }, executeAllDelay);
      return () => clearTimeout(timer);
    }
  }, [autoExecuteAll, initializeAll, auth.isAuthenticated, isInitialized, executeAllDelay, connectionStatus]);

  // Create request methods
  const get = useCallback(<T = any>(
    endpoint: string, 
    params?: Record<string, any>, 
    priority: RequestPriority = RequestPriority.MEDIUM
  ) => {
    return initBatchClient.get<T>(endpoint, params, priority, initManagerRef.current);
  }, []);

  const post = useCallback(<T = any>(
    endpoint: string, 
    data?: any, 
    priority: RequestPriority = RequestPriority.MEDIUM
  ) => {
    return initBatchClient.post<T>(endpoint, data, priority, initManagerRef.current);
  }, []);

  // Reset and retry initialization
  const reset = useCallback(() => {
    setIsInitialized(false);
    setIsPending(true);
    setApiError(null);
    setConnectionStatus('connecting');
    initializeCritical();
    // Always return void to satisfy return type
    return;
  }, [initializeCritical]);

  // Context value
  const contextValue: InitializationContextType = {
    initManager: initManagerRef.current,
    get,
    post,
    executeCritical: initializeCritical,
    executeAll: initializeAll,
    isInitialized,
    isPending,
    error: apiError,
    queueSizes,
    retry: reset,
    connectionStatus
  };

  // API Connectivity Error UI Component
  const ApiConnectivityError = () => (
    <div className="flex items-center justify-center h-screen bg-background">
      <div className="w-full max-w-md p-6">
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>API Connection Error</AlertTitle>
          <AlertDescription>
            {apiError?.message || 'Unable to connect to the API server. Please check if the backend service is running.'}
          </AlertDescription>
        </Alert>
        
        <div className="flex flex-col space-y-4">
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => {
              setApiError(null);
              setConnectionStatus('connecting');
              initializeCritical();
            }}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry Connection
          </Button>
          
          <div className="text-sm text-muted-foreground">
            <p className="mb-2">Troubleshooting steps:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Ensure the API server is running at {import.meta.env.VITE_API_URL || 'http://localhost:5000'}</li>
              <li>Check your network connection</li>
              <li>Verify firewall settings aren't blocking the connection</li>
              <li>Check browser console for detailed error information</li>
            </ul>
          </div>
          
          <div className="flex items-center justify-center text-sm text-muted-foreground mt-6">
            <Server className="mr-2 h-4 w-4" />
            API Status: <span className="font-semibold text-destructive ml-1">Offline</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Render content based on connection status and initialization state
  const renderContent = () => {
    // Show error UI if API connection failed
    if (waitForInitialization && connectionStatus === 'failed' && apiError) {
      return <ApiConnectivityError />;
    }
    
    // Show children once initialization is complete or if not waiting for initialization
    return children;
  };

  // Render provider with context
  return (
    <InitializationContext.Provider value={contextValue}>
      {renderContent()}
    </InitializationContext.Provider>
  );
}

/**
 * Hook to use the initialization context
 */
export function useInitialization(): InitializationContextType {
  const context = useContext(InitializationContext);
  
  if (!context) {
    throw new Error('useInitialization must be used within an InitializationProvider');
  }
  
  return context;
}

export default InitializationProvider;
