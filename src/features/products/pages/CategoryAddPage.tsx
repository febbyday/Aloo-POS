import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { useToast } from '@/lib/toast';
import { useToastManager } from "@/components/ui/toast-manager";
import { CategoryForm } from '../components/CategoryForm';
import { CategoryFormData } from '../types/category';
import { useCategories } from '../context/CategoryContext';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function CategoryAddPage() {
  const navigate = useNavigate();
  const { addCategory, categories, loading: categoriesLoading } = useCategories();
  const { toast } = useToast();
  const showToast = useToastManager();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    // Short timeout to ensure UI feels smooth
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const handleSave = async (data: CategoryFormData) => {
    setIsSubmitting(true);
    try {
      const newCategory = await addCategory(data);
      showToast.success('Success', 'Category created successfully');
      navigate(`/products/categories/${newCategory.id}`);
    } catch (error) {
      console.error('Error creating category:', error);
      showToast.error('Error', 'Failed to create category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/products/categories');
  };

  if (pageLoading || categoriesLoading) {
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
              <BreadcrumbPage>Add New Category</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <PageHeader
          title="Add New Category"
          description="Create a new product category in your system"
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
                type="submit"
                form="category-form"
                disabled={isSubmitting}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Category
              </Button>
            </div>
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <CategoryForm
          id="category-form"
          onSubmit={handleSave}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}

export default CategoryAddPage;
