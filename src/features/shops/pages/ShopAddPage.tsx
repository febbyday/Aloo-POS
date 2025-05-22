// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! ��

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Globe, Hash, Mail, MapPin, Phone, Save, Store, User, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/lib/toast';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRealShopContext } from '../context/RealShopContext';
import { SHOP_STATUS, SHOP_TYPE, Shop } from '../types';
import { Checkbox } from '@/components/ui/checkbox';
import { realShopService } from '../services/realShopService';

// Define the form schema using Zod
const shopFormSchema = z.object({
  name: z.string().min(2, { message: 'Shop name must be at least 2 characters' }),
  code: z.string().min(2, { message: 'Shop code must be at least 2 characters' }),
  description: z.string().optional(),
  type: z.enum(['RETAIL', 'WAREHOUSE', 'OUTLET', 'MARKET', 'ONLINE']),
  address: z.object({
    street: z.string().min(2, { message: 'Street is required' }),
    street2: z.string().optional(),
    city: z.string().min(2, { message: 'City is required' }),
    state: z.string().min(2, { message: 'State is required' }),
    postalCode: z.string().min(2, { message: 'Postal code is required' }),
    country: z.string().min(2, { message: 'Country is required' }),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }),
  phone: z.string().optional(),
  email: z.string().email({ message: 'Invalid email address' }).optional(),
  status: z.enum([SHOP_STATUS.ACTIVE, SHOP_STATUS.INACTIVE, SHOP_STATUS.MAINTENANCE]),
  manager: z.string().optional(),
  isHeadOffice: z.boolean().default(false),
  timezone: z.string().default('UTC'),
  taxId: z.string().optional(),
  licenseNumber: z.string().optional(),
  website: z.string().optional(),
});

type ShopFormValues = z.infer<typeof shopFormSchema>;

