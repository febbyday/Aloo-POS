import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Save,
  CreditCard,
  Calendar,
  DollarSign,
  Plus,
  Trash2,
  Banknote,
  Smartphone,
  Clock,
  Lock,
  Settings,
  Edit,
  CheckCircle2,
  RotateCcw,
  Loader2
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/components/ui/use-toast";
import { SettingsService } from '../services/payment.service';
import { PaymentSettings, PaymentMethod } from '../schemas/payment-settings.schema';

const paymentMethodSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Payment method name is required"),
  icon: z.string().min(1, "Icon name is required"),
  enabled: z.boolean().default(true),
  isDefault: z.boolean().default(false),
  requiresApproval: z.boolean().default(false),
  allowPartialPayment: z.boolean().default(true),
  allowRefund: z.boolean().default(true),
  processingFee: z.number().min(0).default(0),
  processingFeeType: z.enum(['fixed', 'percentage']).default('percentage'),
});

type PaymentMethodFormValues = z.infer<typeof paymentMethodSchema>;

// Available icon options
const iconOptions = [
  { value: "credit-card", label: "Credit Card", icon: CreditCard },
  { value: "cash", label: "Cash", icon: Banknote },
  { value: "mobile", label: "Mobile", icon: Smartphone },
  { value: "calendar", label: "Calendar", icon: Calendar },
  { value: "dollar", label: "Dollar", icon: DollarSign },
];

