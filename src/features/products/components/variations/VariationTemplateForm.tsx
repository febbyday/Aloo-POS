import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Save, 
  X, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  AlertCircle,
  DollarSign,
  Barcode,
  Package
} from 'lucide-react';
import { ProductAttribute } from '../../types/unified-product.types';
import { VariationTemplateFormData } from '../../types/variation-template';

// Form schema
const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  category: z.enum(['clothing', 'electronics', 'food', 'general', 'custom']),
  attributes: z.array(
    z.object({
      id: z.string().optional(),
      name: z.string().min(1, 'Attribute name is required'),
      options: z.array(z.string()).min(1, 'At least one option is required'),
      isVisibleOnProductPage: z.boolean().default(true),
      isUsedForVariations: z.boolean().default(true),
    })
  ).min(1, 'At least one attribute is required'),
  pricingStrategy: z.enum(['fixed', 'increment', 'percentage']),
  pricingValue: z.number().min(0, 'Value must be 0 or greater'),
  generateSKUs: z.boolean(),
  generateBarcodes: z.boolean(),
  stockStrategy: z.enum(['distribute', 'duplicate', 'zero']),
  isDefault: z.boolean().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface VariationTemplateFormProps {
  initialData?: Partial<VariationTemplateFormData>;
  onSubmit: (data: VariationTemplateFormData) => void;
  onCancel: () => void;
  isEdit?: boolean;
}

