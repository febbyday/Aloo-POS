import { useState, useEffect } from 'react'
import { 
  Building2, 
  Settings, 
  Users, 
  BarChart3,
  Search,
  Plus,
  RefreshCw,
  Eye,
  Edit,
  Trash,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from "@/components/ui/select"
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ShopsTable } from '../components/ShopsTable'
import { ShopDialog } from '../components/ShopDialog'
import { ShopImportDialog } from '../components/ShopImportDialog'
import { useToast } from '@/components/ui/use-toast'
import { FieldHelpTooltip } from '@/components/ui/help-tooltip'
import { OperationButton } from '@/components/ui/action-feedback'
import { ShopsToolbar } from '../components/ShopsToolbar'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from '@/lib/utils'
import { useNavigate } from 'react-router-dom'
import { Shop } from '../types/shops.types'
import { useShops } from '../hooks/useShops'
import { useShopOperations } from '../hooks/useShopOperations'
import { ShopImportData, convertImportDataToShop, downloadShopsExport } from '../services/shopImportService'
import { StaffProvider } from '@/features/staff/context/StaffContext'
import { ErrorBoundary } from '@/components/unified-error-boundary'

interface ShopFilter {
  search?: string;
  type?: Shop['type'] | 'all';
  status?: Shop['status'] | 'all';
}

// Column definitions
const columns = [
  { 
    id: 'name', 
    label: 'Shop Name',
    icon: Building2
  },
  { 
    id: 'location', 
    label: 'Location',
    icon: Building2
  },
  { 
    id: 'type', 
    label: 'Type',
    icon: Settings
  },
  { 
    id: 'status', 
    label: 'Status',
    icon: BarChart3
  },
  { 
    id: 'staff', 
    label: 'Staff',
    icon: Users
  }
];

