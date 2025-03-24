/**
 * useShopOperations Hook
 * 
 * This hook provides operations for managing individual shops using the shops service.
 */

import { useState } from 'react';
import { shopsService } from '../services/shopsService';
import { Shop } from '../types/shops.types';
import { useToast } from '@/components/ui/use-toast';

export interface UseShopOperationsResult {
  loading: boolean;
  error: Error | null;
  createShop: (shopData: Omit<Shop, 'id' | 'createdAt' | 'lastSync'>) => Promise<Shop | null>;
  updateShop: (id: string, shopData: Partial<Shop>) => Promise<Shop | null>;
  deleteShop: (id: string) => Promise<boolean>;
  refreshShop: (id: string) => Promise<Shop | null>;
}

export function useShopOperations(): UseShopOperationsResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  /**
   * Create a new shop
   */
  const createShop = async (shopData: Omit<Shop, 'id' | 'createdAt' | 'lastSync'>): Promise<Shop | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const newShop = await shopsService.create(shopData);
      toast({
        title: "Shop created",
        description: `${newShop.name} has been successfully created.`,
      });
      return newShop;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create shop');
      setError(error);
      toast({
        title: "Error creating shop",
        description: error.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update an existing shop
   */
  const updateShop = async (id: string, shopData: Partial<Shop>): Promise<Shop | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedShop = await shopsService.update(id, shopData);
      toast({
        title: "Shop updated",
        description: `${updatedShop.name} has been successfully updated.`,
      });
      return updatedShop;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(`Failed to update shop with ID ${id}`);
      setError(error);
      toast({
        title: "Error updating shop",
        description: error.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Delete a shop
   */
  const deleteShop = async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const success = await shopsService.delete(id);
      if (success) {
        toast({
          title: "Shop deleted",
          description: "Shop has been successfully deleted.",
        });
      } else {
        throw new Error(`Failed to delete shop with ID ${id}`);
      }
      return success;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(`Failed to delete shop with ID ${id}`);
      setError(error);
      toast({
        title: "Error deleting shop",
        description: error.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Refresh a shop's data
   */
  const refreshShop = async (id: string): Promise<Shop | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const shop = await shopsService.fetchById(id);
      return shop;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(`Failed to refresh shop with ID ${id}`);
      setError(error);
      toast({
        title: "Error refreshing shop data",
        description: error.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createShop,
    updateShop,
    deleteShop,
    refreshShop
  };
} 