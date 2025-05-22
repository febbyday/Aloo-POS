import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

// Define schema for customer settings
const customerSettingsSchema = z.object({
  // General Settings
  enableCustomerAccounts: z.boolean(),
  requireEmailVerification: z.boolean(),
  allowGuestCheckout: z.boolean(),
  customerCodePrefix: z.string(),
  
  // Loyalty Program Settings
  enableLoyaltyProgram: z.boolean(),
  pointsPerCurrency: z.number().min(0),
  minimumPointsRedemption: z.number().min(0),
  pointsExpiryDays: z.number().min(0),
  
  // Customer Groups Settings
  enableCustomerGroups: z.boolean(),
  defaultCustomerGroup: z.string(),
  allowMultipleGroups: z.boolean(),
  
  // Communication Settings
  enableEmailNotifications: z.boolean(),
  enableSmsNotifications: z.boolean(),
  defaultCommunicationMethod: z.enum(["email", "sms", "both"]),
  
  // Privacy Settings
  retentionPeriodDays: z.number().min(0),
  allowDataExport: z.boolean(),
  anonymizeDeletedCustomers: z.boolean(),
});

type CustomerSettingsValues = z.infer<typeof customerSettingsSchema>;

const defaultValues: CustomerSettingsValues = {
  enableCustomerAccounts: true,
  requireEmailVerification: true,
  allowGuestCheckout: true,
  customerCodePrefix: "CUST",
  
  enableLoyaltyProgram: true,
  pointsPerCurrency: 10,
  minimumPointsRedemption: 100,
  pointsExpiryDays: 365,
  
  enableCustomerGroups: true,
  defaultCustomerGroup: "Regular",
  allowMultipleGroups: false,
  
  enableEmailNotifications: true,
  enableSmsNotifications: false,
  defaultCommunicationMethod: "email",
  
  retentionPeriodDays: 730,
  allowDataExport: true,
  anonymizeDeletedCustomers: true,
};

/**
 * Customer Settings Component
 * Manages customer-related settings like loyalty programs, customer groups, and notifications
 */
