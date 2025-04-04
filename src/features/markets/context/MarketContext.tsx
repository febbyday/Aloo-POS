import React, { createContext, useContext, ReactNode } from 'react';
import { useMarkets, UseMarketsReturn } from '../hooks/useMarkets';

// Create the context with a default undefined value
const MarketContext = createContext<UseMarketsReturn | undefined>(undefined);

// Interface for the provider props
interface MarketProviderProps {
  children: ReactNode;
}

/**
 * Provider component that wraps the application or a part of it
 * to provide market-related state and functions
 */
export const MarketProvider: React.FC<MarketProviderProps> = ({ children }) => {
  // Use the custom hook to get all market-related state and functions
  const marketState = useMarkets();
  
  return (
    <MarketContext.Provider value={marketState}>
      {children}
    </MarketContext.Provider>
  );
};

/**
 * Custom hook to consume the market context
 * This hook can be used in any component that needs access to market data
 */
export const useMarketContext = (): UseMarketsReturn => {
  const context = useContext(MarketContext);
  
  if (context === undefined) {
    throw new Error('useMarketContext must be used within a MarketProvider');
  }
  
  return context;
};

export default MarketContext; 