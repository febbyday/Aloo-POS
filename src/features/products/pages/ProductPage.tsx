/**
 * Product Page
 * 
 * This page displays a list of products with filtering, sorting, and pagination.
 * It uses the product store and specialized hooks for data management.
 */

import React, { useEffect, useState } from 'react';
import { useProductStore } from '../store';
import { useProductFilters } from '../hooks/useProductFilters';
import { selectAllProducts, selectLoadingStates, selectPagination } from '../store/selectors';
import { 
  ProductsTable, 
  ProductsToolbar, 
  FilterDialog,
  SortDialog,
  BulkEditModal,
  ImportExportDialog
} from '../components';
import { Button } from '@/components/ui/button';
import { Plus, Filter, ArrowUpDown, MoreHorizontal, FileUp, FileDown } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';

/**
 * ProductPage component
 */
const ProductPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [isSortDialogOpen, setIsSortDialogOpen] = useState(false);
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);
  
  // Get products from store
  const products = selectAllProducts();
  const { products: productsLoading } = selectLoadingStates();
  const pagination = selectPagination();
  
  // Get filter actions
  const { 
    currentFilter, 
    applyFilters, 
    clearFilters, 
    changePage, 
    changeLimit 
  } = useProductFilters();
  
  // Initialize products on mount
  const fetchProducts = useProductStore(state => state.fetchProducts);
  
  useEffect(() => {
    fetchProducts(currentFilter);
  }, [fetchProducts, currentFilter]);
  
  // Handle row selection
  const handleRowSelectionChange = (selectedIds: string[]) => {
    setSelectedProductIds(selectedIds);
  };
  
  // Handle creating a new product
  const handleCreateProduct = () => {
    navigate('/products/new');
  };
  
  // Handle editing a product
  const handleEditProduct = (id: string) => {
    navigate(`/products/edit/${id}`);
  };
  
  // Handle viewing a product
  const handleViewProduct = (id: string) => {
    navigate(`/products/${id}`);
  };
  
  // Handle pagination
  const handlePageChange = (page: number) => {
    changePage(page);
  };
  
  // Handle items per page change
  const handleLimitChange = (limit: number) => {
    changeLimit(limit);
  };
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Products</h1>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsFilterDialogOpen(true)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsSortDialogOpen(true)}
          >
            <ArrowUpDown className="h-4 w-4 mr-2" />
            Sort
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4 mr-2" />
                Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsImportExportOpen(true)}>
                <FileUp className="h-4 w-4 mr-2" />
                Import / Export
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setIsBulkEditOpen(true)}
                disabled={selectedProductIds.length === 0}
              >
                Bulk Edit ({selectedProductIds.length})
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button onClick={handleCreateProduct}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>
      
      <ProductsToolbar 
        onSearch={(query) => applyFilters({ search: query })}
        onClearFilters={clearFilters}
        activeFilters={Object.keys(currentFilter).filter(key => 
          key !== 'page' && key !== 'limit' && 
          currentFilter[key as keyof typeof currentFilter] !== undefined
        ).length}
      />
      
      <ProductsTable 
        products={products}
        loading={productsLoading}
        onRowSelectionChange={handleRowSelectionChange}
        onEdit={handleEditProduct}
        onView={handleViewProduct}
        pagination={{
          page: pagination.page,
          pageSize: pagination.limit,
          totalItems: pagination.total,
          totalPages: pagination.totalPages,
          onPageChange: handlePageChange,
          onPageSizeChange: handleLimitChange,
        }}
      />
      
      {/* Dialogs */}
      <FilterDialog 
        open={isFilterDialogOpen} 
        onOpenChange={setIsFilterDialogOpen}
        currentFilters={currentFilter}
        onApplyFilters={applyFilters}
        onClearFilters={clearFilters}
      />
      
      <SortDialog 
        open={isSortDialogOpen} 
        onOpenChange={setIsSortDialogOpen}
        currentSort={{
          sortBy: currentFilter.sortBy || 'name',
          sortDirection: currentFilter.sortDirection || 'asc'
        }}
        onApplySort={(sort) => applyFilters(sort)}
      />
      
      <BulkEditModal 
        open={isBulkEditOpen} 
        onOpenChange={setIsBulkEditOpen}
        selectedProductIds={selectedProductIds}
        onSuccess={() => {
          setSelectedProductIds([]);
          fetchProducts(currentFilter);
        }}
      />
      
      <ImportExportDialog 
        open={isImportExportOpen} 
        onOpenChange={setIsImportExportOpen}
        onSuccess={() => {
          fetchProducts(currentFilter);
        }}
      />
    </div>
  );
};

export default ProductPage; 