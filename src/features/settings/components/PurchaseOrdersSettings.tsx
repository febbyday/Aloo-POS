import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { FileText } from "lucide-react"

// Define schema for purchase order settings
const purchaseOrderSettingsSchema = z.object({
  // General Settings
  enableAutomaticPO: z.boolean(),
  poNumberPrefix: z.string(),
  poNumberSuffix: z.string().optional(),
  poNumberStartAt: z.number().min(1),
  
  // Approval Settings
  requireApproval: z.boolean(),
  approvalThreshold: z.number().min(0),
  multiLevelApproval: z.boolean(),
  
  // Email Settings
  sendEmailToSupplier: z.boolean(),
  sendEmailToApprover: z.boolean(),
  sendEmailOnReceive: z.boolean(),
});

type PurchaseOrderSettingsValues = z.infer<typeof purchaseOrderSettingsSchema>;

const defaultValues: PurchaseOrderSettingsValues = {
  enableAutomaticPO: true,
  poNumberPrefix: "PO",
  poNumberSuffix: "",
  poNumberStartAt: 1000,
  
  requireApproval: true,
  approvalThreshold: 1000,
  multiLevelApproval: false,
  
  sendEmailToSupplier: true,
  sendEmailToApprover: true,
  sendEmailOnReceive: true,
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
 * Purchase Orders Settings Component
 * Manages settings related to purchase orders, approvals, and notifications
 */
const PurchaseOrdersSettings = () => {
  const { toast } = useToast();
  const form = useForm<PurchaseOrderSettingsValues>({
    resolver: zodResolver(purchaseOrderSettingsSchema),
    defaultValues,
  });

  const onSubmit = (data: PurchaseOrderSettingsValues) => {
    toast({
      title: "Settings Updated",
      description: "Purchase order settings have been saved successfully.",
    });
    console.log(data);
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Purchase Orders Settings</h1>
        <p className="text-muted-foreground">Configure purchase order management and approvals</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure basic purchase order settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="enable-auto-po">Enable Automatic PO</Label>
                <Switch 
                  id="enable-auto-po"
                  checked={form.watch("enableAutomaticPO")}
                  onCheckedChange={(value) => form.setValue("enableAutomaticPO", value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="po-prefix">PO Number Prefix</Label>
                <Input 
                  id="po-prefix"
                  {...form.register("poNumberPrefix")}
                  placeholder="PO"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="po-suffix">PO Number Suffix (Optional)</Label>
                <Input 
                  id="po-suffix"
                  {...form.register("poNumberSuffix")}
                  placeholder=""
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="po-start">PO Number Start At</Label>
                <Input 
                  id="po-start"
                  type="number"
                  {...form.register("poNumberStartAt", { valueAsNumber: true })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Approval Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Approval Settings</CardTitle>
              <CardDescription>Configure purchase order approval workflow</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="require-approval">Require Approval</Label>
                <Switch 
                  id="require-approval"
                  checked={form.watch("requireApproval")}
                  onCheckedChange={(value) => form.setValue("requireApproval", value)}
                />
              </div>
              {form.watch("requireApproval") && (
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
                    <Label htmlFor="multi-level">Multi-Level Approval</Label>
                    <Switch 
                      id="multi-level"
                      checked={form.watch("multiLevelApproval")}
                      onCheckedChange={(value) => form.setValue("multiLevelApproval", value)}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Email Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>Configure email notifications for purchase orders</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="email-supplier">Send Email to Supplier</Label>
                <Switch 
                  id="email-supplier"
                  checked={form.watch("sendEmailToSupplier")}
                  onCheckedChange={(value) => form.setValue("sendEmailToSupplier", value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="email-approver">Send Email to Approver</Label>
                <Switch 
                  id="email-approver"
                  checked={form.watch("sendEmailToApprover")}
                  onCheckedChange={(value) => form.setValue("sendEmailToApprover", value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="email-receive">Send Email on Receive</Label>
                <Switch 
                  id="email-receive"
                  checked={form.watch("sendEmailOnReceive")}
                  onCheckedChange={(value) => form.setValue("sendEmailOnReceive", value)}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
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

export default PurchaseOrdersSettings; 