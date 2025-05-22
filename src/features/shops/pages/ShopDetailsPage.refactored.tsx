import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/lib/toast";
import UnifiedErrorBoundary from '@/components/unified-error-boundary';

// Custom hooks
import { useShopData } from '../hooks/useShopData';

// Components
import { ShopDetailsHeader } from '../components/details/ShopDetailsHeader';
import { ShopMetricsSection } from '../components/details/ShopMetricsSection';
import { ShopDetailsTabs } from '../components/details/tabs/ShopDetailsTabs';
import { ShopInfoTab } from '../components/details/tabs/ShopInfoTab';
import { ShopInventoryTab } from '../components/details/tabs/ShopInventoryTab';
import { ShopStaffTab } from '../components/details/tabs/ShopStaffTab';
import { ShopSalesTab } from '../components/details/tabs/ShopSalesTab';
import { ShopPerformanceTab } from '../components/details/tabs/ShopPerformanceTab';
import { ShopSettingsTab } from '../components/details/tabs/ShopSettingsTab';

/**
 * Main shop details page component
 */
export function ShopDetailsPage() {
  const { shopId } = useParams<{ shopId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Use the shop data hook to fetch and manage shop data
  const {
    shop,
    loading,
    error,
    usingOfflineData,
    contextLoading,
    updateShopData,
    changeShopStatus,
    removeShop,
    refreshShop
  } = useShopData(shopId);

  // Handler for deleting the shop
  const handleDelete = async () => {
    if (!shop) return;

    const success = await removeShop();
    if (success) {
      navigate('/shops');
    }
  };

  return (
    <UnifiedErrorBoundary
      title="Error in Shop Details"
      showToast={true}
      fallback={(error, reset) => (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
          <h2 className="text-2xl font-bold">Error Loading Shop Details</h2>
          <p className="text-sm text-muted-foreground mb-4">
            There was an error rendering the shop details
          </p>
          <div className="flex gap-2">
            <Button onClick={() => navigate('/shops')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Shops
            </Button>
            <Button variant="outline" onClick={reset}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      )}
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] p-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <h3 className="text-lg font-medium">Loading Shop Details...</h3>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] p-4">
          <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-medium mb-2">Error Loading Shop</h3>
          <p className="text-muted-foreground text-center max-w-md mb-4">
            {error instanceof Error ? error.message : 'An unknown error occurred'}
          </p>
          <div className="flex gap-4">
            <Button onClick={() => navigate('/shops')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Shops
            </Button>
            <Button onClick={() => refreshShop()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        </div>
      ) : !shop ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
          <h2 className="text-2xl font-bold">Shop Not Found</h2>
          <p className="text-muted-foreground mb-4">The shop you are looking for does not exist or has been removed.</p>
          <Button onClick={() => navigate('/shops')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Shops
          </Button>
        </div>
      ) : (
        <div className="w-full pb-6 space-y-6">
          {/* Header */}
          <ShopDetailsHeader
            shop={shop}
            isLoading={contextLoading}
            onRefresh={refreshShop}
            onChangeStatus={changeShopStatus}
            onDelete={handleDelete}
          />

          {/* Key Metrics */}
          <ShopMetricsSection shop={shop} />

          {/* Tabs */}
          <ShopDetailsTabs
            shop={shop}
            defaultTab="info"
            infoTabContent={
              <ShopInfoTab 
                shop={shop} 
                updateShop={updateShopData} 
              />
            }
            inventoryTabContent={
              <ShopInventoryTab 
                shop={shop} 
              />
            }
            staffTabContent={
              <ShopStaffTab 
                shop={shop} 
              />
            }
            salesTabContent={
              <ShopSalesTab 
                shop={shop} 
              />
            }
            performanceTabContent={
              <ShopPerformanceTab 
                shop={shop} 
              />
            }
            settingsTabContent={
              <ShopSettingsTab 
                shop={shop} 
              />
            }
          />

          {/* Offline data warning */}
          {usingOfflineData && (
            <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mt-4">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-amber-800">Using Offline Data</h3>
                  <p className="text-sm text-amber-700 mt-1">
                    You are currently viewing cached data. Some features may be limited until connection is restored.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2 bg-white" 
                    onClick={refreshShop}
                  >
                    <RefreshCw className="h-3.5 w-3.5 mr-1" />
                    Try to Reconnect
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </UnifiedErrorBoundary>
  );
}