const CustomersSettings = () => {
  const { toast } = useToast();
  const form = useForm<CustomerSettingsValues>({
    resolver: zodResolver(customerSettingsSchema),
    defaultValues,
  });

  const onSubmit = (data: CustomerSettingsValues) => {
    toast({
      title: "Settings Updated",
      description: "Customer settings have been saved successfully.",
    });
    console.log(data);
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Customer Settings</h1>
        <p className="text-muted-foreground">Configure how customers interact with your business</p>
      </div>
      
      <Form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Basic customer account settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enableCustomerAccounts">Enable Customer Accounts</Label>
                <p className="text-sm text-muted-foreground">Allow customers to create and manage accounts</p>
              </div>
              <Switch
                id="enableCustomerAccounts"
                checked={form.watch('enableCustomerAccounts')}
                onCheckedChange={(checked) => form.setValue('enableCustomerAccounts', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="requireEmailVerification">Require Email Verification</Label>
                <p className="text-sm text-muted-foreground">Customers must verify their email before accessing their account</p>
              </div>
              <Switch
                id="requireEmailVerification"
                checked={form.watch('requireEmailVerification')}
                onCheckedChange={(checked) => form.setValue('requireEmailVerification', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="allowGuestCheckout">Allow Guest Checkout</Label>
                <p className="text-sm text-muted-foreground">Customers can checkout without creating an account</p>
              </div>
              <Switch
                id="allowGuestCheckout"
                checked={form.watch('allowGuestCheckout')}
                onCheckedChange={(checked) => form.setValue('allowGuestCheckout', checked)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="customerCodePrefix">Customer Code Prefix</Label>
              <Input
                id="customerCodePrefix"
                placeholder="CUST"
                {...form.register('customerCodePrefix')}
              />
              <p className="text-sm text-muted-foreground">Prefix used for customer reference codes</p>
            </div>
          </CardContent>
        </Card>
        
        {/* Loyalty Program Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Loyalty Program</CardTitle>
            <CardDescription>Configure your customer loyalty program</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enableLoyaltyProgram">Enable Loyalty Program</Label>
                <p className="text-sm text-muted-foreground">Allow customers to earn and redeem loyalty points</p>
              </div>
              <Switch
                id="enableLoyaltyProgram"
                checked={form.watch('enableLoyaltyProgram')}
                onCheckedChange={(checked) => form.setValue('enableLoyaltyProgram', checked)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="pointsPerCurrency">Points Per Currency Unit</Label>
              <Input
                id="pointsPerCurrency"
                type="number"
                {...form.register('pointsPerCurrency', { valueAsNumber: true })}
              />
              <p className="text-sm text-muted-foreground">Number of points earned per currency unit spent</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="minimumPointsRedemption">Minimum Points for Redemption</Label>
              <Input
                id="minimumPointsRedemption"
                type="number"
                {...form.register('minimumPointsRedemption', { valueAsNumber: true })}
              />
              <p className="text-sm text-muted-foreground">Minimum points required before redemption is allowed</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="pointsExpiryDays">Points Expiry (Days)</Label>
              <Input
                id="pointsExpiryDays"
                type="number"
                {...form.register('pointsExpiryDays', { valueAsNumber: true })}
              />
              <p className="text-sm text-muted-foreground">Number of days before points expire (0 for never)</p>
            </div>
          </CardContent>
        </Card>
        
        {/* Customer Groups Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Groups</CardTitle>
            <CardDescription>Manage customer group settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enableCustomerGroups">Enable Customer Groups</Label>
                <p className="text-sm text-muted-foreground">Organize customers into groups with different pricing and permissions</p>
              </div>
              <Switch
                id="enableCustomerGroups"
                checked={form.watch('enableCustomerGroups')}
                onCheckedChange={(checked) => form.setValue('enableCustomerGroups', checked)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="defaultCustomerGroup">Default Customer Group</Label>
              <Input
                id="defaultCustomerGroup"
                {...form.register('defaultCustomerGroup')}
              />
              <p className="text-sm text-muted-foreground">Group assigned to new customers by default</p>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="allowMultipleGroups">Allow Multiple Groups</Label>
                <p className="text-sm text-muted-foreground">Customers can belong to multiple groups simultaneously</p>
              </div>
              <Switch
                id="allowMultipleGroups"
                checked={form.watch('allowMultipleGroups')}
                onCheckedChange={(checked) => form.setValue('allowMultipleGroups', checked)}
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Communication Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Communication</CardTitle>
            <CardDescription>Customer communication preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enableEmailNotifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Send notifications to customers via email</p>
              </div>
              <Switch
                id="enableEmailNotifications"
                checked={form.watch('enableEmailNotifications')}
                onCheckedChange={(checked) => form.setValue('enableEmailNotifications', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enableSmsNotifications">SMS Notifications</Label>
                <p className="text-sm text-muted-foreground">Send notifications to customers via SMS</p>
              </div>
              <Switch
                id="enableSmsNotifications"
                checked={form.watch('enableSmsNotifications')}
                onCheckedChange={(checked) => form.setValue('enableSmsNotifications', checked)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="defaultCommunicationMethod">Default Communication Method</Label>
              <Select
                onValueChange={(value) => form.setValue('defaultCommunicationMethod', value as any)}
                defaultValue={form.watch('defaultCommunicationMethod')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a communication method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">Preferred method for sending notifications</p>
            </div>
          </CardContent>
        </Card>
        
        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Privacy</CardTitle>
            <CardDescription>Customer data privacy settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="retentionPeriodDays">Data Retention Period (Days)</Label>
              <Input
                id="retentionPeriodDays"
                type="number"
                {...form.register('retentionPeriodDays', { valueAsNumber: true })}
              />
              <p className="text-sm text-muted-foreground">Number of days to retain inactive customer data (0 for indefinite)</p>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="allowDataExport">Allow Data Export</Label>
                <p className="text-sm text-muted-foreground">Customers can export their personal data</p>
              </div>
              <Switch
                id="allowDataExport"
                checked={form.watch('allowDataExport')}
                onCheckedChange={(checked) => form.setValue('allowDataExport', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="anonymizeDeletedCustomers">Anonymize Deleted Customers</Label>
                <p className="text-sm text-muted-foreground">Remove personal information when customers are deleted</p>
              </div>
              <Switch
                id="anonymizeDeletedCustomers"
                checked={form.watch('anonymizeDeletedCustomers')}
                onCheckedChange={(checked) => form.setValue('anonymizeDeletedCustomers', checked)}
              />
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-end">
          <Button type="submit">Save Changes</Button>
        </div>
      </Form>
    </div>
  );
} 

export default CustomersSettings; 