import { useState } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TablePagination } from '@/components/ui/TablePagination';
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
  Globe,
  Eye,
  EyeOff,
  Tag,
  Package,
  AlertCircle,
  Calendar,
  Settings
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/lib/toast';
import { useBrands } from '../context/BatchBrandProvider';
import BrandForm from '../components/brands/BrandForm';
import { Brand, BrandFormData } from '../types/brand';

function BrandsPageComponent() {
  const { toast } = useToast();
  const {
    brands,
    loading,
    error,
    selectedBrands,
    setSelectedBrands,
    filters,
    setFilters,
    sort,
    setSort,
    pagination,
    setPagination,
    addBrand,
    updateBrand,
    deleteBrands,
    refreshBrands
  } = useBrands();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentBrand, setCurrentBrand] = useState<Brand | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Handle form open for adding new brand
  const handleAddBrand = () => {
    setCurrentBrand(null);
    setIsFormOpen(true);
  };

  // Handle form open for editing brand
  const handleEditBrand = (brand: Brand) => {
    setCurrentBrand(brand);
    setIsFormOpen(true);
  };

  // Handle delete brand
  const handleDeleteBrand = (brand: Brand) => {
    setCurrentBrand(brand);
    setIsDeleteDialogOpen(true);
  };

  // Handle form submission
  const handleFormSubmit = async (data: BrandFormData) => {
    try {
      if (currentBrand) {
        // Update existing brand
        await updateBrand(currentBrand.id, data);
        toast({
          title: "Brand Updated",
          description: "The brand has been updated successfully.",
        });
      } else {
        // Add new brand
        await addBrand(data);
        toast({
          title: "Brand Created",
          description: "The brand has been created successfully.",
        });
      }
      setIsFormOpen(false);
    } catch (error) {
      console.error('Failed to save brand:', error);
      toast({
        title: currentBrand ? "Update Failed" : "Creation Failed",
        description: `Failed to ${currentBrand ? 'update' : 'create'} brand. Please try again.`,
        variant: "destructive",
      });
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    try {
      if (currentBrand) {
        await deleteBrands([currentBrand.id]);
        toast({
          title: "Brand Deleted",
          description: "The brand has been deleted successfully.",
        });
      } else if (selectedBrands.length > 0) {
        await deleteBrands(selectedBrands);
        toast({
          title: "Brands Deleted",
          description: `${selectedBrands.length} brands have been deleted successfully.`,
        });
      }
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Failed to delete brand(s):', error);
      toast({
        title: "Deletion Failed",
        description: "Failed to delete brand(s). Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle search
  const handleSearch = () => {
    setFilters({ ...filters, search: searchQuery });
  };

  // Handle status filter change
  const handleStatusFilterChange = (status: string) => {
    setFilters({ ...filters, status: status as 'all' | 'active' | 'inactive' });
  };

  // Handle sort change
  const handleSortChange = (field: 'name' | 'products' | 'createdAt' | 'updatedAt') => {
    if (sort.field === field) {
      setSort({ field, direction: sort.direction === 'asc' ? 'desc' : 'asc' });
    } else {
      setSort({ field, direction: 'asc' });
    }
  };

  // Handle select all brands
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedBrands(brands.map(brand => brand.id));
    } else {
      setSelectedBrands([]);
    }
  };

  // Handle select brand
  const handleSelectBrand = (brandId: string, checked: boolean) => {
    if (checked) {
      setSelectedBrands([...selectedBrands, brandId]);
    } else {
      setSelectedBrands(selectedBrands.filter(id => id !== brandId));
    }
  };

  // Handle brand visibility toggle
  const handleBrandVisibilityToggle = async (brandId: string, isVisible: boolean) => {
    try {
      // Find the current brand to get its name
      const brandToUpdate = brands.find(brand => brand.id === brandId);
      if (!brandToUpdate) {
        throw new Error('Brand not found');
      }

      await updateBrand(brandId, {
        name: brandToUpdate.name, // Include required name property
        status: isVisible ? 'active' : 'inactive'
      });
      toast({
        title: isVisible ? "Brand Activated" : "Brand Deactivated",
        description: `The brand has been ${isVisible ? 'activated' : 'deactivated'}.`,
      });
    } catch (error) {
      console.error('Failed to update brand status:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update brand status. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    try {
      await refreshBrands();
      toast({
        title: "Brands Refreshed",
        description: "The brands list has been refreshed.",
      });
    } catch (error) {
      console.error('Failed to refresh brands:', error);
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh brands. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle export
  const handleExport = (format: 'csv' | 'excel') => {
    toast({
      title: `Export as ${format.toUpperCase()}`,
      description: `Brands have been exported as ${format.toUpperCase()}.`,
    });
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setPagination({ ...pagination, page });
  };

  // Get sort indicator
  const getSortIndicator = (field: 'name' | 'products' | 'createdAt' | 'updatedAt') => {
    if (sort.field !== field) return null;
    return sort.direction === 'asc' ? ' ↑' : ' ↓';
  };

  return (
    <div className="w-full" data-component-name="BrandsPageComponent">
      <PageHeader
        title="Brands"
        description="Manage your product brands"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={handleAddBrand}>
              <Plus className="h-4 w-4 mr-2" />
              Add Brand
            </Button>
          </div>
        }
      />

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex-1 flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search brands..."
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
            value={filters.status || 'all'}
            onValueChange={handleStatusFilterChange}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={() => handleExport('csv')}>
            <FileDown className="h-4 w-4 mr-2" />
            Export
          </Button>

          {selectedBrands.length > 0 && (
            <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete ({selectedBrands.length})
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-4" />
            <p className="text-lg">Loading brands...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-lg text-destructive">Error loading brands</p>
            <Button variant="outline" onClick={handleRefresh} className="mt-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      ) : brands.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 border rounded-lg">
          <p className="text-lg mb-4">No brands found</p>
          <Button onClick={handleAddBrand}>
            <Plus className="h-4 w-4 mr-2" />
            Add Brand
          </Button>
        </div>
      ) : (
        <div className="rounded-md overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={selectedBrands.length === brands.length && brands.length > 0}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSortChange('name')}
                >
                  <Tag className="h-4 w-4 mr-1" />
                  Brand{getSortIndicator('name')}
                </TableHead>
                <TableHead>
                  <Globe className="h-4 w-4 mr-1" />
                  Website
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSortChange('products')}
                >
                  <Package className="h-4 w-4 mr-1" />
                  Products{getSortIndicator('products')}
                </TableHead>
                <TableHead>
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Status
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSortChange('createdAt')}
                >
                  <Calendar className="h-4 w-4 mr-1" />
                  Created{getSortIndicator('createdAt')}
                </TableHead>
                <TableHead className="text-right">
                  <Settings className="h-4 w-4 mr-1" />
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {brands.map((brand) => (
                <TableRow key={brand.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedBrands.includes(brand.id)}
                      onCheckedChange={(checked) => handleSelectBrand(brand.id, !!checked)}
                      aria-label={`Select ${brand.name}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-3">
                      {brand.logo && (
                        <div className="h-8 w-8 rounded-md overflow-hidden">
                          <img
                            src={brand.logo}
                            alt={brand.name}
                            className="h-full w-full object-contain"
                          />
                        </div>
                      )}
                      <div>
                        <div>{brand.name}</div>
                        {brand.description && (
                          <div className="text-sm text-muted-foreground">{brand.description}</div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {brand.website ? (
                      <a
                        href={brand.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-600 hover:underline"
                      >
                        <Globe className="h-4 w-4 mr-1" />
                        {brand.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                      </a>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>{brand.products}</TableCell>
                  <TableCell>
                    <Badge variant={brand.status === 'active' ? 'default' : 'secondary'}>
                      {brand.status === 'active' ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(brand.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditBrand(brand)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleBrandVisibilityToggle(brand.id, brand.status !== 'active')}>
                          {brand.status === 'active' ? (
                            <>
                              <EyeOff className="h-4 w-4 mr-2" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <Eye className="h-4 w-4 mr-2" />
                              Activate
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDeleteBrand(brand)}
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
          <div className="mt-4 flex justify-between items-center px-4 py-2 bg-muted/20 rounded-md">
            <TablePagination
              currentPage={pagination.page}
              totalPages={Math.ceil(brands.length / pagination.pageSize)}
              totalItems={brands.length}
              pageSize={pagination.pageSize}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      )}

      {/* Brand Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{currentBrand ? 'Edit Brand' : 'Add New Brand'}</DialogTitle>
            <DialogDescription>
              {currentBrand
                ? 'Edit the details of the selected brand.'
                : 'Add a new brand to your product catalog.'}
            </DialogDescription>
          </DialogHeader>
          <BrandForm
            initialData={currentBrand ? {
              name: currentBrand.name,
              description: currentBrand.description,
              logo: currentBrand.logo,
              website: currentBrand.website,
              slug: currentBrand.slug,
              status: currentBrand.status,
              seo: {
                metaTitle: '',
                metaDescription: '',
                keywords: ''
              }
            } : {
              name: '',
              description: '',
              logo: '',
              website: '',
              status: 'active' as const,
              seo: {
                metaTitle: '',
                metaDescription: '',
                keywords: ''
              }
            }}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsFormOpen(false)}
            isEdit={!!currentBrand}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedBrands.length > 1
                ? `This will permanently delete ${selectedBrands.length} brands.`
                : currentBrand
                  ? `This will permanently delete "${currentBrand.name}".`
                  : 'This will permanently delete the selected brand.'}
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



// Export the component with both default and named exports for compatibility
export { BrandsPageComponent as BrandsPage };
export default BrandsPageComponent;
