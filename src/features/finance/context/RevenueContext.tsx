/**
 * 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
 */
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Revenue, RevenueSchema, SalesData, SalesDataSchema } from "../types/finance.types";
import { toast } from "@/components/ui/use-toast";
import { useFinance } from "./FinanceContext";
import { v4 as uuidv4 } from "uuid";
import { apiClient } from "@/lib/api/api-client";
import { useApiTransition } from "@/hooks/useApiTransition";
import { withApiTransition } from "@/lib/api/api-transition-utils";

// Fallback data for when API is unavailable
const generateFallbackRevenues = (count: number = 30): Revenue[] => {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 3);
  
  const revenues: Revenue[] = [];
  const paymentMethods = ["cash", "credit_card", "debit_card", "mobile_payment", "bank_transfer"];
  const sources = ["in_store", "online", "phone", "third_party"];
  const categories = ["product_sales", "service_fees", "subscriptions", "gift_cards"];
  
  for (let i = 0; i < count; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + Math.floor(Math.random() * 90)); // Random day in last 3 months
    
    const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
    const source = sources[Math.floor(Math.random() * sources.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];
    
    const amount = Math.floor(Math.random() * 5000) + 100; // Between 100 and 5100
    
    revenues.push({
      id: uuidv4(),
      date: date.toISOString(),
      amount,
      paymentMethod,
      source,
      category,
      description: `Revenue from ${source} via ${paymentMethod}`,
      customer: Math.random() > 0.3 ? `CUST-${Math.floor(Math.random() * 1000)}` : undefined,
      orderId: `ORD-${Math.floor(Math.random() * 10000)}`,
      taxIncluded: Math.random() > 0.5,
      taxAmount: Math.random() > 0.5 ? Math.floor(amount * 0.1) : 0,
      notes: Math.random() > 0.8 ? "Important transaction" : undefined,
      createdAt: date.toISOString(),
      updatedAt: date.toISOString(),
    });
  }
  
  return revenues.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

// Fallback sales data for when API is unavailable
const generateFallbackSalesData = (): SalesData[] => {
  const salesData: SalesData[] = [];
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 3);
  
  // Generate 90 days of sales data
  for (let i = 0; i < 90; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    // Generate different sales metrics
    const totalSales = Math.floor(Math.random() * 10000) + 1000;
    const transactionCount = Math.floor(Math.random() * 100) + 10;
    const averageTicket = totalSales / transactionCount;
    
    salesData.push({
      id: uuidv4(),
      date: date.toISOString(),
      totalSales,
      transactionCount,
      averageTicket,
      productsSold: Math.floor(Math.random() * 200) + 50,
      discountsApplied: Math.floor(totalSales * (Math.random() * 0.2)),
      taxCollected: Math.floor(totalSales * 0.1),
      hourlyBreakdown: {
        morning: Math.floor(totalSales * 0.2),
        afternoon: Math.floor(totalSales * 0.5),
        evening: Math.floor(totalSales * 0.3),
      },
      categoryBreakdown: {
        product_sales: Math.floor(totalSales * 0.6),
        service_fees: Math.floor(totalSales * 0.25),
        subscriptions: Math.floor(totalSales * 0.1),
        gift_cards: Math.floor(totalSales * 0.05),
      },
      createdAt: date.toISOString(),
      updatedAt: date.toISOString(),
    });
  }
  
  return salesData;
};