// Wrapper component to add providers
function ShopsPageContent() {
  // Use the useShops hook for fetching shops
  const { 
    items: shops, 
    loading: loadingShops, 
    error: shopsError, 
    refresh: refreshShops 
  } = useShops({
    autoLoad: true
  });
  
  // Use the useShopOperations hook for managing shops
  const { deleteShop, createShop, loading: operationLoading } = useShopOperations();
  
  const [filters, setFilters] = useState<ShopFilter>({
    search: '',
    type: 'all',
    status: 'all',
  });
  const [selectedShops, setSelectedShops] = useState<string[]>([]);
  const [shopDialog, setShopDialog] = useState<{ open: boolean; mode: 'create' | 'edit'; shop?: Shop }>({ 
    open: false, 
    mode: 'create' 
  });
  const [importDialog, setImportDialog] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ column: string; direction: 'asc' | 'desc' } | null>({
    column: 'name',
    direction: 'asc'
  });
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Handles saving shops - both creating new ones and updating existing ones
  const handleSaveShop = (shop: Shop) => {
    // After successful save, refresh the shops list from the API
    refreshShops();
    
    // Close the dialog after saving
    setShopDialog(prev => ({ ...prev, open: false }));
    
    // Show success toast
    toast({
      title: `Shop ${shopDialog.mode === 'create' ? 'created' : 'updated'} successfully`,
      description: `${shop.name} has been ${shopDialog.mode === 'create' ? 'added to' : 'updated in'} your shops.`,
    });
  };

  const handleSort = (column: string) => {
    if (sortConfig && sortConfig.column === column) {
      // Toggle direction if clicking the same column
      setSortConfig({
        column,
        direction: sortConfig.direction === 'asc' ? 'desc' : 'asc'
      });
    } else {
      // Default to ascending for a new column
      setSortConfig({
        column,
        direction: 'asc'
      });
    }
  };

  // Apply filtering
  const filteredShops = shops.filter(shop => {
    const matchesSearch = !filters.search || 
      shop.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      shop.location.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesType = !filters.type || filters.type === 'all' || shop.type === filters.type;
    const matchesStatus = !filters.status || filters.status === 'all' || shop.status === filters.status;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // Apply sorting
  const sortedShops = [...filteredShops].sort((a, b) => {
    if (!sortConfig) return 0;
    
    const { column, direction } = sortConfig;
    const aValue = a[column as keyof Shop];
    const bValue = b[column as keyof Shop];
    
    // Handle different types of values
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return direction === 'asc' 
        ? aValue.localeCompare(bValue) 
        : bValue.localeCompare(aValue);
    } else if (aValue instanceof Date && bValue instanceof Date) {
      return direction === 'asc' 
        ? aValue.getTime() - bValue.getTime() 
        : bValue.getTime() - aValue.getTime();
    } else if (typeof aValue === 'number' && typeof bValue === 'number') {
      return direction === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    return 0;
  });

  const handleRefresh = () => {
    refreshShops();
    toast({
      title: "Refreshing data...",
      description: "Your shops data is being updated."
    });
  };

  const handleNewShop = () => {
    // Open the shop dialog in create mode
    setShopDialog({
      open: true,
      mode: 'create'
    });
  };

  const handleImportShops = () => {
    // Open the import dialog
    setImportDialog(true);
  };

  const handleImportSubmit = async (shopsData: ShopImportData[]) => {
    try {
      // Convert imported data to Shop format using the utility function
      const processedShops = shopsData.map(shopData => convertImportDataToShop(shopData));
      
      console.log(`Processing ${shopsData.length} shops for import:`, processedShops);
      
      // Filter out shops that already exist (same name + location)
      const uniqueShops: CreateShopInput[] = [];
      const duplicateShops: ShopImportData[] = [];
      
      // Check each shop against existing shops and also against other shops in current import
      // to catch duplicates both ways
      const existingNameLocations = new Set(shops.map(shop => 
        `${shop.name.toLowerCase()}|${shop.location.toLowerCase()}`
      ));
      
      const importedNameLocations = new Set<string>();
      
      for (const shop of processedShops) {
        const shopKey = `${shop.name.toLowerCase()}|${shop.location.toLowerCase()}`;
        
        // Check if shop already exists in database or is a duplicate in current import
        if (existingNameLocations.has(shopKey) || importedNameLocations.has(shopKey)) {
          duplicateShops.push(shop);
        } else {
          uniqueShops.push(shop);
          importedNameLocations.add(shopKey);
        }
      }
      
      if (duplicateShops.length > 0) {
        toast({
          title: "Duplicate shops detected",
          description: `${duplicateShops.length} shop(s) were skipped because they already exist.`,
          variant: "warning"
        });
        
        if (uniqueShops.length === 0) {
          throw new Error("All shops in the import already exist. No new shops were created.");
        }
      }
      
      // Create shops for each unique imported item
      const creationPromises = uniqueShops.map(shopData => createShop(shopData));
      
      // Wait for all shops to be created
      const results = await Promise.all(creationPromises);
      console.log(`Successfully created ${results.length} unique shops`);
      
      // Refresh the shops list
      refreshShops();
      
      // No need to show toast here since ShopImportDialog already shows one
    } catch (error) {
      console.error("Error importing shops:", error);
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
      throw error; // Re-throw to be handled by the import dialog
    }
  };

  const handleViewDetails = () => {
    if (selectedShops.length === 1) {
      navigate(`/shops/${selectedShops[0]}`);
    }
  };

  const handleEditShop = () => {
    if (selectedShops.length === 1) {
      const selectedShop = shops.find(shop => shop.id === selectedShops[0]);
      
      if (selectedShop) {
        setShopDialog({
          open: true,
          mode: 'edit',
          shop: selectedShop
        });
      }
    }
  };

  const handleDeleteShops = async () => {
    // Check if any shops are selected
    if (selectedShops.length === 0) {
      toast({
        title: "No shops selected",
        description: "Please select at least one shop to delete.",
        variant: "destructive"
      });
      return;
    }
    
    // Loop through each selected shop and delete it
    const deletionPromises = selectedShops.map(shopId => deleteShop(shopId));
    const results = await Promise.all(deletionPromises);
    
    // Check if all deletions were successful
    const allSuccessful = results.every(Boolean);
    
    if (allSuccessful) {
      // Clear selection
      setSelectedShops([]);
      
      // Refresh shops list
      refreshShops();
      
      toast({
        title: "Shops deleted",
        description: `Successfully deleted ${selectedShops.length} shop(s).`,
      });
    } else {
      toast({
        title: "Deletion partially failed",
        description: "Some shops could not be deleted. Please try again.",
        variant: "destructive"
      });
    }
  };

  const toggleShopSelection = (shopId: string) => {
    setSelectedShops(prev => {
      if (prev.includes(shopId)) {
        return prev.filter(id => id !== shopId);
      } else {
        return [...prev, shopId];
      }
    });
  };

  const toggleAllSelection = () => {
    if (selectedShops.length === sortedShops.length) {
      // If all are selected, deselect all
      setSelectedShops([]);
    } else {
      // Otherwise, select all
      setSelectedShops(sortedShops.map(shop => shop.id));
    }
  };

  // Handle single row click (selection will happen in the Table component)
  const handleRowClick = (_shop: Shop) => {
    // This function can remain empty as direct selection is handled in the ShopsTable component
    // or you can add additional functionality for row clicks that aren't handled in the table
  };

  // Handle navigation to shop details
  const handleViewShopDetails = (shop: Shop) => {
    navigate(`/shops/${shop.id}`);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({
      ...prev,
      search: e.target.value
    }));
  };

  const handleTypeFilterChange = (value: string) => {
    setFilters(prev => ({
      ...prev,
      type: value as Shop['type'] | 'all'
    }));
  };

  const handleStatusFilterChange = (value: string) => {
    setFilters(prev => ({
      ...prev,
      status: value as Shop['status'] | 'all'
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      type: 'all',
      status: 'all',
    });
  };

  const handleExport = () => {
    try {
      // Export all shops that match the current filters
      downloadShopsExport(filteredShops);
      
      toast({
        title: "Export Successful",
        description: `${filteredShops.length} shops exported to CSV file.`,
      });
    } catch (error) {
      console.error("Error exporting shops:", error);
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shops</h1>
          <p className="text-muted-foreground">
            Manage your retail shop locations
          </p>
        </div>
      </div>

      {/* Shops Toolbar */}
      <ShopsToolbar 
        onNewShop={handleNewShop} 
        onRefresh={handleRefresh}
        onViewDetails={handleViewDetails}
        onEditShop={handleEditShop}
        onDelete={handleDeleteShops}
        onExport={handleExport}
        onImport={handleImportShops}
        onSettings={() => {}}
        onClearFilters={handleClearFilters}
        searchValue={filters.search}
        onSearchChange={(value) => setFilters(prev => ({ ...prev, search: value }))}
        selectedCount={selectedShops.length}
        filtersActive={filters.search !== '' || filters.type !== 'all' || filters.status !== 'all'}
        selectedShopId={selectedShops.length === 1 ? selectedShops[0] : null}
        loading={loadingShops || operationLoading}
      />

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search shops..."
                  className="pl-8"
                  value={filters.search}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
            <div className="w-full md:w-[180px]">
              <Select 
                value={filters.type || 'all'} 
                onValueChange={handleTypeFilterChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="warehouse">Warehouse</SelectItem>
                  <SelectItem value="outlet">Outlet</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-[180px]">
              <Select 
                value={filters.status || 'all'} 
                onValueChange={handleStatusFilterChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              variant="ghost" 
              className="w-full md:w-auto"
              onClick={handleClearFilters}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Shops Table */}
      <Card>
        <CardContent className="p-0">
          {loadingShops ? (
            <div className="py-10 text-center">
              <RefreshCw className="h-8 w-8 mx-auto mb-4 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading shops...</p>
            </div>
          ) : shopsError ? (
            <div className="py-10 text-center text-destructive">
              <p className="font-medium">Error loading shops</p>
              <p className="text-sm mt-1">{shopsError.message}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-4"
                onClick={() => refreshShops()}
              >
                Retry
              </Button>
            </div>
          ) : sortedShops.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">
              {shops.length === 0 ? (
                <>
                  <Building2 className="h-8 w-8 mx-auto mb-4" />
                  <p>No shops found</p>
                  <p className="text-sm mt-1">Start by adding your first shop.</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-4"
                    onClick={handleNewShop}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Shop
                  </Button>
                </>
              ) : (
                <>
                  <p>No shops match your filters</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-4"
                    onClick={handleClearFilters}
                  >
                    Clear Filters
                  </Button>
                </>
              )}
            </div>
          ) : (
            <ShopsTable 
              shops={sortedShops}
              columns={columns}
              selectedShops={selectedShops}
              onSelectShop={toggleShopSelection}
              onSelectAll={toggleAllSelection}
              sortConfig={sortConfig}
              onSort={handleSort}
              onRowClick={handleRowClick}
              onViewShopDetails={handleViewShopDetails}
            />
          )}
        </CardContent>
      </Card>

      {shopDialog.open && (
        <ShopDialog 
          open={shopDialog.open}
          mode={shopDialog.mode}
          shop={shopDialog.shop}
          onClose={() => setShopDialog({ open: false, mode: 'create' })}
          onSave={handleSaveShop}
        />
      )}
      {importDialog && (
        <ShopImportDialog 
          isOpen={importDialog}
          onClose={() => setImportDialog(false)}
          onImport={handleImportSubmit}
        />
      )}
    </div>
  )
}

// Export ShopsPage with the StaffProvider
export function ShopsPage() {
  return (
    <ErrorBoundary>
      <StaffProvider>
        <ShopsPageContent />
      </StaffProvider>
    </ErrorBoundary>
  );
}
