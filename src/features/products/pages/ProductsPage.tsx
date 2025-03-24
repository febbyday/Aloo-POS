// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤

import { useState } from 'react'
import { 
  ArrowDownUp, 
  FileText, 
  Eye,
  Pencil,
  Plus, 
  Printer, 
  Tags, 
  Trash2 as Trash, 
  RefreshCw,
  Search,
  AlertTriangle,
  FolderTree,
  AlertCircle,
  FolderPlus
} from 'lucide-react'

// Components
import { Button } from '@/components/ui/button'
import { ProductFilters } from '../components/ProductFilters'
import { ProductsTable } from '../components/ProductsTable'
import { AssignCategoryDialog } from '../components/AssignCategoryDialog'
import { BulkEditModal } from '../components/BulkEditModal'
import { ProductsToolbar } from '../components/ProductsToolbar'
import { StatsCard } from '../components/StatsCard'
import { ImportExportDialog } from '../components/ImportExportDialog'
import { ExportDialog } from '../components/ExportDialog'

// Utilities
import { exportProductsToCSV, exportProductsToExcel, exportProductsToPDF } from '../utils/exportUtils'
import * as XLSX from 'xlsx'

// Contexts
import { useProducts } from '../context/ProductContext'

// Hooks
import { useToast } from '@/components/ui/use-toast'
import { useNavigate } from 'react-router-dom'

// Error Boundary
import { ErrorBoundary } from '@/components/unified-error-boundary'

// Types
import type { Product, InventoryFilter } from '../types'

// Add the validateAndProcessImport utility function
import { validateAndProcessImport } from '@/utils/importValidation'

