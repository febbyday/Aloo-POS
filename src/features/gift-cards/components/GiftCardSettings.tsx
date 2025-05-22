import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { SettingsIcon, Check, Info, ChevronsUpDown, SaveIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
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
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { ToastService } from '@/lib/toast';

import { useTemplates } from '../hooks/useTemplates';
import { GiftCardSettings } from '../types';

// Form validation schema
const formSchema = z.object({
  // Email and Digital Options
  enableEmailDelivery: z.boolean().default(true),
  enablePrintFormat: z.boolean().default(true),
  enableDigitalWallet: z.boolean().default(false),

  // Code Format Settings
  codePrefix: z.string().max(10, 'Prefix cannot exceed 10 characters'),
  codeLength: z.coerce.number().min(8, 'Code must be at least 8 characters').max(24, 'Code cannot exceed 24 characters'),
  allowManualCodes: z.boolean().default(true),

  // Expiration Settings
  defaultExpirationPeriod: z.coerce.number().min(0, 'Must be 0 or greater'),

  // Template Settings
  defaultTemplate: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

interface GiftCardSettingsProps {
  settings: GiftCardSettings;
  onSave: (settings: GiftCardSettings) => Promise<void>;
}

export function GiftCardSettings({ settings, onSave }: GiftCardSettingsProps) {
  const { templates, loading: loadingTemplates } = useTemplates();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set up form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      enableEmailDelivery: settings.enableEmailDelivery,
      enablePrintFormat: settings.enablePrintFormat,
      enableDigitalWallet: settings.enableDigitalWallet,
      codePrefix: settings.codePrefix,
      codeLength: settings.codeLength,
      allowManualCodes: settings.allowManualCodes,
      defaultExpirationPeriod: settings.defaultExpirationPeriod,
      defaultTemplate: settings.defaultTemplate,
    },
  });

  // Handle form submission
  const handleSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      await onSave(data as GiftCardSettings);
      ToastService.success(
        'Settings Saved',
        'Gift card settings have been updated successfully.'
      );
    } catch (error) {
      ToastService.error(
        'Error',
        'Failed to save settings. Please try again.'
      );
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Gift Card Delivery Options</CardTitle>
            <CardDescription>
              Configure how gift cards can be delivered to recipients
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="enableEmailDelivery"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Email Delivery</FormLabel>
                    <FormDescription>
                      Allow gift cards to be delivered via email to recipients
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
              name="enablePrintFormat"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Printable Format</FormLabel>
                    <FormDescription>
                      Allow gift cards to be generated as printable PDFs
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
              name="enableDigitalWallet"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Digital Wallet Support</FormLabel>
                    <FormDescription>
                      Allow gift cards to be added to digital wallets (Apple Pay, Google Pay)
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Gift Card Code Settings</CardTitle>
            <CardDescription>
              Configure how gift card codes are generated
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="codePrefix"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code Prefix</FormLabel>
                    <FormControl>
                      <Input placeholder="GIFT" {...field} />
                    </FormControl>
                    <FormDescription>
                      Prefix for auto-generated gift card codes
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="codeLength"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code Length</FormLabel>
                    <FormControl>
                      <Input type="number" min={8} max={24} {...field} />
                    </FormControl>
                    <FormDescription>
                      Total length of the gift card code (including prefix)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="allowManualCodes"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Allow Manual Codes</FormLabel>
                    <FormDescription>
                      Allow users to manually enter custom gift card codes
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Expiration Settings</CardTitle>
            <CardDescription>
              Configure default expiration behavior for gift cards
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="defaultExpirationPeriod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default Expiration Period (Days)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      placeholder="90"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Number of days after issue that gift cards expire by default (0 = never expires)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Default Template</CardTitle>
            <CardDescription>
              Select the default design template for new gift cards
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="defaultTemplate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Default Template</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value && templates
                            ? templates.find(
                                (template) => template.id === field.value
                              )?.name || "Select template"
                            : "Select template"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search templates..." />
                        <CommandEmpty>No template found.</CommandEmpty>
                        <CommandGroup>
                          {templates.filter(t => t.isActive).map((template) => (
                            <CommandItem
                              key={template.id}
                              value={template.id}
                              onSelect={() => {
                                form.setValue("defaultTemplate", template.id);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  template.id === field.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {template.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    This template will be selected by default when creating new gift cards
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Settings'}
            <SaveIcon className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </form>
    </Form>
  );
}