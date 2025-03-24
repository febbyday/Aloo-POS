import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, FormProvider } from "react-hook-form"
import * as z from "zod"
import { useToast } from "@/components/ui/use-toast"
import { usePricingSettings } from "../../context/PricingSettingsContext"
import { PricingToolbar } from "./PricingToolbar"

const pricingSettingsSchema = z.object({
  // Price Calculation Settings
  defaultPriceCalculation: z.enum(["markup", "margin"]),
  defaultMarkupPercentage: z.number().min(0).max(1000),
  defaultMarginPercentage: z.number().min(0).max(100),
  minimumMarginPercentage: z.number().min(0).max(100),
  roundPricesToNearest: z.number().min(0),
  enforceMinimumMargin: z.boolean(),

  // Tax Settings
  defaultTaxRate: z.number().min(0).max(100),
  includeTaxInPrice: z.boolean(),
  enableAutomaticTaxCalculation: z.boolean(),
  taxCalculationMethod: z.enum(["inclusive", "exclusive"]),

  // Currency Settings
  defaultCurrency: z.string(),
  currencyPosition: z.enum(["before", "after"]),
  thousandsSeparator: z.string().max(1),
  decimalSeparator: z.string().max(1),
  decimalPlaces: z.number().min(0).max(4),

  // Discount Settings
  maximumDiscountPercentage: z.number().min(0).max(100),
  allowStackingDiscounts: z.boolean(),
  minimumOrderValueForDiscount: z.number().min(0),
  enableAutomaticDiscounts: z.boolean(),
})

type PricingSettingsValues = z.infer<typeof pricingSettingsSchema>

export function PricingSettings() {
  const { toast } = useToast()
  const settings = usePricingSettings()
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    // Fetch categories when component mounts
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        const data = await response.json()
        setCategories(data)
      } catch (error) {
        console.error('Error fetching categories:', error)
        toast({
          title: "Error",
          description: "Failed to load categories. Please try again later.",
          variant: "destructive",
        })
      }
    }

    fetchCategories()
  }, [toast])

  const form = useForm<PricingSettingsValues>({
    resolver: zodResolver(pricingSettingsSchema),
    defaultValues: {
      defaultPriceCalculation: settings.defaultPriceCalculation,
      defaultMarkupPercentage: settings.defaultMarkupPercentage,
      defaultMarginPercentage: settings.defaultMarginPercentage,
      minimumMarginPercentage: settings.minimumMarginPercentage,
      roundPricesToNearest: settings.roundPricesToNearest,
      enforceMinimumMargin: settings.enforceMinimumMargin,
      defaultTaxRate: settings.defaultTaxRate,
      includeTaxInPrice: settings.includeTaxInPrice,
      enableAutomaticTaxCalculation: settings.enableAutomaticTaxCalculation,
      taxCalculationMethod: settings.taxCalculationMethod,
      defaultCurrency: settings.defaultCurrency,
      currencyPosition: settings.currencyPosition,
      thousandsSeparator: settings.thousandsSeparator,
      decimalSeparator: settings.decimalSeparator,
      decimalPlaces: settings.decimalPlaces,
      maximumDiscountPercentage: settings.maximumDiscountPercentage,
      allowStackingDiscounts: settings.allowStackingDiscounts,
      minimumOrderValueForDiscount: settings.minimumOrderValueForDiscount,
      enableAutomaticDiscounts: settings.enableAutomaticDiscounts,
    },
  })

  const onSubmit = (data: PricingSettingsValues) => {
    settings.updateSettings(data)
    toast({
      title: "Settings Updated",
      description: "Your pricing settings have been saved successfully.",
    })
  }

  const handleReset = () => {
    settings.resetSettings()
    form.reset(settings)
    toast({
      title: "Settings Reset",
      description: "Your pricing settings have been reset to defaults.",
    })
  }

  return (
    <div>
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pt-6">
          <div className="space-y-8">
            <Card className="border-0 p-0">
              <CardHeader className="p-0 pb-6">
                <CardTitle>Price Calculation</CardTitle>
                <CardDescription id="price-calc-description">
                  Configure how product prices are calculated by default
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 space-y-4">
                <FormField
                  control={form.control}
                  name="defaultPriceCalculation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Price Calculation Method</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="markup">Markup</SelectItem>
                          <SelectItem value="margin">Margin</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Choose how prices are calculated by default
                      </FormDescription>
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="defaultMarkupPercentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Default Markup %</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="defaultMarginPercentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Default Margin %</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="enforceMinimumMargin"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Enforce Minimum Margin
                        </FormLabel>
                        <FormDescription>
                          Prevent selling products below minimum margin
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

            <Separator />

            <Card className="border-0 p-0">
              <CardHeader className="p-0 pb-6">
                <CardTitle>Tax Settings</CardTitle>
                <CardDescription id="tax-settings-description">
                  Configure how taxes are calculated and displayed
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 space-y-4">
                <FormField
                  control={form.control}
                  name="defaultTaxRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Tax Rate %</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="taxCalculationMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax Calculation Method</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="inclusive">Tax Inclusive</SelectItem>
                          <SelectItem value="exclusive">Tax Exclusive</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="enableAutomaticTaxCalculation"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Automatic Tax Calculation
                        </FormLabel>
                        <FormDescription>
                          Automatically calculate taxes based on rules
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

            <Separator />

            <Card className="border-0 p-0">
              <CardHeader className="p-0 pb-6">
                <CardTitle>Currency Settings</CardTitle>
                <CardDescription id="currency-settings-description">
                  Configure how prices are formatted and displayed
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="defaultCurrency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Default Currency</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
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
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="currencyPosition"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency Position</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select position" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="before">Before Amount</SelectItem>
                            <SelectItem value="after">After Amount</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="thousandsSeparator"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Thousands Separator</FormLabel>
                        <FormControl>
                          <Input {...field} maxLength={1} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="decimalSeparator"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Decimal Separator</FormLabel>
                        <FormControl>
                          <Input {...field} maxLength={1} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="decimalPlaces"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Decimal Places</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            max={4}
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Separator />

            <Card className="border-0 p-0">
              <CardHeader className="p-0 pb-6">
                <CardTitle>Discount Settings</CardTitle>
                <CardDescription id="discount-settings-description">
                  Configure how discounts are applied and managed
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="maximumDiscountPercentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maximum Discount %</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="minimumOrderValueForDiscount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Order Value</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="allowStackingDiscounts"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Allow Stacking Discounts
                        </FormLabel>
                        <FormDescription>
                          Allow multiple discounts to be applied to the same item
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
                  name="enableAutomaticDiscounts"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Enable Automatic Discounts
                        </FormLabel>
                        <FormDescription>
                          Automatically apply discounts based on rules
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
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={handleReset}>
              Reset to Defaults
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </FormProvider>
    </div>
  )
}

export default PricingSettings;
