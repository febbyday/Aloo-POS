import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation } from 'react-router-dom';
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
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { ApiMonitoringDashboard } from '@/components/monitoring/ApiMonitoringDashboard';

// Define the form schema
const monitoringSettingsSchema = z.object({
  // General settings
  enableMonitoring: z.boolean().default(true),
  logLevel: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  enableRemoteLogging: z.boolean().default(false),
  remoteLoggingUrl: z.string().url().optional().or(z.literal('')),

  // API monitoring settings
  enableApiMonitoring: z.boolean().default(true),
  apiErrorThreshold: z.coerce.number().min(0).max(100).default(5),
  apiResponseTimeThreshold: z.coerce.number().min(0).default(1000),

  // Retry settings
  maxRetries: z.coerce.number().min(0).max(10).default(3),
  retryBackoffFactor: z.coerce.number().min(1).max(5).default(2),
  initialRetryDelay: z.coerce.number().min(100).max(10000).default(500),

  // Notification settings
  enableErrorNotifications: z.boolean().default(true),
  notifyOnHighErrorRate: z.boolean().default(true),
  errorRateThreshold: z.coerce.number().min(1).max(100).default(10),

  // Data retention
  dataRetentionDays: z.coerce.number().min(1).max(90).default(30),
});

type MonitoringSettingsValues = z.infer<typeof monitoringSettingsSchema>;

// Default values
const defaultValues: MonitoringSettingsValues = {
  enableMonitoring: true,
  logLevel: 'info',
  enableRemoteLogging: false,
  remoteLoggingUrl: '',

  enableApiMonitoring: true,
  apiErrorThreshold: 5,
  apiResponseTimeThreshold: 1000,

  maxRetries: 3,
  retryBackoffFactor: 2,
  initialRetryDelay: 500,

  enableErrorNotifications: true,
  notifyOnHighErrorRate: true,
  errorRateThreshold: 10,

  dataRetentionDays: 30,
};

export function MonitoringSettings() {
  const { toast } = useToast();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('settings');

  // Read the tab parameter from the URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get('tab');
    if (tabParam === 'settings' || tabParam === 'dashboard') {
      setActiveTab(tabParam);
    }
  }, [location.search]);

  // Initialize form
  const form = useForm<MonitoringSettingsValues>({
    resolver: zodResolver(monitoringSettingsSchema),
    defaultValues,
  });

  // Form submission handler
  const onSubmit = (values: MonitoringSettingsValues) => {
    // In a real app, this would save to a settings store or API
    console.log('Monitoring settings saved:', values);

    // Show success toast
    toast({
      title: 'Settings saved',
      description: 'Your monitoring settings have been updated.',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Monitoring & Logging</h2>
        <p className="text-muted-foreground">
          Configure how the application monitors and logs API errors and performance.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* General Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>
                    Configure general monitoring and logging settings.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="enableMonitoring"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Enable Monitoring</FormLabel>
                          <FormDescription>
                            Turn on/off all monitoring features
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
                    name="logLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Log Level</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select log level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="debug">Debug</SelectItem>
                            <SelectItem value="info">Info</SelectItem>
                            <SelectItem value="warn">Warning</SelectItem>
                            <SelectItem value="error">Error</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Minimum level of logs to capture
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="enableRemoteLogging"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Enable Remote Logging</FormLabel>
                          <FormDescription>
                            Send logs to a remote logging service
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

                  {form.watch('enableRemoteLogging') && (
                    <FormField
                      control={form.control}
                      name="remoteLoggingUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Remote Logging URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://logging.example.com/api/logs" {...field} />
                          </FormControl>
                          <FormDescription>
                            URL of the remote logging service
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </CardContent>
              </Card>

              {/* API Monitoring Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>API Monitoring</CardTitle>
                  <CardDescription>
                    Configure how API errors and performance are monitored.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="enableApiMonitoring"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Enable API Monitoring</FormLabel>
                          <FormDescription>
                            Track API errors, retries, and performance
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

                  {form.watch('enableApiMonitoring') && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="apiErrorThreshold"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Error Rate Threshold (%)</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} />
                              </FormControl>
                              <FormDescription>
                                Error rate percentage that triggers warnings
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="apiResponseTimeThreshold"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Response Time Threshold (ms)</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} />
                              </FormControl>
                              <FormDescription>
                                Response time that triggers performance warnings
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Retry Configuration</h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name="maxRetries"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Max Retries</FormLabel>
                                <FormControl>
                                  <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="initialRetryDelay"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Initial Delay (ms)</FormLabel>
                                <FormControl>
                                  <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="retryBackoffFactor"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Backoff Factor</FormLabel>
                                <FormControl>
                                  <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Notification Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>
                    Configure error notifications and alerts.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="enableErrorNotifications"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Enable Error Notifications</FormLabel>
                          <FormDescription>
                            Show notifications for API errors
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

                  {form.watch('enableErrorNotifications') && (
                    <>
                      <FormField
                        control={form.control}
                        name="notifyOnHighErrorRate"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                              <FormLabel>Notify on High Error Rate</FormLabel>
                              <FormDescription>
                                Send alerts when error rate exceeds threshold
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

                      {form.watch('notifyOnHighErrorRate') && (
                        <FormField
                          control={form.control}
                          name="errorRateThreshold"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Error Rate Alert Threshold (%)</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} />
                              </FormControl>
                              <FormDescription>
                                Percentage of errors that triggers an alert
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Data Retention */}
              <Card>
                <CardHeader>
                  <CardTitle>Data Retention</CardTitle>
                  <CardDescription>
                    Configure how long monitoring data is kept.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="dataRetentionDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data Retention Period (days)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormDescription>
                          How long to keep monitoring data before it's automatically purged
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button type="submit">Save Settings</Button>
              </div>
            </form>
          </Form>
        </TabsContent>

        <TabsContent value="dashboard">
          <ApiMonitoringDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default MonitoringSettings;
