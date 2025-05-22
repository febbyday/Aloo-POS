import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Label } from "@/components/ui/label"
import { DollarSign } from "lucide-react"

// Define schema for expense settings
const expenseSettingsSchema = z.object({
  // General Settings
  enableExpenseTracking: z.boolean(),
  expenseCodePrefix: z.string(),
  defaultExpenseStatus: z.enum(["pending", "approved", "rejected"]),
  requireReceipts: z.boolean(),
  
  // Approval Settings
  enableApprovalWorkflow: z.boolean(),
  approvalThreshold: z.number().min(0),
  requireManagerApproval: z.boolean(),
  autoApproveBelow: z.number().min(0),
  
  // Category Settings
  enableCustomCategories: z.boolean(),
  defaultCategories: z.array(z.string()),
  requireCategory: z.boolean(),
  allowMultipleCategories: z.boolean(),
  
  // Budget Settings
  enableBudgetTracking: z.boolean(),
  budgetPeriod: z.enum(["daily", "weekly", "monthly", "quarterly", "yearly"]),
  alertThreshold: z.number().min(0).max(100),
  allowOverBudget: z.boolean(),
  
  // Tax Settings
  enableTaxTracking: z.boolean(),
  defaultTaxRate: z.number().min(0).max(100),
  requireTaxInfo: z.boolean(),
  separateTaxAmount: z.boolean(),
});

type ExpenseSettingsValues = z.infer<typeof expenseSettingsSchema>;

const defaultValues: ExpenseSettingsValues = {
  enableExpenseTracking: true,
  expenseCodePrefix: "EXP",
  defaultExpenseStatus: "pending",
  requireReceipts: true,
  
  enableApprovalWorkflow: true,
  approvalThreshold: 1000,
  requireManagerApproval: true,
  autoApproveBelow: 100,
  
  enableCustomCategories: true,
  defaultCategories: ["Office", "Travel", "Utilities", "Supplies", "Maintenance"],
  requireCategory: true,
  allowMultipleCategories: false,
  
  enableBudgetTracking: true,
  budgetPeriod: "monthly",
  alertThreshold: 80,
  allowOverBudget: false,
  
  enableTaxTracking: true,
  defaultTaxRate: 10,
  requireTaxInfo: true,
  separateTaxAmount: true,
};

interface SettingsSidebarItemProps {
  icon: React.ElementType;
  label: string;
  active: boolean;
  onClick: () => void;
}

function SettingsSidebarItem({ icon: Icon, label, active, onClick }: SettingsSidebarItemProps) {
  return (
    <Button
      variant={active ? "secondary" : "ghost"}
      className={cn(
        "w-full justify-start gap-2 px-3 py-2",
        active ? "bg-secondary text-secondary-foreground" : "text-muted-foreground"
      )}
      onClick={onClick}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </Button>
  );
}

/**
 * Expenses Settings Component
 * Manages settings related to expense tracking, approvals, categories, budgets, and tax
 */
