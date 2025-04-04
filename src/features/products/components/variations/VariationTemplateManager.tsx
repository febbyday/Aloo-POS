// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤

import React, { useState, useEffect } from 'react';
import { useVariationTemplates } from '../../context/VariationTemplateContext';
import { VariationTemplate, VariationTemplateFormData } from '../../types/variation-template';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Copy,
  Star,
  Trash2,
  Filter,
} from 'lucide-react';
import VariationTemplateForm from './VariationTemplateForm';

const VariationTemplateManager: React.FC = () => {
  const { toast } = useToast();
  const {
    templates,
    loading,
    error,
    sort,
    setFilters,
    setSort,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    setDefaultTemplate,
  } = useVariationTemplates();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<VariationTemplate | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Apply filters when search or category changes
  useEffect(() => {
    setFilters({
      search: searchQuery,
      category: selectedCategory === 'all' ? undefined : selectedCategory as any,
    });
  }, [searchQuery, selectedCategory, setFilters]);

  // Handle sort change
  const handleSortChange = (field: string) => {
    setSort({
      field: field as any,
      direction: sort.field === field && sort.direction === 'asc' ? 'desc' : 'asc',
    });
  };

  // Get sort indicator
  const getSortIndicator = (field: string) => {
    if (sort.field !== field) return null;
    return sort.direction === 'asc' ? ' ↑' : ' ↓';
  };

  // Handle opening the form for adding a new template
  const handleAddTemplate = () => {
    setCurrentTemplate(null);
    setIsEditMode(false);
    setIsFormOpen(true);
  };

  // Handle opening the form for editing a template
  const handleEditTemplate = (template: VariationTemplate) => {
    setCurrentTemplate(template);
    setIsEditMode(true);
    setIsFormOpen(true);
  };

  // Handle saving a template (add or update)
  const handleSaveTemplate = async (data: VariationTemplateFormData) => {
    try {
      if (isEditMode && currentTemplate) {
        await updateTemplate(currentTemplate.id, data);
        toast({
          title: 'Success',
          description: 'Template updated successfully',
        });
      } else {
        await addTemplate(data);
        toast({
          title: 'Success',
          description: 'Template created successfully',
        });
      }
      setIsFormOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${isEditMode ? 'update' : 'create'} template`,
        variant: 'destructive',
      });
    }
  };

  // Handle duplicating a template
  const handleDuplicateTemplate = async (id: string) => {
    try {
      await duplicateTemplate(id);
      toast({
        title: 'Success',
        description: 'Template duplicated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to duplicate template',
        variant: 'destructive',
      });
    }
  };

  // Handle setting a template as default
  const handleSetDefaultTemplate = async (id: string) => {
    try {
      await setDefaultTemplate(id);
      toast({
        title: 'Success',
        description: 'Default template updated',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to set default template',
        variant: 'destructive',
      });
    }
  };

  // Handle opening the delete confirmation dialog
  const handleDeleteConfirmation = (template: VariationTemplate) => {
    setCurrentTemplate(template);
    setIsDeleteDialogOpen(true);
  };

  // Handle deleting a template
  const handleDeleteTemplate = async () => {
    if (!currentTemplate) return;
    
    try {
      await deleteTemplate(currentTemplate.id);
      toast({
        title: 'Success',
        description: 'Template deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete template',
        variant: 'destructive',
      });
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  // Get category badge color
  const getCategoryBadgeVariant = (category: string) => {
    switch (category) {
      case 'clothing':
        return 'default';
      case 'electronics':
        return 'secondary';
      case 'food':
        return 'destructive';
      case 'general':
        return 'outline';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and filter bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search templates..."
            className="w-full sm:w-[300px] pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select
            value={selectedCategory}
            onValueChange={setSelectedCategory}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="clothing">Clothing</SelectItem>
              <SelectItem value="electronics">Electronics</SelectItem>
              <SelectItem value="food">Food</SelectItem>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={handleAddTemplate}>
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </Button>
        </div>
      </div>

      {/* Templates table */}
      {loading ? (
        <div className="flex justify-center py-8">Loading templates...</div>
      ) : error ? (
        <div className="flex justify-center py-8 text-destructive">Error loading templates</div>
      ) : templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 border rounded-md">
          <p className="text-muted-foreground mb-4">No variation templates found</p>
          <Button onClick={handleAddTemplate}>
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Template
          </Button>
        </div>
      ) : (
        <div className="border rounded-md overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSortChange('name')}
                >
                  Name{getSortIndicator('name')}
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
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      {template.name}
                      {template.isDefault && (
                        <Badge variant="secondary" className="ml-2">
                          <Star className="h-3 w-3 mr-1" />
                          Default
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getCategoryBadgeVariant(template.category)}>
                      {template.category.charAt(0).toUpperCase() + template.category.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {template.attributes.length} attribute{template.attributes.length !== 1 ? 's' : ''}
                    <span className="text-muted-foreground ml-2">
                      ({template.attributes.map(attr => attr.name).join(', ')})
                    </span>
                  </TableCell>
                  <TableCell>{template.usageCount}</TableCell>
                  <TableCell>{formatDate(template.lastUsed)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
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
                          onClick={() => handleDeleteConfirmation(template)}
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

      {/* Template form dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Template' : 'Create New Template'}</DialogTitle>
            <DialogDescription>
              {isEditMode
                ? 'Update the template details below'
                : 'Create a reusable template for product variations'}
            </DialogDescription>
          </DialogHeader>
          
          <VariationTemplateForm
            initialData={isEditMode && currentTemplate ? currentTemplate : undefined}
            onSubmit={handleSaveTemplate}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the template "{currentTemplate?.name}".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTemplate} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default VariationTemplateManager;
