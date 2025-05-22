import { Button } from "@/components/ui/button"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

// Define schema for supplier settings
const supplierSettingsSchema = z.object({
  // General Settings
  enableSupplierManagement: z.boolean(),
  supplierCodePrefix: z.string(),
  requireTaxInfo: z.boolean(),
  
  // Ordering Settings
  defaultPaymentTerms: z.string(),
  enableAutoOrdering: z.boolean(),
  minimumOrderValue: z.number().min(0),
  requirePurchaseOrder: z.boolean(),
  
  // Communication Settings
  enableEmailNotifications: z.boolean(),
  enableSmsNotifications: z.boolean(),
  autoSendOrderConfirmation: z.boolean(),
  
  // Performance Tracking
  enableSupplierRating: z.boolean(),
  trackDeliveryPerformance: z.boolean(),
  trackPriceChanges: z.boolean(),
  
  // Document Management
  requireDocuments: z.boolean(),
  documentExpiryReminders: z.boolean(),
});

type SupplierSettingsValues = z.infer<typeof supplierSettingsSchema>;

const defaultValues: SupplierSettingsValues = {
  enableSupplierManagement: true,
  supplierCodePrefix: "SUP",
  requireTaxInfo: true,
  
  defaultPaymentTerms: "net30",
  enableAutoOrdering: false,
  minimumOrderValue: 100,
  requirePurchaseOrder: true,
  
  enableEmailNotifications: true,
  enableSmsNotifications: false,
  autoSendOrderConfirmation: true,
  
  enableSupplierRating: true,
  trackDeliveryPerformance: true,
  trackPriceChanges: true,
  
  requireDocuments: true,
  documentExpiryReminders: true,
};

/**
 * Suppliers Settings Component
 * Manages settings related to supplier management, ordering, communication, and performance tracking
 */
const SuppliersSettings = () => {
  const { toast } = useToast();
  const form = useForm<SupplierSettingsValues>({
    resolver: zodResolver(supplierSettingsSchema),
    defaultValues,
  });

  const onSubmit = (data: SupplierSettingsValues) => {
    toast({
      title: "Settings Updated",
      description: "Supplier settings have been saved successfully.",
    });
    console.log(data);
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Supplier Settings</h1>
        <p className="text-muted-foreground">Configure supplier management and ordering</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid gap-6">
            {/* General Settings */}
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Configure basic supplier management settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="enableSupplierManagement"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <FormLabel>Enable Supplier Management</FormLabel>
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
                  name="supplierCodePrefix"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Supplier Code Prefix</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="SUP"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Prefix used for supplier codes (e.g. SUP001)
                      </FormDescription>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="requireTaxInfo"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <FormLabel>Require Tax Information</FormLabel>
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

            {/* Ordering Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Ordering Settings</CardTitle>
                <CardDescription>Configure how orders are placed with suppliers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="defaultPaymentTerms"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Default Payment Terms</FormLabel>
                      <FormControl>
                        <Select 
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select terms" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="immediate">Immediate</SelectItem>
                            <SelectItem value="net15">Net 15</SelectItem>
                            <SelectItem value="net30">Net 30</SelectItem>
                            <SelectItem value="net60">Net 60</SelectItem>
                            <SelectItem value="net90">Net 90</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="enableAutoOrdering"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <FormLabel>Enable Auto Ordering</FormLabel>
                      <FormControl>
                        <Switch 
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                {form.watch("enableAutoOrdering") && (
                  <FormField
                    control={form.control}
                    name="minimumOrderValue"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>Minimum Order Value</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                )}
                
                <FormField
                  control={form.control}
                  name="requirePurchaseOrder"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <FormLabel>Require Purchase Order</FormLabel>
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

            {/* Communication Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Communication Settings</CardTitle>
                <CardDescription>Configure how you communicate with suppliers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="enableEmailNotifications"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <FormLabel>Enable Email Notifications</FormLabel>
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
                  name="enableSmsNotifications"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <FormLabel>Enable SMS Notifications</FormLabel>
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
                  name="autoSendOrderConfirmation"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <FormLabel>Auto-send Order Confirmations</FormLabel>
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

            {/* Performance Tracking */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Tracking</CardTitle>
                <CardDescription>Configure supplier performance metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="enableSupplierRating"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <FormLabel>Enable Supplier Rating</FormLabel>
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
                  name="trackDeliveryPerformance"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <FormLabel>Track Delivery Performance</FormLabel>
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
                  name="trackPriceChanges"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <FormLabel>Track Price Changes</FormLabel>
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

            {/* Document Management */}
            <Card>
              <CardHeader>
                <CardTitle>Document Management</CardTitle>
                <CardDescription>Configure supplier document requirements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="requireDocuments"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <FormLabel>Require Documents</FormLabel>
                      <FormControl>
                        <Switch 
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                {form.watch("requireDocuments") && (
                  <FormField
                    control={form.control}
                    name="documentExpiryReminders"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <FormLabel>Document Expiry Reminders</FormLabel>
                        <FormControl>
                          <Switch 
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <Button variant="outline" onClick={() => form.reset(defaultValues)}>
              Reset to Defaults
            </Button>
            <Button type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default SuppliersSettings;