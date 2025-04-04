import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Loader, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

// Connection type enum
enum ConnectionType {
  API = 'api',
  WEBHOOK = 'webhook',
  DATABASE = 'database',
  FILE = 'file',
  MANUAL = 'manual'
}

// Connection status enum
enum ConnectionStatus {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  PENDING = 'pending',
  ERROR = 'error'
}

// Connection form schema
const connectionFormSchema = z.object({
  name: z.string().min(3, { message: 'Connection name must be at least 3 characters' }),
  type: z.nativeEnum(ConnectionType),
  url: z.string().url({ message: 'Must be a valid URL' }).optional(),
  apiKey: z.string().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
  databaseName: z.string().optional(),
  refreshInterval: z.number().min(5).max(1440).default(60),
  autoSync: z.boolean().default(true),
});

// Field mapping schema
const fieldMappingSchema = z.object({
  localField: z.string(),
  remoteField: z.string(),
  transform: z.string().optional(),
});

// Sync options schema
const syncOptionsSchema = z.object({
  syncProducts: z.boolean().default(true),
  syncInventory: z.boolean().default(true),
  syncPrices: z.boolean().default(true),
  syncOrders: z.boolean().default(false),
  syncCustomers: z.boolean().default(false),
  conflictResolution: z.enum(['local', 'remote', 'newest', 'ask']).default('ask'),
  syncDirection: z.enum(['bidirectional', 'import', 'export']).default('import'),
  frequency: z.enum(['manual', 'hourly', 'daily', 'weekly']).default('daily'),
});

// Inferred types from schemas
type ConnectionFormValues = z.infer<typeof connectionFormSchema>;
type FieldMapping = z.infer<typeof fieldMappingSchema>;
type SyncOptions = z.infer<typeof syncOptionsSchema>;

// Mock connection history data
const mockConnectionHistory = [
  { id: '1', timestamp: new Date(Date.now() - 86400000).toISOString(), status: 'success', itemsProcessed: 142 },
  { id: '2', timestamp: new Date(Date.now() - 172800000).toISOString(), status: 'error', errorMessage: 'API timeout' },
  { id: '3', timestamp: new Date(Date.now() - 259200000).toISOString(), status: 'success', itemsProcessed: 87 },
];

