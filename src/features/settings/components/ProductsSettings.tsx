import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Save, RotateCcw, Loader2 } from 'lucide-react';
import { SettingsService, productService } from '../services/product.service';
import { productSettingsSchema, ProductSettings } from '../schemas/product-settings.schema';

export const ProductsSettingsPanel = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<ProductSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await SettingsService.getSettings();
        setSettings(data);
      } catch (error) {
        console.error("Error loading product settings:", error);
        toast({
          title: "Error",
          description: "Failed to load product settings",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [toast]);

  const form = useForm<ProductSettings>({
    resolver: zodResolver(productSettingsSchema),
    values: settings || undefined,
  });

  // Update form when settings change
  useEffect(() => {
    if (settings) {
      form.reset(settings);
    }
  }, [settings, form]);

  const saveSettings = async (updatedSettings: ProductSettings) => {
    setSaving(true);
    try {
      await SettingsService.saveSettings(updatedSettings);
      setSettings(updatedSettings);
      toast({
        title: "Settings saved",
        description: "Product settings have been updated successfully",
      });
    } catch (error) {
      console.error("Error saving product settings:", error);
      toast({
        title: "Error",
        description: "Failed to save product settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleResetSettings = async () => {
    try {
      const defaultSettings = await SettingsService.resetSettings();
      setSettings(defaultSettings);
      form.reset(defaultSettings);
      toast({
        title: "Settings reset",
        description: "Product settings have been reset to defaults",
      });
    } catch (error) {
      console.error("Error resetting product settings:", error);
      toast({
        title: "Error",
        description: "Failed to reset product settings",
        variant: "destructive",
      });
    }
  };

  const onSubmit = (data: ProductSettings) => {
    saveSettings(data);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Product Settings</CardTitle>
          <CardDescription>Configure product settings and behavior</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!settings) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Product Settings</CardTitle>
          <CardDescription>Configure product settings and behavior</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">Failed to load settings. Please try again.</p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={() => window.location.reload()}>Reload</Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="h-full">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="inventory">Inventory</TabsTrigger>
                <TabsTrigger value="pricing">Pricing</TabsTrigger>
                <TabsTrigger value="display">Display</TabsTrigger>
                <TabsTrigger value="images">Variations</TabsTrigger>
              </TabsList>

              {/* General Settings */}
              <TabsContent value="general">
                <Card>
                  <CardHeader>
                    <CardTitle>General Product Settings</CardTitle>
                    <CardDescription>Configure basic product settings and features</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="defaultUnit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Default Unit</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select unit" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="piece">Piece</SelectItem>
                                <SelectItem value="kg">Kilogram</SelectItem>
                                <SelectItem value="meter">Meter</SelectItem>
                                <SelectItem value="liter">Liter</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="defaultCategory"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Default Category</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="general">General</SelectItem>
                                <SelectItem value="electronics">Electronics</SelectItem>
                                <SelectItem value="clothing">Clothing</SelectItem>
                                <SelectItem value="food">Food</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="variations.enabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Product Variants</FormLabel>
                            <FormDescription>Enable product variations (size, color, etc.)</FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="inventory.enableBarcodes"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Barcode Support</FormLabel>
                            <FormDescription>Enable barcode generation and scanning</FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {form.watch("inventory.enableBarcodes") && (
                      <FormField
                        control={form.control}
                        name="inventory.barcodeFormat"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Barcode Format</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select format" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="CODE128">CODE128</SelectItem>
                                <SelectItem value="EAN13">EAN13</SelectItem>
                                <SelectItem value="UPC">UPC</SelectItem>
                                <SelectItem value="QR">QR Code</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Inventory Settings */}
              <TabsContent value="inventory">
                <Card>
                  <CardHeader>
                    <CardTitle>Inventory Management</CardTitle>
                    <CardDescription>Configure how product inventory is tracked and managed</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="inventory.trackInventory"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Track Inventory</FormLabel>
                            <FormDescription>Enable inventory tracking for products</FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {form.watch("inventory.trackInventory") && (
                      <>
                        <FormField
                          control={form.control}
                          name="inventory.allowNegativeStock"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Allow Negative Stock</FormLabel>
                                <FormDescription>Allow stock levels to go below zero</FormDescription>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="inventory.lowStockThreshold"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Low Stock Threshold</FormLabel>
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
                            name="inventory.autoOrderThreshold"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Auto Order Threshold</FormLabel>
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
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Pricing Settings */}
              <TabsContent value="pricing">
                <Card>
                  <CardHeader>
                    <CardTitle>Pricing Configuration</CardTitle>
                    <CardDescription>Configure product pricing settings and calculations</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="pricing.enableTax"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Enable Tax</FormLabel>
                            <FormDescription>Enable tax calculations for products</FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {form.watch("pricing.enableTax") && (
                      <FormField
                        control={form.control}
                        name="pricing.defaultTaxRate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Default Tax Rate (%)</FormLabel>
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
                    )}

                    <FormField
                      control={form.control}
                      name="pricing.enableDiscount"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Enable Discounts</FormLabel>
                            <FormDescription>Enable discount functionality</FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {form.watch("pricing.enableDiscount") && (
                      <FormField
                        control={form.control}
                        name="pricing.maxDiscountPercent"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Maximum Discount (%)</FormLabel>
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
                    )}

                    <FormField
                      control={form.control}
                      name="pricing.enableCostTracking"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Cost Tracking</FormLabel>
                            <FormDescription>Track product costs and calculate margins</FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {form.watch("pricing.enableCostTracking") && (
                      <FormField
                        control={form.control}
                        name="pricing.defaultMarkupPercent"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Default Markup (%)</FormLabel>
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
                    )}

                    <FormField
                      control={form.control}
                      name="pricing.roundPricesToNearestCent"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Round Prices</FormLabel>
                            <FormDescription>Round prices to the nearest cent</FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Display Settings */}
              <TabsContent value="display">
                <Card>
                  <CardHeader>
                    <CardTitle>Display Settings</CardTitle>
                    <CardDescription>Configure how products are displayed in the system</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="display.defaultView"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Default View</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select view type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="grid">Grid</SelectItem>
                              <SelectItem value="list">List</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="display.showOutOfStock"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Show Out of Stock</FormLabel>
                            <FormDescription>Display out of stock products in listings</FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="display.showImages"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Show Images</FormLabel>
                            <FormDescription>Display product images in listings</FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="display.defaultSortOrder"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Default Sort Order</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select sort order" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="name">Name</SelectItem>
                              <SelectItem value="price">Price</SelectItem>
                              <SelectItem value="newest">Newest</SelectItem>
                              <SelectItem value="bestselling">Best Selling</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="display.itemsPerPage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Items Per Page</FormLabel>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Variations Settings */}
              <TabsContent value="images">
                <Card>
                  <CardHeader>
                    <CardTitle>Variations Settings</CardTitle>
                    <CardDescription>Configure product variations and attributes</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="variations.enabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Enable Variations</FormLabel>
                            <FormDescription>Allow products to have variations</FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {form.watch("variations.enabled") && (
                      <>
                        <FormField
                          control={form.control}
                          name="variations.maxVariationsPerProduct"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Maximum Variations Per Product</FormLabel>
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

                        <div className="space-y-2">
                          <Label>Default Attributes</Label>
                          <div className="border rounded-md p-4">
                            <p className="text-sm text-muted-foreground mb-2">
                              Default attributes for product variations (e.g., Size, Color)
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {form.watch("variations.defaultAttributes")?.map((attr, index) => (
                                <div key={index} className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm flex items-center">
                                  {attr}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>


            </Tabs>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleResetSettings}
                disabled={loading || saving}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset to Defaults
              </Button>
              <Button
                type="submit"
                disabled={loading || saving}
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
          </form>
        </Form>
      </div>
    </div>
  );
}