const ExpensesSettings = () => {
  const { toast } = useToast();
  const form = useForm<ExpenseSettingsValues>({
    resolver: zodResolver(expenseSettingsSchema),
    defaultValues,
  });

  const onSubmit = (data: ExpenseSettingsValues) => {
    toast({
      title: "Settings Updated",
      description: "Expense settings have been saved successfully.",
    });
    console.log(data);
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Expense Settings</h1>
        <p className="text-muted-foreground">Configure expense tracking and management</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure basic expense settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="enable-tracking">Enable Expense Tracking</Label>
                <Switch 
                  id="enable-tracking"
                  checked={form.watch("enableExpenseTracking")}
                  onCheckedChange={(value) => form.setValue("enableExpenseTracking", value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expense-prefix">Expense Code Prefix</Label>
                <Input 
                  id="expense-prefix"
                  {...form.register("expenseCodePrefix")}
                  placeholder="EXP"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expense-status">Default Expense Status</Label>
                <Select 
                  defaultValue={form.watch("defaultExpenseStatus")}
                  onValueChange={(value: any) => form.setValue("defaultExpenseStatus", value)}
                >
                  <SelectTrigger id="expense-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="require-receipts">Require Receipts</Label>
                <Switch 
                  id="require-receipts"
                  checked={form.watch("requireReceipts")}
                  onCheckedChange={(value) => form.setValue("requireReceipts", value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Approval Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Approval Settings</CardTitle>
              <CardDescription>Configure expense approval workflow</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="enable-approval">Enable Approval Workflow</Label>
                <Switch 
                  id="enable-approval"
                  checked={form.watch("enableApprovalWorkflow")}
                  onCheckedChange={(value) => form.setValue("enableApprovalWorkflow", value)}
                />
              </div>
              {form.watch("enableApprovalWorkflow") && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="approval-threshold">Approval Threshold</Label>
                    <Input 
                      id="approval-threshold"
                      type="number"
                      {...form.register("approvalThreshold", { valueAsNumber: true })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="manager-approval">Require Manager Approval</Label>
                    <Switch 
                      id="manager-approval"
                      checked={form.watch("requireManagerApproval")}
                      onCheckedChange={(value) => form.setValue("requireManagerApproval", value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="auto-approve">Auto Approve Below Amount</Label>
                    <Input 
                      id="auto-approve"
                      type="number"
                      {...form.register("autoApproveBelow", { valueAsNumber: true })}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Budget Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Budget Settings</CardTitle>
              <CardDescription>Configure expense budget tracking</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="enable-budget">Enable Budget Tracking</Label>
                <Switch 
                  id="enable-budget"
                  checked={form.watch("enableBudgetTracking")}
                  onCheckedChange={(value) => form.setValue("enableBudgetTracking", value)}
                />
              </div>
              {form.watch("enableBudgetTracking") && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="budget-period">Budget Period</Label>
                    <Select 
                      defaultValue={form.watch("budgetPeriod")}
                      onValueChange={(value: any) => form.setValue("budgetPeriod", value)}
                    >
                      <SelectTrigger id="budget-period">
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="alert-threshold">Alert Threshold (%)</Label>
                    <Input 
                      id="alert-threshold"
                      type="number"
                      {...form.register("alertThreshold", { valueAsNumber: true })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="over-budget">Allow Over Budget</Label>
                    <Switch 
                      id="over-budget"
                      checked={form.watch("allowOverBudget")}
                      onCheckedChange={(value) => form.setValue("allowOverBudget", value)}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Tax Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Tax Settings</CardTitle>
              <CardDescription>Configure expense tax tracking</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="enable-tax">Enable Tax Tracking</Label>
                <Switch 
                  id="enable-tax"
                  checked={form.watch("enableTaxTracking")}
                  onCheckedChange={(value) => form.setValue("enableTaxTracking", value)}
                />
              </div>
              {form.watch("enableTaxTracking") && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="tax-rate">Default Tax Rate (%)</Label>
                    <Input 
                      id="tax-rate"
                      type="number"
                      {...form.register("defaultTaxRate", { valueAsNumber: true })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="require-tax">Require Tax Information</Label>
                    <Switch 
                      id="require-tax"
                      checked={form.watch("requireTaxInfo")}
                      onCheckedChange={(value) => form.setValue("requireTaxInfo", value)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="separate-tax">Separate Tax Amount</Label>
                    <Switch 
                      id="separate-tax"
                      checked={form.watch("separateTaxAmount")}
                      onCheckedChange={(value) => form.setValue("separateTaxAmount", value)}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </form>
      </Form>

      <div className="flex justify-end space-x-4">
        <Button variant="outline" onClick={() => form.reset(defaultValues)}>
          Reset to Defaults
        </Button>
        <Button onClick={form.handleSubmit(onSubmit)}>
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default ExpensesSettings; 