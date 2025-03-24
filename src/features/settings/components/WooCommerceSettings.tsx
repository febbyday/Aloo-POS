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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, XCircle } from "lucide-react"

const wooCommerceSchema = z.object({
  enabled: z.boolean(),
  storeUrl: z.string().url("Please enter a valid URL"),
  consumerKey: z.string().min(1, "Consumer Key is required"),
  consumerSecret: z.string().min(1, "Consumer Secret is required"),
  sync: z.object({
    products: z.boolean(),
    inventory: z.boolean(),
    orders: z.boolean(),
    customers: z.boolean(),
    frequency: z.enum(["realtime", "hourly", "daily", "manual"]),
  }),
  products: z.object({
    overridePrices: z.boolean(),
    syncImages: z.boolean(),
    syncCategories: z.boolean(),
    attributeMapping: z.boolean(),
  }),
  orders: z.object({
    defaultStatus: z.enum(["pending", "processing", "completed"]),
    autoComplete: z.boolean(),
    notifications: z.boolean(),
    customWorkflow: z.boolean(),
  }),
})

type WooCommerceSettings = z.infer<typeof wooCommerceSchema>

export function WooCommerceSettingsPanel() {
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected" | "testing">("disconnected")

  const form = useForm<WooCommerceSettings>({
    resolver: zodResolver(wooCommerceSchema),
    defaultValues: {
      enabled: false,
      storeUrl: "",
      consumerKey: "",
      consumerSecret: "",
      sync: {
        products: true,
        inventory: true,
        orders: true,
        customers: true,
        frequency: "hourly",
      },
      products: {
        overridePrices: false,
        syncImages: true,
        syncCategories: true,
        attributeMapping: true,
      },
      orders: {
        defaultStatus: "processing",
        autoComplete: false,
        notifications: true,
        customWorkflow: false,
      },
    },
  })

  const testConnection = async () => {
    setConnectionStatus("testing")
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    setConnectionStatus("connected")
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>WooCommerce Integration</CardTitle>
          <CardDescription>
            Connect and sync your POS system with your WooCommerce online store
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <FormLabel>Enable WooCommerce Integration</FormLabel>
                  <FormDescription>
                    Connect your POS system with WooCommerce
                  </FormDescription>
                </div>
                <FormField
                  control={form.control}
                  name="enabled"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {form.watch("enabled") && (
                <>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="storeUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Store URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://your-store.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="consumerKey"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Consumer Key</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="consumerSecret"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Consumer Secret</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex items-center gap-4">
                      <Button
                        type="button"
                        onClick={testConnection}
                        disabled={connectionStatus === "testing"}
                      >
                        Test Connection
                      </Button>

                      {connectionStatus !== "disconnected" && (
                        <Alert className="flex-1">
                          {connectionStatus === "testing" ? (
                            <AlertTitle>Testing connection...</AlertTitle>
                          ) : (
                            <>
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                              <AlertTitle>Connected successfully!</AlertTitle>
                              <AlertDescription>
                                Your POS is now connected to WooCommerce
                              </AlertDescription>
                            </>
                          )}
                        </Alert>
                      )}
                    </div>

                    <Tabs defaultValue="sync" className="mt-6">
                      <TabsList>
                        <TabsTrigger value="sync">Sync Configuration</TabsTrigger>
                        <TabsTrigger value="products">Product Management</TabsTrigger>
                        <TabsTrigger value="orders">Order Processing</TabsTrigger>
                      </TabsList>

                      <TabsContent value="sync" className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <FormField
                            control={form.control}
                            name="sync.products"
                            render={({ field }) => (
                              <FormItem className="flex items-center justify-between space-y-0">
                                <div>
                                  <FormLabel>Sync Products</FormLabel>
                                  <FormDescription>
                                    Keep products in sync with WooCommerce
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
                            name="sync.inventory"
                            render={({ field }) => (
                              <FormItem className="flex items-center justify-between space-y-0">
                                <div>
                                  <FormLabel>Sync Inventory</FormLabel>
                                  <FormDescription>
                                    Keep inventory levels in sync
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
                            name="sync.orders"
                            render={({ field }) => (
                              <FormItem className="flex items-center justify-between space-y-0">
                                <div>
                                  <FormLabel>Sync Orders</FormLabel>
                                  <FormDescription>
                                    Import orders from WooCommerce
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
                            name="sync.customers"
                            render={({ field }) => (
                              <FormItem className="flex items-center justify-between space-y-0">
                                <div>
                                  <FormLabel>Sync Customers</FormLabel>
                                  <FormDescription>
                                    Keep customer data in sync
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
                        </div>

                        <FormField
                          control={form.control}
                          name="sync.frequency"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Sync Frequency</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select frequency" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="realtime">Real-time</SelectItem>
                                  <SelectItem value="hourly">Hourly</SelectItem>
                                  <SelectItem value="daily">Daily</SelectItem>
                                  <SelectItem value="manual">Manual</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                      </TabsContent>

                      <TabsContent value="products" className="space-y-4">
                        <FormField
                          control={form.control}
                          name="products.overridePrices"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between space-y-0">
                              <div>
                                <FormLabel>Override WooCommerce Prices</FormLabel>
                                <FormDescription>
                                  Use POS prices instead of WooCommerce prices
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
                          name="products.syncImages"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between space-y-0">
                              <div>
                                <FormLabel>Sync Product Images</FormLabel>
                                <FormDescription>
                                  Keep product images in sync
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
                          name="products.syncCategories"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between space-y-0">
                              <div>
                                <FormLabel>Sync Categories</FormLabel>
                                <FormDescription>
                                  Keep product categories in sync
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
                          name="products.attributeMapping"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between space-y-0">
                              <div>
                                <FormLabel>Attribute Mapping</FormLabel>
                                <FormDescription>
                                  Map POS attributes to WooCommerce attributes
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
                      </TabsContent>

                      <TabsContent value="orders" className="space-y-4">
                        <FormField
                          control={form.control}
                          name="orders.defaultStatus"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Default Order Status</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="processing">Processing</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="orders.autoComplete"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between space-y-0">
                              <div>
                                <FormLabel>Auto-complete Orders</FormLabel>
                                <FormDescription>
                                  Automatically complete orders when paid
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
                          name="orders.notifications"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between space-y-0">
                              <div>
                                <FormLabel>Order Notifications</FormLabel>
                                <FormDescription>
                                  Receive notifications for new orders
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
                          name="orders.customWorkflow"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between space-y-0">
                              <div>
                                <FormLabel>Custom Order Workflow</FormLabel>
                                <FormDescription>
                                  Enable custom order processing workflow
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
                      </TabsContent>
                    </Tabs>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <Button variant="outline" type="reset">
                      Reset
                    </Button>
                    <Button type="submit">Save Changes</Button>
                  </div>
                </>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
