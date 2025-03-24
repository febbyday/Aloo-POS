// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! ��

import { useState, useEffect } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { Label } from "@/components/ui/label"
import { useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Link } from "react-router-dom"
import { 
  Settings, 
  Bell, 
  Database, 
  Receipt, 
  Calculator, 
  Shield, 
  Cpu, 
  Printer,
  Palette,
  FileText,
  Lock,
  HardDrive,
  BarChart4,
  ShoppingCart,
  Building,
  CreditCard,
  Users,
  Package,
  Truck,
  Wrench,
  Store,
  BarChart,
  DollarSign
} from "lucide-react"

// Define the schema for inventory settings
const inventorySettingsSchema = z.object({
  // General Inventory Settings
  enableInventoryTracking: z.boolean(),
  trackSerialNumbers: z.boolean(),
  trackBatchNumbers: z.boolean(),
  trackExpiryDates: z.boolean(),
  allowNegativeStock: z.boolean(),
  defaultStockLocation: z.string(),
  
  // Stock Level Settings
  lowStockThreshold: z.number().min(0),
  criticalStockThreshold: z.number().min(0),
  overStockThreshold: z.number().min(0),
  enableStockAlerts: z.boolean(),
  alertFrequency: z.enum(["immediately", "daily", "weekly"]),
  
  // Reordering Settings
  enableAutoReorder: z.boolean(),
  reorderPoint: z.number().min(0),
  defaultReorderQuantity: z.number().min(0),
  preferredSuppliers: z.boolean(),
  autoApproveOrders: z.boolean(),
  
  // Cost & Valuation
  costingMethod: z.enum(["fifo", "lifo", "average"]),
  includeTaxInCost: z.boolean(),
  includeShippingInCost: z.boolean(),
  autoUpdateCosts: z.boolean(),
  
  // Movement & Transfer
  requireTransferApproval: z.boolean(),
  allowPartialTransfers: z.boolean(),
  requireTransferReason: z.boolean(),
  enableLocationTransfers: z.boolean(),
  
  // Counting & Adjustment
  stockCountFrequency: z.enum(["daily", "weekly", "monthly", "quarterly"]),
  enableCycleCounting: z.boolean(),
  requireCountApproval: z.boolean(),
  allowPartialCounting: z.boolean(),
  requireAdjustmentReason: z.boolean(),
  
  // Automation
  enableAutomatedCounting: z.boolean(),
  enableBarcodeScanning: z.boolean(),
  enableRFID: z.boolean(),
  autoGenerateLabels: z.boolean(),
  
  // Reporting
  enableInventoryReports: z.boolean(),
  reportSchedule: z.enum(["daily", "weekly", "monthly"]),
  includeImages: z.boolean(),
  trackInventoryChanges: z.boolean(),
  keepStockHistory: z.number().min(1), // months
});

type InventorySettingsValues = z.infer<typeof inventorySettingsSchema>;

const defaultValues: InventorySettingsValues = {
  enableInventoryTracking: true,
  trackSerialNumbers: false,
  trackBatchNumbers: true,
  trackExpiryDates: true,
  allowNegativeStock: false,
  defaultStockLocation: "main",
  
  lowStockThreshold: 10,
  criticalStockThreshold: 5,
  overStockThreshold: 100,
  enableStockAlerts: true,
  alertFrequency: "daily",
  
  enableAutoReorder: true,
  reorderPoint: 15,
  defaultReorderQuantity: 50,
  preferredSuppliers: true,
  autoApproveOrders: false,
  
  costingMethod: "average",
  includeTaxInCost: false,
  includeShippingInCost: true,
  autoUpdateCosts: true,
  
  requireTransferApproval: true,
  allowPartialTransfers: true,
  requireTransferReason: true,
  enableLocationTransfers: true,
  
  stockCountFrequency: "monthly",
  enableCycleCounting: true,
  requireCountApproval: true,
  allowPartialCounting: true,
  requireAdjustmentReason: true,
  
  enableAutomatedCounting: false,
  enableBarcodeScanning: true,
  enableRFID: false,
  autoGenerateLabels: true,
  
  enableInventoryReports: true,
  reportSchedule: "weekly",
  includeImages: true,
  trackInventoryChanges: true,
  keepStockHistory: 12,
};

/**
 * Inventory Settings Component
 * Manages inventory-related settings like stock management, alerts, and counting
 */
const InventorySettings = () => {
  const { toast } = useToast();
  const form = useForm<InventorySettingsValues>({
    resolver: zodResolver(inventorySettingsSchema),
    defaultValues,
  });

  const onSubmit = (data: InventorySettingsValues) => {
    toast({
      title: "Settings Updated",
      description: "Inventory settings have been saved successfully.",
    });
    console.log(data);
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Inventory Settings</h1>
        <p className="text-muted-foreground">Configure inventory tracking and management</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid gap-6">
            {/* Stock Management Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Stock Management</CardTitle>
                <CardDescription>Configure how stock is managed in your system</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="negative-stock">Allow Negative Stock</Label>
                  <Switch id="negative-stock" checked={form.watch("allowNegativeStock")} onCheckedChange={(value) => form.setValue("allowNegativeStock", value)} />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-order">Automatic Reordering</Label>
                  <Switch id="auto-order" checked={form.watch("enableAutoReorder")} onCheckedChange={(value) => form.setValue("enableAutoReorder", value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reorder-point">Default Reorder Point</Label>
                  <Input id="reorder-point" type="number" placeholder="10" {...form.register("reorderPoint")} />
                </div>
              </CardContent>
            </Card>

            {/* Stock Count Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Stock Count</CardTitle>
                <CardDescription>Configure stock counting preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="count-frequency">Count Frequency</Label>
                  <Select onValueChange={(value) => form.setValue("stockCountFrequency", value as "daily" | "weekly" | "monthly" | "quarterly")} defaultValue={form.watch("stockCountFrequency")}>
                    <SelectTrigger id="count-frequency">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="blind-count">Enable Blind Count</Label>
                  <Switch id="blind-count" checked={form.watch("enableCycleCounting")} onCheckedChange={(value) => form.setValue("enableCycleCounting", value)} />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="variance-alerts">Variance Alerts</Label>
                  <Switch id="variance-alerts" checked={form.watch("requireCountApproval")} onCheckedChange={(value) => form.setValue("requireCountApproval", value)} />
                </div>
              </CardContent>
            </Card>

            {/* Low Stock Alerts */}
            <Card>
              <CardHeader>
                <CardTitle>Low Stock Alerts</CardTitle>
                <CardDescription>Configure low stock notification settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="enable-alerts">Enable Alerts</Label>
                  <Switch id="enable-alerts" checked={form.watch("enableStockAlerts")} onCheckedChange={(value) => form.setValue("enableStockAlerts", value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="alert-threshold">Alert Threshold (%)</Label>
                  <Input id="alert-threshold" type="number" placeholder="20" {...form.register("lowStockThreshold")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notification-method">Notification Method</Label>
                  <Select onValueChange={(value) => form.setValue("alertFrequency", value as "immediately" | "daily" | "weekly")} defaultValue={form.watch("alertFrequency")}>
                    <SelectTrigger id="notification-method">
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediately">Immediately</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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

export default InventorySettings;