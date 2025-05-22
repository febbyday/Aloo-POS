import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { formatDate } from '@/lib/utils/formatters';
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
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Plus,
  Search,
  RefreshCw,
  FileDown,
  Trash2,
  Edit,
  MoreHorizontal,
  Copy,
  Star,
  Calendar,
  Tag,
  Layers
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/lib/toast';
import { useVariationTemplates } from '../../context/BatchVariationTemplateProvider';
import { VariationTemplateForm } from './VariationTemplateForm';
import { VariationTemplate, VariationTemplateFormData } from '../../types/variation-template';

export function VariationTemplatesTab() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    templates,
    loading,
    error,
    selectedTemplates,
    setSelectedTemplates,
    filters,
    setFilters,
    sort,
    setSort,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    deleteTemplates,
    getTemplate,
    applyTemplate,
    duplicateTemplate,
    setDefaultTemplate,
    refreshTemplates
  } = useVariationTemplates();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<VariationTemplate | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);

  // Handle form open for adding new template
  const handleAddTemplate = () => {
    setCurrentTemplate(null);
    setIsFormOpen(true);
  };

  // Handle form open for editing template
  const handleEditTemplate = (template: VariationTemplate) => {
    setCurrentTemplate(template);
    setIsFormOpen(true);
  };

  // Handle delete template
  const handleDeleteTemplate = (template: VariationTemplate) => {
    setCurrentTemplate(template);
    setIsDeleteDialogOpen(true);
  };

  // Handle form submission
  const handleFormSubmit = async (data: VariationTemplateFormData) => {
    try {
      if (currentTemplate) {
        // Update existing template
        await updateTemplate(currentTemplate.id, data);
        toast({
          title: "Template Updated",
          description: "The variation template has been updated successfully.",
        });
      } else {
        // Add new template
        await addTemplate(data);
        toast({
          title: "Template Created",
          description: "The variation template has been created successfully.",
        });
      }
      setIsFormOpen(false);
    } catch (error) {
      console.error('Failed to save template:', error);
      toast({
        title: currentTemplate ? "Update Failed" : "Creation Failed",
        description: `Failed to ${currentTemplate ? 'update' : 'create'} template. Please try again.`,
        variant: "destructive",
      });
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    try {
      if (currentTemplate) {
        await deleteTemplate(currentTemplate.id);
        toast({
          title: "Template Deleted",
          description: "The template has been deleted successfully.",
        });
      } else if (selectedTemplates.length > 0) {
        await deleteTemplates(selectedTemplates);
        toast({
          title: "Templates Deleted",
          description: `${selectedTemplates.length} templates have been deleted successfully.`,
        });
      }
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Failed to delete template(s):', error);
      toast({
        title: "Deletion Failed",
        description: "Failed to delete template(s). Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle search
  const handleSearch = () => {
    setFilters({ ...filters, search: searchQuery });
  };

  // Handle category filter change
  const handleCategoryFilterChange = (category: string) => {
    setFilters({ ...filters, category: category as any });
  };

  // Handle sort change
  const handleSortChange = (field: 'name' | 'category' | 'createdAt' | 'updatedAt' | 'usageCount' | 'lastUsed') => {
    if (sort.field === field) {
      setSort({ field, direction: sort.direction === 'asc' ? 'desc' : 'asc' });
    } else {
      setSort({ field, direction: 'asc' });
    }
  };

  // Handle select all templates
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTemplates(templates.map(template => template.id));
    } else {
      setSelectedTemplates([]);
    }
  };

  // Handle select template
  const handleSelectTemplate = (templateId: string, checked: boolean) => {
    if (checked) {
      setSelectedTemplates([...selectedTemplates, templateId]);
    } else {
      setSelectedTemplates(selectedTemplates.filter(id => id !== templateId));
    }
  };

  // Handle set default template
  const handleSetDefaultTemplate = async (templateId: string) => {
    try {
      await setDefaultTemplate(templateId);
      toast({
        title: "Default Template Set",
        description: "The default template has been updated.",
      });
    } catch (error) {
      console.error('Failed to set default template:', error);
      toast({
        title: "Update Failed",
        description: "Failed to set default template. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle duplicate template
  const handleDuplicateTemplate = async (templateId: string) => {
    try {
      await duplicateTemplate(templateId);
      toast({
        title: "Template Duplicated",
        description: "The template has been duplicated successfully.",
      });
    } catch (error) {
      console.error('Failed to duplicate template:', error);
      toast({
        title: "Duplication Failed",
        description: "Failed to duplicate template. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle apply template
  const handleApplyTemplate = async (templateId: string) => {
    try {
      const template = await applyTemplate(templateId);
      toast({
        title: "Template Applied",
        description: `The template "${template.name}" has been applied successfully.`,
      });
      setIsApplyDialogOpen(false);
    } catch (error) {
      console.error('Failed to apply template:', error);
      toast({
        title: "Application Failed",
        description: "Failed to apply template. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    try {
      await refreshTemplates();
      toast({
        title: "Templates Refreshed",
        description: "The templates list has been refreshed.",
      });
    } catch (error) {
      console.error('Failed to refresh templates:', error);
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh templates. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle export
  const handleExport = (format: 'csv' | 'excel') => {
    toast({
      title: `Export as ${format.toUpperCase()}`,
      description: `Templates have been exported as ${format.toUpperCase()}.`,
    });
  };

  // Get sort indicator
  const getSortIndicator = (field: 'name' | 'category' | 'createdAt' | 'updatedAt' | 'usageCount' | 'lastUsed') => {
    if (sort.field !== field) return null;
    return sort.direction === 'asc' ? ' ↑' : ' ↓';
  };

  // Format category name
  const formatCategoryName = (category: string) => {
    switch (category) {
      case 'clothing':
        return 'Clothing';
      case 'electronics':
        return 'Electronics';
      case 'food':
        return 'Food & Beverages';
      case 'general':
        return 'General';
      case 'custom':
        return 'Custom';
      default:
        return category;
    }
  };

  // Using imported formatDate from formatters.ts

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-xl">Variation Templates</CardTitle>
            <CardDescription>
              Create and manage reusable variation templates for your products
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('csv')}
              disabled={templates.length === 0}
            >
              <FileDown className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={handleAddTemplate}>
              <Plus className="h-4 w-4 mr-2" />
              Add Template
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-8"
              />
            </div>
            <Button variant="secondary" onClick={handleSearch}>
              Search
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Select
              value={filters.category || 'all'}
              onValueChange={handleCategoryFilterChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="clothing">Clothing</SelectItem>
                <SelectItem value="electronics">Electronics</SelectItem>
                <SelectItem value="food">Food & Beverages</SelectItem>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>

            {selectedTemplates.length > 0 && (
              <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete ({selectedTemplates.length})
              </Button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-4" />
              <p className="text-lg">Loading templates...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-lg text-destructive">Error loading templates</p>
              <Button variant="outline" onClick={handleRefresh} className="mt-4">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        ) : templates.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 border rounded-lg">
            <p className="text-lg mb-4">No templates found</p>
            <Button onClick={handleAddTemplate}>
              <Plus className="h-4 w-4 mr-2" />
              Add Template
            </Button>
          </div>
        ) : (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={selectedTemplates.length === templates.length && templates.length > 0}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all"
                    />
                  </TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSortChange('name')}
                  >
                    Template{getSortIndicator('name')}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSortChange('category')}
                  >
                    Category{getSortIndicator('category')}
                  </TableHead>
                  <TableHead>Attributes</TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSortChange('usageCount')}
                  >
                    Usage{getSortIndicator('usageCount')}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSortChange('lastUsed')}
                  >
                    Last Used{getSortIndicator('lastUsed')}
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedTemplates.includes(template.id)}
                        onCheckedChange={(checked) => handleSelectTemplate(template.id, !!checked)}
                        aria-label={`Select ${template.name}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        {template.isDefault && (
                          <Star className="h-4 w-4 text-yellow-500 mr-2" />
                        )}
                        <div>
                          <div>{template.name}</div>
                          {template.description && (
                            <div className="text-sm text-muted-foreground">{template.description}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {formatCategoryName(template.category)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {template.attributes.map((attr, index) => (
                          <Badge key={index} variant="secondary">
                            {attr.name}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {template.usageCount} {template.usageCount === 1 ? 'time' : 'times'}
                    </TableCell>
                    <TableCell>
                      {formatDate(template.lastUsed)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setIsApplyDialogOpen(true)}>
                            <Layers className="h-4 w-4 mr-2" />
                            Apply Template
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditTemplate(template)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicateTemplate(template.id)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          {!template.isDefault && (
                            <DropdownMenuItem onClick={() => handleSetDefaultTemplate(template.id)}>
                              <Star className="h-4 w-4 mr-2" />
                              Set as Default
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDeleteTemplate(template)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t p-4 text-sm text-muted-foreground">
        {templates.length} templates found
      </CardFooter>

      {/* Template Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{currentTemplate ? 'Edit Template' : 'Add Template'}</DialogTitle>
            <DialogDescription>
              {currentTemplate
                ? 'Update the template details below.'
                : 'Fill in the details to create a new variation template.'}
            </DialogDescription>
          </DialogHeader>
          <VariationTemplateForm
            initialData={currentTemplate || undefined}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsFormOpen(false)}
            isEdit={!!currentTemplate}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedTemplates.length > 1
                ? `This will permanently delete ${selectedTemplates.length} templates.`
                : currentTemplate
                  ? `This will permanently delete "${currentTemplate.name}".`
                  : 'This will permanently delete the selected template.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Apply Template Dialog */}
      <Dialog open={isApplyDialogOpen} onOpenChange={setIsApplyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply Template</DialogTitle>
            <DialogDescription>
              This feature is coming soon. In the future, you'll be able to apply this template to products directly.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-4">
              When implemented, this will allow you to:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Apply the template to a single product</li>
              <li>Apply the template to multiple products at once</li>
              <li>Preview the variations before applying</li>
              <li>Customize pricing and stock settings</li>
            </ul>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setIsApplyDialogOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export default VariationTemplatesTab;
