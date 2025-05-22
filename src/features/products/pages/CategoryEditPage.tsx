import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trash2, Save } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { useToast } from '@/lib/toast';
import { useToastManager } from "@/components/ui/toast-manager";
import { CategoryForm } from '../components/CategoryForm';
import { CategoryFormData } from '../types/category';
import { useCategories } from '../context/CategoryContext';
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
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function CategoryEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getCategory, updateCategory, deleteCategory, categories } = useCategories();
  const { toast } = useToast();
  const showToast = useToastManager();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [category, setCategory] = useState<CategoryFormData | null>(null);
  const [originalCategory, setOriginalCategory] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const loadCategory = async () => {
      if (!id) return;

      setIsLoading(true);
      try {
        const categoryData = await getCategory(id);
        if (categoryData) {
          setOriginalCategory(categoryData);

          // Convert to form data format
          setCategory({
            name: categoryData.name,
            description: categoryData.description || '',
            parentId: categoryData.parentId,
            status: categoryData.status || 'active',
            slug: categoryData.slug,
            inheritParentAttributes: categoryData.inheritParentAttributes || false,
            seo: {
              metaTitle: categoryData.seo?.metaTitle || '',
              metaDescription: categoryData.seo?.metaDescription || '',
              keywords: categoryData.seo?.keywords || '',
            },
          });
        } else {
          showToast.error('Error', 'Category not found');
          navigate('/products/categories');
        }
      } catch (error) {
        console.error('Error loading category:', error);
        showToast.error('Error', 'Failed to load category');
        navigate('/products/categories');
      } finally {
        setIsLoading(false);
      }
    };

    loadCategory();
  }, [id, getCategory, navigate, showToast]);

  const handleSave = async (data: CategoryFormData) => {
    if (!id) return;

    setIsSubmitting(true);
    try {
      const updatedCategory = await updateCategory(id, data);
      showToast.success('Success', 'Category updated successfully');
      navigate(`/products/categories/${updatedCategory.id}`);
    } catch (error) {
      console.error('Error updating category:', error);
      showToast.error('Error', 'Failed to update category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    try {
      await deleteCategory(id);
      showToast.success('Success', 'Category deleted successfully');
      navigate('/products/categories');
    } catch (error) {
      console.error('Error deleting category:', error);
      showToast.error('Error', 'Failed to delete category');
    }
  };

  const handleCancel = () => {
    navigate(`/products/categories/${id}`);
  };

  if (isLoading) {
    return (
      <div className="w-full pb-6 space-y-4 mx-auto max-w-[1920px]">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-10 w-[250px]" />
          <Skeleton className="h-4 w-[350px]" />
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-8 w-[200px]" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-24 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="w-full pb-6 space-y-4 mx-auto max-w-[1920px]">
        <PageHeader
          title="Category Not Found"
          description="The requested category could not be found"
          actions={
            <Button variant="outline" onClick={() => navigate('/products/categories')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Categories
            </Button>
          }
        />
        <Card>
          <CardContent className="p-6 text-center">
            <p>The category you are looking for does not exist or has been deleted.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full pb-6 space-y-4 mx-auto max-w-[1920px]">
      <div className="flex flex-col gap-2">
        <Breadcrumb>
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
              <BreadcrumbLink href={`/products/categories/${id}`}>{originalCategory?.name}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Edit</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <PageHeader
          title={`Edit ${originalCategory?.name}`}
          description="Update category information"
          actions={
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
                disabled={isSubmitting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
              <Button
                type="submit"
                form="category-edit-form"
                disabled={isSubmitting}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <CategoryForm
          id="category-edit-form"
          initialData={category}
          onSubmit={handleSave}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
        />
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this category?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the category
              "{originalCategory?.name}" and may affect products assigned to this category.
              {originalCategory?.products > 0 && (
                <p className="mt-2 font-semibold text-destructive">
                  Warning: This category contains {originalCategory.products} products that will be affected.
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete Category
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default CategoryEditPage;
