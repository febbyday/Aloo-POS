/**
 * Markets Module
 * 
 * This is the main entry point for the Markets module which provides functionality
 * for managing market events, locations, inventory, staff assignments and connections.
 */

// Types
export * from './types';

// Services
export { marketsService } from './services/marketsService';

// Hooks
export { useMarkets } from './hooks/useMarkets';

// Context
export { MarketProvider, useMarketContext } from './context/MarketContext';
export { default as MarketContext } from './context/MarketContext';

// Pages
export { default as MarketsList } from './pages/MarketsList';
export { default as MarketDetails } from './pages/MarketDetails';
export { default as MarketForm } from './pages/MarketForm';
export { default as MarketConnectionPage } from './pages/MarketConnectionPage';
// Additional pages will be exported as they are implemented

// Route config
export { MARKETS_ROUTES, MARKETS_FULL_ROUTES, MARKETS_ROUTE_CONFIG } from '@/routes/marketRoutes';

// Constants
export const MODULE_NAME = 'Markets';
export const MODULE_DESCRIPTION = 'Manage market events, inventory, and staff assignments';
export const MODULE_ICON = 'Store'; 