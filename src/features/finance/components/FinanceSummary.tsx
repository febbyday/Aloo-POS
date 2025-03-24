import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRevenueFromRegistry, useExpenseFromRegistry } from '../hooks/useFinanceRegistry';
import { ContextType } from '../context/ContextRegistry';
import { useFinanceRegistry } from '../hooks/useFinanceRegistry';
import { ErrorMessage } from '@/components/ui/error-display';
import { DataState } from '@/components/ui/loading-state';
import { useDataOperation } from '@/hooks/useDataOperation';

/**
 * FinanceSummary Component
 * 
 * This component demonstrates how to use the context registry pattern
 * to access multiple contexts without deep nesting of providers.
 * 
 * It also showcases the standardized error handling and loading state components
 * to provide a consistent user experience.
 */
export const FinanceSummary: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [financeData, setFinanceData] = useState<{
    revenue: any;
    expenses: any;
    finance: any;
    tax: any;
  } | null>(null);
  
  // Set up the data loading operation with our reusable hook
  const { execute: loadData, loading, error: dataError } = useDataOperation({
    operation: async () => {
      try {
        // Simulate network request for demo purposes
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Access contexts through specialized hooks
        const revenueContext = useRevenueFromRegistry();
        const expenseContext = useExpenseFromRegistry();
        
        // Alternative approach: access through the generic registry hook
        const financeContext = useFinanceRegistry(ContextType.Finance);
        const taxContext = useFinanceRegistry(ContextType.Tax);
        
        return {
          revenue: revenueContext,
          expenses: expenseContext,
          finance: financeContext,
          tax: taxContext,
        };
      } catch (err) {
        console.error('Failed to load finance data:', err);
        throw new Error('Failed to load finance summary data. Please try again.');
      }
    },
    errorTitle: 'Finance Data Error',
    showErrorToast: true,
  });
  
  // Load the data when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Access contexts through specialized hooks
        const revenueContext = useRevenueFromRegistry();
        const expenseContext = useExpenseFromRegistry();
        
        // Alternative approach: access through the generic registry hook
        const financeContext = useFinanceRegistry(ContextType.Finance);
        const taxContext = useFinanceRegistry(ContextType.Tax);
        
        setFinanceData({
          revenue: revenueContext,
          expenses: expenseContext,
          finance: financeContext,
          tax: taxContext,
        });
      } catch (err) {
        console.error('Error loading finance data:', err);
        setError(err instanceof Error ? err : new Error('Failed to load finance data'));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // If data is loading or there's an error, show the appropriate state
  if (isLoading || !financeData) {
    return (
      <DataState 
        loading={isLoading} 
        error={error}
        text="Loading finance summary..."
        errorComponent={
          <ErrorMessage
            title="Could not load finance data"
            description="There was a problem loading the finance summary data."
            error={error}
            onRetry={() => window.location.reload()}
          />
        }
      >
        <></>
      </DataState>
    );
  }
  
  // Extract data for easier access
  const { revenue, expenses, finance, tax } = financeData;
  const { totalRevenue, revenueByPaymentMethod } = revenue;
  const { totalExpenses, expensesByCategory } = expenses;
  const { settings } = finance;
  const { taxRates } = tax;
  
  // Calculate profit/loss
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Finance Summary</CardTitle>
          <CardDescription>
            Overview of your financial performance using the context registry pattern
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Revenue Card */}
            <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-green-600 dark:text-green-400">
                Total Revenue
              </h3>
              <p className="text-2xl font-bold">{settings.currency} {totalRevenue.toFixed(2)}</p>
              <div className="mt-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Top payment method: {Object.entries(revenueByPaymentMethod)
                    .sort(([, a], [, b]) => b - a)[0]?.[0] || 'None'}
                </p>
              </div>
            </div>
            
            {/* Expenses Card */}
            <div className="bg-red-50 dark:bg-red-950 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-red-600 dark:text-red-400">
                Total Expenses
              </h3>
              <p className="text-2xl font-bold">{settings.currency} {totalExpenses.toFixed(2)}</p>
              <div className="mt-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Top expense category: {Object.entries(expensesByCategory)
                    .sort(([, a], [, b]) => b - a)[0]?.[0] || 'None'}
                </p>
              </div>
            </div>
            
            {/* Profit Card */}
            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-600 dark:text-blue-400">
                Net Profit
              </h3>
              <p className="text-2xl font-bold">{settings.currency} {netProfit.toFixed(2)}</p>
              <div className="mt-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Profit margin: {profitMargin.toFixed(2)}%
                </p>
              </div>
            </div>
            
            {/* Tax Card */}
            <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-purple-600 dark:text-purple-400">
                Tax Rates
              </h3>
              <p className="text-2xl font-bold">{taxRates.length} rates configured</p>
              <div className="mt-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Tax enabled: {settings.taxEnabled ? 'Yes' : 'No'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 