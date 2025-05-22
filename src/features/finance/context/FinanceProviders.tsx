import React, { ReactNode, useEffect } from "react";
import { FinanceProvider } from "./FinanceContext";
import { RevenueProvider } from "./RevenueContext";
import { ExpenseProvider } from "./ExpenseContext";
import { TaxProvider } from "./TaxContext";
import { contextRegistry, ContextType } from "./ContextRegistry";
import { 
  RegisterFinanceContext, 
  RegisterTaxContext,
  RegisterRevenueContext,
  RegisterExpenseContext 
} from "./RegisterContexts";

/**
 * FinanceProviders component
 * 
 * This component provides all finance-related contexts to its children.
 * 
 * Instead of using deeply nested providers (which creates tight coupling),
 * we register each context in the ContextRegistry, allowing for more flexible
 * dependency management while maintaining proper context hierarchy.
 * 
 * Benefits:
 * - Reduced nesting and prop drilling
 * - Explicit dependencies through the registry
 * - Improved testability and maintainability
 * - Each context can access its dependencies through the registry
 */
interface FinanceProvidersProps {
  children: ReactNode;
}

export const FinanceProviders: React.FC<FinanceProvidersProps> = ({ children }) => {
  // We'll still maintain the context provider nesting to ensure proper React context behavior,
  // but each provider will now register itself with the context registry to make dependencies explicit.
  
  // This useEffect is just for logging in development mode
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('FinanceProviders mounted with registry pattern');
    }
    
    // Clean up the registry when the providers are unmounted
    return () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('FinanceProviders unmounted, cleaning registry');
      }
      
      // Deregister all finance contexts
      Object.values(ContextType).forEach((type) => {
        contextRegistry.deregister(type);
      });
    };
  }, []);
  
  return (
    <FinanceProvider>
      <RegisterFinanceContext>
        <TaxProvider>
          <RegisterTaxContext>
            <RevenueProvider>
              <RegisterRevenueContext>
                <ExpenseProvider>
                  <RegisterExpenseContext>
                    {children}
                  </RegisterExpenseContext>
                </ExpenseProvider>
              </RegisterRevenueContext>
            </RevenueProvider>
          </RegisterTaxContext>
        </TaxProvider>
      </RegisterFinanceContext>
    </FinanceProvider>
  );
};
