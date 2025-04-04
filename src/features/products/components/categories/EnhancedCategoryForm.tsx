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
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Trash2, 
  Save, 
  X, 
  ArrowLeft, 
  Copy, 
  AlertCircle 
} from 'lucide-react';
import { useCategories } from '../../context/CategoryContext';
import { Category, CategoryAttribute, CategoryFormData } from '../../types/category';

// Enhanced schema with attributes
const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  parentId: z.string().optional(),
  status: z.enum(['active', 'inactive']),
  slug: z.string().optional(),
  inheritParentAttributes: z.boolean().default(true),
  attributes: z.array(
    z.object({
      name: z.string().min(1, 'Attribute name is required'),
      type: z.enum(['text', 'number', 'select', 'boolean']),
      required: z.boolean().default(false),
      options: z.array(z.string()).optional(),
      inherited: z.boolean().default(false),
      value: z.union([z.string(), z.number(), z.boolean()]).optional(),
    })
  ).optional(),
  seo: z.object({
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    keywords: z.string().optional(),
  }).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface EnhancedCategoryFormProps {
  initialData?: Partial<FormValues>;
  onSubmit: (data: FormValues) => void;
  onCancel: () => void;
  isEdit?: boolean;
}

export function EnhancedCategoryForm({ 
  initialData, 
  onSubmit, 
  onCancel,
  isEdit = false
}: EnhancedCategoryFormProps) {
  const { categories } = useCategories();
  const [activeTab, setActiveTab] = useState('basic');
  const [newAttributeName, setNewAttributeName] = useState('');
  const [newAttributeType, setNewAttributeType] = useState<'text' | 'number' | 'select' | 'boolean'>('text');
  const [newAttributeRequired, setNewAttributeRequired] = useState(false);
  const [newAttributeOption, setNewAttributeOption] = useState('');
  const [newAttributeOptions, setNewAttributeOptions] = useState<string[]>([]);
  
  // Initialize form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: '',
      description: '',
      status: 'active',
      inheritParentAttributes: true,
      attributes: [],
      seo: {
        metaTitle: '',
        metaDescription: '',
        keywords: '',
      },
    },
  });
  
  // Get all categories except the current one (for parent selection)
  const availableParents = isEdit 
    ? categories.filter(cat => cat.id !== initialData?.parentId)
    : categories;
  
  // Handle adding a new attribute
  const handleAddAttribute = () => {
    if (!newAttributeName.trim()) return;
    
    const currentAttributes = form.getValues('attributes') || [];
    
    // Create new attribute
    const newAttribute: CategoryAttribute = {
      id: `attr-${Date.now()}`,
      name: newAttributeName,
      type: newAttributeType,
      required: newAttributeRequired,
      options: newAttributeType === 'select' ? newAttributeOptions : undefined,
    };
    
    // Update form
    form.setValue('attributes', [...currentAttributes, newAttribute]);
    
    // Reset inputs
    setNewAttributeName('');
    setNewAttributeType('text');
    setNewAttributeRequired(false);
    setNewAttributeOption('');
    setNewAttributeOptions([]);
  };
  
  // Handle adding a new option to a select attribute
  const handleAddOption = () => {
    if (!newAttributeOption.trim()) return;
    
    setNewAttributeOptions([...newAttributeOptions, newAttributeOption]);
    setNewAttributeOption('');
  };
  
  // Handle removing an attribute
  const handleRemoveAttribute = (index: number) => {
    const currentAttributes = form.getValues('attributes') || [];
    const updatedAttributes = [...currentAttributes];
    updatedAttributes.splice(index, 1);
    form.setValue('attributes', updatedAttributes);
  };
  
  // Handle removing an option from a select attribute
  const handleRemoveOption = (index: number) => {
    const updatedOptions = [...newAttributeOptions];
    updatedOptions.splice(index, 1);
    setNewAttributeOptions(updatedOptions);
  };
  
  // Generate slug from name
  const handleNameChange = (name: string) => {
    form.setValue('name', name);
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    form.setValue('slug', slug);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Information</TabsTrigger>
            <TabsTrigger value="attributes">Attributes</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="Category name" 
                      onChange={(e) => handleNameChange(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="category-slug" />
                  </FormControl>
                  <FormDescription>
                    URL-friendly version of the name. Auto-generated but can be edited.
                  </FormDescription>
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
                      placeholder="Category description" 
                      className="min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="parentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parent Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select parent category (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">None (Root Category)</SelectItem>
                      {availableParents.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Selecting a parent will place this category as a subcategory.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Inactive categories won't be visible to customers.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
          
          <TabsContent value="attributes" className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="inheritParentAttributes"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Inherit Parent Attributes</FormLabel>
                    <FormDescription>
                      Products in this category will inherit attributes from parent categories.
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
            
            <Separator />
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Category Attributes</h3>
              <p className="text-sm text-muted-foreground">
                Define attributes that will be applied to products in this category.
              </p>
              
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <FormLabel htmlFor="new-attribute-name">Attribute Name</FormLabel>
                        <Input
                          id="new-attribute-name"
                          placeholder="e.g., Color, Size, Material"
                          value={newAttributeName}
                          onChange={(e) => setNewAttributeName(e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <FormLabel htmlFor="new-attribute-type">Attribute Type</FormLabel>
                        <Select
                          value={newAttributeType}
                          onValueChange={(value) => setNewAttributeType(value as any)}
                        >
                          <SelectTrigger id="new-attribute-type">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">Text</SelectItem>
                            <SelectItem value="number">Number</SelectItem>
                            <SelectItem value="select">Select (Options)</SelectItem>
                            <SelectItem value="boolean">Boolean (Yes/No)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="new-attribute-required"
                        checked={newAttributeRequired}
                        onCheckedChange={setNewAttributeRequired}
                      />
                      <FormLabel htmlFor="new-attribute-required">Required</FormLabel>
                    </div>
                    
                    {newAttributeType === 'select' && (
                      <div className="space-y-2">
                        <FormLabel>Options</FormLabel>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {newAttributeOptions.map((option, index) => (
                            <Badge key={index} variant="secondary" className="px-2 py-1">
                              {option}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 ml-1 p-0"
                                onClick={() => handleRemoveOption(index)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </Badge>
                          ))}
                        </div>
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
                      </div>
                    )}
                    
                    <Button
                      type="button"
                      onClick={handleAddAttribute}
                      disabled={!newAttributeName.trim() || (newAttributeType === 'select' && newAttributeOptions.length === 0)}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Attribute
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <div className="space-y-2">
                <h4 className="font-medium">Defined Attributes</h4>
                {form.watch('attributes')?.length ? (
                  <div className="space-y-2">
                    {form.watch('attributes')?.map((attribute, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                        <div>
                          <p className="font-medium">{attribute.name}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant="outline">
                              {attribute.type.charAt(0).toUpperCase() + attribute.type.slice(1)}
                            </Badge>
                            {attribute.required && (
                              <Badge variant="secondary">Required</Badge>
                            )}
                            {attribute.inherited && (
                              <Badge variant="outline" className="bg-primary/10">Inherited</Badge>
                            )}
                          </div>
                          {attribute.type === 'select' && attribute.options && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {attribute.options.map((option, optIndex) => (
                                <Badge key={optIndex} variant="secondary" className="text-xs">
                                  {option}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveAttribute(index)}
                          disabled={attribute.inherited}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-4 border border-dashed rounded-md">
                    <p className="text-muted-foreground">No attributes defined yet.</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="seo" className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="seo.metaTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta Title</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="SEO title (defaults to category name)" />
                  </FormControl>
                  <FormDescription>
                    Appears in browser tab and search results. Recommended length: 50-60 characters.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="seo.metaDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Brief description for search engines" 
                      className="min-h-[100px]"
                    />
                  </FormControl>
                  <FormDescription>
                    Appears in search results. Recommended length: 150-160 characters.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="seo.keywords"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Keywords</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="keyword1, keyword2, keyword3" />
                  </FormControl>
                  <FormDescription>
                    Comma-separated keywords related to this category.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="p-4 border rounded-md bg-muted/30">
              <div className="flex items-start">
                <AlertCircle className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Good SEO practices help customers find your products more easily in search engines.
                </p>
              </div>
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
            {isEdit ? 'Update Category' : 'Create Category'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default EnhancedCategoryForm;
