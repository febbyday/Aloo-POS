// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { TaxRate, TaxRateSchema, TaxCategory, TaxReport } from "../types/finance.types";
import { toast } from "@/components/ui/use-toast";
import { useFinance } from "./FinanceContext";
import { v4 as uuidv4 } from "uuid";
import mockDataService from "../services/MockDataService";

// Default tax rates now come from MockDataService
// const defaultTaxRates: TaxRate[] = [ ... ];

interface TaxContextType {
  taxRates: TaxRate[];
  addTaxRate: (taxRate: Omit<TaxRate, "id">) => void;
  updateTaxRate: (id: string, taxRate: Partial<TaxRate>) => void;
  deleteTaxRate: (id: string) => void;
  getDefaultTaxRate: () => TaxRate | undefined;
  calculateTax: (amount: number, taxRateId?: string) => number;
  loading: boolean;
  error: string | null;
  collectedTaxes: Record<string, number>;
  taxCategories: TaxCategory[];
  taxReports: TaxReport[];
}

const TaxContext = createContext<TaxContextType | undefined>(undefined);

export const TaxProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { settings } = useFinance();
  const [taxRates, setTaxRates] = useState<TaxRate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use MockDataService for consistent mock data
  const taxCategories: TaxCategory[] = mockDataService.generateTaxCategories();
  const taxReports: TaxReport[] = mockDataService.generateTaxReports();
  
  // Load tax rates
  useEffect(() => {
    const loadTaxRates = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 600));
        
        // In a real app, this would be an API call
        // For now, use the MockDataService
        const savedTaxRates = localStorage.getItem("taxRates");
        if (savedTaxRates) {
          const parsedTaxRates = JSON.parse(savedTaxRates);
          setTaxRates(parsedTaxRates);
        } else {
          const defaultTaxRates = mockDataService.generateTaxRates();
          setTaxRates(defaultTaxRates);
          localStorage.setItem("taxRates", JSON.stringify(defaultTaxRates));
        }
        
        setError(null);
      } catch (err) {
        console.error("Failed to load tax rates:", err);
        setError("Failed to load tax rates");
        setTaxRates(mockDataService.generateTaxRates());
      } finally {
        setLoading(false);
      }
    };

    loadTaxRates();
  }, []);

  // Generate collected taxes based on tax rates
  const collectedTaxes: Record<string, number> = {
    "standard": 12500.75,
    "reduced": 3750.25,
    "zero": 0,
  };

  // Add new tax rate
  const addTaxRate = (taxRate: Omit<TaxRate, "id">) => {
    try {
      const newTaxRate = {
        ...taxRate,
        id: uuidv4(),
      };
      
      // Validate with Zod
      const validatedTaxRate = TaxRateSchema.parse(newTaxRate);
      
      // If this is set as default, update other tax rates
      if (validatedTaxRate.isDefault) {
        setTaxRates(prev => 
          prev.map(rate => ({
            ...rate,
            isDefault: false,
          }))
        );
      }
      
      setTaxRates(prev => [...prev, validatedTaxRate]);
      localStorage.setItem("taxRates", JSON.stringify([...taxRates, validatedTaxRate]));
      
      toast({
        title: "Tax rate added",
        description: "New tax rate has been added successfully.",
        variant: "default",
      });
    } catch (err) {
      console.error("Failed to add tax rate:", err);
      toast({
        title: "Error",
        description: "Failed to add tax rate. Please check your input.",
        variant: "destructive",
      });
    }
  };

  // Update existing tax rate
  const updateTaxRate = (id: string, taxRateUpdate: Partial<TaxRate>) => {
    try {
      let updatedRates: TaxRate[] = [];
      
      // If this is being set as default, update other tax rates
      if (taxRateUpdate.isDefault) {
        updatedRates = taxRates.map(rate => ({
          ...rate,
          isDefault: rate.id === id,
        }));
      } else {
        updatedRates = [...taxRates];
      }
      
      // Now update the specific tax rate
      updatedRates = updatedRates.map(rate => {
        if (rate.id === id) {
          const updated = { ...rate, ...taxRateUpdate };
          // Validate with Zod
          return TaxRateSchema.parse(updated);
        }
        return rate;
      });
      
      setTaxRates(updatedRates);
      localStorage.setItem("taxRates", JSON.stringify(updatedRates));
      
      toast({
        title: "Tax rate updated",
        description: "Tax rate has been updated successfully.",
        variant: "default",
      });
    } catch (err) {
      console.error("Failed to update tax rate:", err);
      toast({
        title: "Error",
        description: "Failed to update tax rate. Please check your input.",
        variant: "destructive",
      });
    }
  };

  // Delete tax rate
  const deleteTaxRate = (id: string) => {
    try {
      // Check if this is the default tax rate
      const isDefault = taxRates.find(rate => rate.id === id)?.isDefault;
      
      if (isDefault) {
        toast({
          title: "Cannot delete default tax rate",
          description: "Please set another tax rate as default before deleting this one.",
          variant: "destructive",
        });
        return;
      }
      
      const updatedRates = taxRates.filter(rate => rate.id !== id);
      setTaxRates(updatedRates);
      localStorage.setItem("taxRates", JSON.stringify(updatedRates));
      
      toast({
        title: "Tax rate deleted",
        description: "Tax rate has been deleted successfully.",
        variant: "default",
      });
    } catch (err) {
      console.error("Failed to delete tax rate:", err);
      toast({
        title: "Error",
        description: "Failed to delete tax rate. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Get default tax rate
  const getDefaultTaxRate = (): TaxRate | undefined => {
    return taxRates.find(rate => rate.isDefault);
  };

  // Calculate tax for a given amount
  const calculateTax = (amount: number, taxRateId?: string): number => {
    if (!settings.taxEnabled) {
      return 0;
    }
    
    let taxRate: TaxRate | undefined;
    
    if (taxRateId) {
      taxRate = taxRates.find(rate => rate.id === taxRateId);
    } else {
      taxRate = getDefaultTaxRate();
    }
    
    if (!taxRate) {
      return 0;
    }
    
    return (amount * taxRate.rate) / 100;
  };

  return (
    <TaxContext.Provider
      value={{
        taxRates,
        addTaxRate,
        updateTaxRate,
        deleteTaxRate,
        getDefaultTaxRate,
        calculateTax,
        loading,
        error,
        collectedTaxes,
        taxCategories,
        taxReports,
      }}
    >
      {children}
    </TaxContext.Provider>
  );
};

export const useTax = (): TaxContextType => {
  const context = useContext(TaxContext);
  if (context === undefined) {
    throw new Error("useTax must be used within a TaxProvider");
  }
  return context;
};
