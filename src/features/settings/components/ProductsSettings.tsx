// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! ��

import { useState } from "react"
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
import { useToast } from "@/components/ui/use-toast"

// Define the schema for product settings
const productSettingsSchema = z.object({
  // General Product Settings
  defaultUnit: z.string(),
  defaultCategory: z.string(),
  enableVariants: z.boolean(),
  enableSerialNumbers: z.boolean(),
  enableBarcodes: z.boolean(),
  barcodeFormat: z.enum(["EAN-13", "UPC", "CODE128", "QR"]),
  
  // Inventory Settings
  trackInventory: z.boolean(),
  allowNegativeStock: z.boolean(),
  lowStockThreshold: z.number().min(0),
  enableAutoReorder: z.boolean(),
  reorderPoint: z.number().min(0),
  reorderQuantity: z.number().min(0),
  
  // Pricing Settings
  defaultPriceCalculation: z.enum(["markup", "margin"]),
  defaultMarkupPercentage: z.number().min(0).max(1000),
  defaultMarginPercentage: z.number().min(0).max(100),
  enableBulkPricing: z.boolean(),
  enableCustomerPricing: z.boolean(),
  
  // Display Settings
  showOutOfStock: z.boolean(),
  showLowStock: z.boolean(),
  defaultSortOrder: z.enum(["name", "sku", "price", "category"]),
  itemsPerPage: z.number().min(10).max(100),
  
  // Image Settings
  enableImageUpload: z.boolean(),
  maxImageSize: z.number().min(1),
  allowMultipleImages: z.boolean(),
  compressImages: z.boolean(),
  
  // Import/Export Settings
  importFormat: z.enum(["csv", "excel", "json"]),
  exportFormat: z.enum(["csv", "excel", "json"]),
  autoBackupProducts: z.boolean(),
});

type ProductSettingsValues = z.infer<typeof productSettingsSchema>;

const defaultValues: ProductSettingsValues = {
  defaultUnit: "piece",
  defaultCategory: "general",
  enableVariants: true,
  enableSerialNumbers: false,
  enableBarcodes: true,
  barcodeFormat: "EAN-13",
  trackInventory: true,
  allowNegativeStock: false,
  lowStockThreshold: 10,
  enableAutoReorder: false,
  reorderPoint: 5,
  reorderQuantity: 10,
  defaultPriceCalculation: "markup",
  defaultMarkupPercentage: 50,
  defaultMarginPercentage: 33,
  enableBulkPricing: true,
  enableCustomerPricing: true,
  showOutOfStock: true,
  showLowStock: true,
  defaultSortOrder: "name",
  itemsPerPage: 20,
  enableImageUpload: true,
  maxImageSize: 5,
  allowMultipleImages: true,
  compressImages: true,
  importFormat: "csv",
  exportFormat: "csv",
  autoBackupProducts: true,
};

export const ProductsSettingsPanel = () => {
  const { toast } = useToast();
  const form = useForm<ProductSettingsValues>({
    resolver: zodResolver(productSettingsSchema),
    defaultValues,
  });

  const onSubmit = (data: ProductSettingsValues) => {
    toast({
      title: "Settings Updated",
      description: "Product settings have been saved successfully.",
    });
    console.log(data);
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="h-full">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="inventory">Inventory</TabsTrigger>
                <TabsTrigger value="pricing">Pricing</TabsTrigger>
                <TabsTrigger value="display">Display</TabsTrigger>
                <TabsTrigger value="images">Images</TabsTrigger>
                <TabsTrigger value="import-export">Import/Export</TabsTrigger>
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
                      name="enableVariants"
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
                      name="enableBarcodes"
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

                    {form.watch("enableBarcodes") && (
                      <FormField
                        control={form.control}
                        name="barcodeFormat"
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
                                <SelectItem value="EAN-13">EAN-13</SelectItem>
                                <SelectItem value="UPC">UPC</SelectItem>
                                <SelectItem value="CODE128">CODE128</SelectItem>
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
                      name="trackInventory"
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

                    {form.watch("trackInventory") && (
                      <>
                        <FormField
                          control={form.control}
                          name="allowNegativeStock"
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
                            name="lowStockThreshold"
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
                            name="reorderPoint"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Reorder Point</FormLabel>
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
                      name="defaultPriceCalculation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Default Price Calculation</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select calculation method" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="markup">Markup</SelectItem>
                              <SelectItem value="margin">Margin</SelectItem>
                            </SelectContent>
                          </Select>
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
                      name="enableBulkPricing"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Bulk Pricing</FormLabel>
                            <FormDescription>Enable bulk pricing discounts</FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="enableCustomerPricing"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Customer-Specific Pricing</FormLabel>
                            <FormDescription>Enable customer-specific price lists</FormDescription>
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
                      name="showOutOfStock"
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
                      name="defaultSortOrder"
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
                              <SelectItem value="sku">SKU</SelectItem>
                              <SelectItem value="price">Price</SelectItem>
                              <SelectItem value="category">Category</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="itemsPerPage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Items Per Page</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value.toString()}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select items per page" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="10">10</SelectItem>
                              <SelectItem value="20">20</SelectItem>
                              <SelectItem value="50">50</SelectItem>
                              <SelectItem value="100">100</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Image Settings */}
              <TabsContent value="images">
                <Card>
                  <CardHeader>
                    <CardTitle>Image Settings</CardTitle>
                    <CardDescription>Configure product image handling and storage</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="enableImageUpload"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Enable Image Upload</FormLabel>
                            <FormDescription>Allow product image uploads</FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {form.watch("enableImageUpload") && (
                      <>
                        <FormField
                          control={form.control}
                          name="maxImageSize"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Maximum Image Size (MB)</FormLabel>
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
                          name="allowMultipleImages"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Multiple Images</FormLabel>
                                <FormDescription>Allow multiple images per product</FormDescription>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="compressImages"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Compress Images</FormLabel>
                                <FormDescription>Automatically compress uploaded images</FormDescription>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Import/Export Settings */}
              <TabsContent value="import-export">
                <Card>
                  <CardHeader>
                    <CardTitle>Import/Export Settings</CardTitle>
                    <CardDescription>Configure product data import and export options</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="importFormat"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Default Import Format</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select import format" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="csv">CSV</SelectItem>
                              <SelectItem value="excel">Excel</SelectItem>
                              <SelectItem value="json">JSON</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="exportFormat"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Default Export Format</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select export format" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="csv">CSV</SelectItem>
                              <SelectItem value="excel">Excel</SelectItem>
                              <SelectItem value="json">JSON</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="autoBackupProducts"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Auto Backup</FormLabel>
                            <FormDescription>Automatically backup product data daily</FormDescription>
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
            </Tabs>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={() => form.reset(defaultValues)}>
                Reset to Defaults
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
} 