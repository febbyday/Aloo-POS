import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/lib/toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  LinkIcon,
  Settings,
  RefreshCw,
  Database
} from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import { MARKETS_FULL_ROUTES } from '@/routes/marketRoutes';
import { useMarkets } from '../hooks/useMarkets';

const MarketConnectionPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>('status');
  const [connecting, setConnecting] = useState<boolean>(false);
  const [testingConnection, setTestingConnection] = useState<boolean>(false);
  const [syncingData, setSyncingData] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'partial' | 'unknown'>('unknown');

  const testConnection = async () => {
    setTestingConnection(true);
    try {
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 2000));
      setConnectionStatus('connected');
      toast({
        title: "Connection test successful",
        description: "All market systems are accessible and responding correctly.",
      });
    } catch (error) {
      setConnectionStatus('disconnected');
      toast({
        title: "Connection test failed",
        description: "Unable to connect to one or more market systems.",
        variant: "destructive",
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const initiateConnection = async () => {
    setConnecting(true);
    try {
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 3000));
      setConnectionStatus('connected');
      toast({
        title: "Connection established",
        description: "Successfully connected to market systems.",
      });
    } catch (error) {
      setConnectionStatus('disconnected');
      toast({
        title: "Connection failed",
        description: "Failed to establish connection with market systems. Please check settings and try again.",
        variant: "destructive",
      });
    } finally {
      setConnecting(false);
    }
  };

  const syncData = async () => {
    setSyncingData(true);
    try {
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 4000));
      toast({
        title: "Data synchronized",
        description: "All market data has been successfully synchronized.",
      });
    } catch (error) {
      toast({
        title: "Synchronization failed",
        description: "Failed to synchronize market data. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setSyncingData(false);
    }
  };

  const getStatusIndicator = () => {
    switch (connectionStatus) {
      case 'connected':
        return <CheckCircle2 className="h-6 w-6 text-green-500" />;
      case 'disconnected':
        return <AlertCircle className="h-6 w-6 text-red-500" />;
      case 'partial':
        return <AlertCircle className="h-6 w-6 text-amber-500" />;
      default:
        return <Database className="h-6 w-6 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Market Connection"
        description="Connect and manage market system integrations"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Markets', href: MARKETS_FULL_ROUTES.ROOT },
          { label: 'Connection', href: MARKETS_FULL_ROUTES.CONNECTION },
        ]}
      />

      <div className="grid gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-2xl font-bold">Connection Status</CardTitle>
              <CardDescription>
                Current status of your market system integrations
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusIndicator()}
              <span className="font-medium capitalize">{connectionStatus}</span>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="status">Status</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
                <TabsTrigger value="sync">Synchronization</TabsTrigger>
              </TabsList>

              <TabsContent value="status" className="space-y-4">
                <Alert>
                  <AlertTitle className="flex items-center">
                    <Database className="h-4 w-4 mr-2" />
                    Market Connection Status
                  </AlertTitle>
                  <AlertDescription>
                    The connection to the market systems is {connectionStatus === 'unknown' ? 'not yet tested' : connectionStatus}.
                    {connectionStatus === 'connected' && ' All systems are functioning correctly.'}
                    {connectionStatus === 'disconnected' && ' Please check your settings and try reconnecting.'}
                    {connectionStatus === 'partial' && ' Some systems are not properly connected.'}
                  </AlertDescription>
                </Alert>

                <div className="flex flex-col space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Market Data Services</CardTitle>
                        <CardDescription>Central market data repository</CardDescription>
                      </CardHeader>
                      <CardContent className="flex justify-between items-center">
                        <span>Status: {connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}</span>
                        {connectionStatus === 'connected' ?
                          <CheckCircle2 className="h-5 w-5 text-green-500" /> :
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        }
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Inventory Sync</CardTitle>
                        <CardDescription>Market inventory management</CardDescription>
                      </CardHeader>
                      <CardContent className="flex justify-between items-center">
                        <span>Status: {connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}</span>
                        {connectionStatus === 'connected' ?
                          <CheckCircle2 className="h-5 w-5 text-green-500" /> :
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        }
                      </CardContent>
                    </Card>
                  </div>

                  <div className="flex space-x-4">
                    <Button onClick={testConnection} disabled={testingConnection}>
                      {testingConnection ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Testing...</>
                      ) : (
                        <><RefreshCw className="mr-2 h-4 w-4" /> Test Connection</>
                      )}
                    </Button>

                    <Button onClick={initiateConnection} variant={connectionStatus === 'connected' ? 'outline' : 'default'} disabled={connecting}>
                      {connecting ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Connecting...</>
                      ) : (
                        <><LinkIcon className="mr-2 h-4 w-4" /> {connectionStatus === 'connected' ? 'Reconnect' : 'Connect'}</>
                      )}
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <Alert>
                  <AlertTitle className="flex items-center">
                    <Settings className="h-4 w-4 mr-2" />
                    Connection Settings
                  </AlertTitle>
                  <AlertDescription>
                    Configure your market connection settings. Changes will require reconnection.
                  </AlertDescription>
                </Alert>

                <Card>
                  <CardHeader>
                    <CardTitle>API Configuration</CardTitle>
                    <CardDescription>Settings for the market API connections</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      The connection settings are managed through the system configuration.
                      Contact your administrator to modify these settings if needed.
                    </p>

                    <Button variant="outline" onClick={() => navigate(MARKETS_FULL_ROUTES.SETTINGS)}>
                      <Settings className="mr-2 h-4 w-4" /> Go to Settings
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="sync" className="space-y-4">
                <Alert>
                  <AlertTitle className="flex items-center">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Data Synchronization
                  </AlertTitle>
                  <AlertDescription>
                    Synchronize data between your POS system and market platforms.
                  </AlertDescription>
                </Alert>

                <Card>
                  <CardHeader>
                    <CardTitle>Synchronization Status</CardTitle>
                    <CardDescription>Last sync: {new Date().toLocaleString()}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>Products</span>
                        <span className="text-green-500">Synchronized</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Inventory</span>
                        <span className="text-green-500">Synchronized</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Staff Assignments</span>
                        <span className="text-amber-500">Partial Sync</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Market Settings</span>
                        <span className="text-green-500">Synchronized</span>
                      </div>

                      <Button onClick={syncData} disabled={syncingData || connectionStatus !== 'connected'} className="w-full mt-4">
                        {syncingData ? (
                          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Synchronizing...</>
                        ) : (
                          <><RefreshCw className="mr-2 h-4 w-4" /> Synchronize Data</>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MarketConnectionPage;