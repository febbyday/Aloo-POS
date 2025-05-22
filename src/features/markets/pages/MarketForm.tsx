import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarIcon, Save } from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useToast } from '@/lib/toast';
import { cn } from '@/lib/utils';
import PageHeader from '@/components/layout/PageHeader';

import { useMarketContext } from '../context/MarketContext';
import {
  MARKET_STATUS,
  CreateMarketSchema,
  UpdateMarketSchema,
  CreateMarketInput,
  UpdateMarketInput
} from '../types';
import { MARKETS_FULL_ROUTES } from '@/routes/marketRoutes';
import { Skeleton } from '@/components/ui/skeleton';

const MarketForm = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    selectedMarket,
    isLoading,
    fetchMarketById,
    createMarket,
    updateMarket
  } = useMarketContext();

  // Initialize form with correct schema based on create/edit mode
  const form = useForm<CreateMarketInput | UpdateMarketInput>({
    resolver: zodResolver(isEditing ? UpdateMarketSchema : CreateMarketSchema),
    defaultValues: {
      name: '',
      location: '',
      startDate: new Date(),
      endDate: new Date(Date.now() + 86400000), // tomorrow
      status: MARKET_STATUS.PLANNING,
      progress: 0
    }
  });

  // Fetch market data if in edit mode
  useEffect(() => {
    if (isEditing && id) {
      fetchMarketById(id);
    }
  }, [isEditing, id, fetchMarketById]);

  // Update form values when market data is loaded
  useEffect(() => {
    if (isEditing && selectedMarket) {
      // Parse dates from string to Date objects
      const startDate = selectedMarket.startDate ? new Date(selectedMarket.startDate) : new Date();
      const endDate = selectedMarket.endDate ? new Date(selectedMarket.endDate) : new Date();

      form.reset({
        ...selectedMarket,
        startDate,
        endDate
      });
    }
  }, [isEditing, selectedMarket, form]);

  const onSubmit = async (data: CreateMarketInput | UpdateMarketInput) => {
    try {
      if (isEditing && id) {
        await updateMarket(id, data as UpdateMarketInput);
        toast({
          title: "Market updated",
          description: "Market has been successfully updated",
        });
      } else {
        await createMarket(data as CreateMarketInput);
        toast({
          title: "Market created",
          description: "New market has been successfully created",
        });
      }
      navigate(MARKETS_FULL_ROUTES.LIST);
    } catch (error) {
      toast({
        title: "Error",
        description: isEditing
          ? "Failed to update market. Please try again."
          : "Failed to create market. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isEditing && isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-[250px]" />
        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-[180px]" />
            <Skeleton className="h-5 w-[250px]" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-5 w-[120px]" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
            <div className="pt-4">
              <Skeleton className="h-10 w-[120px]" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEditing ? "Edit Market" : "Create Market"}
        description={isEditing ? "Update market details" : "Create a new market event"}
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Markets', href: MARKETS_FULL_ROUTES.ROOT },
          { label: 'All Markets', href: MARKETS_FULL_ROUTES.LIST },
          { label: isEditing ? 'Edit Market' : 'Create Market', href: isEditing ? `${MARKETS_FULL_ROUTES.ROOT}/${id}/edit` : MARKETS_FULL_ROUTES.NEW },
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? "Edit Market" : "Create Market"}</CardTitle>
          <CardDescription>
            {isEditing
              ? "Update the details of an existing market"
              : "Fill in the details to create a new market event"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Market Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter market name" {...field} />
                    </FormControl>
                    <FormDescription>
                      The name of your market event
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter market location" {...field} />
                    </FormControl>
                    <FormDescription>
                      The physical location where the market will be held
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value as Date}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Date when the market starts
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value as Date}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Date when the market ends
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select market status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={MARKET_STATUS.PLANNING}>Planning</SelectItem>
                          <SelectItem value={MARKET_STATUS.PREPARING}>Preparing</SelectItem>
                          <SelectItem value={MARKET_STATUS.ACTIVE}>Active</SelectItem>
                          <SelectItem value={MARKET_STATUS.CLOSED}>Closed</SelectItem>
                          <SelectItem value={MARKET_STATUS.CANCELLED}>Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Current status of the market
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="progress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Progress (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          placeholder="Enter progress percentage"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>
                        Preparation progress (0-100%)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(MARKETS_FULL_ROUTES.LIST)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  {isEditing ? "Update Market" : "Create Market"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default MarketForm;