// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! ��

import { useState, forwardRef, useEffect } from "react"
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

// Define the schema for sales settings
const salesSettingsSchema = z.object({
  // General Sales Settings
  defaultSaleType: z.enum(["retail", "wholesale", "online"]),
  requireCustomerForSale: z.boolean(),
  allowPartialPayments: z.boolean(),
  requirePaymentBeforeCompletion: z.boolean(),
  allowNegativeSales: z.boolean(),
  
  // Tax Settings
  enableTax: z.boolean(),
  defaultTaxRate: z.number().min(0).max(100),
  taxCalculationType: z.enum(["inclusive", "exclusive"]),
  enableMultipleTaxRates: z.boolean(),
  roundingMethod: z.enum(["round", "ceil", "floor"]),
  
  // Discount Settings
  enableDiscounts: z.boolean(),
  maxDiscountPercentage: z.number().min(0).max(100),
  allowDiscountStacking: z.boolean(),
  requireDiscountReason: z.boolean(),
  minimumOrderForDiscount: z.number().min(0),
  
  // Payment Methods
  enabledPaymentMethods: z.object({
    cash: z.boolean(),
    card: z.boolean(),
    mobileMoney: z.boolean(),
    bankTransfer: z.boolean(),
    check: z.boolean(),
    credit: z.boolean(),
  }),
  defaultPaymentMethod: z.enum(["cash", "card", "mobileMoney", "bankTransfer", "check", "credit"]),
  requireChangeAmount: z.boolean(),
  allowSplitPayments: z.boolean(),
  
  // Receipt Settings
  autoGenerateReceipt: z.boolean(),
  receiptNumberPrefix: z.string(),
  receiptFooter: z.string(),
  showTaxDetails: z.boolean(),
  showDiscountDetails: z.boolean(),
  includeLogo: z.boolean(),
  
  // Return & Refund
  allowReturns: z.boolean(),
  returnPeriod: z.number().min(0),
  requireReturnReason: z.boolean(),
  allowPartialReturns: z.boolean(),
  defaultRefundMethod: z.enum(["original", "store_credit", "cash"]),
  
  // Order Processing
  enableOrderHold: z.boolean(),
  maxHoldDuration: z.number().min(0),
  requireHoldReason: z.boolean(),
  enableQuickSale: z.boolean(),
  requireStockCheck: z.boolean(),
});

type SalesSettingsValues = z.infer<typeof salesSettingsSchema>;

const defaultValues: SalesSettingsValues = {
  defaultSaleType: "retail",
  requireCustomerForSale: false,
  allowPartialPayments: true,
  requirePaymentBeforeCompletion: true,
  allowNegativeSales: false,
  
  enableTax: true,
  defaultTaxRate: 10,
  taxCalculationType: "exclusive",
  enableMultipleTaxRates: false,
  roundingMethod: "round",
  
  enableDiscounts: true,
  maxDiscountPercentage: 50,
  allowDiscountStacking: false,
  requireDiscountReason: true,
  minimumOrderForDiscount: 0,
  
  enabledPaymentMethods: {
    cash: true,
    card: true,
    mobileMoney: true,
    bankTransfer: true,
    check: false,
    credit: false,
  },
  defaultPaymentMethod: "cash",
  requireChangeAmount: true,
  allowSplitPayments: true,
  
  autoGenerateReceipt: true,
  receiptNumberPrefix: "INV",
  receiptFooter: "Thank you for your business!",
  showTaxDetails: true,
  showDiscountDetails: true,
  includeLogo: true,
  
  allowReturns: true,
  returnPeriod: 30,
  requireReturnReason: true,
  allowPartialReturns: true,
  defaultRefundMethod: "original",
  
  enableOrderHold: true,
  maxHoldDuration: 24,
  requireHoldReason: true,
  enableQuickSale: true,
  requireStockCheck: true,
};

const SelectWithRef = forwardRef((props, ref) => (
  <Select {...props} />
));

/**
 * Sales Settings Component
 * Manages sales-related settings like discounts, taxes, and receipt customization
 */
const SalesSettings = () => {
  const { toast } = useToast();
  const form = useForm<SalesSettingsValues>({
    resolver: zodResolver(salesSettingsSchema),
    defaultValues,
  });

  const onSubmit = (data: SalesSettingsValues) => {
    toast({
      title: "Settings Updated",
      description: "Sales settings have been saved successfully.",
    });
    console.log(data);
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Sales Settings</h1>
        <p className="text-muted-foreground">Configure sales and transaction settings</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid gap-6">
            {/* Discount Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Discounts</CardTitle>
                <CardDescription>Configure discount rules and limits</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="enable-discounts">Enable Discounts</Label>
                  <Switch id="enable-discounts" checked={form.watch("enableDiscounts")} onCheckedChange={(value) => form.setValue("enableDiscounts", value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-discount">Maximum Discount (%)</Label>
                  <Input id="max-discount" type="number" placeholder="50" {...form.register("maxDiscountPercentage")} />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="require-approval">Require Approval</Label>
                  <Switch id="require-approval" checked={form.watch("requireDiscountReason")} onCheckedChange={(value) => form.setValue("requireDiscountReason", value)} />
                </div>
              </CardContent>
            </Card>

            {/* Tax Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Tax Configuration</CardTitle>
                <CardDescription>Configure tax calculation settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="enable-tax">Enable Tax</Label>
                  <Switch id="enable-tax" checked={form.watch("enableTax")} onCheckedChange={(value) => form.setValue("enableTax", value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="default-tax">Default Tax Rate (%)</Label>
                  <Input id="default-tax" type="number" placeholder="10" {...form.register("defaultTaxRate")} />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="tax-inclusive">Tax Inclusive Pricing</Label>
                  <Switch id="tax-inclusive" checked={form.watch("taxCalculationType") === "inclusive"} onCheckedChange={(value) => form.setValue("taxCalculationType", value as "inclusive" | "exclusive")} />
                </div>
              </CardContent>
            </Card>

            {/* Receipt Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Receipt Customization</CardTitle>
                <CardDescription>Configure receipt printing options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="receipt-format">Receipt Format</Label>
                  <SelectWithRef defaultValue={form.watch("roundingMethod")}>
                    <SelectTrigger id="receipt-format">
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="round">Round</SelectItem>
                      <SelectItem value="ceil">Ceiling</SelectItem>
                      <SelectItem value="floor">Floor</SelectItem>
                    </SelectContent>
                  </SelectWithRef>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-logo">Show Logo</Label>
                  <Switch id="show-logo" checked={form.watch("includeLogo")} onCheckedChange={(value) => form.setValue("includeLogo", value)} />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-barcode">Show Barcode</Label>
                  <Switch id="show-barcode" checked={form.watch("showDiscountDetails")} onCheckedChange={(value) => form.setValue("showDiscountDetails", value)} />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-print">Auto Print</Label>
                  <Switch id="auto-print" checked={form.watch("autoGenerateReceipt")} onCheckedChange={(value) => form.setValue("autoGenerateReceipt", value)} />
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

export default SalesSettings;