/**
 * This file has been refactored for better maintainability.
 * The implementation has been split into smaller, more focused components.
 * 
 * The main components can be found in:
 * - src/features/shops/components/details/ (UI components)
 * - src/features/shops/hooks/ (custom hooks)
 */

import { ShopDetailsPage as RefactoredShopDetailsPage } from './ShopDetailsPage.refactored';

/**
 * This component has been moved to ShopDetailsPage.refactored.tsx
 * This file now re-exports the refactored component.
 */

// Export the refactored component
export function ShopDetailsPage() {
  return <RefactoredShopDetailsPage />;
}
