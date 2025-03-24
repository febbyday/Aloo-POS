/**
 * Products Settings Panel (Refactored)
 * 
 * This component demonstrates how to use the new form system from Phase 2
 * to replace the existing form implementation.
 */

import { useState } from "react";
import { z } from "zod";
import { 
  useZodForm, 
  FormProvider,
  createFormSchema,
  SchemaCreators
} from "@/lib/forms";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { createFormField } from "@/lib/forms";
import { 
  Input,
  Switch,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/form";

// Create form field components using our new form system
const FormTextField = createFormField({
  component: ({ label, value, onChange, onBlur, error, hasError, id, ...props }) => (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
        {props.required && <span className="text-destructive ml-1">*</span>}
      </label>
      <Input
        id={id}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className={hasError ? "border-destructive" : ""}
        {...props}
      />
      {hasError && <p className="text-destructive text-xs">{error}</p>}
    </div>
  )
});

const FormNumberField = createFormField({
  component: ({ label, value, onChange, onBlur, error, hasError, id, ...props }) => (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
        {props.required && <span className="text-destructive ml-1">*</span>}
      </label>
      <Input
        id={id}
        type="number"
        value={value === undefined || value === null ? "" : value}
        onChange={(e) => onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
        onBlur={onBlur}
        className={hasError ? "border-destructive" : ""}
        {...props}
      />
      {hasError && <p className="text-destructive text-xs">{error}</p>}
    </div>
  )
});

const FormSwitchField = createFormField({
  component: ({ label, value, onChange, onBlur, error, hasError, id, ...props }) => (
    <div className="flex items-center justify-between">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
        {props.required && <span className="text-destructive ml-1">*</span>}
      </label>
      <Switch
        id={id}
        checked={value || false}
        onCheckedChange={onChange}
        aria-invalid={hasError}
        {...props}
      />
      {hasError && <p className="text-destructive text-xs">{error}</p>}
    </div>
  ),
  defaultValueFn: (value) => Boolean(value)
});

const FormSelectField = createFormField({
  component: ({ label, value, onChange, onBlur, error, hasError, id, options, ...props }) => (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
        {props.required && <span className="text-destructive ml-1">*</span>}
      </label>
      <Select
        value={value || ""}
        onValueChange={onChange}
        onOpenChange={() => onBlur()}
      >
        <SelectTrigger id={id} className={hasError ? "border-destructive" : ""}>
          <SelectValue placeholder={props.placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options?.map((option) => (
            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {hasError && <p className="text-destructive text-xs">{error}</p>}
    </div>
  )
});

// Define the schema for product settings using our schema creators
const productSettingsSchema = createFormSchema({
  // General Product Settings
  defaultUnit: SchemaCreators.string({ required: true }),
  defaultCategory: SchemaCreators.string({ required: true }),
  enableVariants: SchemaCreators.boolean(),
  enableSerialNumbers: SchemaCreators.boolean(),
  enableBarcodes: SchemaCreators.boolean(),
  barcodeFormat: SchemaCreators.enum(["EAN-13", "UPC", "CODE128", "QR"] as const, { required: true }),
  
  // Inventory Settings
  trackInventory: SchemaCreators.boolean(),
  allowNegativeStock: SchemaCreators.boolean(),
  lowStockThreshold: SchemaCreators.number({ required: true, min: 0 }),
  enableAutoReorder: SchemaCreators.boolean(),
  reorderPoint: SchemaCreators.number({ required: true, min: 0 }),
  reorderQuantity: SchemaCreators.number({ required: true, min: 0 }),
  
  // Pricing Settings
  defaultPriceCalculation: SchemaCreators.enum(["markup", "margin"] as const, { required: true }),
  defaultMarkupPercentage: SchemaCreators.number({ required: true, min: 0, max: 1000 }),
  defaultMarginPercentage: SchemaCreators.number({ required: true, min: 0, max: 100 }),
  enableBulkPricing: SchemaCreators.boolean(),
  enableCustomerPricing: SchemaCreators.boolean(),
  
  // Display Settings
  showOutOfStock: SchemaCreators.boolean(),
  showLowStock: SchemaCreators.boolean(),
  defaultSortOrder: SchemaCreators.enum(["name", "sku", "price", "category"] as const, { required: true }),
  itemsPerPage: SchemaCreators.number({ required: true, min: 10, max: 100 }),
  
  // Image Settings
  enableImageUpload: SchemaCreators.boolean(),
  maxImageSize: SchemaCreators.number({ required: true, min: 1 }),
  allowMultipleImages: SchemaCreators.boolean(),
  compressImages: SchemaCreators.boolean(),
  
  // Import/Export Settings
  importFormat: SchemaCreators.enum(["csv", "excel", "json"] as const, { required: true }),
  exportFormat: SchemaCreators.enum(["csv", "excel", "json"] as const, { required: true }),
  autoBackupProducts: SchemaCreators.boolean(),
});

// Define the type based on the schema
type ProductSettingsValues = z.infer<typeof productSettingsSchema>;

// Default values for the form
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

// Barcode format options
const barcodeFormatOptions = [
  { label: "EAN-13", value: "EAN-13" },
  { label: "UPC", value: "UPC" },
  { label: "CODE128", value: "CODE128" },
  { label: "QR", value: "QR" },
];

// Price calculation options
const priceCalculationOptions = [
  { label: "Markup", value: "markup" },
  { label: "Margin", value: "margin" },
];

// Sort order options
const sortOrderOptions = [
  { label: "Name", value: "name" },
  { label: "SKU", value: "sku" },
  { label: "Price", value: "price" },
  { label: "Category", value: "category" },
];

// Format options
const formatOptions = [
  { label: "CSV", value: "csv" },
  { label: "Excel", value: "excel" },
  { label: "JSON", value: "json" },
];

export const ProductsSettingsPanelRefactored = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  
  // Initialize form with our new useZodForm hook
  const form = useZodForm({
    schema: productSettingsSchema,
    defaultValues,
    mode: "onBlur",
  });
  
  // Handle form submission
  const handleSubmit = async (data: ProductSettingsValues) => {
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success toast
      toast({
        title: "Settings saved",
        description: "Product settings have been updated successfully.",
      });
    } catch (error) {
      // Show error toast
      toast({
        title: "Error",
        description: "Failed to save product settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Settings</CardTitle>
        <CardDescription>
          Configure how products are displayed, managed, and processed in the system.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FormProvider
          form={form}
          onSubmit={handleSubmit}
          id="product-settings-form"
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="inventory">Inventory</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
              <TabsTrigger value="display">Display</TabsTrigger>
              <TabsTrigger value="images">Images</TabsTrigger>
              <TabsTrigger value="import-export">Import/Export</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="space-y-4">
              <FormTextField 
                name="defaultUnit" 
                label="Default Unit" 
                required 
              />
              
              <FormTextField 
                name="defaultCategory" 
                label="Default Category" 
                required 
              />
              
              <FormSwitchField 
                name="enableVariants" 
                label="Enable Product Variants" 
              />
              
              <FormSwitchField 
                name="enableSerialNumbers" 
                label="Enable Serial Numbers" 
              />
              
              <FormSwitchField 
                name="enableBarcodes" 
                label="Enable Barcodes" 
              />
              
              <FormSelectField 
                name="barcodeFormat" 
                label="Barcode Format" 
                options={barcodeFormatOptions}
                required 
              />
            </TabsContent>
            
            <TabsContent value="inventory" className="space-y-4">
              <FormSwitchField 
                name="trackInventory" 
                label="Track Inventory" 
              />
              
              <FormSwitchField 
                name="allowNegativeStock" 
                label="Allow Negative Stock" 
              />
              
              <FormNumberField 
                name="lowStockThreshold" 
                label="Low Stock Threshold" 
                required 
              />
              
              <FormSwitchField 
                name="enableAutoReorder" 
                label="Enable Auto Reorder" 
              />
              
              <FormNumberField 
                name="reorderPoint" 
                label="Reorder Point" 
                required 
              />
              
              <FormNumberField 
                name="reorderQuantity" 
                label="Reorder Quantity" 
                required 
              />
            </TabsContent>
            
            <TabsContent value="pricing" className="space-y-4">
              <FormSelectField 
                name="defaultPriceCalculation" 
                label="Default Price Calculation" 
                options={priceCalculationOptions}
                required 
              />
              
              <FormNumberField 
                name="defaultMarkupPercentage" 
                label="Default Markup Percentage" 
                required 
              />
              
              <FormNumberField 
                name="defaultMarginPercentage" 
                label="Default Margin Percentage" 
                required 
              />
              
              <FormSwitchField 
                name="enableBulkPricing" 
                label="Enable Bulk Pricing" 
              />
              
              <FormSwitchField 
                name="enableCustomerPricing" 
                label="Enable Customer-Specific Pricing" 
              />
            </TabsContent>
            
            <TabsContent value="display" className="space-y-4">
              <FormSwitchField 
                name="showOutOfStock" 
                label="Show Out of Stock Products" 
              />
              
              <FormSwitchField 
                name="showLowStock" 
                label="Show Low Stock Warning" 
              />
              
              <FormSelectField 
                name="defaultSortOrder" 
                label="Default Sort Order" 
                options={sortOrderOptions}
                required 
              />
              
              <FormNumberField 
                name="itemsPerPage" 
                label="Items Per Page" 
                required 
              />
            </TabsContent>
            
            <TabsContent value="images" className="space-y-4">
              <FormSwitchField 
                name="enableImageUpload" 
                label="Enable Image Upload" 
              />
              
              <FormNumberField 
                name="maxImageSize" 
                label="Max Image Size (MB)" 
                required 
              />
              
              <FormSwitchField 
                name="allowMultipleImages" 
                label="Allow Multiple Images" 
              />
              
              <FormSwitchField 
                name="compressImages" 
                label="Compress Images" 
              />
            </TabsContent>
            
            <TabsContent value="import-export" className="space-y-4">
              <FormSelectField 
                name="importFormat" 
                label="Default Import Format" 
                options={formatOptions}
                required 
              />
              
              <FormSelectField 
                name="exportFormat" 
                label="Default Export Format" 
                options={formatOptions}
                required 
              />
              
              <FormSwitchField 
                name="autoBackupProducts" 
                label="Auto Backup Products" 
              />
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 flex justify-end">
            <Button 
              type="submit" 
              onClick={form.handleSubmit(handleSubmit)}
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Settings
            </Button>
          </div>
        </FormProvider>
      </CardContent>
    </Card>
  );
}; 