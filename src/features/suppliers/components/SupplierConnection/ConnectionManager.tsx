import React, { useState, useEffect } from 'react';
import { 
  CONNECTION_STATUS, 
  CONNECTION_TYPE, 
  ConnectionConfig, 
  ConnectionStatus, 
  ValidationResult,
  suppliersConnector
} from '../../services/suppliersConnector';
import { ConnectionForm } from './ConnectionForm';
import { Supplier } from '../../types';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Alert, 
  AlertDescription, 
  AlertTitle 
} from '@/components/ui/alert';
import { 
  AlertCircle, 
  Check, 
  RefreshCw, 
  Clock, 
  Settings, 
  Database, 
  FileDown, 
  FileUp,
  HelpCircle,
  Loader2
} from 'lucide-react';

interface ConnectionManagerProps {
  supplier: Supplier;
}

export function ConnectionManager({ supplier }: ConnectionManagerProps) {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus | null>(null);
  const [connectionConfig, setConnectionConfig] = useState<ConnectionConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState('status');

  // Load connection status on mount
  useEffect(() => {
    loadConnectionStatus();
  }, [supplier.id]);

  // Load connection status
  const loadConnectionStatus = async () => {
    setIsLoading(true);
    setIsError(false);
    
    try {
      const status = await suppliersConnector.getConnectionStatus(supplier.id);
      setConnectionStatus(status);

      if (status && status.status === CONNECTION_STATUS.CONNECTED) {
        const config = await suppliersConnector.getConnectionConfig(supplier.id);
        setConnectionConfig(config);
      }
    } catch (error) {
      console.error('Error loading connection status:', error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Start configuration 
  const handleConfigureConnection = async () => {
    // If already connected, load existing configuration
    if (connectionStatus?.status === CONNECTION_STATUS.CONNECTED && !connectionConfig) {
      try {
        const config = await suppliersConnector.getConnectionConfig(supplier.id);
        setConnectionConfig(config);
      } catch (error) {
        console.error('Error loading connection config:', error);
      }
    }
    
    setIsConfiguring(true);
  };

  // Cancel configuration
  const handleCancelConfiguration = () => {
    setIsConfiguring(false);
  };

  // Test connection
  const handleTestConnection = async (supplierId: string, config: ConnectionConfig): Promise<ValidationResult> => {
    return await suppliersConnector.testConnection(supplierId, config);
  };

  // Connect to supplier
  const handleConnect = async (supplierId: string, config: ConnectionConfig): Promise<ValidationResult> => {
    const result = await suppliersConnector.connect(supplierId, config);
    if (result.success) {
      setIsConfiguring(false);
      await loadConnectionStatus(); // Reload status after connection
    }
    return result;
  };

  // Disconnect from supplier
  const handleDisconnect = async () => {
    if (!connectionStatus) return;

    const confirmed = window.confirm('Are you sure you want to disconnect from this supplier? This will stop all automatic synchronization.');
    
    if (confirmed) {
      try {
        await suppliersConnector.disconnect(supplier.id);
        await loadConnectionStatus();
      } catch (error) {
        console.error('Error disconnecting from supplier:', error);
      }
    }
  };

  // Trigger a manual sync
  const handleTriggerSync = async () => {
    if (!connectionStatus || connectionStatus.status !== CONNECTION_STATUS.CONNECTED) return;

    setIsSyncing(true);
    try {
      await suppliersConnector.triggerSync(supplier.id);
      await loadConnectionStatus();
    } catch (error) {
      console.error('Error triggering sync:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Generate a connection report
  const handleGenerateReport = async () => {
    if (!connectionStatus || connectionStatus.status !== CONNECTION_STATUS.CONNECTED) return;

    try {
      const report = await suppliersConnector.generateReport(supplier.id);
      // Create a download link for the blob
      const url = window.URL.createObjectURL(report);
      const a = document.createElement('a');
      a.href = url;
      a.download = `supplier-connection-report-${supplier.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating report:', error);
    }
  };

  // Render connection status badge
  const renderStatusBadge = () => {
    if (!connectionStatus) return <Badge variant="outline">Unknown</Badge>;

    switch (connectionStatus.status) {
      case CONNECTION_STATUS.CONNECTED:
        return <Badge variant="success" className="bg-green-600">Connected</Badge>;
      case CONNECTION_STATUS.CONNECTING:
        return <Badge variant="warning" className="bg-yellow-600">Connecting</Badge>;
      case CONNECTION_STATUS.FAILED:
        return <Badge variant="destructive">Failed</Badge>;
      case CONNECTION_STATUS.SYNCING:
        return <Badge variant="secondary" className="bg-blue-600">Syncing</Badge>;
      case CONNECTION_STATUS.DISCONNECTED:
      default:
        return <Badge variant="outline">Disconnected</Badge>;
    }
  };

  // Render connection type badge
  const renderConnectionTypeBadge = () => {
    if (!connectionConfig) return null;

    const typeLabels = {
      [CONNECTION_TYPE.API]: 'API',
      [CONNECTION_TYPE.SFTP]: 'SFTP',
      [CONNECTION_TYPE.DATABASE]: 'Database',
      [CONNECTION_TYPE.WEBHOOK]: 'Webhook',
      [CONNECTION_TYPE.MANUAL]: 'Manual'
    };

    return <Badge variant="outline">{typeLabels[connectionConfig.type]}</Badge>;
  };

  // Render connection health
  const renderConnectionHealth = () => {
    if (!connectionStatus?.health) return null;

    const { uptime, responseTime, errorRate } = connectionStatus.health;
    
    let healthStatus = 'Excellent';
    let healthColor = 'text-green-600';
    
    if (uptime < 95 || errorRate > 5) {
      healthStatus = 'Poor';
      healthColor = 'text-red-600';
    } else if (uptime < 99 || errorRate > 2) {
      healthStatus = 'Fair';
      healthColor = 'text-yellow-600';
    } else {
      healthStatus = 'Excellent';
      healthColor = 'text-green-600';
    }

    return (
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Connection Health: <span className={healthColor}>{healthStatus}</span></h3>
        
        <div className="space-y-2">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>Uptime</span>
              <span>{uptime}%</span>
            </div>
            <Progress value={uptime} className="h-2" />
          </div>
          
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>Error Rate</span>
              <span>{errorRate}%</span>
            </div>
            <Progress value={100 - errorRate} className="h-2" />
          </div>
          
          <div className="flex justify-between text-xs">
            <span>Average Response Time</span>
            <span>{responseTime}ms</span>
          </div>
        </div>
      </div>
    );
  };

  // Render sync history
  const renderSyncHistory = () => {
    if (!connectionStatus?.syncHistory || connectionStatus.syncHistory.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <Clock className="w-8 h-8 mx-auto mb-2" />
          <p>No synchronization history available.</p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {connectionStatus.syncHistory.map((sync, index) => (
          <div key={index} className="flex items-center p-3 border rounded-md">
            <div className="mr-4">
              {sync.status === 'success' ? (
                <Check className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium">
                {sync.status === 'success' ? 'Successful sync' : 'Failed sync'}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(sync.timestamp).toLocaleString()}
              </p>
              {sync.details && (
                <p className="text-xs mt-1">{sync.details}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // If in configuration mode, show the connection form
  if (isConfiguring) {
    return (
      <ConnectionForm
        supplierId={supplier.id}
        initialConfig={connectionConfig || undefined}
        onTest={handleTestConnection}
        onConnect={handleConnect}
        onCancel={handleCancelConfiguration}
      />
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6 flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (isError) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Could not load connection status for this supplier. Please try again later.
            </AlertDescription>
          </Alert>
          <div className="flex justify-center mt-4">
            <Button onClick={loadConnectionStatus} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Not connected state
  if (!connectionStatus || connectionStatus.status === CONNECTION_STATUS.DISCONNECTED) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            Supplier Connection
            {renderStatusBadge()}
          </CardTitle>
          <CardDescription>
            This supplier is not currently connected to any external system.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Alert>
            <HelpCircle className="h-4 w-4" />
            <AlertTitle>Connection Required</AlertTitle>
            <AlertDescription>
              Connect to the supplier's system to enable automatic synchronization of product data, 
              inventory levels, and pricing.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter>
          <Button onClick={handleConfigureConnection} className="w-full">
            Configure Connection
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Connected state with tabs for different views
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Supplier Connection</CardTitle>
          <div className="flex gap-2">
            {renderConnectionTypeBadge()}
            {renderStatusBadge()}
          </div>
        </div>
        <CardDescription>
          {connectionStatus.status === CONNECTION_STATUS.CONNECTED ? (
            <span>
              Connected since {connectionStatus.lastSync ? new Date(connectionStatus.lastSync).toLocaleDateString() : 'unknown'}. 
              Next sync {connectionStatus.nextSync ? new Date(connectionStatus.nextSync).toLocaleString() : 'not scheduled'}.
            </span>
          ) : (
            <span>Connection is currently {connectionStatus.status}.</span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="status">Status</TabsTrigger>
            <TabsTrigger value="history">Sync History</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="status" className="space-y-4">
            {renderConnectionHealth()}
            
            {connectionStatus.status === CONNECTION_STATUS.CONNECTED && (
              <div className="mt-4 pt-4 border-t">
                <h3 className="text-sm font-medium mb-2">Sync Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center">
                    <FileDown className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Last downloaded: {connectionStatus.lastSync ? new Date(connectionStatus.lastSync).toLocaleString() : 'Never'}</span>
                  </div>
                  <div className="flex items-center">
                    <FileUp className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Last uploaded: {connectionStatus.lastSync ? new Date(connectionStatus.lastSync).toLocaleString() : 'Never'}</span>
                  </div>
                  <div className="flex items-center">
                    <Database className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Products synced: {connectionConfig?.settings.syncProducts ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex items-center">
                    <Settings className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Auto-ordering: {connectionConfig?.settings.automaticOrdering ? 'Enabled' : 'Disabled'}</span>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="history">
            {renderSyncHistory()}
          </TabsContent>
          
          <TabsContent value="settings">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Connection Settings</h3>
              {connectionConfig && (
                <div className="text-sm space-y-2">
                  <p>Connection Type: {connectionConfig.type}</p>
                  <p>Sync Interval: {connectionConfig.settings.syncInterval} minutes</p>
                  <p>Retry Attempts: {connectionConfig.settings.retryAttempts}</p>
                  <p>Timeout: {connectionConfig.settings.timeout} seconds</p>
                  
                  <h4 className="font-medium mt-4">Sync Options</h4>
                  <ul className="list-disc list-inside">
                    {connectionConfig.settings.syncProducts && <li>Products</li>}
                    {connectionConfig.settings.syncPricing && <li>Pricing</li>}
                    {connectionConfig.settings.syncInventory && <li>Inventory</li>}
                    {connectionConfig.settings.automaticOrdering && <li>Automatic Ordering</li>}
                    {connectionConfig.settings.notifyOnChanges && <li>Notifications</li>}
                  </ul>
                  
                  {Object.keys(connectionConfig.mapping).length > 0 && (
                    <>
                      <h4 className="font-medium mt-4">Field Mappings</h4>
                      <div className="bg-accent/50 rounded-md p-2">
                        {Object.entries(connectionConfig.mapping).map(([key, value]) => (
                          <div key={key} className="flex justify-between text-xs py-1">
                            <span>{key}</span>
                            <span className="mx-2">→</span>
                            <span>{value}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        {connectionStatus.status === CONNECTION_STATUS.CONNECTED ? (
          <>
            <Button variant="outline" onClick={handleDisconnect}>
              Disconnect
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleGenerateReport}>
                Generate Report
              </Button>
              <Button onClick={handleTriggerSync} disabled={isSyncing}>
                {isSyncing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Sync Now
                  </>
                )}
              </Button>
            </div>
          </>
        ) : (
          <Button onClick={handleConfigureConnection} className="ml-auto">
            Configure Connection
          </Button>
        )}
      </CardFooter>
    </Card>
  );
} 