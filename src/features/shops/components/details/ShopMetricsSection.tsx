import React from 'react';
import { TrendingUp, ShoppingCart, Package, Users } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Shop } from '../../types/shops.types';

interface ShopMetricsSectionProps {
  shop: Shop;
}

/**
 * Component for displaying key metrics about the shop
 */
export function ShopMetricsSection({ shop }: ShopMetricsSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Sales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-2xl font-bold">${shop.metrics?.totalSales?.toLocaleString() || '0'}</div>
              <p className="text-xs text-muted-foreground">Lifetime sales</p>
            </div>
            <TrendingUp className="h-5 w-5 text-emerald-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-2xl font-bold">{shop.metrics?.totalOrders?.toLocaleString() || '0'}</div>
              <p className="text-xs text-muted-foreground">Processed orders</p>
            </div>
            <ShoppingCart className="h-5 w-5 text-blue-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Inventory Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-2xl font-bold">{shop.inventoryCount?.toLocaleString() || '0'}</div>
              <p className="text-xs text-muted-foreground">Products in stock</p>
            </div>
            <Package className="h-5 w-5 text-violet-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Staff Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-2xl font-bold">{shop.staffCount?.toLocaleString() || '0'}</div>
              <p className="text-xs text-muted-foreground">Active employees</p>
            </div>
            <Users className="h-5 w-5 text-amber-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
