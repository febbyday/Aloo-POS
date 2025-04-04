import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { useToast } from '@/components/ui/use-toast';
import { 
  Plus, 
  Search, 
  Filter, 
  RefreshCw, 
  FileDown, 
  Trash2, 
  BarChart3, 
  List, 
  Grid3X3
} from 'lucide-react';
import { 
  CategoryTreeView, 
  EnhancedCategoryForm,
  CategoryAnalyticsDashboard
} from '../components/categories';
import { useCategories } from '../context/CategoryContext';
import { Category, CategoryFormData } from '../types/category';

// Mock data for analytics
const mockAnalyticsData = {
  categoryId: '1',
  categoryName: 'Electronics',
  totalProducts: 245,
  totalSales: 1289,
  totalRevenue: 128900,
  averageRating: 4.2,
  salesTrend: 'up' as const,
  salesGrowth: 12.5,
  topProducts: [
    { id: '1', name: 'Wireless Headphones', sales: 120, revenue: 12000 },
    { id: '2', name: 'Bluetooth Speaker', sales: 95, revenue: 9500 },
    { id: '3', name: 'Smart Watch', sales: 85, revenue: 8500 },
    { id: '4', name: 'Wireless Charger', sales: 75, revenue: 3750 },
    { id: '5', name: 'Power Bank', sales: 65, revenue: 3250 },
  ],
  salesByPeriod: Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return {
      date: date.toISOString(),
      sales: Math.floor(Math.random() * 50) + 20,
      revenue: (Math.floor(Math.random() * 50) + 20) * 100,
    };
  }),
  salesBySubcategory: [
    { id: '1', name: 'Audio', sales: 350, revenue: 35000 },
    { id: '2', name: 'Wearables', sales: 250, revenue: 25000 },
    { id: '3', name: 'Accessories', sales: 200, revenue: 10000 },
    { id: '4', name: 'Cameras', sales: 150, revenue: 15000 },
    { id: '5', name: 'Computers', sales: 100, revenue: 20000 },
  ],
  customerSegmentation: [
    { segment: 'New Customers', count: 450, percentage: 0.35 },
    { segment: 'Returning', count: 350, percentage: 0.27 },
    { segment: 'Loyal', count: 250, percentage: 0.19 },
    { segment: 'VIP', count: 150, percentage: 0.12 },
    { segment: 'At Risk', count: 89, percentage: 0.07 },
  ],
  inventoryStatus: {
    inStock: 180,
    lowStock: 45,
    outOfStock: 20,
  },
};

