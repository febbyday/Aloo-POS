// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! ��

import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useToast } from "@/components/ui/use-toast"

// Define schema for repair settings
const repairSettingsSchema = z.object({
  // General Settings
  enableRepairTracking: z.boolean(),
  requireCustomerInfo: z.boolean(),
  autoGenerateRepairID: z.boolean(),
  repairIDPrefix: z.string(),
  
  // Status Settings
  defaultRepairStatus: z.enum(["pending", "in_progress", "completed", "cancelled"]),
  enableCustomStatuses: z.boolean(),
  requireStatusNotes: z.boolean(),
  
  // Pricing Settings
  enableDiagnosticFee: z.boolean(),
  defaultDiagnosticFee: z.number().min(0),
  requireEstimateApproval: z.boolean(),
  allowPartialPayments: z.boolean(),
  
  // Notifications
  enableCustomerNotifications: z.boolean(),
  notificationEvents: z.object({
    statusChange: z.boolean(),
    estimateReady: z.boolean(),
    repairComplete: z.boolean(),
    paymentReceived: z.boolean(),
  }),
  
  // Warranty Settings
  enableWarranty: z.boolean(),
  defaultWarrantyPeriod: z.number().min(0),
  requireWarrantyTerms: z.boolean(),
});

type RepairSettingsValues = z.infer<typeof repairSettingsSchema>;

const defaultValues: RepairSettingsValues = {
  enableRepairTracking: true,
  requireCustomerInfo: true,
  autoGenerateRepairID: true,
  repairIDPrefix: "REP",
  
  defaultRepairStatus: "pending",
  enableCustomStatuses: false,
  requireStatusNotes: true,
  
  enableDiagnosticFee: true,
  defaultDiagnosticFee: 25,
  requireEstimateApproval: true,
  allowPartialPayments: true,
  
  enableCustomerNotifications: true,
  notificationEvents: {
    statusChange: true,
    estimateReady: true,
    repairComplete: true,
    paymentReceived: true,
  },
  
  enableWarranty: true,
  defaultWarrantyPeriod: 30,
  requireWarrantyTerms: true,
};

/**
 * Repairs Settings Component
 * Manages settings related to repair services including tracking, pricing, and warranties
 */
const RepairsSettings = () => {
  const { toast } = useToast();
  const form = useForm<RepairSettingsValues>({
    resolver: zodResolver(repairSettingsSchema),
    defaultValues,
  });

  const onSubmit = (data: RepairSettingsValues) => {
    toast({
      title: "Settings Updated",
      description: "Repair settings have been saved successfully.",
    });
    console.log(data);
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Repair Settings</h1>
        <p className="text-muted-foreground">Configure repair service settings and options</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid gap-6">
            {/* General Settings */}
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Configure basic repair tracking settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="enableRepairTracking"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Enable Repair Tracking</FormLabel>
                        <FormDescription>
                          Track repair tickets and their status
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
                  name="requireCustomerInfo"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Require Customer Information</FormLabel>
                        <FormDescription>
                          Require customer details for all repair tickets
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
                  name="autoGenerateRepairID"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Auto-generate Repair IDs</FormLabel>
                        <FormDescription>
                          Automatically generate unique IDs for repair tickets
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

                {form.watch("autoGenerateRepairID") && (
                  <FormField
                    control={form.control}
                    name="repairIDPrefix"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Repair ID Prefix</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          Prefix used for repair ticket IDs (e.g., REP-001)
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                )}
              </CardContent>
            </Card>

            {/* Status Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Status Settings</CardTitle>
                <CardDescription>Configure repair status options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="defaultRepairStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Repair Status</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select default status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormDescription>
                        Default status for new repair tickets
                      </FormDescription>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="enableCustomStatuses"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Enable Custom Statuses</FormLabel>
                        <FormDescription>
                          Create custom repair status options
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
                  name="requireStatusNotes"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Require Status Notes</FormLabel>
                        <FormDescription>
                          Require notes when changing repair status
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

            {/* Pricing Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing Settings</CardTitle>
                <CardDescription>Configure repair pricing options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="enableDiagnosticFee"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Enable Diagnostic Fee</FormLabel>
                        <FormDescription>
                          Charge a fee for diagnosing repairs
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

                {form.watch("enableDiagnosticFee") && (
                  <FormField
                    control={form.control}
                    name="defaultDiagnosticFee"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Default Diagnostic Fee</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          Default fee charged for diagnostics
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="requireEstimateApproval"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Require Estimate Approval</FormLabel>
                        <FormDescription>
                          Require customer approval of repair estimates
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
                  name="allowPartialPayments"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Allow Partial Payments</FormLabel>
                        <FormDescription>
                          Allow customers to pay for repairs in installments
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

            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>Configure customer notifications for repairs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="enableCustomerNotifications"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Enable Customer Notifications</FormLabel>
                        <FormDescription>
                          Send notifications to customers about their repairs
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

                {form.watch("enableCustomerNotifications") && (
                  <>
                    <FormField
                      control={form.control}
                      name="notificationEvents.statusChange"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Status Change Notifications</FormLabel>
                            <FormDescription>
                              Notify customers when repair status changes
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
                      name="notificationEvents.estimateReady"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Estimate Ready Notifications</FormLabel>
                            <FormDescription>
                              Notify customers when repair estimates are ready
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
                      name="notificationEvents.repairComplete"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Repair Complete Notifications</FormLabel>
                            <FormDescription>
                              Notify customers when repairs are completed
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
                      name="notificationEvents.paymentReceived"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Payment Received Notifications</FormLabel>
                            <FormDescription>
                              Notify customers when payments are received
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

            {/* Warranty Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Warranty Settings</CardTitle>
                <CardDescription>Configure repair warranty options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="enableWarranty"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Enable Warranty</FormLabel>
                        <FormDescription>
                          Offer warranty on completed repairs
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

                {form.watch("enableWarranty") && (
                  <>
                    <FormField
                      control={form.control}
                      name="defaultWarrantyPeriod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Default Warranty Period (Days)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            Default warranty period in days
                          </FormDescription>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="requireWarrantyTerms"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Require Warranty Terms</FormLabel>
                            <FormDescription>
                              Require warranty terms to be specified for each repair
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

export default RepairsSettings;