// UI Components
import { 
  Card,
  CardContent,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

// Add import for the product mapper
import { mapFeatureProductsToInventoryProducts } from '@/utils/productMapper'

const mockTrendData = {
  products: Array.from({ length: 10 }, (_, i) => ({
    value: Math.floor(Math.random() * 20) + 80
  })),
  lowStock: Array.from({ length: 10 }, (_, i) => ({
    value: Math.floor(Math.random() * 5) + 1
  })),
  outOfStock: Array.from({ length: 10 }, (_, i) => ({
    value: Math.floor(Math.random() * 3)
  })),
  categories: Array.from({ length: 10 }, (_, i) => ({
    value: Math.floor(Math.random() * 2) + 4
  }))
}

export function ProductsPage() {
  const { products, deleteProduct, categories, updateProduct, addProduct } = useProducts();
  const [filters, setFilters] = useState<InventoryFilter>({})
  const [sortConfig, setSortConfig] = useState<{column: string; direction: 'asc' | 'desc'} | null>(null)
  const [visibleColumns, setVisibleColumns] = useState(['name', 'productType', 'sku', 'price', 'stock', 'status', 'category', 'supplier'])
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [assignCategoryDialog, setAssignCategoryDialog] = useState(false)
  const [importExportDialogOpen, setImportExportDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [bulkEditModalOpen, setBulkEditModalOpen] = useState(false);
  const { toast } = useToast()
  const navigate = useNavigate()

  const handleRefresh = () => {
    // TODO: Implement refresh logic
    toast({
      title: "Refreshing data...",
      description: "Your inventory data is being updated."
    })
  }

  const handleCreate = () => {
    // Navigate to the new ProductAddPage
    navigate('/products/new')
  }

  const handleEdit = () => {
    if (selectedItems.length !== 1) {
      toast({
        title: "Select one product",
        description: "Please select exactly one product to edit.",
        variant: "destructive"
      })
      return
    }
    // Navigate to the new ProductEditPage
    navigate(`/products/${selectedItems[0]}/edit`)
  }

  const handleView = () => {
    if (selectedItems.length !== 1) {
      toast({
        title: "Select one product",
        description: "Please select exactly one product to view.",
        variant: "destructive"
      })
      return
    }
    
    // Navigate to the product details page instead of showing a dialog
    navigate(`/products/${selectedItems[0]}`);
  }

  const handleDeleteProduct = () => {
    if (selectedItems.length === 0) {
      toast({
        title: "No products selected",
        description: "Please select at least one product to delete.",
        variant: "destructive"
      })
      return
    }
    // Delete each selected product
    selectedItems.forEach(id => deleteProduct(id));
    toast({
      title: "Products deleted",
      description: `Successfully deleted ${selectedItems.length} products.`
    })
    setSelectedItems([])
  }

  const handleViewProduct = (product: Product) => {
    navigate(`/products/${product.id}`);
  }

  const handleAssignCategory = async (categoryId: string) => {
    try {
      // Get the category name for the toast message
      const categoryName = categories.find(c => c.id === categoryId)?.name

      // Update all selected products with the new category
      for (const productId of selectedItems) {
        const product = products.find(p => p.id === productId)
        if (product) {
          await updateProduct(productId, { ...product, category: categoryId })
        }
      }

      toast({
        title: "Category Assigned",
        description: `Successfully assigned ${selectedItems.length} products to ${categoryName}`
      })

      // Clear selection after successful assignment
      setSelectedItems([])
    } catch (error) {
      console.error('Failed to assign category:', error)
      toast({
        title: "Error",
        description: "Failed to assign category to selected products",
        variant: "destructive"
      })
    }
  }

  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    try {
      switch (format) {
        case 'csv': {
          const csvData = exportProductsToCSV(products, true);
          const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `products_export_${format}.csv`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          break;
        }
        case 'excel': {
          const workbook = exportProductsToExcel(products, true);
          const blob = new Blob([s2ab(XLSX.write(workbook, { bookType: 'xlsx', type: 'binary' }))], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `products_export_${format}.xlsx`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          break;
        }
        case 'pdf': {
          const pdfDoc = exportProductsToPDF(products, true);
          const blob = pdfDoc.output('blob');
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `products_export_${format}.pdf`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          break;
        }
        default:
          toast({
            title: "Export Error",
            description: "Invalid export format selected.",
            variant: "destructive"
          });
          return;
      }
      
      toast({
        title: "Export Successful",
        description: `Products exported successfully as ${format.toUpperCase()}.`
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "An error occurred while exporting products.",
        variant: "destructive"
      });
    }
  };

  // Helper function to convert string to ArrayBuffer
  function s2ab(s: string): ArrayBuffer {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
  }

  const handleFileImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = sheetName ? workbook.Sheets[sheetName] : null;
      if (!sheet) {
        throw new Error('No sheet found in the imported file');
      }
      const jsonData = XLSX.utils.sheet_to_json(sheet);

      const { validData, errors } = await validateAndProcessImport(jsonData, 'Products');

      if (errors.length > 0) {
        toast({
          title: "Import Errors",
          description: `${errors.length} errors found during import. Check console for details.`,
          variant: "destructive"
        });
        console.error('Import Errors:', errors);
      }

      if (validData.length > 0) {
        updateProductList(validData);
        toast({
          title: "Import Successful",
          description: `${validData.length} products imported successfully.`
        });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const updateProductList = (newProducts: Product[]) => {
    // Assuming updateProduct is a function from the context to update products
    newProducts.forEach(product => {
      const existingProduct = products.find(p => p.id === product.id);
      if (existingProduct) {
        updateProduct(product.id, product);
      } else {
        // If the product doesn't exist, add it to the list
        // Assuming addProduct is a function from the context to add new products
        addProduct(product);
      }
    });
  };

  // Filter and sort products
  const filteredProducts = products.filter(product => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      if (!product.name.toLowerCase().includes(searchLower) && 
          !product.sku.toLowerCase().includes(searchLower)) {
        return false
      }
    }
    if (filters.categories?.length && !filters.categories.includes(product.category)) {
      return false
    }
    if (filters.locations?.length && !product.locations.some(loc => filters.locations?.includes(loc.locationId))) {
      return false
    }
    if (filters.priceRange?.min && product.retailPrice < filters.priceRange.min) {
      return false
    }
    if (filters.priceRange?.max && product.retailPrice > filters.priceRange.max) {
      return false
    }
    if (filters.min && product.locations.reduce((total, loc) => total + loc.stock, 0) < filters.min) {
      return false
    }
    if (filters.max && product.locations.reduce((total, loc) => total + loc.stock, 0) > filters.max) {
      return false
    }
    return true
  })

  // Sort products
  const sortedProducts = sortConfig
    ? [...filteredProducts].sort((a, b) => {
        const aVal = a[sortConfig.column as keyof Product]
        const bVal = b[sortConfig.column as keyof Product]
        const modifier = sortConfig.direction === 'asc' ? 1 : -1
        
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return aVal.localeCompare(bVal) * modifier
        }
        
        return ((aVal as any) < (bVal as any) ? -1 : 1) * modifier
      })
    : filteredProducts

  // New bulk edit handler
  const handleBulkEdit = () => {
    if (selectedItems.length === 0) {
      toast({
        title: "No products selected",
        description: "Please select at least one product to edit.",
        variant: "destructive"
      })
      return
    }
    setBulkEditModalOpen(true)
  }

  // Handler for applying bulk updates
  const handleApplyBulkUpdates = (updates: Partial<Product>, productIds: string[]) => {
    // Update each selected product
    productIds.forEach(id => {
      const product = products.find(p => p.id === id)
      if (product) {
        const updatedProduct = { ...product, ...updates }
        updateProduct(id, updatedProduct)
      }
    })
    
    toast({
      title: "Bulk update complete",
      description: `Updated ${productIds.length} products successfully.`
    })
  }

  const toolbarGroups = [
    {
      buttons: [
        {
          icon: RefreshCw,
          label: "Refresh",
          onClick: handleRefresh
        }
      ]
    },
    {
      buttons: [
        {
          icon: Plus,
          label: "New",
          onClick: handleCreate
        },
        {
          icon: Pencil,
          label: "Edit",
          onClick: handleEdit,
          disabled: selectedItems.length !== 1
        },
        {
          icon: ArrowDownUp,
          label: "Bulk Edit",
          onClick: handleBulkEdit,
          disabled: selectedItems.length === 0
        },
        {
          icon: Eye,
          label: "View",
          onClick: handleView,
          disabled: selectedItems.length !== 1
        },
        {
          icon: Trash,
          label: "Delete",
          onClick: handleDeleteProduct,
          disabled: selectedItems.length === 0
        }
      ]
    },
    {
      buttons: [
        {
          icon: FolderPlus,
          label: "Assign Category",
          onClick: () => setAssignCategoryDialog(true),
          disabled: selectedItems.length === 0
        },
        {
          icon: ArrowDownUp,
          label: "Export",
          onClick: () => setExportDialogOpen(true)
        },
        {
          icon: FileText,
          label: "Import",
          onClick: () => setImportExportDialogOpen(true)
        }
      ]
    }
  ]

  return (
    <ErrorBoundary>
      <div className="space-y-8">
        {/* Toolbar */}
        <ProductsToolbar
          groups={toolbarGroups}
        />

        {/* Export Dialog */}
        <ErrorBoundary>
          <ExportDialog
            open={exportDialogOpen}
            onOpenChange={setExportDialogOpen}
            onExport={handleExport}
          />
        </ErrorBoundary>

        {/* Import/Export Dialog */}
        <ErrorBoundary>
          <ImportExportDialog
            open={importExportDialogOpen}
            onOpenChange={setImportExportDialogOpen}
            onFileImport={handleFileImport}
          />
        </ErrorBoundary>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <ErrorBoundary>
            <StatsCard
              title="Total Products"
              value={products.length}
              icon={Tags}
              iconColor="text-primary"
              iconBgColor="bg-primary/10"
              trend={{
                data: mockTrendData.products,
                isPositive: true,
                percentage: 12
              }}
            />
          </ErrorBoundary>
          <ErrorBoundary>
            <StatsCard
              title="Low Stock Items"
              value={products.filter(p => 
                p.locations?.some(loc => 
                  (loc.stock || 0) <= (loc.minStock || 0)
                )
              ).length}
              icon={AlertCircle}
              iconColor="text-destructive"
              iconBgColor="bg-destructive/10"
              trend={{
                data: mockTrendData.lowStock,
                isPositive: false,
                percentage: 8
              }}
            />
          </ErrorBoundary>
          <ErrorBoundary>
            <StatsCard
              title="Out of Stock"
              value={products.filter(p => 
                !p.locations?.some(loc => (loc.stock || 0) > 0)
              ).length}
              icon={AlertTriangle}
              iconColor="text-destructive"
              iconBgColor="bg-destructive/10"
              trend={{
                data: mockTrendData.outOfStock,
                isPositive: false,
                percentage: 5
              }}
            />
          </ErrorBoundary>
          <ErrorBoundary>
            <StatsCard
              title="Categories"
              value={new Set(products.map(p => p.category)).size}
              icon={FolderTree}
              iconColor="text-primary"
              iconBgColor="bg-primary/10"
              trend={{
                data: mockTrendData.categories,
                isPositive: true,
                percentage: 15
              }}
            />
          </ErrorBoundary>
        </div>

        {/* Filters and Table */}
        <div className="space-y-4">
          <ErrorBoundary>
            <ProductFilters 
              filters={filters} 
              onFilterChange={setFilters} 
              onFilterReset={() => setFilters({})} 
            />
          </ErrorBoundary>
          
          <ErrorBoundary>
            <ProductsTable 
              data={mapFeatureProductsToInventoryProducts(sortedProducts)}
              selectedItems={selectedItems}
              onSelectionChange={setSelectedItems}
              onProductDoubleClick={(product) => navigate(`/products/${product.id}`)}
              sortConfig={sortConfig}
              onSort={(column) => {
                setSortConfig(prev => {
                  if (prev && prev.column === column) {
                    return {
                      column,
                      direction: prev.direction === 'asc' ? 'desc' : 'asc'
                    };
                  }
                  return { column, direction: 'asc' };
                });
              }}
              visibleColumns={visibleColumns}
            />
          </ErrorBoundary>
        </div>

        <ErrorBoundary>
          <AssignCategoryDialog
            open={assignCategoryDialog}
            onOpenChange={setAssignCategoryDialog}
            selectedProducts={products.filter(p => selectedItems.includes(p.id))}
            categories={categories}
            onAssign={handleAssignCategory}
          />
        </ErrorBoundary>

        <ErrorBoundary>
          <BulkEditModal
            open={bulkEditModalOpen}
            onOpenChange={setBulkEditModalOpen}
            selectedProducts={products.filter(p => selectedItems.includes(p.id))}
            onSave={handleApplyBulkUpdates}
            categories={categories}
            suppliers={[
              { id: "sup1", name: "Audio Supplies Co." },
              { id: "sup2", name: "Other Supplier" }
            ]}
          />
        </ErrorBoundary>
      </div>
    </ErrorBoundary>
  )
}