export function PaymentSettingsPanel() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<PaymentSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAddingPaymentMethod, setIsAddingPaymentMethod] = useState(false);
  const [editingPaymentMethod, setEditingPaymentMethod] = useState<string | null>(null);

  // Load settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await SettingsService.getSettings();
        setSettings(data);
      } catch (error) {
        console.error("Error loading payment settings:", error);
        toast({
          title: "Error",
          description: "Failed to load payment settings",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [toast]);

  const paymentMethodForm = useForm<PaymentMethodFormValues>({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: {
      name: "",
      icon: "credit-card",
      enabled: true,
      isDefault: false,
      requiresApproval: false,
      allowPartialPayment: true,
      allowRefund: true,
      processingFee: 0,
      processingFeeType: 'percentage',
    }
  });

  // Save settings
  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      await SettingsService.saveSettings(settings);
      toast({
        title: "Success",
        description: "Payment settings saved successfully",
      });
    } catch (error) {
      console.error("Error saving payment settings:", error);
      toast({
        title: "Error",
        description: "Failed to save payment settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Reset settings to defaults
  const handleReset = async () => {
    setSaving(true);
    try {
      const defaults = await SettingsService.resetSettings();
      setSettings(defaults);
      toast({
        title: "Success",
        description: "Payment settings reset to defaults",
      });
    } catch (error) {
      console.error("Error resetting payment settings:", error);
      toast({
        title: "Error",
        description: "Failed to reset payment settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePaymentMethodChange = (methodId: string, field: keyof PaymentMethod, value: any) => {
    if (!settings) return;

    setSettings({
      ...settings,
      methods: settings.methods.map(method =>
        method.id === methodId ? { ...method, [field]: value } : method
      )
    });
  };

  const handleAddPaymentMethod = (values: PaymentMethodFormValues) => {
    if (!settings) return;

    const newMethod: PaymentMethod = {
      id: editingPaymentMethod || `method_${Date.now()}`,
      name: values.name,
      icon: values.icon,
      enabled: values.enabled,
      isDefault: values.isDefault,
      requiresApproval: values.requiresApproval,
      allowPartialPayment: values.allowPartialPayment,
      allowRefund: values.allowRefund,
      processingFee: values.processingFee,
      processingFeeType: values.processingFeeType,
    };

    if (editingPaymentMethod) {
      // Update existing method
      setSettings({
        ...settings,
        methods: settings.methods.map(method =>
          method.id === editingPaymentMethod ? newMethod : method
        )
      });
    } else {
      // Add new method
      setSettings({
        ...settings,
        methods: [...settings.methods, newMethod]
      });
    }

    setIsAddingPaymentMethod(false);
    setEditingPaymentMethod(null);
    paymentMethodForm.reset();
  };

  const handleDeletePaymentMethod = (methodId: string) => {
    if (!settings) return;

    setSettings({
      ...settings,
      methods: settings.methods.filter(method => method.id !== methodId)
    });
  };

  const handleEditPaymentMethod = (methodId: string) => {
    if (!settings) return;

    const method = settings.methods.find(m => m.id === methodId);
    if (!method) return;

    paymentMethodForm.reset({
      id: method.id,
      name: method.name,
      icon: method.icon,
      enabled: method.enabled,
      isDefault: method.isDefault,
      requiresApproval: method.requiresApproval,
      allowPartialPayment: method.allowPartialPayment,
      allowRefund: method.allowRefund,
      processingFee: method.processingFee,
      processingFeeType: method.processingFeeType,
    });

    setEditingPaymentMethod(methodId);
    setIsAddingPaymentMethod(true);
  };

  const updateSetting = <K extends keyof PaymentSettings>(
    key: K,
    value: PaymentSettings[K]
  ) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
  };

  // Helper function to render icon component based on string name
  const getIconComponent = (iconName: string) => {
    const iconOption = iconOptions.find(option => option.value === iconName);
    if (iconOption) {
      const IconComponent = iconOption.icon;
      return <IconComponent className="h-5 w-5 mr-2 text-muted-foreground" />;
    }
    // Default icon if not found
    return <CreditCard className="h-5 w-5 mr-2 text-muted-foreground" />;
  };

  if (loading || !settings) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading payment settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Payment Settings</h2>
          <p className="text-muted-foreground">
            Configure payment methods and options
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={saving}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset to Defaults
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="methods" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="methods" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Payment Methods
          </TabsTrigger>
          <TabsTrigger value="installment" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Installment Plans
          </TabsTrigger>
        </TabsList>

        <TabsContent value="methods" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Available Payment Methods</CardTitle>
                  <CardDescription>
                    Enable or disable payment methods and configure their settings
                  </CardDescription>
                </div>
                <Dialog open={isAddingPaymentMethod} onOpenChange={setIsAddingPaymentMethod}>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      onClick={() => {
                        setEditingPaymentMethod(null);
                        paymentMethodForm.reset({
                          name: "",
                          icon: "credit-card",
                          enabled: true,
                          systemDefined: false
                        });
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Payment Method
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingPaymentMethod ? "Edit" : "Add"} Payment Method</DialogTitle>
                      <DialogDescription>
                        Configure a payment method for your business
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...paymentMethodForm}>
                      <form onSubmit={paymentMethodForm.handleSubmit(handleAddPaymentMethod)} className="space-y-4">
                        <FormField
                          control={paymentMethodForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Method Name</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. Debit Card, PayPal" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={paymentMethodForm.control}
                          name="icon"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Icon</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select icon" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {iconOptions.map(option => (
                                    <SelectItem
                                      key={option.value}
                                      value={option.value}
                                      className="flex items-center gap-2"
                                    >
                                      <div className="flex items-center gap-2">
                                        <option.icon className="h-4 w-4" />
                                        <span>{option.label}</span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={paymentMethodForm.control}
                          name="enabled"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel>Enable Payment Method</FormLabel>
                                <FormDescription>
                                  Allow customers to use this payment method
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
                        <DialogFooter>
                          <Button type="button" variant="outline" onClick={() => setIsAddingPaymentMethod(false)}>
                            Cancel
                          </Button>
                          <Button type="submit">
                            {editingPaymentMethod ? "Update" : "Add"} Payment Method
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {Object.entries(formData.methods).length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>
                            <div className="flex items-center gap-2">
                              <CreditCard className="h-4 w-4" />
                              <span>Method</span>
                            </div>
                          </TableHead>
                          <TableHead>
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4" />
                              <span>Status</span>
                            </div>
                          </TableHead>
                          <TableHead className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Settings className="h-4 w-4" />
                              <span>Actions</span>
                            </div>
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Object.entries(formData.methods).map(([methodId, method]) => (
                          <TableRow key={methodId}>
                            <TableCell>
                              <div className="flex items-center">
                                {getIconComponent(method.icon)}
                                <div className="font-medium">{method.name}</div>
                                {method.systemDefined && (
                                  <div className="ml-2 inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                                    <Lock className="mr-1 h-3 w-3" />
                                    System
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Switch
                                checked={method.enabled}
                                onCheckedChange={(checked) => handlePaymentMethodChange(methodId, checked)}
                              />
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEditPaymentMethod(methodId)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                {!method.systemDefined && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeletePaymentMethod(methodId)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="flex items-center justify-center p-4 border rounded-md">
                    <p className="text-muted-foreground">No payment methods configured</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="installment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Installment Payment Settings</CardTitle>
              <CardDescription>
                Configure installment payment options and rules
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enable-installments"
                  checked={formData.installment.enabled}
                  onCheckedChange={(checked) => {
                    setFormData(prev => ({
                      ...prev,
                      installment: {
                        ...prev.installment,
                        enabled: checked
                      }
                    }));
                  }}
                />
                <Label htmlFor="enable-installments">Enable Installment Payments</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="min-amount">Minimum Amount for Installment</Label>
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                  <Input
                    id="min-amount"
                    type="number"
                    value={formData.installment.minimumAmount}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        installment: {
                          ...prev.installment,
                          minimumAmount: parseFloat(e.target.value)
                        }
                      }));
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="min-down-payment">Minimum Down Payment (%)</Label>
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                  <Input
                    id="min-down-payment"
                    type="number"
                    value={formData.installment.minimumDownPaymentPercent}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        installment: {
                          ...prev.installment,
                          minimumDownPaymentPercent: parseFloat(e.target.value)
                        }
                      }));
                    }}
                  />
                </div>
              </div>

              <div className="pt-6 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Installment Plans</h3>
                    <p className="text-sm text-muted-foreground">
                      Configure installment options and plans for customers
                    </p>
                  </div>
                  <Button size="sm" onClick={addInstallmentPlan} disabled={!newInstallmentPlan.period.frequency || !newInstallmentPlan.numberOfInstallments}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Plan
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <Label>Payment Period</Label>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Input
                              type="number"
                              min="1"
                              placeholder="Frequency"
                              value={newInstallmentPlan.period.frequency}
                              onChange={(e) => handleInstallmentChange('period.frequency', parseInt(e.target.value) || 1)}
                            />
                          </div>
                          <Select
                            value={newInstallmentPlan.period.unit}
                            onValueChange={(value) => handleInstallmentChange('period.unit', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Unit" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="day">Day(s)</SelectItem>
                              <SelectItem value="week">Week(s)</SelectItem>
                              <SelectItem value="month">Month(s)</SelectItem>
                              <SelectItem value="year">Year(s)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <Label>Price Range</Label>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Input
                            type="number"
                            min="0"
                            placeholder="Min"
                            value={newInstallmentPlan.priceRange.min}
                            onChange={(e) => handleInstallmentChange('priceRange.min', e.target.value)}
                          />
                        </div>
                        <div>
                          <Input
                            type="number"
                            min="0"
                            placeholder="Max"
                            value={newInstallmentPlan.priceRange.max}
                            onChange={(e) => handleInstallmentChange('priceRange.max', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <Label htmlFor="installments">Number of Installments</Label>
                      </div>
                      <Input
                        id="installments"
                        type="number"
                        min="1"
                        placeholder="e.g. 3"
                        value={newInstallmentPlan.numberOfInstallments}
                        onChange={(e) => handleInstallmentChange('numberOfInstallments', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {formData.installment.plans.length > 0 ? (
                  <div className="rounded-md border mt-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>Period</span>
                            </div>
                          </TableHead>
                          <TableHead>
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4" />
                              <span>Price Range</span>
                            </div>
                          </TableHead>
                          <TableHead>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>Installments</span>
                            </div>
                          </TableHead>
                          <TableHead className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Trash2 className="h-4 w-4" />
                              <span>Actions</span>
                            </div>
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {formData.installment.plans.map((plan) => (
                          <TableRow key={plan.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span>
                                  {plan.period.frequency} {plan.period.unit}
                                  {plan.period.frequency > 1 ? 's' : ''}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                                <span>${plan.priceRange.min.toFixed(2)} - ${plan.priceRange.max.toFixed(2)}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span>{plan.numberOfInstallments}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeInstallmentPlan(plan.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="flex items-center justify-center p-4 border rounded-md">
                    <p className="text-muted-foreground">No installment plans configured</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