export function EnhancedCategoriesPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    categories, 
    loading, 
    error, 
    addCategory, 
    updateCategory, 
    deleteCategory,
    fetchCategories
  } = useCategories();
  
  // State
  const [view, setView] = useState<'tree' | 'grid'>('tree');
  const [activeTab, setActiveTab] = useState<'categories' | 'analytics'>('categories');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [selectedCategoryForAnalytics, setSelectedCategoryForAnalytics] = useState<string | null>(null);
  
  // Filter categories based on search and status
  const filteredCategories = categories.filter(category => {
    const matchesSearch = searchQuery 
      ? category.name.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    
    const matchesStatus = statusFilter !== 'all' 
      ? category.status === statusFilter
      : true;
    
    return matchesSearch && matchesStatus;
  });
  
  // Handle category selection
  const handleCategorySelect = (categoryId: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedCategories([...selectedCategories, categoryId]);
    } else {
      setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
    }
  };
  
  // Handle category expansion
  const handleCategoryToggle = (categoryId: string) => {
    if (expandedCategories.includes(categoryId)) {
      setExpandedCategories(expandedCategories.filter(id => id !== categoryId));
    } else {
      setExpandedCategories([...expandedCategories, categoryId]);
    }
  };
  
  // Handle category move
  const handleCategoryMove = (categoryId: string, newParentId: string | null, position: number) => {
    // In a real app, you would call an API to move the category
    toast({
      title: "Category Moved",
      description: `Category moved to ${newParentId ? 'a new parent' : 'root level'}.`,
    });
  };
  
  // Handle category edit
  const handleCategoryEdit = (category: Category) => {
    setCurrentCategory(category);
    setIsFormOpen(true);
  };
  
  // Handle category delete
  const handleCategoryDelete = (categoryId: string) => {
    setCurrentCategory(categories.find(cat => cat.id === categoryId) || null);
    setIsDeleteDialogOpen(true);
  };
  
  // Handle category add
  const handleCategoryAdd = (parentId: string | null) => {
    setCurrentCategory(null);
    setIsFormOpen(true);
    
    if (parentId) {
      const parentCategory = categories.find(cat => cat.id === parentId);
      if (parentCategory) {
        // Pre-fill parent ID
        setCurrentCategory({
          id: '',
          name: '',
          description: '',
          parentId,
          products: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          slug: '',
          status: 'active',
        });
      }
    }
  };
  
  // Handle category duplicate
  const handleCategoryDuplicate = (categoryId: string) => {
    const categoryToDuplicate = categories.find(cat => cat.id === categoryId);
    if (categoryToDuplicate) {
      const duplicatedCategory = {
        ...categoryToDuplicate,
        id: '',
        name: `${categoryToDuplicate.name} (Copy)`,
        slug: `${categoryToDuplicate.slug}-copy`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      setCurrentCategory(duplicatedCategory);
      setIsFormOpen(true);
    }
  };
  
  // Handle category visibility toggle
  const handleCategoryVisibilityToggle = (categoryId: string, isVisible: boolean) => {
    const category = categories.find(cat => cat.id === categoryId);
    if (category) {
      const updatedCategory = {
        ...category,
        status: isVisible ? 'active' : 'inactive',
      };
      
      updateCategory(categoryId, updatedCategory)
        .then(() => {
          toast({
            title: isVisible ? "Category Activated" : "Category Deactivated",
            description: `${category.name} has been ${isVisible ? 'activated' : 'deactivated'}.`,
          });
        })
        .catch(error => {
          console.error('Failed to update category status:', error);
          toast({
            title: "Update Failed",
            description: "Failed to update category status. Please try again.",
            variant: "destructive",
          });
        });
    }
  };
  
  // Handle form submission
  const handleFormSubmit = (data: CategoryFormData) => {
    if (currentCategory && currentCategory.id) {
      // Update existing category
      updateCategory(currentCategory.id, data)
        .then(() => {
          toast({
            title: "Category Updated",
            description: "The category has been updated successfully.",
          });
          setIsFormOpen(false);
        })
        .catch(error => {
          console.error('Failed to update category:', error);
          toast({
            title: "Update Failed",
            description: "Failed to update category. Please try again.",
            variant: "destructive",
          });
        });
    } else {
      // Add new category
      addCategory(data)
        .then(() => {
          toast({
            title: "Category Created",
            description: "The category has been created successfully.",
          });
          setIsFormOpen(false);
        })
        .catch(error => {
          console.error('Failed to create category:', error);
          toast({
            title: "Creation Failed",
            description: "Failed to create category. Please try again.",
            variant: "destructive",
          });
        });
    }
  };
  
  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (currentCategory && currentCategory.id) {
      deleteCategory(currentCategory.id)
        .then(() => {
          toast({
            title: "Category Deleted",
            description: "The category has been deleted successfully.",
          });
          setIsDeleteDialogOpen(false);
        })
        .catch(error => {
          console.error('Failed to delete category:', error);
          toast({
            title: "Deletion Failed",
            description: "Failed to delete category. Please try again.",
            variant: "destructive",
          });
        });
    }
  };
  
  // Handle refresh
  const handleRefresh = () => {
    fetchCategories()
      .then(() => {
        toast({
          title: "Data Refreshed",
          description: "Category data has been refreshed.",
        });
      })
      .catch(error => {
        console.error('Failed to refresh categories:', error);
        toast({
          title: "Refresh Failed",
          description: "Failed to refresh category data. Please try again.",
          variant: "destructive",
        });
      });
  };
  
  // Handle export
  const handleExport = (format: 'csv' | 'pdf' | 'excel') => {
    toast({
      title: `Export as ${format.toUpperCase()}`,
      description: `Categories have been exported as ${format.toUpperCase()}.`,
    });
  };
  
  // Handle analytics time range change
  const handleTimeRangeChange = (range: 'day' | 'week' | 'month' | 'year') => {
    setTimeRange(range);
    toast({
      title: "Time Range Changed",
      description: `Analytics time range changed to ${range}.`,
    });
  };
  
  // Handle selecting a category for analytics
  const handleSelectCategoryForAnalytics = (categoryId: string) => {
    setSelectedCategoryForAnalytics(categoryId);
    setActiveTab('analytics');
  };
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        title="Product Categories"
        description="Manage and organize your product categories"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => handleCategoryAdd(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </div>
        }
      />
      
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="categories">
            <List className="h-4 w-4 mr-2" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="categories" className="space-y-4 pt-4">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="icon" onClick={() => setView('tree')} className={view === 'tree' ? 'bg-muted' : ''}>
                <List className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => setView('grid')} className={view === 'grid' ? 'bg-muted' : ''}>
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={() => handleExport('csv')}>
                <FileDown className="h-4 w-4 mr-2" />
                Export
              </Button>
              {selectedCategories.length > 0 && (
                <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete ({selectedCategories.length})
                </Button>
              )}
            </div>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-4" />
                <p className="text-lg">Loading categories...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-lg text-destructive">Error loading categories</p>
                <Button variant="outline" onClick={handleRefresh} className="mt-4">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 border rounded-lg">
              <p className="text-lg mb-4">No categories found</p>
              <Button onClick={() => handleCategoryAdd(null)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </div>
          ) : (
            <div className="border rounded-lg">
              <CategoryTreeView
                categories={filteredCategories}
                selectedCategories={selectedCategories}
                expandedCategories={expandedCategories}
                onCategorySelect={handleCategorySelect}
                onCategoryToggle={handleCategoryToggle}
                onCategoryMove={handleCategoryMove}
                onCategoryEdit={handleCategoryEdit}
                onCategoryDelete={handleCategoryDelete}
                onCategoryAdd={handleCategoryAdd}
                onCategoryDuplicate={handleCategoryDuplicate}
                onCategoryVisibilityToggle={handleCategoryVisibilityToggle}
                showCheckboxes={true}
                showActions={true}
                showProductCount={true}
                className="p-4"
              />
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4 pt-4">
          {selectedCategoryForAnalytics ? (
            <CategoryAnalyticsDashboard
              categoryId={selectedCategoryForAnalytics}
              timeRange={timeRange}
              onTimeRangeChange={handleTimeRangeChange}
              onRefresh={handleRefresh}
              onExport={handleExport}
              data={mockAnalyticsData}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-64 border rounded-lg">
              <p className="text-lg mb-4">Select a category to view analytics</p>
              <Button variant="outline" onClick={() => setActiveTab('categories')}>
                <List className="h-4 w-4 mr-2" />
                Go to Categories
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Category Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{currentCategory?.id ? 'Edit Category' : 'Add Category'}</DialogTitle>
            <DialogDescription>
              {currentCategory?.id 
                ? 'Update the category details below.' 
                : 'Fill in the details to create a new category.'}
            </DialogDescription>
          </DialogHeader>
          <EnhancedCategoryForm
            initialData={currentCategory || undefined}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsFormOpen(false)}
            isEdit={!!currentCategory?.id}
          />
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedCategories.length > 1 
                ? `This will permanently delete ${selectedCategories.length} categories and their subcategories.` 
                : currentCategory 
                  ? `This will permanently delete "${currentCategory.name}" and its subcategories.` 
                  : 'This will permanently delete the selected category and its subcategories.'}
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
    </div>
  );
}

export default EnhancedCategoriesPage;
