import { useState } from 'react';
import {
  Copy,
  CreditCard,
  Edit,
  Plus,
  Star,
  StarOff,
  Trash2,
  CheckCircle,
  FilterIcon,
  SearchIcon,
  RefreshCw,
  ChevronDown,
  X
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import { useToast } from '@/lib/toast';

import { useTemplates } from '../../hooks/gift-cards/useTemplates';
import { DesignTemplate } from '../../types/gift-cards';

export function TemplateManager() {
  const toast = useToast();
  const {
    templates,
    filteredTemplates,
    loading,
    error,
    selectedTemplate,
    filter,
    selectTemplate,
    clearSelectedTemplate,
    loadTemplates,
    updateTemplate,
    duplicateTemplate,
    deleteTemplate,
    setDefaultTemplate,
    applyFilter,
  } = useTemplates();

  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');

  // Handle select template
  const handleSelectTemplate = (template: DesignTemplate) => {
    selectTemplate(template);
    setShowDetailsDialog(true);
  };

  // Handle refresh
  const handleRefresh = () => {
    loadTemplates();
    toast({
      title: 'Templates Refreshed',
      description: 'The template list has been updated',
    });
  };

  // Handle set as default
  const handleSetAsDefault = async (template: DesignTemplate) => {
    try {
      await setDefaultTemplate(template.id);
      toast({
        title: 'Default Template Set',
        description: `"${template.name}" is now the default template`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to set default template',
        variant: 'destructive',
      });
      console.error(error);
    }
  };

  // Handle duplicate template
  const handleDuplicateTemplate = async () => {
    if (!selectedTemplate) return;

    try {
      await duplicateTemplate(selectedTemplate.id, newTemplateName || `${selectedTemplate.name} (Copy)`);
      setShowDuplicateDialog(false);
      setNewTemplateName('');
      toast({
        title: 'Template Duplicated',
        description: 'The template has been duplicated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to duplicate template',
        variant: 'destructive',
      });
      console.error(error);
    }
  };

  // Handle delete template
  const handleDeleteTemplate = async () => {
    if (!selectedTemplate) return;

    try {
      if (selectedTemplate.isDefault) {
        toast({
          title: 'Cannot Delete',
          description: 'You cannot delete the default template',
          variant: 'destructive',
        });
        return;
      }

      await deleteTemplate(selectedTemplate.id);
      setShowDeleteDialog(false);
      setShowDetailsDialog(false);
      clearSelectedTemplate();
      toast({
        title: 'Template Deleted',
        description: 'The template has been deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete template',
        variant: 'destructive',
      });
      console.error(error);
    }
  };

  // Toggle template active status
  const handleToggleActive = async (template: DesignTemplate) => {
    try {
      await updateTemplate(template.id, {
        isActive: !template.isActive,
      });

      toast({
        title: template.isActive ? 'Template Deactivated' : 'Template Activated',
        description: `"${template.name}" is now ${template.isActive ? 'inactive' : 'active'}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update template status',
        variant: 'destructive',
      });
      console.error(error);
    }
  };

  // Handle category filter
  const handleCategoryFilter = (category: string | undefined) => {
    setSelectedCategory(category);
    applyFilter({ ...filter, category });
  };

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    applyFilter({ ...filter, search: query });
  };

  // Group templates by category for display
  const groupedTemplates = filteredTemplates.reduce((acc, template) => {
    const category = template.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(template);
    return acc;
  }, {} as Record<string, DesignTemplate[]>);

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <FilterIcon className="h-4 w-4 mr-2" />
                Filter
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[200px]">
              <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleCategoryFilter(undefined)}>
                All Categories
                {!selectedCategory && <CheckCircle className="h-4 w-4 ml-auto" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleCategoryFilter('default')}>
                Default
                {selectedCategory === 'default' && <CheckCircle className="h-4 w-4 ml-auto" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleCategoryFilter('occasion')}>
                Occasion
                {selectedCategory === 'occasion' && <CheckCircle className="h-4 w-4 ml-auto" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleCategoryFilter('seasonal')}>
                Seasonal
                {selectedCategory === 'seasonal' && <CheckCircle className="h-4 w-4 ml-auto" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="relative">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search templates..."
              className="pl-8 h-9 w-[200px]"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>

        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>

      {/* Templates Grid */}
      <div className="space-y-8">
        {loading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading templates...</p>
          </div>
        ) : Object.keys(groupedTemplates).length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No templates found</p>
          </div>
        ) : (
          Object.entries(groupedTemplates).map(([category, templates]) => (
            <div key={category} className="space-y-4">
              <h3 className="text-lg font-medium capitalize">{category}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {templates.map((template) => (
                  <Card
                    key={template.id}
                    className={`overflow-hidden ${!template.isActive ? 'opacity-60' : ''}`}
                  >
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base truncate">{template.name}</CardTitle>
                        <div className="flex items-center space-x-1">
                          {template.isDefault && <Star className="h-4 w-4 text-amber-500" />}
                          {!template.isActive && <Badge variant="outline">Inactive</Badge>}
                        </div>
                      </div>
                      <CardDescription className="line-clamp-2 text-xs">
                        {template.description || 'No description'}
                      </CardDescription>
                    </CardHeader>
                    <div
                      className="aspect-[2/1] relative cursor-pointer"
                      onClick={() => handleSelectTemplate(template)}
                    >
                      <div
                        className="w-full h-full bg-cover bg-center"
                        style={{
                          backgroundColor: template.styles.backgroundColor,
                          backgroundImage: template.styles.backgroundImage ?
                            `url(${template.styles.backgroundImage})` :
                            undefined
                        }}
                      >
                        {/* Show placeholder if no background image */}
                        {!template.styles.backgroundImage && (
                          <div className="flex items-center justify-center h-full">
                            <CreditCard className="h-12 w-12 text-muted-foreground/40" />
                          </div>
                        )}
                      </div>
                    </div>
                    <CardFooter className="p-4 pt-3 flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        {template.occasion && (
                          <Badge variant="secondary" className="text-xs">
                            {template.occasion}
                          </Badge>
                        )}
                        {template.season && (
                          <Badge variant="secondary" className="text-xs">
                            {template.season}
                          </Badge>
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleSelectTemplate(template)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              selectTemplate(template);
                              setShowDuplicateDialog(true);
                            }}
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          {!template.isDefault && (
                            <DropdownMenuItem onClick={() => handleSetAsDefault(template)}>
                              <Star className="h-4 w-4 mr-2" />
                              Set as Default
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleToggleActive(template)}>
                            {template.isActive ? (
                              <>
                                <StarOff className="h-4 w-4 mr-2" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          {!template.isDefault && (
                            <DropdownMenuItem
                              onClick={() => {
                                selectTemplate(template);
                                setShowDeleteDialog(true);
                              }}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Template Details Dialog */}
      {selectedTemplate && (
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedTemplate.name}</DialogTitle>
              <DialogDescription>
                {selectedTemplate.description || 'No description provided'}
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="preview" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
              </TabsList>

              <TabsContent value="preview" className="space-y-4 py-4">
                <div className="aspect-[2/1] relative rounded-md overflow-hidden">
                  <div
                    className="w-full h-full bg-cover bg-center"
                    style={{
                      backgroundColor: selectedTemplate.styles.backgroundColor,
                      backgroundImage: selectedTemplate.styles.backgroundImage ?
                        `url(${selectedTemplate.styles.backgroundImage})` :
                        undefined
                    }}
                  >
                    {/* Show placeholder if no background image */}
                    {!selectedTemplate.styles.backgroundImage && (
                      <div className="flex items-center justify-center h-full">
                        <CreditCard className="h-24 w-24 text-muted-foreground/40" />
                      </div>
                    )}

                    {/* Sample content */}
                    <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center p-4">
                      <div className="font-bold text-center text-3xl mb-2">$50.00</div>
                      <div className="text-sm mb-3">Gift Card</div>
                      <div className="font-mono text-sm">XXXX-XXXX-XXXX-XXXX</div>
                      <div className="mt-4 text-sm italic text-center max-w-xs">
                        "Sample gift message would appear here"
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">
                      This is a preview of how the template will look when used for gift cards.
                      The actual gift card will include the value, code, and any custom message.
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    {selectedTemplate.isDefault ? (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                        Default Template
                      </Badge>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => handleSetAsDefault(selectedTemplate)}>
                        <Star className="h-4 w-4 mr-2" />
                        Set as Default
                      </Button>
                    )}

                    <Badge
                      variant="outline"
                      className={selectedTemplate.isActive ?
                        "bg-green-50 text-green-700 border-green-200" :
                        "bg-gray-50 text-gray-700 border-gray-200"}
                    >
                      {selectedTemplate.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="details" className="space-y-6 py-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Category</Label>
                    <div className="mt-1 text-sm capitalize">{selectedTemplate.category}</div>
                  </div>

                  {selectedTemplate.occasion && (
                    <div>
                      <Label>Occasion</Label>
                      <div className="mt-1 text-sm capitalize">{selectedTemplate.occasion}</div>
                    </div>
                  )}

                  {selectedTemplate.season && (
                    <div>
                      <Label>Season</Label>
                      <div className="mt-1 text-sm capitalize">{selectedTemplate.season}</div>
                    </div>
                  )}

                  <div>
                    <Label>Created</Label>
                    <div className="mt-1 text-sm">
                      {new Date(selectedTemplate.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div>
                    <Label>Last Updated</Label>
                    <div className="mt-1 text-sm">
                      {new Date(selectedTemplate.updatedAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div>
                    <Label>Version</Label>
                    <div className="mt-1 text-sm">{selectedTemplate.version}</div>
                  </div>

                  <div>
                    <Label>Status</Label>
                    <div className="mt-1 flex items-center space-x-2">
                      <Badge
                        variant="outline"
                        className={selectedTemplate.isActive ?
                          "bg-green-50 text-green-700 border-green-200" :
                          "bg-gray-50 text-gray-700 border-gray-200"}
                      >
                        {selectedTemplate.isActive ? 'Active' : 'Inactive'}
                      </Badge>

                      {selectedTemplate.isDefault && (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                          Default
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Background Color</Label>
                  <div className="mt-2 flex items-center space-x-2">
                    <div
                      className="w-8 h-8 rounded-full border"
                      style={{ backgroundColor: selectedTemplate.styles.backgroundColor }}
                    />
                    <div className="text-sm">{selectedTemplate.styles.backgroundColor}</div>
                  </div>
                </div>

                <div>
                  <Label>Dimensions</Label>
                  <div className="mt-1 text-sm">
                    {selectedTemplate.styles.width} × {selectedTemplate.styles.height} pixels
                  </div>
                </div>

                {/* Element count */}
                <div>
                  <Label>Elements</Label>
                  <div className="mt-1 text-sm">
                    {selectedTemplate.elements.length} design elements
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="flex justify-between">
              <div className="flex space-x-2">
                {!selectedTemplate.isDefault && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowDetailsDialog(false);
                      setShowDeleteDialog(true);
                    }}
                    className="text-destructive border-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                )}
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowDetailsDialog(false);
                    setShowDuplicateDialog(true);
                  }}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </Button>

                <Button
                  size="sm"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Template
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      {selectedTemplate && (
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Delete Template</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete the template "{selectedTemplate.name}"?
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteTemplate}
              >
                Delete Template
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Duplicate Dialog */}
      {selectedTemplate && (
        <Dialog open={showDuplicateDialog} onOpenChange={setShowDuplicateDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Duplicate Template</DialogTitle>
              <DialogDescription>
                Create a copy of the template "{selectedTemplate.name}" with a new name.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <Label htmlFor="newTemplateName">New Template Name</Label>
              <Input
                id="newTemplateName"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                placeholder={`${selectedTemplate.name} (Copy)`}
                className="mt-2"
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDuplicateDialog(false);
                  setNewTemplateName('');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDuplicateTemplate}
              >
                Duplicate Template
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}