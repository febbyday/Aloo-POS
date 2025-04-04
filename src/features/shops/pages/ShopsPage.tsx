// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useRealShopContext } from '../context/RealShopContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SHOP_STATUS, Shop } from '../types';
import { MapPinIcon, PhoneIcon, MailIcon, PlusIcon, StoreIcon, Trash2Icon, AlertCircleIcon, Edit } from 'lucide-react';
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
import { useToast } from '@/components/ui/use-toast';

export function ShopsPage() {
  const { shops, isLoading, error, fetchShops, deleteShop } = useRealShopContext();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [shopToDelete, setShopToDelete] = useState<Shop | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Fetch shops when component mounts
    fetchShops();
    
    // Set up a refresh interval to periodically check for new shops
    const refreshInterval = setInterval(() => {
      fetchShops();
    }, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(refreshInterval);
  }, [fetchShops]);

  // Render error state
  if (error) {
    return (
      <div className="w-full">
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <h2 className="text-red-800 text-lg font-semibold">Error loading shops</h2>
          <p className="text-red-700">
            {error instanceof Error 
              ? error.message 
              : typeof error === 'string'
                ? error
                : 'An unexpected error occurred'}
          </p>
          <div className="mt-4">
            <h3 className="text-red-800 font-medium">Troubleshooting steps:</h3>
            <ul className="list-disc pl-5 mt-2 text-red-700">
              <li>Check your internet connection</li>
              <li>Verify that the API server is running</li>
              <li>Check browser console for detailed error messages</li>
              <li>Try refreshing the page</li>
            </ul>
          </div>
          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => fetchShops()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Render the shop list
  return (
    <>
      <div className="w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Shops</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => fetchShops()}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </Button>
            <Button asChild>
              <Link to="/shops/new">
                <PlusIcon className="mr-2 h-4 w-4" />
                New Shop
              </Link>
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : shops.length === 0 ? (
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shops.map((shop) => (
              <Card key={shop.id} className="overflow-hidden border hover:shadow-md transition-all">
                <CardHeader className="pb-3 border-b">
                  <div className="flex justify-between items-start">
                    <Link to={`/shops/${shop.id}`} className="hover:text-primary transition-colors group">
                      <CardTitle className="text-xl flex items-center gap-2 group-hover:underline">
                        {shop.name}
                        <StoreIcon className="h-4 w-4 text-primary" />
                      </CardTitle>
                    </Link>
                    {renderStatusBadge(shop.status)}
                  </div>
                  <CardDescription className="flex items-center gap-1">
                    <span className="font-medium text-muted-foreground">ID:</span> {shop.code}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <Link to={`/shops/${shop.id}`} className="block hover:bg-muted/50 p-2 rounded-md transition-colors group">
                      <div className="flex items-start">
                        <MapPinIcon className="h-5 w-5 mr-2 mt-0.5 text-primary/70 group-hover:text-primary" />
                        <div>
                          <span className="font-medium text-sm block text-muted-foreground mb-0.5">Address</span>
                          <span className="text-sm">
                            {shop.address.street}, {shop.address.city}, {shop.address.state} {shop.address.postalCode}
                          </span>
                        </div>
                      </div>
                    </Link>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-start p-2 rounded-md hover:bg-muted/50 transition-colors group">
                        <PhoneIcon className="h-5 w-5 mr-2 mt-0.5 text-primary/70 group-hover:text-primary" />
                        <div>
                          <span className="font-medium text-sm block text-muted-foreground mb-0.5">Phone</span>
                          <span className="text-sm">{shop.phone}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-start p-2 rounded-md hover:bg-muted/50 transition-colors group">
                        <MailIcon className="h-5 w-5 mr-2 mt-0.5 text-primary/70 group-hover:text-primary" />
                        <div>
                          <span className="font-medium text-sm block text-muted-foreground mb-0.5">Email</span>
                          <span className="text-sm">{shop.email}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="flex justify-between pt-3 pb-3 bg-muted/20 border-t">
                  <Button variant="outline" asChild className="shadow-sm">
                    <Link to={`/shops/${shop.id}`}>
                      <StoreIcon className="h-4 w-4 mr-2" />
                      View Details
                    </Link>
                  </Button>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="shadow-sm hover:bg-primary/10"
                      asChild
                    >
                      <Link to={`/shops/${shop.id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="icon"
                      className="shadow-sm"
                      onClick={() => {
                        setShopToDelete(shop);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2Icon className="h-4 w-4" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <AlertCircleIcon className="h-5 w-5 mr-2 text-destructive" />
              Confirm Shop Deletion
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-semibold">{shopToDelete?.name}</span>? 
              This action cannot be undone and will permanently remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (shopToDelete?.id) {
                  try {
                    await deleteShop(shopToDelete.id);
                    toast({
                      title: "Shop Deleted",
                      description: `${shopToDelete.name} has been successfully deleted.`,
                    });
                  } catch (err) {
                    console.error('Error deleting shop:', err);
                    toast({
                      title: "Error",
                      description: "Failed to delete shop. Please try again.",
                      variant: "destructive",
                    });
                  }
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// Helper function to render status badge
function renderStatusBadge(status: SHOP_STATUS) {
  switch (status) {
    case SHOP_STATUS.ACTIVE:
      return <Badge variant="success">Active</Badge>;
    case SHOP_STATUS.INACTIVE:
      return <Badge variant="secondary">Inactive</Badge>;
    case SHOP_STATUS.MAINTENANCE:
      return <Badge variant="warning">Maintenance</Badge>;
    case SHOP_STATUS.CLOSED:
      return <Badge variant="destructive">Closed</Badge>;
    case SHOP_STATUS.PENDING:
      return <Badge>Pending</Badge>;
    default:
      return null;
  }
}
