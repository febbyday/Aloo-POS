import React, { useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
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
import { Switch } from '@/components/ui/switch';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ConnectionConfig, connectionConfigSchema } from '../types';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
// Update to use the factory-based service
import suppliersService from '../services/factory-suppliers-service';

interface ConnectionFormProps {
  config: ConnectionConfig;
  setConfig: (config: ConnectionConfig) => void;
  isLoading: boolean;
}

export function ConnectionForm({ config, setConfig, isLoading }: ConnectionFormProps) {
  const { toast } = useToast();

  const form = useForm<ConnectionConfig>({
    resolver: zodResolver(connectionConfigSchema) as any,
    defaultValues: config,
  });

  useEffect(() => {
    if (config) {
      form.reset(config);
    }
  }, [config, form]);

  const onSubmit = async (data: ConnectionConfig) => {
    try {
      // Validate configuration
      const validationResult = await suppliersService.validateConfig(data);

      if (!validationResult.valid) {
        // Show validation errors
        Object.entries(validationResult.errors).forEach(([field, message]) => {
          form.setError(field as any, { type: 'manual', message });
        });

        // Show warnings as toasts
        Object.entries(validationResult.warnings).forEach(([field, message]) => {
          toast({
            title: `Warning: ${field}`,
            description: message,
            variant: 'default',
          });
        });

        if (!validationResult.valid) {
          return;
        }
      }

      // Update the configuration
      setConfig(data);

      toast({
        title: 'Form updated',
        description: 'Connection configuration has been updated.',
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update connection configuration.',
      });
    }
  };

  const connectionType = form.watch('type');

  return (
    <Form {...form}>
      <form onChange={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Connection Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Main Supplier API" {...field} />
                  </FormControl>
                  <FormDescription>
                    A name to identify this connection
                  </FormDescription>
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
                      <SelectItem value="api">API</SelectItem>
                      <SelectItem value="sftp">SFTP</SelectItem>
                      <SelectItem value="database">Database</SelectItem>
                      <SelectItem value="webhook">Webhook</SelectItem>
                      <SelectItem value="manual">Manual</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    How you'll connect to your supplier's system
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Enabled</FormLabel>
                    <FormDescription>
                      Enable or disable this connection
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
              name="syncFrequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sync Frequency</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select sync frequency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="manual">Manual</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    How often to synchronize data
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-6">
            {connectionType === 'api' && (
              <>
                <FormField
                  control={form.control}
                  name="baseUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>API Base URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://api.supplier.com" {...field} />
                      </FormControl>
                      <FormDescription>
                        The base URL for the supplier's API
                      </FormDescription>
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
                        <Input type="password" placeholder="Your API key" {...field} />
                      </FormControl>
                      <FormDescription>
                        Authentication key for the API
                      </FormDescription>
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
                        <FormLabel>Username (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Username" {...field} autoComplete="username" />
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
                        <FormLabel>Password (Optional)</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Password" {...field} autoComplete="current-password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}

            {connectionType === 'sftp' && (
              <>
                <FormField
                  control={form.control}
                  name="hostName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Host Name</FormLabel>
                      <FormControl>
                        <Input placeholder="sftp.supplier.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="port"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Port</FormLabel>
                      <FormControl>
                        <Input placeholder="22" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="sftp-user" {...field} autoComplete="username" />
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
                        <Input type="password" placeholder="Password" {...field} autoComplete="current-password" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sftpPath"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SFTP Path</FormLabel>
                      <FormControl>
                        <Input placeholder="/exports/data" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {connectionType === 'database' && (
              <>
                <FormField
                  control={form.control}
                  name="hostName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Host Name</FormLabel>
                      <FormControl>
                        <Input placeholder="db.supplier.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="port"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Port</FormLabel>
                      <FormControl>
                        <Input placeholder="5432" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="databaseName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Database Name</FormLabel>
                      <FormControl>
                        <Input placeholder="supplier_db" {...field} />
                      </FormControl>
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
                          <Input placeholder="db-user" {...field} autoComplete="username" />
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
                          <Input type="password" placeholder="Password" {...field} autoComplete="current-password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}

            {connectionType === 'webhook' && (
              <FormField
                control={form.control}
                name="webhookUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Webhook URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://your-instance.com/webhook/suppliers" {...field} />
                    </FormControl>
                    <FormDescription>
                      URL that will receive supplier data updates
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {connectionType === 'manual' && (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground mb-4">
                    Manual connection doesn't require additional setup. You'll need to manually upload or enter supplier data.
                  </p>

                  <p className="text-sm font-medium">Setting up manual connection:</p>
                  <ul className="list-disc list-inside space-y-2 mt-2 text-sm text-muted-foreground">
                    <li>Prepare CSV files with supplier data</li>
                    <li>Use the import feature to upload files</li>
                    <li>Map fields during the import process</li>
                    <li>Verify imported data before finalizing</li>
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {isLoading && (
          <div className="flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
      </form>
    </Form>
  );
}