export function VariationTemplateForm({ 
  initialData, 
  onSubmit, 
  onCancel,
  isEdit = false
}: VariationTemplateFormProps) {
  const [activeTab, setActiveTab] = useState('basic');
  const [newAttributeName, setNewAttributeName] = useState('');
  const [newAttributeOption, setNewAttributeOption] = useState('');
  const [currentAttributeIndex, setCurrentAttributeIndex] = useState<number | null>(null);
  
  // Initialize form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: '',
      description: '',
      category: 'general',
      attributes: [],
      pricingStrategy: 'fixed',
      pricingValue: 0,
      generateSKUs: true,
      generateBarcodes: false,
      stockStrategy: 'duplicate',
      isDefault: false,
    },
  });
  
  // Handle adding a new attribute
  const handleAddAttribute = () => {
    if (!newAttributeName.trim()) return;
    
    const currentAttributes = form.getValues('attributes') || [];
    
    // Create new attribute
    const newAttribute: ProductAttribute = {
      id: `attr-${Date.now()}`,
      name: newAttributeName,
      options: [],
      isVisibleOnProductPage: true,
      isUsedForVariations: true,
    };
    
    // Update form
    form.setValue('attributes', [...currentAttributes, newAttribute]);
    
    // Set current attribute index to the new attribute
    setCurrentAttributeIndex(currentAttributes.length);
    
    // Reset input
    setNewAttributeName('');
  };
  
  // Handle adding a new option to an attribute
  const handleAddOption = () => {
    if (currentAttributeIndex === null || !newAttributeOption.trim()) return;
    
    const currentAttributes = form.getValues('attributes');
    const currentAttribute = currentAttributes[currentAttributeIndex];
    
    // Add option to attribute
    const updatedAttribute = {
      ...currentAttribute,
      options: [...currentAttribute.options, newAttributeOption]
    };
    
    // Update attributes array
    const updatedAttributes = [...currentAttributes];
    updatedAttributes[currentAttributeIndex] = updatedAttribute;
    
    // Update form
    form.setValue('attributes', updatedAttributes);
    
    // Reset input
    setNewAttributeOption('');
  };
  
  // Handle removing an attribute
  const handleRemoveAttribute = (index: number) => {
    const currentAttributes = form.getValues('attributes');
    const updatedAttributes = [...currentAttributes];
    updatedAttributes.splice(index, 1);
    
    form.setValue('attributes', updatedAttributes);
    
    if (currentAttributeIndex === index) {
      setCurrentAttributeIndex(null);
    } else if (currentAttributeIndex !== null && currentAttributeIndex > index) {
      setCurrentAttributeIndex(currentAttributeIndex - 1);
    }
  };
  
  // Handle removing an option from an attribute
  const handleRemoveOption = (attributeIndex: number, optionIndex: number) => {
    const currentAttributes = form.getValues('attributes');
    const currentAttribute = currentAttributes[attributeIndex];
    
    // Remove option from attribute
    const updatedOptions = [...currentAttribute.options];
    updatedOptions.splice(optionIndex, 1);
    
    // Update attribute
    const updatedAttribute = {
      ...currentAttribute,
      options: updatedOptions
    };
    
    // Update attributes array
    const updatedAttributes = [...currentAttributes];
    updatedAttributes[attributeIndex] = updatedAttribute;
    
    // Update form
    form.setValue('attributes', updatedAttributes);
  };
  
  // Get pricing strategy description
  const getPricingStrategyDescription = () => {
    const strategy = form.watch('pricingStrategy');
    const value = form.watch('pricingValue');
    
    switch (strategy) {
      case 'fixed':
        return 'All variations will have the same price as the base product.';
      case 'increment':
        return `Each variation's price will be the base price plus $${value.toFixed(2)}.`;
      case 'percentage':
        return `Each variation's price will be the base price plus ${value}%.`;
      default:
        return '';
    }
  };
  
  // Get stock strategy description
  const getStockStrategyDescription = () => {
    const strategy = form.watch('stockStrategy');
    
    switch (strategy) {
      case 'distribute':
        return 'The base product stock will be distributed evenly among all variations.';
      case 'duplicate':
        return 'Each variation will have the same stock as the base product.';
      case 'zero':
        return 'All variations will start with zero stock.';
      default:
        return '';
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Information</TabsTrigger>
            <TabsTrigger value="attributes">Attributes</TabsTrigger>
            <TabsTrigger value="settings">Generation Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Template Name <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., Clothing - Size & Color" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Describe what this template is for" 
                      className="min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category <span className="text-red-500">*</span></FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="clothing">Clothing</SelectItem>
                      <SelectItem value="electronics">Electronics</SelectItem>
                      <SelectItem value="food">Food & Beverages</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Categorize this template for easier organization.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="isDefault"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Default Template</FormLabel>
                    <FormDescription>
                      Make this the default template for new products.
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
          
          <TabsContent value="attributes" className="space-y-4 pt-4">
            <div className="flex items-end gap-4 mb-4">
              <div className="flex-1">
                <FormLabel htmlFor="new-attribute-name">New Attribute Name</FormLabel>
                <Input
                  id="new-attribute-name"
                  placeholder="e.g., Size, Color, Material"
                  value={newAttributeName}
                  onChange={(e) => setNewAttributeName(e.target.value)}
                />
              </div>
              <Button 
                type="button" 
                onClick={handleAddAttribute}
                disabled={!newAttributeName.trim()}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Attribute
              </Button>
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1 border rounded-md p-4">
                <h3 className="font-medium mb-2">Attributes</h3>
                <div className="space-y-2">
                  {form.watch('attributes').map((attribute, index) => (
                    <div 
                      key={index} 
                      className={`flex items-center justify-between p-2 rounded-md cursor-pointer ${
                        currentAttributeIndex === index ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                      }`}
                      onClick={() => setCurrentAttributeIndex(index)}
                    >
                      <div>
                        <p className="font-medium">{attribute.name}</p>
                        <p className="text-xs">
                          {attribute.options.length} options
                        </p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveAttribute(index);
                        }}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  
                  {form.watch('attributes').length === 0 && (
                    <div className="text-center p-4 text-muted-foreground">
                      No attributes added yet
                    </div>
                  )}
                </div>
              </div>
              
              <div className="md:col-span-2 border rounded-md p-4">
                {currentAttributeIndex !== null ? (
                  <div className="space-y-4">
                    <h3 className="font-medium">
                      {form.watch(`attributes.${currentAttributeIndex}.name`)} Options
                    </h3>
                    
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add option"
                        value={newAttributeOption}
                        onChange={(e) => setNewAttributeOption(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddOption();
                          }
                        }}
                      />
                      <Button 
                        type="button" 
                        onClick={handleAddOption}
                        disabled={!newAttributeOption.trim()}
                      >
                        Add
                      </Button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {form.watch(`attributes.${currentAttributeIndex}.options`).map((option, optionIndex) => (
                        <Badge key={optionIndex} variant="secondary" className="px-2 py-1">
                          {option}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 ml-1 p-0"
                            onClick={() => handleRemoveOption(currentAttributeIndex, optionIndex)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                      
                      {form.watch(`attributes.${currentAttributeIndex}.options`).length === 0 && (
                        <div className="text-center w-full p-4 text-muted-foreground">
                          No options added yet
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="visible-on-product"
                        checked={form.watch(`attributes.${currentAttributeIndex}.isVisibleOnProductPage`)}
                        onCheckedChange={(checked) => {
                          const currentAttributes = form.getValues('attributes');
                          const updatedAttributes = [...currentAttributes];
                          updatedAttributes[currentAttributeIndex].isVisibleOnProductPage = checked;
                          form.setValue('attributes', updatedAttributes);
                        }}
                      />
                      <FormLabel htmlFor="visible-on-product">Visible on product page</FormLabel>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full py-8">
                    <p className="text-muted-foreground">
                      Select an attribute to manage its options
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {form.formState.errors.attributes && (
              <div className="p-4 border rounded-md bg-destructive/10 text-destructive">
                <AlertCircle className="h-4 w-4 inline-block mr-2" />
                {form.formState.errors.attributes.message}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-4 flex items-center">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Pricing Strategy
                </h3>
                
                <FormField
                  control={form.control}
                  name="pricingStrategy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Strategy <span className="text-red-500">*</span></FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select strategy" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="fixed">Fixed (Same as base product)</SelectItem>
                          <SelectItem value="increment">Increment (Add fixed amount)</SelectItem>
                          <SelectItem value="percentage">Percentage (Add percentage)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        {getPricingStrategyDescription()}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {form.watch('pricingStrategy') !== 'fixed' && (
                  <FormField
                    control={form.control}
                    name="pricingValue"
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel>
                          {form.watch('pricingStrategy') === 'increment' ? 'Amount ($)' : 'Percentage (%)'}
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            min="0"
                            step={form.watch('pricingStrategy') === 'increment' ? '0.01' : '1'}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
              
              <div>
                <h3 className="font-medium mb-4 flex items-center">
                  <Package className="h-4 w-4 mr-2" />
                  Stock Strategy
                </h3>
                
                <FormField
                  control={form.control}
                  name="stockStrategy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Strategy <span className="text-red-500">*</span></FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select strategy" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="distribute">Distribute (Split base stock)</SelectItem>
                          <SelectItem value="duplicate">Duplicate (Same as base product)</SelectItem>
                          <SelectItem value="zero">Zero (Start with no stock)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        {getStockStrategyDescription()}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="generateSKUs"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Generate SKUs</FormLabel>
                      <FormDescription>
                        Automatically generate SKUs for each variation.
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
                name="generateBarcodes"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Generate Barcodes</FormLabel>
                      <FormDescription>
                        Automatically generate barcodes for each variation.
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
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button type="submit">
            <Save className="h-4 w-4 mr-2" />
            {isEdit ? 'Update Template' : 'Create Template'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default VariationTemplateForm;
