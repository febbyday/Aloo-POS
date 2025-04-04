import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Plus,
  Trash2,
  Edit,
  Search,
  Save,
  X,
  AlertCircle,
  Tag,
  Copy,
  FileDown
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

// Types for global attributes
interface AttributeOption {
  id: string;
  value: string;
  sortOrder: number;
}

interface GlobalAttribute {
  id: string;
  name: string;
  slug: string;
  description?: string;
  type: 'text' | 'number' | 'select' | 'boolean' | 'color';
  options?: AttributeOption[];
  isVisibleOnProductPage: boolean;
  isUsedForVariations: boolean;
  isRequired: boolean;
  createdAt: string;
  updatedAt: string;
}

interface GlobalAttributesManagerProps {
  attributes: GlobalAttribute[];
  onAttributeAdd: (attribute: Omit<GlobalAttribute, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onAttributeUpdate: (id: string, attribute: Partial<Omit<GlobalAttribute, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<void>;
  onAttributeDelete: (id: string) => Promise<void>;
  onExport: (format: 'csv' | 'excel') => void;
}

export const GlobalAttributesManager: React.FC<GlobalAttributesManagerProps> = ({
  attributes,
  onAttributeAdd,
  onAttributeUpdate,
  onAttributeDelete,
  onExport,
}) => {
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentAttribute, setCurrentAttribute] = useState<GlobalAttribute | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Form state
  const [formData, setFormData] = useState<{
    name: string;
    slug: string;
    description: string;
    type: 'text' | 'number' | 'select' | 'boolean' | 'color';
    isVisibleOnProductPage: boolean;
    isUsedForVariations: boolean;
    isRequired: boolean;
    options: AttributeOption[];
  }>({
    name: '',
    slug: '',
    description: '',
    type: 'text',
    isVisibleOnProductPage: true,
    isUsedForVariations: false,
    isRequired: false,
    options: [],
  });

  // New option state
  const [newOption, setNewOption] = useState('');

  // Template dialog state
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);

  // Predefined attribute templates
  const attributeTemplates = [
    {
      name: 'Color',
      description: 'Product color options',
      type: 'color' as const,
      isVisibleOnProductPage: true,
      isUsedForVariations: true,
      isRequired: false,
      options: [
        { id: 'color-1', value: 'Red', sortOrder: 0 },
        { id: 'color-2', value: 'Blue', sortOrder: 1 },
        { id: 'color-3', value: 'Green', sortOrder: 2 },
        { id: 'color-4', value: 'Black', sortOrder: 3 },
        { id: 'color-5', value: 'White', sortOrder: 4 },
      ]
    },
    {
      name: 'Size',
      description: 'Product size options',
      type: 'select' as const,
      isVisibleOnProductPage: true,
      isUsedForVariations: true,
      isRequired: false,
      options: [
        { id: 'size-1', value: 'Small', sortOrder: 0 },
        { id: 'size-2', value: 'Medium', sortOrder: 1 },
        { id: 'size-3', value: 'Large', sortOrder: 2 },
        { id: 'size-4', value: 'X-Large', sortOrder: 3 },
      ]
    },
    {
      name: 'Material',
      description: 'Product material',
      type: 'select' as const,
      isVisibleOnProductPage: true,
      isUsedForVariations: false,
      isRequired: false,
      options: [
        { id: 'material-1', value: 'Cotton', sortOrder: 0 },
        { id: 'material-2', value: 'Polyester', sortOrder: 1 },
        { id: 'material-3', value: 'Wool', sortOrder: 2 },
        { id: 'material-4', value: 'Leather', sortOrder: 3 },
      ]
    },
    {
      name: 'Weight',
      description: 'Product weight in kg',
      type: 'number' as const,
      isVisibleOnProductPage: false,
      isUsedForVariations: false,
      isRequired: false,
      options: []
    },
  ];

