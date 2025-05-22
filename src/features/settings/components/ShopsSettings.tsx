import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

// Define schema for shop settings
const shopSettingsSchema = z.object({
  // General Settings
  enableMultipleShops: z.boolean(),
  requireShopCode: z.boolean(),
  shopCodePrefix: z.string(),
  defaultCurrency: z.string(),
  
  // Operation Settings
  operatingHours: z.object({
    monday: z.string(),
    tuesday: z.string(),
    wednesday: z.string(),
    thursday: z.string(),
    friday: z.string(),
    saturday: z.string(),
    sunday: z.string(),
  }),
  allowAfterHoursOperation: z.boolean(),
  requireManagerApproval: z.boolean(),
  
  // Inventory Settings
  enableInventoryTracking: z.boolean(),
  lowStockThreshold: z.number().min(0),
  enableAutoReorder: z.boolean(),
  separateInventoryPerShop: z.boolean(),
  
  // Staff Settings
  enableStaffScheduling: z.boolean(),
  allowStaffTransfers: z.boolean(),
  requireShiftHandover: z.boolean(),
  
  // Reporting Settings
  generateDailyReports: z.boolean(),
  reportEmailRecipients: z.string(),
  reportSchedule: z.enum(["daily", "weekly", "monthly"]),
});

type ShopSettingsValues = z.infer<typeof shopSettingsSchema>;

const defaultValues: ShopSettingsValues = {
  enableMultipleShops: true,
  requireShopCode: true,
  shopCodePrefix: "SHOP",
  defaultCurrency: "USD",
  
  operatingHours: {
    monday: "09:00-17:00",
    tuesday: "09:00-17:00",
    wednesday: "09:00-17:00",
    thursday: "09:00-17:00",
    friday: "09:00-17:00",
    saturday: "10:00-15:00",
    sunday: "closed",
  },
  allowAfterHoursOperation: false,
  requireManagerApproval: true,
  
  enableInventoryTracking: true,
  lowStockThreshold: 10,
  enableAutoReorder: false,
  separateInventoryPerShop: true,
  
  enableStaffScheduling: true,
  allowStaffTransfers: true,
  requireShiftHandover: true,
  
  generateDailyReports: true,
  reportEmailRecipients: "",
  reportSchedule: "daily",
};

const ShopsSettings = () => {
  const { toast } = useToast();
  const form = useForm<ShopSettingsValues>({
    resolver: zodResolver(shopSettingsSchema),
    defaultValues,
  });

  const onSubmit = (data: ShopSettingsValues) => {
    toast({
      title: "Settings Updated",
      description: "Shop settings have been saved successfully.",
    });
    console.log(data);
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Shop Settings</h1>
        <p className="text-muted-foreground">Configure shop locations and operations</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid gap-6">
            {/* General Settings */}
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Configure basic shop settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="enableMultipleShops"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Enable Multiple Shops</FormLabel>
                        <FormDescription>
                          Allow management of multiple shop locations
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
                  name="requireShopCode"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Require Shop Code</FormLabel>
                        <FormDescription>
                          Require unique code for each shop location
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

                {form.watch("requireShopCode") && (
                  <FormField
                    control={form.control}
                    name="shopCodePrefix"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Shop Code Prefix</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          Prefix used for shop codes (e.g., SHOP-001)
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="defaultCurrency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Currency</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="USD">US Dollar (USD)</SelectItem>
                          <SelectItem value="EUR">Euro (EUR)</SelectItem>
                          <SelectItem value="GBP">British Pound (GBP)</SelectItem>
                          <SelectItem value="JPY">Japanese Yen (JPY)</SelectItem>
                          <SelectItem value="CAD">Canadian Dollar (CAD)</SelectItem>
                          <SelectItem value="AUD">Australian Dollar (AUD)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Default currency for this shop
                      </FormDescription>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Operating Hours Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Operating Hours</CardTitle>
                <CardDescription>Configure shop operating hours</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="operatingHours.monday"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monday</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="09:00-17:00 or closed" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="operatingHours.tuesday"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tuesday</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="09:00-17:00 or closed" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="operatingHours.wednesday"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Wednesday</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="09:00-17:00 or closed" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="operatingHours.thursday"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Thursday</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="09:00-17:00 or closed" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="operatingHours.friday"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Friday</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="09:00-17:00 or closed" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="operatingHours.saturday"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Saturday</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="10:00-15:00 or closed" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="operatingHours.sunday"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sunday</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="closed" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="allowAfterHoursOperation"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Allow After-Hours Operation</FormLabel>
                        <FormDescription>
                          Allow system use outside of operating hours
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
                  name="requireManagerApproval"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Require Manager Approval</FormLabel>
                        <FormDescription>
                          Require manager approval for after-hours operations
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

            {/* Inventory Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Inventory Settings</CardTitle>
                <CardDescription>Configure shop inventory settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="enableInventoryTracking"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Enable Inventory Tracking</FormLabel>
                        <FormDescription>
                          Track inventory levels for each shop
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

                {form.watch("enableInventoryTracking") && (
                  <>
                    <FormField
                      control={form.control}
                      name="lowStockThreshold"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Low Stock Threshold</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            Threshold for low stock alerts
                          </FormDescription>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="enableAutoReorder"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Enable Auto-Reorder</FormLabel>
                            <FormDescription>
                              Automatically create purchase orders for low stock items
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
                      name="separateInventoryPerShop"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Separate Inventory Per Shop</FormLabel>
                            <FormDescription>
                              Maintain separate inventory for each shop location
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
                  </>
                )}
              </CardContent>
            </Card>

            {/* Staff Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Staff Settings</CardTitle>
                <CardDescription>Configure shop staff settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="enableStaffScheduling"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Enable Staff Scheduling</FormLabel>
                        <FormDescription>
                          Schedule staff for shop locations
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
                  name="allowStaffTransfers"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Allow Staff Transfers</FormLabel>
                        <FormDescription>
                          Allow staff to be transferred between shops
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
                  name="requireShiftHandover"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Require Shift Handover</FormLabel>
                        <FormDescription>
                          Require formal handover between staff shifts
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

            {/* Reporting Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Reporting Settings</CardTitle>
                <CardDescription>Configure shop reporting settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="generateDailyReports"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Generate Daily Reports</FormLabel>
                        <FormDescription>
                          Automatically generate daily shop reports
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

                {form.watch("generateDailyReports") && (
                  <>
                    <FormField
                      control={form.control}
                      name="reportEmailRecipients"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Report Email Recipients</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="email1@example.com, email2@example.com" />
                          </FormControl>
                          <FormDescription>
                            Comma-separated list of email recipients for reports
                          </FormDescription>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="reportSchedule"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Report Schedule</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select schedule" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Frequency of shop reports
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => form.reset(defaultValues)}>
              Reset to Defaults
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ShopsSettings;