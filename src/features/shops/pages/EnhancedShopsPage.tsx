import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRealShopContext } from '../context/RealShopContext';
import { Button } from '@/components/ui/button';
import { Shop } from '../types';
import { PlusIcon, StoreIcon, RefreshCw, Download } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/lib/toast';
import { LoadingState } from '@/components/ui/loading-state';
import { EnhancedShopsTable } from '../components/EnhancedShopsTable';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export function EnhancedShopsPage() {
  const { shops, isLoading, error, fetchShops, deleteShop } = useRealShopContext();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [shopToDelete, setShopToDelete] = useState<Shop | null>(null);
  const [initialLoad, setInitialLoad] = useState(true);
  const [selectedShops, setSelectedShops] = useState<Shop[]>([]);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch shops when component mounts
    fetchShops().finally(() => {
      // Set initialLoad to false after the first load completes
      setInitialLoad(false);
    });

    // Set up a refresh interval to periodically check for new shops
    const refreshInterval = setInterval(() => {
      fetchShops();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(refreshInterval);
  }, [fetchShops]);

  // Handle shop deletion
  const handleDeleteShop = async () => {
    if (!shopToDelete) return;

    try {
      await deleteShop(shopToDelete.id);
      toast.success(
        'Shop deleted',
        `${shopToDelete.name} has been deleted successfully.`
      );
      setDeleteDialogOpen(false);
      setShopToDelete(null);
    } catch (error) {
      toast.error(
        'Error',
        'Failed to delete shop. Please try again.'
      );
    }
  };

  // Handle bulk delete
  const handleBulkDelete = () => {
    if (selectedShops.length === 1) {
      // If only one shop is selected, use the single delete flow
      setShopToDelete(selectedShops[0]);
      setDeleteDialogOpen(true);
    } else if (selectedShops.length > 1) {
      // For multiple shops, we would need a bulk delete confirmation
      toast.warning(
        'Bulk delete not implemented',
        'Bulk delete functionality is not yet implemented.'
      );
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchShops();
    toast.info(
      'Refreshing shops',
      'The shop list is being refreshed.'
    );
  };

  // Handle export
  const handleExport = () => {
    toast.info(
      'Exporting shops',
      'The shop list export will be available shortly.'
    );
    // Implement actual export functionality here
  };

  // Handle shop click
  const handleShopClick = (shop: Shop) => {
    // This is handled by row selection in the table
  };

  // Handle shop double click (view details)
  const handleShopDoubleClick = (shop: Shop) => {
    navigate(`/shops/${shop.id}`);
  };

  // Handle settings click
  const handleSettingsClick = (shop: Shop) => {
    navigate(`/shops/${shop.id}/settings`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Shops</h1>
          <p className="text-muted-foreground">Manage your retail locations and warehouses</p>
        </div>
        <div className="flex gap-2">
          {selectedShops.length > 0 && (
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
            >
              Delete {selectedShops.length > 1 ? `(${selectedShops.length})` : ''}
            </Button>
          )}
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button asChild>
            <Link to="/shops/new">
              <PlusIcon className="mr-2 h-4 w-4" />
              New Shop
            </Link>
          </Button>
        </div>
      </div>

      {/* Error state */}
      {error && !isLoading && shops.length === 0 && (
        <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
          <div className="text-destructive text-xl">Error loading shops</div>
          <p>{error.message}</p>
          <Button onClick={() => fetchShops()}>Try Again</Button>
        </div>
      )}

      {/* Empty state - only show when not in initial load, not loading, no error, and no shops */}
      {!initialLoad && !isLoading && !error && shops.length === 0 && (
        <div className="text-center p-12 border border-dashed rounded-md">
          <StoreIcon className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-semibold">No Shops Found</h2>
          <p className="text-muted-foreground mt-2">
            You don't have any shops set up yet. Add your first shop to get started.
          </p>
          <Button className="mt-4" asChild>
            <Link to="/shops/new">
              <PlusIcon className="mr-2 h-4 w-4" />
              Add Shop
            </Link>
          </Button>
        </div>
      )}

      {/* Shop table */}
      {(shops.length > 0 || initialLoad || isLoading) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>All Shops</CardTitle>
            <CardDescription>
              {shops.length} {shops.length === 1 ? 'shop' : 'shops'} found
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <EnhancedShopsTable
              shops={shops}
              onRowSelectionChange={setSelectedShops}
              onRowClick={handleShopClick}
              onRowDoubleClick={handleShopDoubleClick}
              onSettingsClick={handleSettingsClick}
              isLoading={initialLoad || isLoading}
            />
          </CardContent>
        </Card>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the shop "{shopToDelete?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteShop} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
