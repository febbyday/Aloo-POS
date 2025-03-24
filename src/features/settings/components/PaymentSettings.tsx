import { useState } from "react";
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
  CheckCircle2
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
import { PaymentSettings, PaymentMethod } from "../types/settings.types";
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

interface PaymentSettingsPanelProps {
  settings: PaymentSettings;
  onUpdate: (newSettings: PaymentSettings) => void;
}

const paymentMethodSchema = z.object({
  name: z.string().min(1, "Payment method name is required"),
  icon: z.string().min(1, "Icon name is required"),
  enabled: z.boolean().default(true),
  systemDefined: z.boolean().default(false)
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

export function PaymentSettingsPanel({ settings, onUpdate }: PaymentSettingsPanelProps) {
  const [formData, setFormData] = useState<PaymentSettings>(settings);
  const [isAddingPaymentMethod, setIsAddingPaymentMethod] = useState(false);
  const [editingPaymentMethod, setEditingPaymentMethod] = useState<string | null>(null);
  const [newInstallmentPlan, setNewInstallmentPlan] = useState({
    period: {
      frequency: 1,
      unit: 'month' as const
    },
    priceRange: {
      min: "0",
      max: "0"
    },
    numberOfInstallments: "1"
  });

  const paymentMethodForm = useForm<PaymentMethodFormValues>({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: {
      name: "",
      icon: "credit-card",
      enabled: true,
      systemDefined: false
    }
  });

  const handlePaymentMethodChange = (methodId: string, enabled: boolean) => {
    setFormData(prev => ({
      ...prev,
      methods: {
        ...prev.methods,
        [methodId]: {
          ...prev.methods[methodId],
          enabled
        }
      }
    }));
  };

  const handleMethodSettingChange = (methodId: string, setting: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      methods: {
        ...prev.methods,
        [methodId]: {
          ...prev.methods[methodId],
          settings: {
            ...prev.methods[methodId].settings,
            [setting]: value
          }
        }
      }
    }));
  };

  const handleAddPaymentMethod = (values: PaymentMethodFormValues) => {
    const methodId = editingPaymentMethod || `method_${Date.now()}`;
    const newMethod = {
      id: methodId,
      name: values.name,
      icon: values.icon,
      enabled: values.enabled,
      systemDefined: values.systemDefined,
      settings: {}
    };

    setFormData(prev => ({
      ...prev,
      methods: {
        ...prev.methods,
        [methodId]: editingPaymentMethod ? 
          { ...prev.methods[methodId], ...newMethod } : 
          newMethod
      }
    }));

    setIsAddingPaymentMethod(false);
    setEditingPaymentMethod(null);
    paymentMethodForm.reset();
  };

  const handleDeletePaymentMethod = (methodId: string) => {
    if (formData.methods[methodId].systemDefined) {
      return; // Cannot delete system-defined methods
    }

    const updatedMethods = { ...formData.methods };
    delete updatedMethods[methodId];

    setFormData(prev => ({
      ...prev,
      methods: updatedMethods
    }));
  };

  const handleEditPaymentMethod = (methodId: string) => {
    const method = formData.methods[methodId];
    paymentMethodForm.reset({
      name: method.name,
      icon: method.icon,
      enabled: method.enabled,
      systemDefined: method.systemDefined
    });
    setEditingPaymentMethod(methodId);
    setIsAddingPaymentMethod(true);
  };

  const handleInstallmentChange = (field: string, value: string | number) => {
    if (field.startsWith('period.')) {
      const periodField = field.split('.')[1];
      setNewInstallmentPlan(prev => ({
        ...prev,
        period: {
          ...prev.period,
          [periodField]: value
        }
      }));
    } else if (field.startsWith('priceRange.')) {
      const priceField = field.split('.')[1];
      setNewInstallmentPlan(prev => ({
        ...prev,
        priceRange: {
          ...prev.priceRange,
          [priceField]: value
        }
      }));
    } else {
      setNewInstallmentPlan(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const addInstallmentPlan = () => {
    const newPlan = {
      id: `plan_${Date.now()}`,
      period: {
        frequency: parseInt(String(newInstallmentPlan.period.frequency)),
        unit: newInstallmentPlan.period.unit
      },
      priceRange: {
        min: parseFloat(newInstallmentPlan.priceRange.min),
        max: parseFloat(newInstallmentPlan.priceRange.max)
      },
      numberOfInstallments: parseInt(newInstallmentPlan.numberOfInstallments)
    };

    setFormData(prev => ({
      ...prev,
      installment: {
        ...prev.installment,
        plans: [...prev.installment.plans, newPlan]
      }
    }));

    // Reset form
    setNewInstallmentPlan({
      period: {
        frequency: 1,
        unit: 'month'
      },
      priceRange: {
        min: "0",
        max: "0"
      },
      numberOfInstallments: "1"
    });
  };

  const removeInstallmentPlan = (planId: string) => {
    setFormData(prev => ({
      ...prev,
      installment: {
        ...prev.installment,
        plans: prev.installment.plans.filter(plan => plan.id !== planId)
      }
    }));
  };

  const handleSave = () => {
    onUpdate(formData);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Payment Settings</h2>
          <p className="text-muted-foreground">
            Configure payment methods and installment options.
          </p>
        </div>
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
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
