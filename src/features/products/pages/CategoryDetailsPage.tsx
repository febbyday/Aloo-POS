import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from "@/components/page-header";
import { toast } from '@/lib/toast';
import { useCategories } from '../context/CategoryContext';
import { Category } from '../types/category';
import {
  ArrowLeft,
  Edit,
  Trash2,
  FolderTree,
  Package,
  Calendar,
  Tag,
  CheckCircle,
  XCircle,
  Settings,
  AlertTriangle,
  RefreshCw,
  Info
} from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";

export function CategoryDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getCategory, deleteCategory, categories } = useCategories();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('info');

  const loadCategory = async () => {
    if (!id) return;

    setIsLoading(true);
    setError(null);
    try {
      const categoryData = await getCategory(id);
      if (categoryData) {
        setCategory(categoryData);
      } else {
        toast.error('Category not found');
        navigate('/products/categories');
      }
    } catch (error) {
      console.error('Error loading category:', error);
      setError(error as Error);
      toast.error('Failed to load category');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategory();
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;

    try {
      await deleteCategory(id);
      toast.success('Category deleted successfully');
      navigate('/products/categories');
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    }
  };

  const handleEdit = () => {
    navigate(`/products/categories/edit/${id}`);
  };

  const handleBack = () => {
    navigate('/products/categories');
  };

  const handleRefresh = () => {
    loadCategory();
  };

  // Find parent category name if it exists
  const getParentCategoryName = () => {
    if (!category?.parentId) return null;
    const parent = categories.find(c => c.id === category.parentId);
    return parent?.name || 'Unknown';
  };

  if (isLoading) {
    return (
      <div className="w-full h-[50vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-lg font-medium">Loading category...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-[50vh] flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
          <h2 className="text-xl font-bold">Failed to load category</h2>
          <p className="text-muted-foreground">{error.message || 'An unexpected error occurred'}</p>
          <Button onClick={handleRefresh} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="w-full h-[50vh] flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
          <h2 className="text-xl font-bold">Category Not Found</h2>
          <p className="text-muted-foreground">The category you are looking for does not exist or has been removed.</p>
          <Button onClick={() => navigate('/products/categories')} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Categories
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full pb-6 space-y-4 mx-auto max-w-[1920px]">
      {/* Breadcrumb navigation */}
      <Breadcrumb className="mb-2">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/products">Products</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/products/categories">Categories</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{category.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page header with actions */}
      <PageHeader
        title={category.name}
        description="Category details and related information"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleBack}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button
              variant="default"
              onClick={handleEdit}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="destructive"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        }
      />

      {/* Status badge */}
      <div className="flex items-center">
        <Badge
          variant={category.status === 'active' ? 'success' : 'destructive'}
          className="flex items-center gap-1 px-2 py-1"
        >
          {category.status === 'active' ? (
            <>
              <CheckCircle className="h-3 w-3" />
              Active
            </>
          ) : (
            <>
              <XCircle className="h-3 w-3" />
              Inactive
            </>
          )}
        </Badge>
        {category.slug && (
          <div className="ml-4 text-sm text-muted-foreground flex items-center gap-1">
            <Tag className="h-3 w-3" />
            Slug: {category.slug}
          </div>
        )}
      </div>

      {/* Main content tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="info" className="flex items-center gap-1">
            <Info className="h-4 w-4" />
            Information
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-1">
            <Package className="h-4 w-4" />
            Products
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-1">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Information tab */}
        <TabsContent value="info" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Category Information</CardTitle>
              <CardDescription>Basic details about this category</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p className="font-medium">{category.name}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Parent Category</p>
                  <div className="flex items-center gap-2">
                    <FolderTree className="h-4 w-4 text-muted-foreground" />
                    {category.parentId ? (
                      <Button
                        variant="link"
                        className="p-0 h-auto font-medium"
                        onClick={() => navigate(`/products/categories/${category.parentId}`)}
                      >
                        {getParentCategoryName()}
                      </Button>
                    ) : (
                      <span>None (Root Category)</span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Products Count</p>
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{category.products}</span>
                    {category.products > 0 && (
                      <Button
                        variant="link"
                        className="p-0 h-auto text-sm"
                        onClick={() => setActiveTab('products')}
                      >
                        View Products
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Created At</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {new Date(category.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {new Date(category.updatedAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Description</p>
                <p className="text-pretty">{category.description || 'No description provided'}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Products tab */}
        <TabsContent value="products" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Products in this Category</CardTitle>
              <CardDescription>
                {category.products > 0
                  ? `This category contains ${category.products} products`
                  : 'No products in this category yet'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {category.products > 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Product listing functionality will be implemented soon</p>
                  <Button className="mt-4" variant="outline" onClick={() => navigate('/products')}>
                    Go to Products
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No products have been added to this category yet</p>
                  <Button className="mt-4" variant="outline" onClick={() => navigate('/products/add')}>
                    Add Product
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings tab */}
        <TabsContent value="settings" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Category Settings</CardTitle>
              <CardDescription>Configure settings for this category</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">Category Visibility</h3>
                    <p className="text-sm text-muted-foreground">Control whether this category is visible in the shop</p>
                  </div>
                  <Button variant="outline" onClick={handleEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Settings
                  </Button>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="font-medium">Danger Zone</h3>
                  <p className="text-sm text-muted-foreground">Destructive actions for this category</p>

                  <div className="mt-4 space-y-4">
                    <div className="flex justify-between items-center p-4 border border-destructive/20 rounded-lg">
                      <div>
                        <h4 className="font-medium">Delete this category</h4>
                        <p className="text-sm text-muted-foreground">
                          Once deleted, this category cannot be recovered
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        onClick={() => setDeleteDialogOpen(true)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the category "{category.name}"?
              This action cannot be undone. Products in this category will not be deleted,
              but they will no longer be associated with this category.
              {category.products > 0 && (
                <div className="mt-2 p-2 bg-destructive/10 rounded text-destructive">
                  <strong>Warning:</strong> This category contains {category.products} products.
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Category
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default CategoryDetailsPage;
