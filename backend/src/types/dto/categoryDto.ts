import { Category } from '@prisma/client';

// Types for frontend/API responses
export interface CategoryDto {
  id: string;
  name: string;
  description?: string;
  parentId?: string | null;
  parentName?: string;
  isActive: boolean;
  productCount?: number;
  childrenCount?: number;
  children?: CategoryDto[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryListDto {
  categories: CategoryDto[];
  total: number;
  page: number;
  limit: number;
}

export interface CategoryHierarchyDto {
  id: string;
  name: string;
  description?: string;
  children: CategoryHierarchyDto[];
}

// Transform functions
export function transformCategoryToDto(
  category: Category & {
    parent?: Category | null;
    children?: Category[];
    _count?: { products?: number; children?: number };
  }
): CategoryDto {
  return {
    id: category.id,
    name: category.name,
    description: category.description || undefined,
    parentId: category.parentId,
    parentName: category.parent?.name,
    isActive: category.isActive,
    productCount: category._count?.products,
    childrenCount: category._count?.children || category.children?.length,
    children: category.children?.map(child => transformCategoryToDto(child)),
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  };
}

export function transformToHierarchy(
  categories: (Category & {
    children: (Category & {
      children: Category[];
    })[];
  })[]
): CategoryHierarchyDto[] {
  return categories.map(category => ({
    id: category.id,
    name: category.name,
    description: category.description || undefined,
    children: category.children.map(child => ({
      id: child.id,
      name: child.name,
      description: child.description || undefined,
      children: child.children.map(grandchild => ({
        id: grandchild.id,
        name: grandchild.name,
        description: grandchild.description || undefined,
        children: [],
      })),
    })),
  }));
} 