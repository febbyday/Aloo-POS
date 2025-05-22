import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shop } from '../../../types/shops.types';

interface ShopSalesTabProps {
  shop: Shop;
}

/**
 * Component for the Sales tab in shop details
 */
export function ShopSalesTab({ shop }: ShopSalesTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Sales Information</CardTitle>
          <CardDescription>Sales data for {shop.name}</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Sales information and reports will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
