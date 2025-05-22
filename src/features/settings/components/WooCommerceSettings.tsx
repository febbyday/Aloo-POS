import { useState, useEffect } from "react"
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
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { SettingsService, wooCommerceService } from "../services/woocommerce.service"
import { wooCommerceSettingsSchema, WooCommerceSettings } from "../schemas/woocommerce-settings.schema"

export function WooCommerceSettingsPanel() {
  const { toast } = useToast()
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected" | "testing">("disconnected")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const form = useForm<WooCommerceSettings>({
    resolver: zodResolver(wooCommerceSettingsSchema),
    defaultValues: {
      enabled: false,
      storeUrl: "",
      consumerKey: "",
      consumerSecret: "",
      sync: {
        products: {
          enabled: true,
          frequency: "hourly",
          importImages: true,
          importCategories: true,
          importAttributes: true,
        },
        inventory: {
          enabled: true,
          syncBidirectional: false,
          threshold: 5,
        },
        orders: {
          import: true,
          defaultStatus: "processing",
          autoComplete: false,
          notifications: true,
        },
        customers: {
          sync: true,
          importExisting: false,
        },
      },
      prices: {
        allowOverride: false,
        useWooCommercePricing: false,
      },
    },
  })

  // Load settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await SettingsService.getSettings()
        form.reset(settings)

        // If the store URL and credentials are set, assume connection was successful
        if (settings.enabled && settings.storeUrl && settings.consumerKey && settings.consumerSecret) {
          setConnectionStatus("connected")
        }
      } catch (error) {
        console.error("Error loading WooCommerce settings:", error)
        toast({
          title: "Error",
          description: "Failed to load WooCommerce settings",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [])

  const testConnection = async () => {
    try {
      setConnectionStatus("testing")

      const formValues = form.getValues()
      const result = await wooCommerceService.testConnection(formValues)

      if (result.success) {
        setConnectionStatus("connected")
        toast({
          title: "Connection Successful",
          description: result.message,
        })
      } else {
        setConnectionStatus("disconnected")
        toast({
          title: "Connection Failed",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      setConnectionStatus("disconnected")
      toast({
        title: "Connection Error",
        description: error instanceof Error ? error.message : "Failed to test connection",
        variant: "destructive",
      })
    }
  }

  const onSubmit = async (data: WooCommerceSettings) => {
    try {
      setIsSaving(true)
      await SettingsService.saveSettings(data)
      toast({
        title: "Settings Saved",
        description: "WooCommerce settings have been saved successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save WooCommerce settings",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
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
            <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Loading settings...</span>
                </div>
              ) : (
                <>
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
                </>
              )}

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
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => form.reset()}
                      disabled={isSaving}
                    >
                      Reset
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </Button>
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
