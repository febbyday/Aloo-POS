// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/components/ui/use-toast";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart } from "lucide-react";

// Define schema for market settings
const marketSettingsSchema = z.object({
  // General Settings
  enableMarketAnalysis: z.boolean(),
  marketCodePrefix: z.string(),
  defaultCurrency: z.string(),
  enableLocationTracking: z.boolean(),
  
  // Market Analysis Settings
  analysisFrequency: z.enum(["daily", "weekly", "monthly", "quarterly"]),
  trackCompetitors: z.boolean(),
  competitorPriceAlerts: z.boolean(),
  priceAlertThreshold: z.number().min(0),
  
  // Demographics Settings
  enableDemographicTracking: z.boolean(),
  demographicDataSources: z.array(z.enum(["census", "surveys", "social", "purchase"])),
  updateFrequency: z.enum(["monthly", "quarterly", "yearly"]),
  
  // Performance Metrics
  enablePerformanceTracking: z.boolean(),
  kpiMetrics: z.array(z.enum(["sales", "traffic", "conversion", "basket"])),
  benchmarkingEnabled: z.boolean(),
  autoGenerateReports: z.boolean(),
  
  // Integration Settings
  enableGoogleAnalytics: z.boolean(),
  enableSocialMediaTracking: z.boolean(),
  enableWeatherTracking: z.boolean(),
});

type MarketSettingsValues = z.infer<typeof marketSettingsSchema>;

const defaultValues: MarketSettingsValues = {
  enableMarketAnalysis: true,
  marketCodePrefix: "MKT",
  defaultCurrency: "USD",
  enableLocationTracking: true,
  
  analysisFrequency: "monthly",
  trackCompetitors: true,
  competitorPriceAlerts: true,
  priceAlertThreshold: 10,
  
  enableDemographicTracking: true,
  demographicDataSources: ["census", "purchase"],
  updateFrequency: "quarterly",
  
  enablePerformanceTracking: true,
  kpiMetrics: ["sales", "traffic", "conversion", "basket"],
  benchmarkingEnabled: true,
  autoGenerateReports: true,
  
  enableGoogleAnalytics: false,
  enableSocialMediaTracking: true,
  enableWeatherTracking: true,
};

const MarketsSettings = () => {
  const { toast } = useToast();
  const form = useForm<MarketSettingsValues>({
    resolver: zodResolver(marketSettingsSchema),
    defaultValues,
  });

  const onSubmit = (data: MarketSettingsValues) => {
    toast({
      title: "Settings Updated",
      description: "Market settings have been saved successfully.",
    });
    console.log(data);
  };

  const resetToDefaults = () => {
    form.reset(defaultValues);
    toast({
      title: "Settings Reset",
      description: "Market settings have been reset to defaults.",
    });
  };

  return (
    <div className="space-y-6 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Market Settings</h2>
          <p className="text-muted-foreground">
            Configure market analysis and demographic tracking settings
          </p>
        </div>
        <BarChart className="h-6 w-6 text-muted-foreground" />
      </div>
      
      <Separator />
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>General Market Settings</CardTitle>
              <CardDescription>Configure basic market analysis settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="enableMarketAnalysis"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Enable Market Analysis</FormLabel>
                      <FormDescription>
                        Turn on market analysis features for your business
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
                name="marketCodePrefix"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Market Code Prefix</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      Prefix used for market codes in your system
                    </FormDescription>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="defaultCurrency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Currency</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">US Dollar (USD)</SelectItem>
                          <SelectItem value="EUR">Euro (EUR)</SelectItem>
                          <SelectItem value="GBP">British Pound (GBP)</SelectItem>
                          <SelectItem value="JPY">Japanese Yen (JPY)</SelectItem>
                          <SelectItem value="CAD">Canadian Dollar (CAD)</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>
                      Default currency for market analysis
                    </FormDescription>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="enableLocationTracking"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Location Tracking</FormLabel>
                      <FormDescription>
                        Enable location-based market analysis
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
          
          <Card>
            <CardHeader>
              <CardTitle>Market Analysis Settings</CardTitle>
              <CardDescription>Configure how market analysis is performed</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="analysisFrequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Analysis Frequency</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>
                      How often market analysis is performed
                    </FormDescription>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="trackCompetitors"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Track Competitors</FormLabel>
                      <FormDescription>
                        Monitor competitor pricing and offerings
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
                name="competitorPriceAlerts"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Competitor Price Alerts</FormLabel>
                      <FormDescription>
                        Receive alerts when competitors change prices
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
                name="priceAlertThreshold"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price Alert Threshold (%)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      Minimum percentage change to trigger price alerts
                    </FormDescription>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Integration Settings</CardTitle>
              <CardDescription>Configure third-party integrations for market analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="enableGoogleAnalytics"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Google Analytics</FormLabel>
                      <FormDescription>
                        Integrate with Google Analytics for market insights
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
                name="enableSocialMediaTracking"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Social Media Tracking</FormLabel>
                      <FormDescription>
                        Track market trends from social media platforms
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
                name="enableWeatherTracking"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Weather Tracking</FormLabel>
                      <FormDescription>
                        Analyze market trends based on weather patterns
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
          
          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={resetToDefaults}>
              Reset to Defaults
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default MarketsSettings;