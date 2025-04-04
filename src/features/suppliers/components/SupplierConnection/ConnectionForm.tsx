import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  CONNECTION_TYPE,
  ConnectionConfig, 
  ValidationResult 
} from '../../services/suppliersConnector';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

// Define zod schema for form validation based on ConnectionConfig
const connectionFormSchema = z.object({
  type: z.enum([
    CONNECTION_TYPE.API,
    CONNECTION_TYPE.SFTP,
    CONNECTION_TYPE.DATABASE,
    CONNECTION_TYPE.WEBHOOK,
    CONNECTION_TYPE.MANUAL
  ]),
  credentials: z.object({
    apiKey: z.string().optional(),
    username: z.string().optional(),
    password: z.string().optional(),
    host: z.string().optional(),
    port: z.number().optional(),
    database: z.string().optional(),
    certificatePath: z.string().optional(),
    webhookUrl: z.string().optional(),
    secretKey: z.string().optional(),
  }),
  settings: z.object({
    syncInterval: z.number().min(5).max(1440),
    retryAttempts: z.number().min(1).max(10),
    timeout: z.number().min(10).max(300),
    syncFields: z.array(z.string()),
    syncProducts: z.boolean(),
    syncPricing: z.boolean(),
    syncInventory: z.boolean(),
    automaticOrdering: z.boolean(),
    notifyOnChanges: z.boolean(),
  }),
  mapping: z.record(z.string())
});

type ConnectionFormValues = z.infer<typeof connectionFormSchema>;

interface ConnectionFormProps {
  supplierId: string;
  initialConfig?: ConnectionConfig;
  onTest: (supplierId: string, config: ConnectionConfig) => Promise<ValidationResult>;
  onConnect: (supplierId: string, config: ConnectionConfig) => Promise<ValidationResult>;
  onCancel: () => void;
}

