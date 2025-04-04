import React from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ConnectionConfig } from '../types';

interface SyncSettingsProps {
  config: ConnectionConfig;
  onChange: (config: ConnectionConfig) => void;
  isLoading: boolean;
}

const syncSchema = z.object({
  syncFrequency: z.enum(['hourly', 'daily', 'weekly', 'monthly', 'manual']),
  syncTime: z.string().optional(),
  syncDay: z.string().optional(),
  enabled: z.boolean(),
  syncOptions: z.object({
    overwriteExisting: z.boolean().default(false),
    syncImages: z.boolean().default(true),
    syncPrices: z.boolean().default(true),
    syncInventory: z.boolean().default(true),
    notifyOnCompletion: z.boolean().default(false),
    conflictResolution: z.enum(['supplier', 'local', 'newest', 'manual']).default('newest'),
  }),
});

type SyncFormValues = z.infer<typeof syncSchema>;

export function SyncSettings({ config, onChange, isLoading }: SyncSettingsProps) {
  // Extract sync-related properties from the config
  const defaultValues: SyncFormValues = {
    syncFrequency: config.syncFrequency,
    syncTime: '09:00',
    syncDay: 'monday',
    enabled: config.enabled,
    syncOptions: {
      overwriteExisting: false,
      syncImages: true,
      syncPrices: true,
      syncInventory: true,
      notifyOnCompletion: false,
      conflictResolution: 'newest',
    },
  };

  const form = useForm<SyncFormValues>({
    resolver: zodResolver(syncSchema),
    defaultValues,
  });

  const onSubmit = (data: SyncFormValues) => {
    // Update the main configuration with the sync settings
    onChange({
      ...config,
      syncFrequency: data.syncFrequency,
      enabled: data.enabled,
    });
  };

  const syncFrequency = form.watch('syncFrequency');

  return (
    <Form {...form}>
      <form onChange={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="enabled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Enable Automatic Sync</FormLabel>
                <FormDescription>
                  Automatically synchronize data based on schedule
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isLoading}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="syncFrequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sync Frequency</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading || !form.watch('enabled')}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="manual">Manual Only</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    How often to synchronize with supplier data
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {syncFrequency === 'daily' && (
              <FormField
                control={form.control}
                name="syncTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sync Time</FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        {...field}
                        disabled={isLoading || !form.watch('enabled')}
                      />
                    </FormControl>
                    <FormDescription>
                      Time of day to run the synchronization
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {syncFrequency === 'weekly' && (
              <>
                <FormField
                  control={form.control}
                  name="syncDay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sync Day</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value || ''}
                        disabled={isLoading || !form.watch('enabled')}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select day" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="monday">Monday</SelectItem>
                          <SelectItem value="tuesday">Tuesday</SelectItem>
                          <SelectItem value="wednesday">Wednesday</SelectItem>
                          <SelectItem value="thursday">Thursday</SelectItem>
                          <SelectItem value="friday">Friday</SelectItem>
                          <SelectItem value="saturday">Saturday</SelectItem>
                          <SelectItem value="sunday">Sunday</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Day of the week to run synchronization
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="syncTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sync Time</FormLabel>
                      <FormControl>
                        <Input
                          type="time"
                          {...field}
                          disabled={isLoading || !form.watch('enabled')}
                        />
                      </FormControl>
                      <FormDescription>
                        Time of day to run the synchronization
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {syncFrequency === 'monthly' && (
              <>
                <FormItem>
                  <FormLabel>Sync Date</FormLabel>
                  <Select disabled={isLoading || !form.watch('enabled')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select date" defaultValue="1" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 28 }, (_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>
                          {i + 1}
                        </SelectItem>
                      ))}
                      <SelectItem value="last">Last day of month</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Date of the month to run synchronization
                  </FormDescription>
                </FormItem>

                <FormField
                  control={form.control}
                  name="syncTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sync Time</FormLabel>
                      <FormControl>
                        <Input
                          type="time"
                          {...field}
                          disabled={isLoading || !form.watch('enabled')}
                        />
                      </FormControl>
                      <FormDescription>
                        Time of day to run the synchronization
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Sync Options</h3>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="syncOptions.syncInventory"
                  render={({ field }) => (
                    <FormItem className="flex items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isLoading || !form.watch('enabled')}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Sync Inventory Levels</FormLabel>
                        <FormDescription>
                          Update stock quantities from supplier
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="syncOptions.syncPrices"
                  render={({ field }) => (
                    <FormItem className="flex items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isLoading || !form.watch('enabled')}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Sync Prices</FormLabel>
                        <FormDescription>
                          Update prices from supplier
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="syncOptions.syncImages"
                  render={({ field }) => (
                    <FormItem className="flex items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isLoading || !form.watch('enabled')}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Sync Images</FormLabel>
                        <FormDescription>
                          Update product images from supplier
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="syncOptions.notifyOnCompletion"
                  render={({ field }) => (
                    <FormItem className="flex items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isLoading || !form.watch('enabled')}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Notify on Completion</FormLabel>
                        <FormDescription>
                          Send notification when sync is complete
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="syncOptions.conflictResolution"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Conflict Resolution</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                      disabled={isLoading || !form.watch('enabled')}
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="supplier" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Supplier wins (always use supplier data)
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="local" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Local wins (keep local data if conflict)
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="newest" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Use newest (based on timestamp)
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="manual" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Manual resolution (prompt for each conflict)
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormDescription>
                    How to handle data conflicts during synchronization
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </form>
    </Form>
  );
} 