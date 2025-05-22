import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shop } from '../../../types/shops.types';

interface ShopPerformanceTabProps {
  shop: Shop;
}

/**
 * Component for the Performance tab in shop details
 */
export function ShopPerformanceTab({ shop }: ShopPerformanceTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>Performance data for {shop.name}</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Performance metrics and analytics will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