export function ShopConnectionPage() {
  // Form and state management
  const [activeTab, setActiveTab] = useState('setup');
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED);
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([
    { localField: 'name', remoteField: 'shop_name' },
    { localField: 'code', remoteField: 'store_id' },
    { localField: 'address.street', remoteField: 'address_line1' },
  ]);
  const [syncOptions, setSyncOptions] = useState<SyncOptions>({
    syncProducts: true,
    syncInventory: true,
    syncPrices: true,
    syncOrders: false,
    syncCustomers: false,
    conflictResolution: 'ask',
    syncDirection: 'import',
    frequency: 'daily'
  });

  // Set up form with validation
  const form = useForm<ConnectionFormValues>({
    resolver: zodResolver(connectionFormSchema),
    defaultValues: {
      name: '',
      type: ConnectionType.API,
      url: '',
      apiKey: '',
      username: '',
      password: '',
      databaseName: '',
      refreshInterval: 60,
      autoSync: true,
    },
  });

  // Handle form submission
  const onSubmit = async (data: ConnectionFormValues) => {
    console.log('Connection data:', data);
    
    // Simulate API call
    try {
      // In a real app, this would save the connection settings to the server
      await new Promise(resolve => setTimeout(resolve, 1000));
      setConnectionStatus(ConnectionStatus.CONNECTED);
      setActiveTab('sync');
    } catch (error) {
      console.error('Error saving connection:', error);
    }
  };

  // Test connection
  const testConnection = async () => {
    setIsTesting(true);
    
    try {
      // In a real app, this would test the connection with the external system
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate success (in a real app, this would be based on the response)
      setConnectionStatus(ConnectionStatus.CONNECTED);
      alert('Connection successful!');
    } catch (error) {
      setConnectionStatus(ConnectionStatus.ERROR);
      alert('Connection failed: ' + error);
    } finally {
      setIsTesting(false);
    }
  };

  // Trigger sync
  const triggerSync = async () => {
    setIsSyncing(true);
    
    try {
      // In a real app, this would trigger a sync with the external system
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Simulate success
      setLastSyncTime(new Date().toISOString());
      alert('Sync completed successfully!');
    } catch (error) {
      alert('Sync failed: ' + error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Render connection status badge
  const renderStatusBadge = () => {
    switch (connectionStatus) {
      case ConnectionStatus.CONNECTED:
        return <Badge className="ml-2" variant="success">Connected</Badge>;
      case ConnectionStatus.DISCONNECTED:
        return <Badge className="ml-2" variant="secondary">Disconnected</Badge>;
      case ConnectionStatus.PENDING:
        return <Badge className="ml-2" variant="warning">Pending</Badge>;
      case ConnectionStatus.ERROR:
        return <Badge className="ml-2" variant="destructive">Error</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Shop Connection</h1>
        {renderStatusBadge()}
      </div>
      
      <p className="text-muted-foreground mb-6">
        Configure connections between your POS system and external shop systems. 
        This allows you to sync inventory, products, and other shop data.
      </p>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="setup">Connection Setup</TabsTrigger>
          <TabsTrigger value="mapping">Field Mapping</TabsTrigger>
          <TabsTrigger value="sync">Sync Options</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Connection Setup Tab */}
        <TabsContent value="setup">
          <Card>
            <CardHeader>
              <CardTitle>Connection Settings</CardTitle>
              <CardDescription>Configure your connection to an external shop system</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Connection Name</FormLabel>
                        <FormControl>
                          <Input placeholder="My Shop System" {...field} />
                        </FormControl>
                        <FormDescription>A unique name for this connection</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Connection Type</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select connection type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={ConnectionType.API}>API</SelectItem>
                            <SelectItem value={ConnectionType.WEBHOOK}>Webhook</SelectItem>
                            <SelectItem value={ConnectionType.DATABASE}>Database</SelectItem>
                            <SelectItem value={ConnectionType.FILE}>File Import/Export</SelectItem>
                            <SelectItem value={ConnectionType.MANUAL}>Manual</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>How do you want to connect to your shop system?</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.watch('type') === ConnectionType.API && (
                    <>
                      <FormField
                        control={form.control}
                        name="url"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>API URL</FormLabel>
                            <FormControl>
                              <Input placeholder="https://api.myshopsystem.com" {...field} />
                            </FormControl>
                            <FormDescription>The base URL for the shop system API</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="apiKey"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>API Key</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormDescription>Your shop system API key</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  {form.watch('type') === ConnectionType.DATABASE && (
                    <>
                      <FormField
                        control={form.control}
                        name="url"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Database URL</FormLabel>
                            <FormControl>
                              <Input placeholder="mysql://user:pass@localhost:3306/dbname" {...field} />
                            </FormControl>
                            <FormDescription>Connection string for the database</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="databaseName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Database Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  <FormField
                    control={form.control}
                    name="refreshInterval"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Refresh Interval (minutes)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} />
                        </FormControl>
                        <FormDescription>How often should we check for updates?</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="autoSync"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Automatic Sync</FormLabel>
                          <FormDescription>
                            Automatically sync data at the specified interval
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={testConnection} disabled={isTesting}>
                      {isTesting ? 
                        <>
                          <Loader className="mr-2 h-4 w-4 animate-spin" />
                          Testing...
                        </> : 
                        'Test Connection'
                      }
                    </Button>
                    <Button type="submit">Save Connection</Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Field Mapping Tab */}
        <TabsContent value="mapping">
          <Card>
            <CardHeader>
              <CardTitle>Field Mapping</CardTitle>
              <CardDescription>Map fields between your POS system and external shop system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 font-medium text-sm text-muted-foreground pb-2">
                  <div>Local Field</div>
                  <div>Remote Field</div>
                  <div>Transform (Optional)</div>
                </div>
                
                <Separator />
                
                {fieldMappings.map((mapping, index) => (
                  <div key={index} className="grid grid-cols-3 gap-4">
                    <Input value={mapping.localField} onChange={(e) => {
                      const newMappings = [...fieldMappings];
                      if (newMappings[index]) {
                        newMappings[index].localField = e.target.value;
                        setFieldMappings(newMappings);
                      }
                    }} />
                    <Input value={mapping.remoteField} onChange={(e) => {
                      const newMappings = [...fieldMappings];
                      if (newMappings[index]) {
                        newMappings[index].remoteField = e.target.value;
                        setFieldMappings(newMappings);
                      }
                    }} />
                    <Input value={mapping.transform || ''} placeholder="e.g., uppercase(), trim()" onChange={(e) => {
                      const newMappings = [...fieldMappings];
                      if (newMappings[index]) {
                        newMappings[index].transform = e.target.value;
                        setFieldMappings(newMappings);
                      }
                    }} />
                  </div>
                ))}
                
                <Button 
                  variant="outline" 
                  onClick={() => setFieldMappings([...fieldMappings, { localField: '', remoteField: '' }])}
                >
                  Add Field Mapping
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab('setup')}>Back</Button>
              <Button onClick={() => setActiveTab('sync')}>Next: Sync Options</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Sync Options Tab */}
        <TabsContent value="sync">
          <Card>
            <CardHeader>
              <CardTitle>Sync Options</CardTitle>
              <CardDescription>Configure what data to sync and how to handle conflicts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">What to Sync</h3>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {Object.entries({
                      syncProducts: 'Sync Products',
                      syncInventory: 'Sync Inventory',
                      syncPrices: 'Sync Prices',
                      syncOrders: 'Sync Orders',
                      syncCustomers: 'Sync Customers'
                    }).map(([key, label]) => (
                      <div key={key} className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                        <label htmlFor={key} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          {label}
                        </label>
                        <Switch
                          id={key}
                          checked={syncOptions[key as keyof SyncOptions] as boolean}
                          onCheckedChange={(checked) => {
                            setSyncOptions({
                              ...syncOptions,
                              [key]: checked
                            });
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Sync Settings</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="syncDirection" className="text-sm font-medium">
                        Sync Direction
                      </label>
                      <Select 
                        value={syncOptions.syncDirection}
                        onValueChange={(value) => {
                          setSyncOptions({
                            ...syncOptions,
                            syncDirection: value as SyncOptions['syncDirection']
                          });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bidirectional">Bidirectional</SelectItem>
                          <SelectItem value="import">Import Only (From External)</SelectItem>
                          <SelectItem value="export">Export Only (To External)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="frequency" className="text-sm font-medium">
                        Sync Frequency
                      </label>
                      <Select 
                        value={syncOptions.frequency}
                        onValueChange={(value) => {
                          setSyncOptions({
                            ...syncOptions,
                            frequency: value as SyncOptions['frequency']
                          });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manual">Manual Only</SelectItem>
                          <SelectItem value="hourly">Hourly</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="conflictResolution" className="text-sm font-medium">
                        Conflict Resolution
                      </label>
                      <Select 
                        value={syncOptions.conflictResolution}
                        onValueChange={(value) => {
                          setSyncOptions({
                            ...syncOptions,
                            conflictResolution: value as SyncOptions['conflictResolution']
                          });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="local">Prefer Local (POS System)</SelectItem>
                          <SelectItem value="remote">Prefer Remote (External System)</SelectItem>
                          <SelectItem value="newest">Use Newest Data</SelectItem>
                          <SelectItem value="ask">Ask User</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                {lastSyncTime && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>Last Sync Successful</AlertTitle>
                    <AlertDescription>
                      Last synchronized on {new Date(lastSyncTime).toLocaleString()}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab('mapping')}>Back</Button>
              <Button onClick={triggerSync} disabled={isSyncing || connectionStatus !== ConnectionStatus.CONNECTED}>
                {isSyncing ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  'Sync Now'
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Sync History</CardTitle>
              <CardDescription>View past synchronization activities and results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockConnectionHistory.map((history) => (
                  <div 
                    key={history.id} 
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center space-x-4">
                      {history.status === 'success' ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : history.status === 'error' ? (
                        <XCircle className="h-5 w-5 text-red-500" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      )}
                      <div>
                        <p className="font-medium">
                          {history.status === 'success' ? 'Successful Sync' : 'Failed Sync'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(history.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {history.status === 'success' ? (
                        <p className="text-sm">{history.itemsProcessed} items processed</p>
                      ) : (
                        <p className="text-sm text-red-500">{history.errorMessage}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ShopConnectionPage; 