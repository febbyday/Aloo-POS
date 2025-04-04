import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Clock, CloudOff, ExternalLink, RefreshCw, Save, Settings2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { SUPPLIERS_FULL_ROUTES } from '@/routes/supplierRoutes';
import { ConnectionForm } from '../components/ConnectionForm';
import { ConnectionStatus } from '../components/ConnectionStatus';
import { SyncSettings } from '../components/SyncSettings';
import { ConnectionHistory } from '../components/ConnectionHistory';
import { FieldMapping } from '../components/FieldMapping';
import { suppliersService } from '../services/suppliersService';
import { 
  ConnectionConfig, 
  ConnectionStatus as ConnStatus,
  ConnectionType 
} from '../types';

export function SupplierConnectionPage() {
  const [activeTab, setActiveTab] = useState('setup');
  const [loading, setLoading] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionConfig, setConnectionConfig] = useState<ConnectionConfig>({
    type: 'api' as ConnectionType,
    name: '',
    baseUrl: '',
    apiKey: '',
    username: '',
    password: '',
    hostName: '',
    port: '',
    databaseName: '',
    webhookUrl: '',
    sftpPath: '',
    syncFrequency: 'daily',
    enabled: false,
    lastSynced: null,
    fieldMapping: {},
  });
  const [connectionStatus, setConnectionStatus] = useState<ConnStatus>({
    status: 'disconnected',
    lastChecked: null,
    message: 'Not connected',
    latency: null,
    health: null,
  });

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchConnectionConfig = async () => {
      try {
        setLoading(true);
        const config = await suppliersService.fetchConnectionConfig();
        if (config) {
          setConnectionConfig(config);
        }
        
        const status = await suppliersService.checkConnectionStatus();
        if (status) {
          setConnectionStatus(status);
        }
      } catch (error) {
        console.error('Error fetching connection config:', error);
        toast({
          variant: 'destructive',
          title: 'Error fetching connection configuration',
          description: 'Could not load your supplier connection settings.',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchConnectionConfig();
  }, [toast]);

  const handleSaveConfig = async () => {
    try {
      setSavingConfig(true);
      await suppliersService.saveConnectionConfig(connectionConfig);
      toast({
        title: 'Connection configuration saved',
        description: 'Your supplier connection settings have been updated.',
      });
    } catch (error) {
      console.error('Error saving connection config:', error);
      toast({
        variant: 'destructive',
        title: 'Error saving configuration',
        description: 'Could not save your supplier connection settings.',
      });
    } finally {
      setSavingConfig(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      setTestingConnection(true);
      const result = await suppliersService.testConnection(connectionConfig);
      setConnectionStatus(result);
      
      if (result.status === 'connected') {
        toast({
          title: 'Connection successful',
          description: 'Successfully connected to supplier system.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Connection failed',
          description: result.message || 'Could not connect to supplier system.',
        });
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      toast({
        variant: 'destructive',
        title: 'Error testing connection',
        description: 'An error occurred while testing the supplier connection.',
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleTriggerSync = async () => {
    try {
      setLoading(true);
      const result = await suppliersService.triggerSync();
      
      toast({
        title: 'Synchronization started',
        description: 'Supplier data synchronization has been initiated.',
      });
      
      // Update last synced time
      setConnectionConfig(prev => ({
        ...prev,
        lastSynced: new Date().toISOString(),
      }));
    } catch (error) {
      console.error('Error triggering sync:', error);
      toast({
        variant: 'destructive',
        title: 'Synchronization failed',
        description: 'Could not trigger supplier data synchronization.',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = () => {
    switch (connectionStatus.status) {
      case 'connected':
        return <Badge className="ml-2">Connected</Badge>;
      case 'error':
        return <Badge variant="destructive" className="ml-2">Error</Badge>;
      case 'warning':
        return <Badge variant="warning" className="ml-2">Warning</Badge>;
      default:
        return <Badge variant="outline" className="ml-2">Disconnected</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={SUPPLIERS_FULL_ROUTES.LIST}>Suppliers</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbPage>Connection</BreadcrumbPage>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="pb-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Supplier Connection {getStatusBadge()}</h1>
            <p className="text-muted-foreground">
              Configure and manage your supplier system integration
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleTestConnection}
              disabled={testingConnection}
            >
              {testingConnection ? (
                <>Testing<RefreshCw className="ml-2 h-4 w-4 animate-spin" /></>
              ) : (
                <>Test Connection<ExternalLink className="ml-2 h-4 w-4" /></>
              )}
            </Button>
            <Button 
              onClick={handleSaveConfig}
              disabled={savingConfig}
            >
              {savingConfig ? (
                <>Saving<RefreshCw className="ml-2 h-4 w-4 animate-spin" /></>
              ) : (
                <>Save<Save className="ml-2 h-4 w-4" /></>
              )}
            </Button>
          </div>
        </div>
      </div>

      <Separator className="my-6" />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="setup">Setup</TabsTrigger>
          <TabsTrigger value="status">Status</TabsTrigger>
          <TabsTrigger value="mapping">Field Mapping</TabsTrigger>
          <TabsTrigger value="sync">Synchronization</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="setup" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Connection Setup</CardTitle>
              <CardDescription>
                Configure your supplier connection details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ConnectionForm 
                config={connectionConfig} 
                setConfig={setConnectionConfig}
                isLoading={loading}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="status" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Connection Status</CardTitle>
              <CardDescription>
                Monitor your supplier connection health
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ConnectionStatus 
                status={connectionStatus}
                onRefresh={handleTestConnection}
                isRefreshing={testingConnection}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="mapping" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Field Mapping</CardTitle>
              <CardDescription>
                Map fields between your system and supplier's system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldMapping 
                mapping={connectionConfig.fieldMapping}
                onChange={(mapping) => setConnectionConfig(prev => ({
                  ...prev,
                  fieldMapping: mapping
                }))}
                isLoading={loading}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sync" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Synchronization Settings</CardTitle>
              <CardDescription>
                Configure how and when data syncs between systems
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SyncSettings 
                config={connectionConfig}
                onChange={setConnectionConfig}
                isLoading={loading}
              />
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground flex items-center">
                <Clock className="mr-2 h-4 w-4" />
                {connectionConfig.lastSynced 
                  ? `Last synced: ${new Date(connectionConfig.lastSynced).toLocaleString()}`
                  : 'Never synced'}
              </div>
              <Button 
                onClick={handleTriggerSync}
                disabled={loading || connectionStatus.status !== 'connected'}
              >
                {loading ? (
                  <>Syncing<RefreshCw className="ml-2 h-4 w-4 animate-spin" /></>
                ) : (
                  <>Sync Now<RefreshCw className="ml-2 h-4 w-4" /></>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Connection History</CardTitle>
              <CardDescription>
                View historical connection and synchronization events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ConnectionHistory isLoading={loading} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Also provide a default export for backward compatibility
export default SupplierConnectionPage; 