import React, { ReactNode, useEffect } from "react";
import { contextRegistry, ContextType } from "./ContextRegistry";
import { useFinance } from "./FinanceContext";
import { useTax } from "./TaxContext";
import { useRevenue } from "./RevenueContext";
import { useExpense } from "./ExpenseContext";

/**
 * Context registration components
 * 
 * These components access their respective contexts using their custom hooks
 * and register them with the context registry.
 * 
 * This approach:
 * 1. Makes context dependencies explicit
 * 2. Allows contexts to be accessed through the registry
 * 3. Maintains proper cleanup on unmount
 * 4. Simplifies testing by making dependencies injectable
 */

export const RegisterFinanceContext: React.FC<{ children: ReactNode }> = ({ children }) => {
  const financeContext = useFinance();
  
  useEffect(() => {
    // Register the finance context with the registry
    contextRegistry.register(ContextType.Finance, financeContext);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Finance context registered with registry');
    }
    
    // Clean up on unmount
    return () => {
      contextRegistry.deregister(ContextType.Finance);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Finance context deregistered from registry');
      }
    };
  }, [financeContext]);
  
  return <>{children}</>;
};

export const RegisterTaxContext: React.FC<{ children: ReactNode }> = ({ children }) => {
  const taxContext = useTax();
  
  useEffect(() => {
    // Register the tax context with the registry
    contextRegistry.register(ContextType.Tax, taxContext);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Tax context registered with registry');
    }
    
    // Clean up on unmount
    return () => {
      contextRegistry.deregister(ContextType.Tax);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Tax context deregistered from registry');
      }
    };
  }, [taxContext]);
  
  return <>{children}</>;
};

export const RegisterRevenueContext: React.FC<{ children: ReactNode }> = ({ children }) => {
  const revenueContext = useRevenue();
  
  useEffect(() => {
    // Register the revenue context with the registry
    contextRegistry.register(ContextType.Revenue, revenueContext);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Revenue context registered with registry');
    }
    
    // Clean up on unmount
    return () => {
      contextRegistry.deregister(ContextType.Revenue);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Revenue context deregistered from registry');
      }
    };
  }, [revenueContext]);
  
  return <>{children}</>;
};

export const RegisterExpenseContext: React.FC<{ children: ReactNode }> = ({ children }) => {
  const expenseContext = useExpense();
  
  useEffect(() => {
    // Register the expense context with the registry
    contextRegistry.register(ContextType.Expense, expenseContext);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Expense context registered with registry');
    }
    
    // Clean up on unmount
    return () => {
      contextRegistry.deregister(ContextType.Expense);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Expense context deregistered from registry');
      }
    };
  }, [expenseContext]);
  
  return <>{children}</>;
}; 