  // Filter attributes based on search
  const filteredAttributes = attributes.filter(attribute =>
    attribute.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    attribute.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Reset form data
  const resetFormData = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      type: 'text',
      isVisibleOnProductPage: true,
      isUsedForVariations: false,
      isRequired: false,
      options: [],
    });
  };

  // Handle form open for adding new attribute
  const handleAddAttribute = () => {
    setCurrentAttribute(null);
    resetFormData();
    setIsFormOpen(true);
  };

  // Handle template selection
  const handleSelectTemplate = (template: typeof attributeTemplates[0]) => {
    setCurrentAttribute(null);
    setFormData({
      name: template.name,
      slug: template.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      description: template.description,
      type: template.type,
      isVisibleOnProductPage: template.isVisibleOnProductPage,
      isUsedForVariations: template.isUsedForVariations,
      isRequired: template.isRequired,
      options: template.options,
    });
    setIsTemplateDialogOpen(false);
    setIsFormOpen(true);
  };

  // Handle form open for editing attribute
  const handleEditAttribute = (attribute: GlobalAttribute) => {
    setCurrentAttribute(attribute);
    setFormData({
      name: attribute.name,
      slug: attribute.slug,
      description: attribute.description || '',
      type: attribute.type,
      isVisibleOnProductPage: attribute.isVisibleOnProductPage,
      isUsedForVariations: attribute.isUsedForVariations,
      isRequired: attribute.isRequired,
      options: attribute.options || [],
    });
    setIsFormOpen(true);
  };

  // Handle delete attribute
  const handleDeleteAttribute = (attribute: GlobalAttribute) => {
    setCurrentAttribute(attribute);
    setIsDeleteDialogOpen(true);
  };

  // Handle form input change
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Auto-generate slug from name
    if (field === 'name') {
      const slug = value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      setFormData(prev => ({
        ...prev,
        slug,
      }));
    }
  };

  // Handle add option
  const handleAddOption = () => {
    if (!newOption.trim()) return;

    const newOptionObj: AttributeOption = {
      id: `option-${Date.now()}`,
      value: newOption,
      sortOrder: formData.options.length,
    };

    setFormData(prev => ({
      ...prev,
      options: [...prev.options, newOptionObj],
    }));

    setNewOption('');
  };

  // Handle remove option
  const handleRemoveOption = (optionId: string) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter(opt => opt.id !== optionId),
    }));
  };

  // Handle option reorder
  const handleOptionReorder = (optionId: string, direction: 'up' | 'down') => {
    const optionIndex = formData.options.findIndex(opt => opt.id === optionId);
    if (optionIndex === -1) return;

    const newOptions = [...formData.options];

    if (direction === 'up' && optionIndex > 0) {
      // Swap with previous option
      [newOptions[optionIndex], newOptions[optionIndex - 1]] =
        [newOptions[optionIndex - 1], newOptions[optionIndex]];
    } else if (direction === 'down' && optionIndex < newOptions.length - 1) {
      // Swap with next option
      [newOptions[optionIndex], newOptions[optionIndex + 1]] =
        [newOptions[optionIndex + 1], newOptions[optionIndex]];
    }

    // Update sort order
    const updatedOptions = newOptions.map((opt, index) => ({
      ...opt,
      sortOrder: index,
    }));

    setFormData(prev => ({
      ...prev,
      options: updatedOptions,
    }));
  };

  // Handle form submission
  const handleFormSubmit = async () => {
    // Validate form
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Attribute name is required.",
        variant: "destructive",
      });
      return;
    }

    if (formData.type === 'select' && formData.options.length === 0) {
      toast({
        title: "Validation Error",
        description: "Select attributes must have at least one option.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsProcessing(true);

      if (currentAttribute) {
        // Update existing attribute
        await onAttributeUpdate(currentAttribute.id, formData);
        toast({
          title: "Attribute Updated",
          description: "The attribute has been updated successfully.",
        });
      } else {
        // Add new attribute
        await onAttributeAdd(formData);
        toast({
          title: "Attribute Created",
          description: "The attribute has been created successfully.",
        });
      }

      setIsFormOpen(false);
      resetFormData();
    } catch (error) {
      console.error('Failed to save attribute:', error);
      toast({
        title: currentAttribute ? "Update Failed" : "Creation Failed",
        description: `Failed to ${currentAttribute ? 'update' : 'create'} attribute. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!currentAttribute) return;

    try {
      setIsProcessing(true);
      await onAttributeDelete(currentAttribute.id);

      toast({
        title: "Attribute Deleted",
        description: "The attribute has been deleted successfully.",
      });

      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Failed to delete attribute:', error);
      toast({
        title: "Deletion Failed",
        description: "Failed to delete attribute. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-xl">Global Attributes</CardTitle>
              <CardDescription>
                Manage product attributes that can be used across your catalog
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onExport('csv')}
                disabled={attributes.length === 0}
              >
                <FileDown className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsTemplateDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Template
              </Button>
              <Button onClick={handleAddAttribute}>
                <Plus className="h-4 w-4 mr-2" />
                Add Attribute
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search attributes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {filteredAttributes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center border rounded-lg">
              <Tag className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Attributes Found</h3>
              <p className="text-muted-foreground mb-4">
                {attributes.length === 0
                  ? "Create attributes to organize your products and enable variations."
                  : "No attributes match your search criteria."}
              </p>
              {attributes.length === 0 && (
                <Button onClick={handleAddAttribute}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Attribute
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Options</TableHead>
                    <TableHead>Visibility</TableHead>
                    <TableHead>Used For</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAttributes.map((attribute) => (
                    <TableRow key={attribute.id}>
                      <TableCell className="font-medium">
                        <div>
                          {attribute.name}
                          {attribute.isRequired && (
                            <Badge variant="outline" className="ml-2">Required</Badge>
                          )}
                        </div>
                        {attribute.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {attribute.description}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge>
                          {attribute.type.charAt(0).toUpperCase() + attribute.type.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {attribute.type === 'select' && attribute.options ? (
                          <div className="flex flex-wrap gap-1">
                            {attribute.options.map((option) => (
                              <Badge key={option.id} variant="secondary">
                                {option.value}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={attribute.isVisibleOnProductPage ? 'default' : 'outline'}>
                          {attribute.isVisibleOnProductPage ? 'Visible' : 'Hidden'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={attribute.isUsedForVariations ? 'default' : 'outline'}>
                          {attribute.isUsedForVariations ? 'Variations' : 'Information'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditAttribute(attribute)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // Duplicate attribute
                              const duplicatedAttribute = {
                                ...attribute,
                                id: '',
                                name: `${attribute.name} (Copy)`,
                                slug: `${attribute.slug}-copy`,
                              };
                              handleEditAttribute(duplicatedAttribute);
                            }}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteAttribute(attribute)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Attribute Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{currentAttribute ? 'Edit Attribute' : 'Add Attribute'}</DialogTitle>
            <DialogDescription>
              {currentAttribute
                ? 'Update the attribute details below.'
                : 'Fill in the details to create a new attribute.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="attribute-name">Name <span className="text-red-500">*</span></Label>
                <Input
                  id="attribute-name"
                  placeholder="e.g., Color, Size, Material"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="attribute-slug">Slug</Label>
                <Input
                  id="attribute-slug"
                  placeholder="e.g., color, size, material"
                  value={formData.slug}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Used in URLs and code. Auto-generated from name.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="attribute-description">Description</Label>
              <Textarea
                id="attribute-description"
                placeholder="Describe the purpose of this attribute"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="min-h-[80px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="attribute-type">Type <span className="text-red-500">*</span></Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleInputChange('type', value)}
                >
                  <SelectTrigger id="attribute-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="select">Select (Options)</SelectItem>
                    <SelectItem value="boolean">Boolean (Yes/No)</SelectItem>
                    <SelectItem value="color">Color</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="visible-on-product"
                  checked={formData.isVisibleOnProductPage}
                  onCheckedChange={(checked) => handleInputChange('isVisibleOnProductPage', checked)}
                />
                <Label htmlFor="visible-on-product">Visible on product page</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="used-for-variations"
                  checked={formData.isUsedForVariations}
                  onCheckedChange={(checked) => handleInputChange('isUsedForVariations', checked)}
                />
                <Label htmlFor="used-for-variations">Used for variations</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="required"
                  checked={formData.isRequired}
                  onCheckedChange={(checked) => handleInputChange('isRequired', checked)}
                />
                <Label htmlFor="required">Required</Label>
              </div>
            </div>

            {formData.type === 'select' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Options</Label>
                  <Badge variant="outline">
                    {formData.options.length} options
                  </Badge>
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder="Add option"
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
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
                    disabled={!newOption.trim()}
                  >
                    Add
                  </Button>
                </div>

                {formData.options.length > 0 && (
                  <div className="border rounded-md p-4 space-y-2">
                    {formData.options.map((option, index) => (
                      <div key={option.id} className="flex items-center justify-between p-2 bg-muted/30 rounded-md">
                        <div className="flex items-center">
                          <span className="text-muted-foreground mr-2">{index + 1}.</span>
                          <span>{option.value}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOptionReorder(option.id, 'up')}
                            disabled={index === 0}
                          >
                            ↑
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOptionReorder(option.id, 'down')}
                            disabled={index === formData.options.length - 1}
                          >
                            ↓
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveOption(option.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {formData.type === 'color' && (
              <div className="p-4 border rounded-md bg-muted/30">
                <div className="flex items-start">
                  <AlertCircle className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Color attributes allow customers to select colors for products. You can add color options similar to select options.
                  </p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsFormOpen(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleFormSubmit}
              disabled={isProcessing}
            >
              {isProcessing
                ? 'Saving...'
                : currentAttribute
                  ? 'Update Attribute'
                  : 'Create Attribute'
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {currentAttribute && (
                <>
                  This will permanently delete the attribute "{currentAttribute.name}".
                  {currentAttribute.isUsedForVariations && (
                    <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-md text-amber-800">
                      <AlertCircle className="h-4 w-4 inline-block mr-1" />
                      Warning: This attribute is used for product variations. Deleting it may affect existing products.
                    </div>
                  )}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground"
              disabled={isProcessing}
            >
              {isProcessing ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Template Selection Dialog */}
      <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Select Attribute Template</DialogTitle>
            <DialogDescription>
              Choose a predefined attribute template to quickly create common attributes.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            {attributeTemplates.map((template, index) => (
              <Card
                key={index}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleSelectTemplate(template)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{template.name}</h3>
                    <Badge>{template.type}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                  {template.options && template.options.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {template.options.slice(0, 3).map((option, i) => (
                        <Badge key={i} variant="secondary">{option.value}</Badge>
                      ))}
                      {template.options.length > 3 && (
                        <Badge variant="outline">+{template.options.length - 3} more</Badge>
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                    {template.isVisibleOnProductPage && <span>Visible</span>}
                    {template.isUsedForVariations && <span>Used for variations</span>}
                    {template.isRequired && <span>Required</span>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTemplateDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GlobalAttributesManager;