interface RevenueContextType {
  revenues: Revenue[];
  addRevenue: (revenue: Omit<Revenue, "id">) => Promise<void>;
  updateRevenue: (id: string, revenue: Partial<Revenue>) => Promise<void>;
  deleteRevenue: (id: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  totalRevenue: number;
  revenueByPaymentMethod: Record<string, number>;
  revenueBySource: Record<string, number>;
  dailyRevenue: { date: string; amount: number }[];
  salesData: SalesData[];
  revenueByTimeOfDay: Record<string, number>;
  revenueByCategory: Record<string, number>;
}

const RevenueContext = createContext<RevenueContextType | undefined>(undefined);

export const RevenueProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { settings } = useFinance();
  const [revenues, setRevenues] = useState<Revenue[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use API transition for sales data
  const {
    data: salesData,
    isLoading: salesDataLoading,
    error: salesDataError
  } = useApiTransition<SalesData[]>({
    apiCall: () => apiClient.get('finance/sales-data'),
    fallbackData: generateFallbackSalesData(),
    dependencies: []
  });

  // Load revenue data
  useEffect(() => {
    const loadRevenues = async () => {
      try {
        setLoading(true);
        
        // Try to get revenues from API with transition fallback
        const response = await withApiTransition(
          () => apiClient.get('finance/revenues'),
          generateFallbackRevenues(30),
          { endpoint: 'finance/revenues' }
        );
        
        if (response.success) {
          setRevenues(response.data);
        } else {
          // If API call failed and we're using mock data
          if (response.isMock) {
            setRevenues(response.data);
          } else {
            throw new Error(response.error || "Failed to load revenues");
          }
        }
        
        setError(null);
      } catch (err) {
        console.error("Failed to load revenues:", err);
        setError(err instanceof Error ? err.message : "Failed to load revenue data");
        setRevenues(generateFallbackRevenues(30));
      } finally {
        setLoading(false);
      }
    };

    loadRevenues();
  }, []);

  // Add new revenue
  const addRevenue = async (revenue: Omit<Revenue, "id">) => {
    try {
      const newRevenue = {
        ...revenue,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Validate with Zod
      const validatedRevenue = RevenueSchema.parse(newRevenue);
      
      // Try to save to API with transition fallback
      const response = await withApiTransition(
        () => apiClient.post('finance/revenues', validatedRevenue),
        validatedRevenue,
        { endpoint: 'finance/revenues/create' }
      );
      
      // Update local state
      setRevenues(prev => [validatedRevenue, ...prev]);
      
      toast({
        title: "Revenue Added",
        description: "New revenue entry has been added successfully.",
      });
    } catch (err) {
      console.error("Failed to add revenue:", err);
      
      toast({
        title: "Error Adding Revenue",
        description: err instanceof Error ? err.message : "Failed to add revenue. Please check your input.",
        variant: "destructive",
      });
    }
  };

  // Update existing revenue
  const updateRevenue = async (id: string, revenueUpdate: Partial<Revenue>) => {
    try {
      // Find the revenue to update
      const existingRevenue = revenues.find(rev => rev.id === id);
      
      if (!existingRevenue) {
        throw new Error("Revenue not found");
      }
      
      // Combine existing data with updates
      const updatedRevenue = {
        ...existingRevenue,
        ...revenueUpdate,
        updatedAt: new Date().toISOString()
      };
      
      // Validate with Zod
      const validatedRevenue = RevenueSchema.parse(updatedRevenue);
      
      // Try to update via API with transition fallback
      const response = await withApiTransition(
        () => apiClient.put(`finance/revenues/${id}`, validatedRevenue),
        validatedRevenue,
        { endpoint: `finance/revenues/${id}` }
      );
      
      // Update local state
      setRevenues(prev => 
        prev.map(rev => rev.id === id ? validatedRevenue : rev)
      );
      
      toast({
        title: "Revenue Updated",
        description: "Revenue has been updated successfully.",
      });
    } catch (err) {
      console.error("Failed to update revenue:", err);
      
      toast({
        title: "Error Updating Revenue",
        description: err instanceof Error ? err.message : "Failed to update revenue. Please check your input.",
        variant: "destructive",
      });
    }
  };

  // Delete revenue
  const deleteRevenue = async (id: string) => {
    try {
      // Find the revenue to delete
      const revenueToDelete = revenues.find(rev => rev.id === id);
      
      if (!revenueToDelete) {
        throw new Error("Revenue not found");
      }
      
      // Try to delete via API with transition fallback
      const response = await withApiTransition(
        () => apiClient.delete(`finance/revenues/${id}`),
        undefined,
        { endpoint: `finance/revenues/${id}` }
      );
      
      // Update local state
      setRevenues(prev => prev.filter(rev => rev.id !== id));
      
      toast({
        title: "Revenue Deleted",
        description: "Revenue has been deleted successfully.",
      });
    } catch (err) {
      console.error("Failed to delete revenue:", err);
      
      toast({
        title: "Error Deleting Revenue",
        description: err instanceof Error ? err.message : "Failed to delete revenue. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Calculate total revenue
  const totalRevenue = revenues.reduce(
    (total, revenue) => total + revenue.amount, 
    0
  );

  // Calculate revenue by payment method
  const revenueByPaymentMethod = revenues.reduce((acc, revenue) => {
    const method = revenue.paymentMethod || 'other';
    acc[method] = (acc[method] || 0) + revenue.amount;
    return acc;
  }, {} as Record<string, number>);

  // Calculate revenue by source
  const revenueBySource = revenues.reduce((acc, revenue) => {
    const source = revenue.source || 'other';
    acc[source] = (acc[source] || 0) + revenue.amount;
    return acc;
  }, {} as Record<string, number>);

  // Calculate daily revenue for charts
  const dailyRevenue = React.useMemo(() => {
    const days: Record<string, number> = {};
    
    revenues.forEach(revenue => {
      const date = new Date(revenue.date);
      const dayKey = date.toISOString().split('T')[0]; // YYYY-MM-DD format
      
      days[dayKey] = (days[dayKey] || 0) + revenue.amount;
    });
    
    // Convert to array and sort by date
    return Object.entries(days)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [revenues]);

  // Calculate revenue by time of day (from sales data)
  const revenueByTimeOfDay = React.useMemo(() => {
    if (!salesData || salesData.length === 0) {
      return { morning: 0, afternoon: 0, evening: 0 };
    }
    
    return salesData.reduce((acc, day) => {
      if (day.hourlyBreakdown) {
        acc.morning = (acc.morning || 0) + (day.hourlyBreakdown.morning || 0);
        acc.afternoon = (acc.afternoon || 0) + (day.hourlyBreakdown.afternoon || 0);
        acc.evening = (acc.evening || 0) + (day.hourlyBreakdown.evening || 0);
      }
      return acc;
    }, { morning: 0, afternoon: 0, evening: 0 } as Record<string, number>);
  }, [salesData]);

  // Calculate revenue by category (from sales data)
  const revenueByCategory = React.useMemo(() => {
    if (!salesData || salesData.length === 0) {
      return { 
        product_sales: 0, 
        service_fees: 0, 
        subscriptions: 0, 
        gift_cards: 0 
      };
    }
    
    return salesData.reduce((acc, day) => {
      if (day.categoryBreakdown) {
        // Add each category to the accumulator
        Object.entries(day.categoryBreakdown).forEach(([category, amount]) => {
          acc[category] = (acc[category] || 0) + amount;
        });
      }
      return acc;
    }, {} as Record<string, number>);
  }, [salesData]);

  const value: RevenueContextType = {
    revenues,
    addRevenue,
    updateRevenue,
    deleteRevenue,
    loading: loading || salesDataLoading,
    error: error || salesDataError?.message || null,
    totalRevenue,
    revenueByPaymentMethod,
    revenueBySource,
    dailyRevenue,
    salesData: salesData || [],
    revenueByTimeOfDay,
    revenueByCategory,
  };

  return (
    <RevenueContext.Provider value={value}>
      {children}
    </RevenueContext.Provider>
  );
};

export const useRevenue = (): RevenueContextType => {
  const context = useContext(RevenueContext);
  if (context === undefined) {
    throw new Error("useRevenue must be used within a RevenueProvider");
  }
  return context;
};

export default RevenueContext;