export function ConnectionForm({
  supplierId,
  initialConfig,
  onTest,
  onConnect,
  onCancel
}: ConnectionFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<ValidationResult | null>(null);
  const [activeTab, setActiveTab] = useState('general');

  // Default form values
  const defaultValues: ConnectionFormValues = {
    type: CONNECTION_TYPE.API,
    credentials: {
      apiKey: '',
      username: '',
      password: '',
      host: '',
      port: undefined,
      database: '',
      certificatePath: '',
      webhookUrl: '',
      secretKey: '',
    },
    settings: {
      syncInterval: 60,
      retryAttempts: 3,
      timeout: 30,
      syncFields: ['products', 'pricing', 'inventory'],
      syncProducts: true,
      syncPricing: true,
      syncInventory: true,
      automaticOrdering: false,
      notifyOnChanges: true,
    },
    mapping: {}
  };

  // Initialize the form
  const form = useForm<ConnectionFormValues>({
    resolver: zodResolver(connectionFormSchema),
    defaultValues: initialConfig || defaultValues,
  });

  // Watch the connection type to conditionally render form fields
  const connectionType = form.watch('type');

  // Handle form submission
  const onSubmit = async (data: ConnectionFormValues) => {
    setIsLoading(true);
    try {
      const result = await onConnect(supplierId, data as ConnectionConfig);
      // If successful, you may want to show a notification or redirect
      if (!result.success) {
        // Handle connection failure - display errors in the UI
        setTestResult(result);
      }
    } catch (error) {
      console.error('Error connecting to supplier:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle test connection
  const handleTestConnection = async () => {
    setIsLoading(true);
    setTestResult(null);
    
    try {
      const formData = form.getValues();
      const result = await onTest(supplierId, formData as ConnectionConfig);
      setTestResult(result);
    } catch (error) {
      console.error('Error testing connection:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Field mapping component
  const FieldMappingSection = () => {
    const [newKey, setNewKey] = useState('');
    const [newValue, setNewValue] = useState('');
    const mapping = form.watch('mapping');

    const addMapping = () => {
      if (newKey && newValue) {
        form.setValue('mapping', {
          ...mapping,
          [newKey]: newValue
        });
        setNewKey('');
        setNewValue('');
      }
    };

    const removeMapping = (key: string) => {
      const updatedMapping = { ...mapping };
      delete updatedMapping[key];
      form.setValue('mapping', updatedMapping);
    };

    return (
      <div className="space-y-4">
        <div className="flex gap-2 mb-4">
          <Input 
            placeholder="Field name" 
            value={newKey} 
            onChange={(e) => setNewKey(e.target.value)}
            className="flex-1"
          />
          <Input 
            placeholder="Mapped value" 
            value={newValue} 
            onChange={(e) => setNewValue(e.target.value)}
            className="flex-1"
          />
          <Button type="button" onClick={addMapping} variant="outline">Add</Button>
        </div>
        
        <div className="bg-accent/50 rounded-md p-2">
          {Object.keys(mapping).length === 0 ? (
            <p className="text-sm text-muted-foreground p-2">No field mappings defined.</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(mapping).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center p-2 bg-background rounded-md">
                  <div>
                    <strong className="text-sm">{key}</strong>
                    <span className="mx-2 text-muted-foreground">→</span>
                    <span className="text-sm">{value}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removeMapping(key)}
                    className="h-7 w-7 p-0"
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Conditionally render fields based on connection type
  const renderCredentialsFields = () => {
    switch (connectionType) {
      case CONNECTION_TYPE.API:
        return (
          <>
            <FormField
              control={form.control}
              name="credentials.apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Key</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="credentials.host"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Host</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );
      
      case CONNECTION_TYPE.SFTP:
        return (
          <>
            <FormField
              control={form.control}
              name="credentials.host"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SFTP Host</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="credentials.port"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SFTP Port</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="credentials.username"
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
              name="credentials.password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );
      
      case CONNECTION_TYPE.DATABASE:
        return (
          <>
            <FormField
              control={form.control}
              name="credentials.host"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Database Host</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="credentials.port"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Database Port</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="credentials.database"
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
            <FormField
              control={form.control}
              name="credentials.username"
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
              name="credentials.password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );
      
      case CONNECTION_TYPE.WEBHOOK:
        return (
          <>
            <FormField
              control={form.control}
              name="credentials.webhookUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Webhook URL</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="credentials.secretKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Secret Key</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );
      
      case CONNECTION_TYPE.MANUAL:
        return (
          <div className="text-center py-4">
            <p className="text-muted-foreground">
              Manual connection doesn't require credentials.
              Data will need to be imported manually by staff.
            </p>
          </div>
        );
        
      default:
        return null;
    }
  };

  // Render the test result alert if available
  const renderTestResult = () => {
    if (!testResult) return null;

    return (
      <Alert variant={testResult.success ? "default" : "destructive"} className="mt-4">
        {testResult.success ? (
          <CheckCircle2 className="h-4 w-4" />
        ) : (
          <AlertCircle className="h-4 w-4" />
        )}
        <AlertTitle>
          {testResult.success ? "Connection successful" : "Connection failed"}
        </AlertTitle>
        <AlertDescription>
          {testResult.message}
          {testResult.details && testResult.details.length > 0 && (
            <ul className="mt-2 list-disc list-inside">
              {testResult.details.map((detail, index) => (
                <li key={index} className="text-sm">
                  <strong>{detail.field}</strong>: {detail.issue}
                </li>
              ))}
            </ul>
          )}
        </AlertDescription>
      </Alert>
    );
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Configure Supplier Connection</CardTitle>
        <CardDescription>
          Set up the connection to the supplier's system for automated data synchronization.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4 mb-6">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="credentials">Credentials</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
                <TabsTrigger value="mapping">Field Mapping</TabsTrigger>
              </TabsList>
              
              <TabsContent value="general" className="space-y-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Connection Type</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={(value) => field.onChange(value as CONNECTION_TYPE)}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a connection type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={CONNECTION_TYPE.API}>API</SelectItem>
                          <SelectItem value={CONNECTION_TYPE.SFTP}>SFTP</SelectItem>
                          <SelectItem value={CONNECTION_TYPE.DATABASE}>Database</SelectItem>
                          <SelectItem value={CONNECTION_TYPE.WEBHOOK}>Webhook</SelectItem>
                          <SelectItem value={CONNECTION_TYPE.MANUAL}>Manual</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select the method to connect to the supplier's system.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
              
              <TabsContent value="credentials" className="space-y-4">
                {renderCredentialsFields()}
              </TabsContent>
              
              <TabsContent value="settings" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="settings.syncInterval"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sync Interval (minutes)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="settings.retryAttempts"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Retry Attempts</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="settings.timeout"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Timeout (seconds)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="space-y-4 mt-6">
                  <h3 className="text-sm font-medium">Sync Settings</h3>
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="settings.syncProducts"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Sync Products</FormLabel>
                            <FormDescription>
                              Synchronize product catalog from supplier
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
                    
                    <FormField
                      control={form.control}
                      name="settings.syncPricing"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Sync Pricing</FormLabel>
                            <FormDescription>
                              Synchronize price updates from supplier
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
                    
                    <FormField
                      control={form.control}
                      name="settings.syncInventory"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Sync Inventory</FormLabel>
                            <FormDescription>
                              Synchronize inventory levels from supplier
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
                    
                    <FormField
                      control={form.control}
                      name="settings.automaticOrdering"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Automatic Ordering</FormLabel>
                            <FormDescription>
                              Allow system to place orders automatically based on inventory levels
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
                    
                    <FormField
                      control={form.control}
                      name="settings.notifyOnChanges"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Notify On Changes</FormLabel>
                            <FormDescription>
                              Receive notifications when supplier data changes
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
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="mapping" className="space-y-4">
                <FormItem>
                  <FormLabel>Field Mapping</FormLabel>
                  <FormDescription>
                    Map fields between your system and the supplier's system.
                  </FormDescription>
                  <FieldMappingSection />
                </FormItem>
              </TabsContent>
            </Tabs>
            
            {renderTestResult()}
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={handleTestConnection}
            disabled={isLoading}
          >
            {isLoading && activeTab === 'credentials' ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              'Test Connection'
            )}
          </Button>
          <Button
            type="submit"
            onClick={form.handleSubmit(onSubmit)}
            disabled={isLoading}
          >
            {isLoading && activeTab !== 'credentials' ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              'Connect'
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
} 