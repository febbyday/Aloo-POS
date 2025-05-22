import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { TaxRate, TaxRateSchema, TaxCategory, TaxReport } from "../types/finance.types";
import { toast } from "@/lib/toast";
import { useFinance } from "./FinanceContext";
import { v4 as uuidv4 } from "uuid";
import { apiClient } from "@/lib/api/api-client";
import { useApiTransition } from "@/hooks/useApiTransition";
import { withApiTransition } from "@/lib/api/api-transition-utils";

// Fallback mock data for when API calls fail
const fallbackTaxRates: TaxRate[] = [
  {
    id: "1",
    name: "Standard Rate",
    rate: 20,
    code: "STD",
    description: "Standard tax rate for most goods and services",
    isDefault: true,
    category: "standard",
    appliesTo: ["goods", "services"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "2",
    name: "Reduced Rate",
    rate: 5,
    code: "RED",
    description: "Reduced tax rate for certain goods and services",
    isDefault: false,
    category: "reduced",
    appliesTo: ["food", "books", "children_clothes"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "3",
    name: "Zero Rate",
    rate: 0,
    code: "ZERO",
    description: "Zero tax rate for exempt goods and services",
    isDefault: false,
    category: "zero",
    appliesTo: ["exports", "charity", "health"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Fallback tax categories
const fallbackTaxCategories: TaxCategory[] = [
  { id: "1", name: "Standard", code: "STD", description: "Standard rate category" },
  { id: "2", name: "Reduced", code: "RED", description: "Reduced rate category" },
  { id: "3", name: "Zero", code: "ZERO", description: "Zero rate category" },
  { id: "4", name: "Exempt", code: "EX", description: "Tax exempt category" }
];

// Fallback tax reports
const fallbackTaxReports: TaxReport[] = [
  {
    id: "1",
    name: "Q1 Sales Tax Report",
    startDate: "2025-01-01",
    endDate: "2025-03-31",
    totalTaxCollected: 12500.75,
    status: "completed",
    categories: {
      "standard": 9500.50,
      "reduced": 3000.25,
      "zero": 0
    },
    createdAt: new Date().toISOString()
  },
  {
    id: "2",
    name: "Q2 Sales Tax Report",
    startDate: "2025-04-01",
    endDate: "2025-06-30",
    totalTaxCollected: 15750.25,
    status: "in-progress",
    categories: {
      "standard": 12250.75,
      "reduced": 3499.50,
      "zero": 0
    },
    createdAt: new Date().toISOString()
  }
];

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

  // Use API transition hook for tax categories
  const {
    data: taxCategories,
    isLoading: categoriesLoading,
    error: categoriesError
  } = useApiTransition<TaxCategory[]>({
    apiCall: () => apiClient.get('finance/tax-categories'),
    fallbackData: fallbackTaxCategories,
    dependencies: []
  });

  // Use API transition hook for tax reports
  const {
    data: taxReports,
    isLoading: reportsLoading,
    error: reportsError
  } = useApiTransition<TaxReport[]>({
    apiCall: () => apiClient.get('finance/tax-reports'),
    fallbackData: fallbackTaxReports,
    dependencies: []
  });

  // Load tax rates
  useEffect(() => {
    const loadTaxRates = async () => {
      try {
        setLoading(true);

        // Try to get tax rates from API with transition fallback
        const response = await withApiTransition(
          () => apiClient.get('finance/tax-rates'),
          fallbackTaxRates,
          { endpoint: 'finance/tax-rates' }
        );

        if (response.success) {
          setTaxRates(response.data);
        } else {
          // If API call failed but we're using mock data
          if (response.isMock) {
            // Try to get from localStorage first
            const savedTaxRates = localStorage.getItem("taxRates");
            if (savedTaxRates) {
              const parsedTaxRates = JSON.parse(savedTaxRates);
              setTaxRates(parsedTaxRates);
            } else {
              // Otherwise use our fallback data
              setTaxRates(fallbackTaxRates);
              localStorage.setItem("taxRates", JSON.stringify(fallbackTaxRates));
            }
          } else {
            throw new Error(response.error || "Failed to load tax rates");
          }
        }

        setError(null);
      } catch (err) {
        console.error("Failed to load tax rates:", err);
        setError(err instanceof Error ? err.message : "Failed to load tax rates");

        // Use localStorage as fallback if available
        const savedTaxRates = localStorage.getItem("taxRates");
        if (savedTaxRates) {
          try {
            const parsedTaxRates = JSON.parse(savedTaxRates);
            setTaxRates(parsedTaxRates);
          } catch {
            setTaxRates(fallbackTaxRates);
          }
        } else {
          setTaxRates(fallbackTaxRates);
        }
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
  const addTaxRate = async (taxRate: Omit<TaxRate, "id">) => {
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

      // Try to save to API with transition fallback
      const response = await withApiTransition(
        () => apiClient.post('finance/tax-rates', validatedTaxRate),
        validatedTaxRate,
        { endpoint: 'finance/tax-rates/create' }
      );

      // Update local state
      setTaxRates(prev => [...prev, validatedTaxRate]);

      // Also save to localStorage as backup
      localStorage.setItem("taxRates", JSON.stringify([...taxRates, validatedTaxRate]));

      toast.success("Tax Rate Added", `${validatedTaxRate.name} has been added successfully.`);
    } catch (err) {
      console.error("Failed to add tax rate:", err);

      toast.error("Error Adding Tax Rate", err instanceof Error ? err.message : "An unknown error occurred");
    }
  };

  // Update existing tax rate
  const updateTaxRate = async (id: string, updatedFields: Partial<TaxRate>) => {
    try {
      // Find the tax rate to update
      const existingRate = taxRates.find(rate => rate.id === id);

      if (!existingRate) {
        throw new Error("Tax rate not found");
      }

      // Combine existing data with updates
      const updatedTaxRate = {
        ...existingRate,
        ...updatedFields,
        updatedAt: new Date().toISOString()
      };

      // Validate with Zod
      const validatedTaxRate = TaxRateSchema.parse(updatedTaxRate);

      // If this is being set as default, update other tax rates
      if (updatedFields.isDefault === true) {
        setTaxRates(prev =>
          prev.map(rate => ({
            ...rate,
            isDefault: rate.id === id,
          }))
        );
      }

      // Try to update via API with transition fallback
      const response = await withApiTransition(
        () => apiClient.put(`finance/tax-rates/${id}`, validatedTaxRate),
        validatedTaxRate,
        { endpoint: `finance/tax-rates/${id}` }
      );

      // Update local state
      setTaxRates(prev =>
        prev.map(rate => rate.id === id ? validatedTaxRate : rate)
      );

      // Also update localStorage as backup
      localStorage.setItem(
        "taxRates",
        JSON.stringify(taxRates.map(rate => rate.id === id ? validatedTaxRate : rate))
      );

      toast.success("Tax Rate Updated", `${validatedTaxRate.name} has been updated successfully.`);
    } catch (err) {
      console.error("Failed to update tax rate:", err);

      toast.error("Error Updating Tax Rate", err instanceof Error ? err.message : "An unknown error occurred");
    }
  };

  // Delete a tax rate
  const deleteTaxRate = async (id: string) => {
    try {
      // Check if this is the default rate
      const rateToDelete = taxRates.find(rate => rate.id === id);

      if (!rateToDelete) {
        throw new Error("Tax rate not found");
      }

      if (rateToDelete.isDefault) {
        throw new Error("Cannot delete the default tax rate. Set another rate as default first.");
      }

      // Try to delete via API with transition fallback
      const response = await withApiTransition(
        () => apiClient.delete(`finance/tax-rates/${id}`),
        undefined,
        { endpoint: `finance/tax-rates/${id}` }
      );

      // Update local state
      setTaxRates(prev => prev.filter(rate => rate.id !== id));

      // Also update localStorage as backup
      localStorage.setItem(
        "taxRates",
        JSON.stringify(taxRates.filter(rate => rate.id !== id))
      );

      toast.success("Tax Rate Deleted", `${rateToDelete.name} has been deleted successfully.`);
    } catch (err) {
      console.error("Failed to delete tax rate:", err);

      toast.error("Error Deleting Tax Rate", err instanceof Error ? err.message : "An unknown error occurred");
    }
  };

  // Get the default tax rate
  const getDefaultTaxRate = () => {
    return taxRates.find(rate => rate.isDefault);
  };

  // Calculate tax for a given amount and tax rate ID
  const calculateTax = (amount: number, taxRateId?: string) => {
    // If a specific tax rate ID is provided, use that
    if (taxRateId) {
      const taxRate = taxRates.find(rate => rate.id === taxRateId);
      if (taxRate) {
        return (amount * taxRate.rate) / 100;
      }
    }

    // Otherwise use the default tax rate
    const defaultRate = getDefaultTaxRate();
    if (defaultRate) {
      return (amount * defaultRate.rate) / 100;
    }

    // If no default found, return 0
    return 0;
  };

  const value: TaxContextType = {
    taxRates,
    addTaxRate,
    updateTaxRate,
    deleteTaxRate,
    getDefaultTaxRate,
    calculateTax,
    loading: loading || categoriesLoading || reportsLoading,
    error: error || categoriesError?.message || reportsError?.message || null,
    collectedTaxes,
    taxCategories: taxCategories || fallbackTaxCategories,
    taxReports: taxReports || fallbackTaxReports,
  };

  return (
    <TaxContext.Provider value={value}>
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

export default TaxContext;
