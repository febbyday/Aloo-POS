import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shop } from '../../../../types/shops.types';

interface ShopSettingsTabProps {
  shop: Shop;
}

/**
 * Component for the Settings tab in shop details
 */
export function ShopSettingsTab({ shop }: ShopSettingsTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Shop Settings</CardTitle>
          <CardDescription>Configure settings for {shop.name}</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Shop settings configuration will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
