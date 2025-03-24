import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Save } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePaymentSettingsContext } from "../context/PaymentSettingsContext";
import { PaymentMethodsTable } from "./PaymentMethodsTable";
import { InstallmentPlansTable } from "./InstallmentPlansTable";
import { PaymentMethodForm } from "./PaymentMethodForm";
import { InstallmentPlanForm } from "./InstallmentPlanForm";
import { useFormDialog } from "@/lib/form-utils";
import { useState } from "react";

export function PaymentSettingsPanel() {
  const {
    settings,
    isLoading,
    error,
    togglePaymentMethod,
    updateMethodSetting,
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    addInstallmentPlan,
    removeInstallmentPlan,
    updateInstallmentSettings,
    saveSettings
  } = usePaymentSettingsContext();

  const [activeTab, setActiveTab] = useState("methods");

  // Payment Method form dialog
  const paymentMethodForm = useFormDialog(
    {
      name: "",
      icon: "credit-card",
      enabled: true,
      systemDefined: false,
      settings: {}
    },
    (values) => {
      if (paymentMethodForm.initialValues.id) {
        // Editing existing method
        updatePaymentMethod(paymentMethodForm.initialValues.id as string, values);
      } else {
        // Adding new method
        addPaymentMethod(values);
      }
    }
  );

  // Installment Plan form dialog
  const installmentPlanForm = useFormDialog(
    {
      period: {
        frequency: 1,
        unit: "month" as const
      },
      priceRange: {
        min: 0,
        max: 1000
      },
      numberOfInstallments: 3
    },
    (values) => {
      addInstallmentPlan(values);
    }
  );

  // Handle editing a payment method
  const handleEditPaymentMethod = (methodId: string) => {
    const method = settings.methods[methodId];
    if (method) {
      paymentMethodForm.openDialog({
        ...method,
        id: method.id
      });
    }
  };

  // Handle toggling payment method status
  const handleTogglePaymentMethodStatus = (methodId: string) => {
    togglePaymentMethod(methodId, !settings.methods[methodId].enabled);
  };

  // Handle installment settings changes
  const handleInstallmentSettingChange = (field: keyof typeof settings.installment, value: any) => {
    if (field === 'enabled' || field === 'minimumAmount' || field === 'minimumDownPaymentPercent') {
      updateInstallmentSettings({ [field]: value });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Payment Settings</h2>
          <p className="text-muted-foreground">
            Configure payment methods and installment options
          </p>
        </div>
        <Button onClick={saveSettings} disabled={isLoading}>
          {isLoading ? (
            <>
              <span className="mr-2 h-4 w-4 animate-spin">⟳</span>
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

      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-md">
          {error.message}
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="methods">Payment Methods</TabsTrigger>
          <TabsTrigger value="installment">Installment Plans</TabsTrigger>
        </TabsList>

        <TabsContent value="methods" className="space-y-4 pt-4">
          <PaymentMethodsTable 
            methods={Object.values(settings.methods)}
            onEdit={(method) => handleEditPaymentMethod(method.id)}
            onDelete={deletePaymentMethod}
            onToggleStatus={handleTogglePaymentMethodStatus}
            onAdd={() => paymentMethodForm.openDialog()}
          />
        </TabsContent>

        <TabsContent value="installment" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Installment Settings</CardTitle>
              <CardDescription>
                Configure general installment payment options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="installment-enabled">Enable Installment Payments</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow customers to pay in installments
                  </p>
                </div>
                <Switch
                  id="installment-enabled"
                  checked={settings.installment.enabled}
                  onCheckedChange={(value) => 
                    handleInstallmentSettingChange('enabled', value)
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minimum-amount">Minimum Amount</Label>
                  <Input
                    id="minimum-amount"
                    type="number"
                    min="0"
                    value={settings.installment.minimumAmount}
                    onChange={(e) => 
                      handleInstallmentSettingChange('minimumAmount', Number(e.target.value))
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimum order amount eligible for installment payments
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="down-payment">Minimum Down Payment (%)</Label>
                  <Input
                    id="down-payment"
                    type="number"
                    min="0"
                    max="100"
                    value={settings.installment.minimumDownPaymentPercent}
                    onChange={(e) => 
                      handleInstallmentSettingChange('minimumDownPaymentPercent', Number(e.target.value))
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimum percentage required as down payment
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <InstallmentPlansTable
            plans={settings.installment.plans}
            onDelete={removeInstallmentPlan}
            onAdd={() => installmentPlanForm.openDialog()}
          />
        </TabsContent>
      </Tabs>

      {/* Payment Method Form Dialog */}
      <PaymentMethodForm
        open={paymentMethodForm.open}
        onOpenChange={paymentMethodForm.setOpen}
        onSubmit={paymentMethodForm.handleSubmit}
        initialValues={paymentMethodForm.initialValues}
        title={paymentMethodForm.initialValues.id ? "Edit Payment Method" : "Add Payment Method"}
        isEditing={!!paymentMethodForm.initialValues.id}
      />

      {/* Installment Plan Form Dialog */}
      <InstallmentPlanForm
        open={installmentPlanForm.open}
        onOpenChange={installmentPlanForm.setOpen}
        onSubmit={installmentPlanForm.handleSubmit}
        initialValues={installmentPlanForm.initialValues}
      />
    </div>
  );
}
