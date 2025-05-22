import React, { ReactNode } from 'react';
import { ProductHistoryProvider } from '@/features/products/context/ProductHistoryContext';
import { CustomerHistoryProvider } from '@/features/customers/context/CustomerHistoryContext';
import { SalesHistoryProvider } from '@/features/sales/context/SalesHistoryContext';
import { InventoryHistoryProvider } from '@/features/inventory/context/InventoryHistoryContext';
import { StaffHistoryProvider } from '@/features/staff/context/StaffHistoryContext';
import { RoleHistoryProvider } from '@/features/users/context/RoleHistoryContext';
import { SupplierHistoryProvider } from '@/features/suppliers/context/SupplierHistoryContext';
import { PurchaseOrderHistoryProvider } from '@/features/purchase-orders/context/PurchaseOrderHistoryContext';
import { RepairHistoryProvider } from '@/features/repairs/context/RepairHistoryContext';
import { LocationHistoryProvider } from '@/features/locations/context/LocationHistoryContext';
import { ExpenseHistoryProvider } from '@/features/expenses/context/ExpenseHistoryContext';
import { SettingsHistoryProvider } from '@/features/settings/context/SettingsHistoryContext';
import { ReportHistoryProvider } from '@/features/reports/context/ReportHistoryContext';
import { HistoryProviders as HistoryProvidersWrapper } from '@/components/OptimizedProviders';

interface HistoryProvidersProps {
  children: ReactNode;
}

/**
 * Consolidated component for all history providers
 * This allows us to lazy load all history providers as a single chunk
 */
export default function HistoryProviders({ children }: HistoryProvidersProps) {
  return (
    <HistoryProvidersWrapper>
      <ProductHistoryProvider>
        <CustomerHistoryProvider>
          <SalesHistoryProvider>
            <InventoryHistoryProvider>
              <StaffHistoryProvider>
                <RoleHistoryProvider>
                  <SupplierHistoryProvider>
                    <PurchaseOrderHistoryProvider>
                      <RepairHistoryProvider>
                        <LocationHistoryProvider>
                          <ExpenseHistoryProvider>
                            <SettingsHistoryProvider>
                              <ReportHistoryProvider>
                                {children}
                              </ReportHistoryProvider>
                            </SettingsHistoryProvider>
                          </ExpenseHistoryProvider>
                        </LocationHistoryProvider>
                      </RepairHistoryProvider>
                    </PurchaseOrderHistoryProvider>
                  </SupplierHistoryProvider>
                </RoleHistoryProvider>
              </StaffHistoryProvider>
            </InventoryHistoryProvider>
          </SalesHistoryProvider>
        </CustomerHistoryProvider>
      </ProductHistoryProvider>
    </HistoryProvidersWrapper>
  );
}
