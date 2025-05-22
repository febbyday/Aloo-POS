import { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/lib/toast";
import { useRealShopContext } from '../context/RealShopContext';
import { Shop } from '../types/shops.types';

/**
 * Custom hook to handle shop data fetching and updates
 *
 * @param shopId The ID of the shop to fetch
 * @returns Object with shop data and functions to manage it
 */
export function useShopData(shopId: string | undefined) {
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null | unknown>(null);
  const [usingOfflineData, setUsingOfflineData] = useState(false);
  const { toast } = useToast();

  // Destructure context values
  const {
    fetchShopById,
    updateShop,
    deleteShop,
    isLoading: contextLoading,
    error: operationError,
    updateShopStatus,
    fetchShops
  } = useRealShopContext();

  // Fetch shop details from API
  const fetchShopDetails = useCallback(async () => {
    if (!shopId) return;

    setLoading(true);
    setError(null);
    setUsingOfflineData(false);

    try {
      // fetchShopById now returns the shop data directly
      const shopData = await fetchShopById(shopId);
      setShop(shopData);

      // Check if we're using fallback/offline data
      if (shopData.id.startsWith('temp-')) {
        setUsingOfflineData(true);
      }
    } catch (err) {
      console.error('Error fetching shop with ID', shopId, ':', err);

      const errorMsg = err instanceof Error ? err.message : 'Failed to load shop details';
      setError(err);
      toast({
        title: "Error Loading Shop",
        description: errorMsg,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [shopId, fetchShopById, toast]);

  // Fetch shop data on mount and when shopId changes
  useEffect(() => {
    fetchShopDetails();
  }, [fetchShopDetails]);

  // Function to update shop data
  const updateShopData = async (data: Partial<Shop>, partial = false) => {
    if (!shop || !shopId) return null;

    try {
      const updatedShop = await updateShop(shopId, data, partial);
      if (updatedShop) {
        setShop(updatedShop);
      }
      return updatedShop;
    } catch (error) {
      console.error("Error updating shop:", error);
      throw error;
    }
  };

  // Function to update shop status
  const changeShopStatus = async (newStatus: Shop['status']) => {
    if (!shop || shop.status === newStatus) return;

    try {
      // Optimistically update the UI
      setShop(prev => prev ? {...prev, status: newStatus} : null);

      // Use the specialized updateShopStatus function
      const updatedShop = await updateShopStatus(shop.id, newStatus);

      if (updatedShop) {
        // Update the local shop state to immediately reflect the change
        setShop(updatedShop);

        // Refresh the shop list to update the cards in the background
        fetchShops().catch(e => console.error("Error refreshing shops list after status update:", e));

        toast({
          title: "Status Updated",
          description: `Shop status changed to ${newStatus}`,
        });
      }
    } catch (error) {
      console.error("Failed to update shop status:", error);

      // Revert to previous status in case of error
      if (shop) {
        const previousStatus = shop.status;
        setShop(prev => prev ? {...prev, status: previousStatus} : null);
      }

      toast({
        title: "Status Update Failed",
        description: error instanceof Error ? error.message : "Could not update shop status. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Function to delete shop
  const removeShop = async () => {
    if (!shop) return false;

    try {
      return await deleteShop(shop.id);
    } catch (err) {
      console.error("Error deleting shop:", err);
      return false;
    }
  };

  // Function to refresh shop data
  const refreshShop = async () => {
    return fetchShopDetails();
  };

  return {
    shop,
    setShop,
    loading,
    error,
    usingOfflineData,
    contextLoading,
    operationError,
    updateShopData,
    changeShopStatus,
    removeShop,
    refreshShop
  };
}
