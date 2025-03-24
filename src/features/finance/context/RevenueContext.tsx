// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Revenue, RevenueSchema, SalesData, SalesDataSchema } from "../types/finance.types";
import { toast } from "@/components/ui/use-toast";
import { useFinance } from "./FinanceContext";
import { v4 as uuidv4 } from "uuid";
import mockDataService from "../services/MockDataService";

// Original mock data generation function is now replaced with MockDataService
// const generateMockRevenue = (): Revenue[] => { ... };

interface RevenueContextType {
  revenues: Revenue[];
  addRevenue: (revenue: Omit<Revenue, "id">) => void;
  updateRevenue: (id: string, revenue: Partial<Revenue>) => void;
  deleteRevenue: (id: string) => void;
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

  // Load revenue data
  useEffect(() => {
    const loadRevenues = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Use MockDataService instead of inline mock data generation
        const mockRevenues = mockDataService.generateRevenues(30);
        setRevenues(mockRevenues);
        setError(null);
      } catch (err) {
        console.error("Failed to load revenues:", err);
        setError("Failed to load revenue data");
        setRevenues([]);
      } finally {
        setLoading(false);
      }
    };

    loadRevenues();
  }, []);

  // Add new revenue
  const addRevenue = (revenue: Omit<Revenue, "id">) => {
    try {
      const newRevenue = {
        ...revenue,
        id: uuidv4(),
      };
      
      // Validate with Zod
      const validatedRevenue = RevenueSchema.parse(newRevenue);
      
      setRevenues(prev => [validatedRevenue, ...prev]);
      
      toast({
        title: "Revenue added",
        description: "New revenue entry has been added successfully.",
        variant: "default",
      });
    } catch (err) {
      console.error("Failed to add revenue:", err);
      toast({
        title: "Error",
        description: "Failed to add revenue. Please check your input.",
        variant: "destructive",
      });
    }
  };

  // Update existing revenue
  const updateRevenue = (id: string, revenueUpdate: Partial<Revenue>) => {
    try {
      setRevenues(prev => 
        prev.map(rev => {
          if (rev.id === id) {
            const updated = { ...rev, ...revenueUpdate };
            // Validate with Zod
            return RevenueSchema.parse(updated);
          }
          return rev;
        })
      );
      
      toast({
        title: "Revenue updated",
        description: "Revenue entry has been updated successfully.",
        variant: "default",
      });
    } catch (err) {
      console.error("Failed to update revenue:", err);
      toast({
        title: "Error",
        description: "Failed to update revenue. Please check your input.",
        variant: "destructive",
      });
    }
  };

  // Delete revenue
  const deleteRevenue = (id: string) => {
    try {
      setRevenues(prev => prev.filter(rev => rev.id !== id));
      
      toast({
        title: "Revenue deleted",
        description: "Revenue entry has been deleted successfully.",
        variant: "default",
      });
    } catch (err) {
      console.error("Failed to delete revenue:", err);
      toast({
        title: "Error",
        description: "Failed to delete revenue. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Calculate derived data
  const totalRevenue = revenues.reduce((sum, rev) => sum + rev.amount, 0);
  
  const revenueByPaymentMethod = revenues.reduce((acc, rev) => {
    const method = rev.paymentMethod;
    acc[method] = (acc[method] || 0) + rev.amount;
    return acc;
  }, {} as Record<string, number>);
  
  const revenueBySource = revenues.reduce((acc, rev) => {
    const source = rev.source;
    acc[source] = (acc[source] || 0) + rev.amount;
    return acc;
  }, {} as Record<string, number>);
  
  // Calculate daily revenue for the last 30 days
  const dailyRevenue = (() => {
    const last30Days: { date: string; amount: number }[] = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      const dayRevenues = revenues.filter(rev => {
        const revDate = new Date(rev.date);
        return revDate.toISOString().split('T')[0] === dateString;
      });
      
      const totalForDay = dayRevenues.reduce((sum, rev) => sum + rev.amount, 0);
      
      last30Days.push({
        date: dateString,
        amount: totalForDay,
      });
    }
    
    return last30Days;
  })();

  // Generate sales data using MockDataService
  const salesData: SalesData[] = mockDataService.generateSalesData(revenues);

  // Calculate revenue by time of day
  const revenueByTimeOfDay = revenues.reduce((acc, rev) => {
    const hour = new Date(rev.date).getHours();
    let timeOfDay = '';
    
    if (hour >= 5 && hour < 12) {
      timeOfDay = 'Morning';
    } else if (hour >= 12 && hour < 17) {
      timeOfDay = 'Afternoon';
    } else if (hour >= 17 && hour < 21) {
      timeOfDay = 'Evening';
    } else {
      timeOfDay = 'Night';
    }
    
    acc[timeOfDay] = (acc[timeOfDay] || 0) + rev.amount;
    return acc;
  }, {} as Record<string, number>);

  // Calculate revenue by category (using source as category for now)
  const revenueByCategory = revenues.reduce((acc, rev) => {
    const category = rev.source;
    acc[category] = (acc[category] || 0) + rev.amount;
    return acc;
  }, {} as Record<string, number>);

  return (
    <RevenueContext.Provider
      value={{
        revenues,
        addRevenue,
        updateRevenue,
        deleteRevenue,
        loading,
        error,
        totalRevenue,
        revenueByPaymentMethod,
        revenueBySource,
        dailyRevenue,
        salesData,
        revenueByTimeOfDay,
        revenueByCategory,
      }}
    >
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