export function ShopAddPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createShop, isLoading } = useRealShopContext();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [checkingCode, setCheckingCode] = useState(false);
  const [isCodeUnique, setIsCodeUnique] = useState(true);

  // Initialize form with default values
  const form = useForm<ShopFormValues>({
    resolver: zodResolver(shopFormSchema),
    defaultValues: {
      name: '',
      code: '',
      description: '',
      address: {
        street: '',
        street2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'United States',
        latitude: undefined,
        longitude: undefined,
      },
      phone: '',
      email: '',
      status: SHOP_STATUS.ACTIVE,
      type: 'RETAIL' as const,
      manager: '',
      isHeadOffice: false,
      timezone: 'UTC',
      taxId: '',
      licenseNumber: '',
      website: '',
    },
  });

  // Check if shop code is unique when it changes
  const shopCode = form.watch('code');

  useEffect(() => {
    // Skip empty codes or very short codes (still typing)
    if (!shopCode || shopCode.length < 2) {
      setIsCodeUnique(true);
      return;
    }

    // Debounce the check to avoid too many API calls while typing
    const timer = setTimeout(async () => {
      setCheckingCode(true);
      try {
        const exists = await realShopService.checkCodeExists(shopCode);
        setIsCodeUnique(!exists);

        if (exists) {
          form.setError('code', {
            type: 'manual',
            message: 'This shop code is already in use'
          });
        } else {
          form.clearErrors('code');
        }
      } catch (error) {
        console.error('Error checking shop code:', error);
      } finally {
        setCheckingCode(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [shopCode, form]);

  // Handle form submission
  const onSubmit = async (data: ShopFormValues) => {
    setSubmitError(null);

    // Double-check code uniqueness before submission
    if (data.code) {
      try {
        const exists = await realShopService.checkCodeExists(data.code);
        if (exists) {
          form.setError('code', {
            type: 'manual',
            message: 'This shop code is already in use'
          });
          setSubmitError('A shop with this code already exists. Please use a different code.');
          return;
        }
      } catch (error) {
        console.error('Error checking shop code uniqueness:', error);
        // Continue with submission even if the check fails
      }
    }

    try {
      // Prepare the shop data
      const shopData: Partial<Shop> = {
        ...data,
        // Ensure address is properly formatted
        address: {
          street: data.address?.street || '',
          city: data.address?.city || '',
          state: data.address?.state || '',
          postalCode: data.address?.postalCode || '',
          country: data.address?.country || 'USA',
          street2: data.address?.street2,
          latitude: data.address?.latitude,
          longitude: data.address?.longitude,
        },
        // Ensure settings has the necessary defaults
        settings: {
          allowNegativeInventory: false,
          requireStockCheck: true,
          defaultTaxRate: 10,
          defaultDiscountRate: 0,
          autoPrintReceipt: true,
          allowReturnWithoutReceipt: false,
          enableCashierTracking: true,
          minPasswordLength: 8,
          receiptHeader: '',
          receiptFooter: '',
          requireManagerApproval: {
            forDiscount: true,
            forVoid: true,
            forReturn: true,
            forRefund: true,
            forPriceChange: true
          },
          thresholds: {
            lowStock: 10,
            criticalStock: 5,
            reorderPoint: 10
          }
        },
        inventoryLocations: [],
        staffAssignments: [],
        // Add analytics data with default values
        analytics: {
          salesLastMonth: 0,
          inventoryCount: 0,
          averageOrderValue: 0,
          customersServedToday: 0,
          topSellingItems: [],
          revenueByCategory: {},
          salesTrend: []
        }
      };

      const newShop = await createShop(shopData);

      if (newShop) {
        toast({
          title: 'Shop Created',
          description: `${data.name} has been successfully created.`,
        });
        navigate('/shops'); // Redirect to shops list page instead of shop details
      } else {
        setSubmitError('Failed to create shop. Please try again.');
      }
    } catch (err) {
      console.error('Error creating shop:', err);

      let errorMessage = 'An unexpected error occurred';

      if (err instanceof Error) {
        // Check for 409 conflict error (duplicate code or name)
        if (err.message.includes('409 Conflict') || err.message.includes('already exists')) {
          errorMessage = 'A shop with this code or name already exists. Please try a different one.';

          // Set specific field errors
          form.setError('code', {
            type: 'manual',
            message: 'This shop code may already be in use'
          });
        } else {
          errorMessage = err.message;
        }
      }

      setSubmitError(errorMessage);

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          className="mr-4"
          onClick={() => navigate('/shops')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Shops
        </Button>
        <h1 className="text-3xl font-bold">Create New Shop</h1>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Store className="mr-2 h-5 w-5 text-primary" />
            Shop Details
          </CardTitle>
          <CardDescription>
            Enter the details for the new shop location
          </CardDescription>
        </CardHeader>
        <CardContent>
          {submitError && (
            <div className="bg-destructive/10 text-destructive rounded-md p-3 mb-4">
              {submitError}
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Name and Code */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shop Name*</FormLabel>
                      <FormControl>
                        <div className="flex items-center">
                          <Store className="mr-2 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="Main Store" {...field} />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Display name for this shop location
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shop Code*</FormLabel>
                      <FormControl>
                        <div className="flex items-center">
                          <Hash className="mr-2 h-4 w-4 text-muted-foreground" />
                          <div className="relative flex-1">
                            <Input
                              placeholder="MST001"
                              {...field}
                              className={`${!isCodeUnique && field.value ? 'border-red-500 pr-10' : ''}`}
                            />
                            {checkingCode && field.value && (
                              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                              </div>
                            )}
                            {!checkingCode && !isCodeUnique && field.value && (
                              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <svg className="h-4 w-4 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <circle cx="12" cy="12" r="10" />
                                  <line x1="15" y1="9" x2="9" y2="15" />
                                  <line x1="9" y1="9" x2="15" y2="15" />
                                </svg>
                              </div>
                            )}
                            {!checkingCode && isCodeUnique && field.value && field.value.length >= 2 && (
                              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <svg className="h-4 w-4 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                  <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                              </div>
                            )}
                          </div>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Unique identifier for this shop location
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Shop Type */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shop Type*</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select shop type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="RETAIL">Retail</SelectItem>
                        <SelectItem value="WAREHOUSE">Warehouse</SelectItem>
                        <SelectItem value="OUTLET">Outlet</SelectItem>
                        <SelectItem value="MARKET">Market</SelectItem>
                        <SelectItem value="ONLINE">Online</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Type of shop operation
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Status and Head Office */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status*</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={SHOP_STATUS.ACTIVE}>Active</SelectItem>
                          <SelectItem value={SHOP_STATUS.INACTIVE}>Inactive</SelectItem>
                          <SelectItem value={SHOP_STATUS.MAINTENANCE}>Maintenance</SelectItem>
                          <SelectItem value={SHOP_STATUS.CLOSED}>Closed</SelectItem>
                          <SelectItem value={SHOP_STATUS.PENDING}>Pending</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Current operational status of the shop
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isHeadOffice"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 mt-8">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Head Office
                        </FormLabel>
                        <FormDescription>
                          Designate this location as the head office
                        </FormDescription>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Address Section */}
              <div className="border rounded-md p-4 mt-4">
                <h3 className="text-lg font-medium mb-4 flex items-center">
                  <MapPin className="mr-2 h-4 w-4" />
                  Address Information
                </h3>

                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="address.street"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Address*</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Main St" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address.street2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Address 2</FormLabel>
                        <FormControl>
                          <Input placeholder="Suite 100" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="address.city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City*</FormLabel>
                          <FormControl>
                            <Input placeholder="New York" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="address.state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State/Province*</FormLabel>
                          <FormControl>
                            <Input placeholder="NY" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="address.postalCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Postal Code*</FormLabel>
                          <FormControl>
                            <Input placeholder="10001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="address.country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country*</FormLabel>
                          <FormControl>
                            <Input placeholder="United States" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="border rounded-md p-4">
                <h3 className="text-lg font-medium mb-4 flex items-center">
                  <Phone className="mr-2 h-4 w-4" />
                  Contact Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <div className="flex items-center">
                            <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="+1 (555) 123-4567" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <div className="flex items-center">
                            <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="shop@example.com" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website</FormLabel>
                        <FormControl>
                          <div className="flex items-center">
                            <Globe className="mr-2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="https://example.com" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="timezone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Timezone</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select timezone" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="UTC">UTC</SelectItem>
                            <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                            <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                            <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                            <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Local timezone for this shop location
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="mt-4">
                  <FormField
                    control={form.control}
                    name="manager"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Manager</FormLabel>
                        <FormControl>
                          <div className="flex items-center">
                            <User className="mr-2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="John Doe" {...field} />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Name of the shop manager
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Legal Information */}
              <div className="border rounded-md p-4 mt-4">
                <h3 className="text-lg font-medium mb-4 flex items-center">
                  <FileText className="mr-2 h-4 w-4" />
                  Legal Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="taxId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tax ID</FormLabel>
                        <FormControl>
                          <div className="flex items-center">
                            <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="12-3456789" {...field} />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Tax identification number
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="licenseNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>License Number</FormLabel>
                        <FormControl>
                          <div className="flex items-center">
                            <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="LIC-12345" {...field} />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Business license number
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>


              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter details about this shop location..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Additional information about this shop
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/shops')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isLoading ? 'Creating...' : 'Create Shop'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default ShopAddPage;
