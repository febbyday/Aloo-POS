import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api/api-config';
import { useToast } from '@/components/ui/use-toast';

export interface OrderItem {
  id: string;
  productId: string;
  product: {
    name: string;
    sku: string;
    price: number;
  };
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface OrderHistoryItem {
  id: string;
  orderNumber: string;
  date: string;
  createdAt: string;
  total: number;
  subtotal: number;
  tax: number;
  discount: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  items: OrderItem[];
}

interface UseCustomerHistoryOptions {
  customerId: string;
  autoLoad?: boolean;
}

export function useCustomerHistory({ customerId, autoLoad = true }: UseCustomerHistoryOptions) {
  const [history, setHistory] = useState<OrderHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    averageOrderValue: 0,
    returnRate: 0
  });
  
  const { toast } = useToast();

  const fetchHistory = useCallback(async () => {
    if (!customerId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.get(`customers/${customerId}/purchase-history`);
      
      if (response.data?.data) {
        const historyData = response.data.data;
        setHistory(historyData);
        
        // Calculate stats
        if (historyData.length > 0) {
          const totalSpent = historyData.reduce((sum, order) => sum + order.total, 0);
          const refundedOrders = historyData.filter(order => 
            order.status === 'REFUNDED' || order.status === 'refunded'
          ).length;
          
          setStats({
            totalOrders: historyData.length,
            totalSpent,
            averageOrderValue: totalSpent / historyData.length,
            returnRate: historyData.length > 0 ? (refundedOrders / historyData.length) * 100 : 0
          });
        }
      }
    } catch (err) {
      console.error('Error fetching customer purchase history:', err);
      setError(err as Error);
      toast({
        title: "Error loading purchase history",
        description: (err as Error).message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [customerId, toast]);
  
  useEffect(() => {
    if (autoLoad && customerId) {
      fetchHistory();
    }
  }, [autoLoad, customerId, fetchHistory]);
  
  return {
    history,
    loading,
    error,
    stats,
    refresh: fetchHistory
  };
} 