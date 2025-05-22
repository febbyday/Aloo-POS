import React, { useState } from 'react';
import { ShopStockLevels } from './ShopStockLevels';
import { InventoryActionCards } from './InventoryActionCards';
import { Shop } from '../../../../types/shops.types';

interface ShopInventoryTabProps {
  shop: Shop;
}

/**
 * Component for the Inventory tab in shop details
 */
export function ShopInventoryTab({ shop }: ShopInventoryTabProps) {
  const [showStockLevels, setShowStockLevels] = useState(true);

  // Mock inventory stats - in a real app, these would come from the API
  const inventoryStats = {
    totalItems: shop.inventoryCount || 0,
    lowStockItems: Math.floor(Math.random() * 10), // Mock data
    itemsInTransit: Math.floor(Math.random() * 5), // Mock data
  };

  return (
    <div className="space-y-6">
      {showStockLevels && (
        <ShopStockLevels shopId={shop.id} />
      )}
      
      <InventoryActionCards 
        shopId={shop.id} 
        inventoryStats={inventoryStats} 
      />
    </div>
  );
}
