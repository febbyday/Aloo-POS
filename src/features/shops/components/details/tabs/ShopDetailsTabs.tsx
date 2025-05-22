import React from 'react';
import { Building2, Package, Users, ShoppingCart, TrendingUp, Settings } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shop } from '../../../types/shops.types';

interface ShopDetailsTabsProps {
  shop: Shop;
  defaultTab?: string;
  infoTabContent: React.ReactNode;
  inventoryTabContent: React.ReactNode;
  staffTabContent: React.ReactNode;
  salesTabContent: React.ReactNode;
  performanceTabContent: React.ReactNode;
  settingsTabContent: React.ReactNode;
}

/**
 * Component for the tabs in the shop details page
 */
export function ShopDetailsTabs({
  shop,
  defaultTab = 'info',
  infoTabContent,
  inventoryTabContent,
  staffTabContent,
  salesTabContent,
  performanceTabContent,
  settingsTabContent
}: ShopDetailsTabsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-3">
        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid grid-cols-6 mb-4">
            <TabsTrigger value="info">
              <Building2 className="h-4 w-4 mr-2" />
              Info
            </TabsTrigger>
            <TabsTrigger value="inventory">
              <Package className="h-4 w-4 mr-2" />
              Inventory
            </TabsTrigger>
            <TabsTrigger value="staff">
              <Users className="h-4 w-4 mr-2" />
              Staff
            </TabsTrigger>
            <TabsTrigger value="sales">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Sales
            </TabsTrigger>
            <TabsTrigger value="performance">
              <TrendingUp className="h-4 w-4 mr-2" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4">
            {infoTabContent}
          </TabsContent>

          <TabsContent value="inventory" className="space-y-4">
            {inventoryTabContent}
          </TabsContent>

          <TabsContent value="staff" className="space-y-4">
            {staffTabContent}
          </TabsContent>

          <TabsContent value="sales" className="space-y-4">
            {salesTabContent}
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            {performanceTabContent}
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            {settingsTabContent}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
