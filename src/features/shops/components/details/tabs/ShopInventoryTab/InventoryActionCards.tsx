import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  AlertTriangle, 
  ArrowLeftRight, 
  ClipboardList, 
  RefreshCw, 
  ShoppingBag 
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface InventoryActionCardsProps {
  shopId: string;
  inventoryStats?: {
    totalItems: number;
    lowStockItems: number;
    itemsInTransit: number;
  };
}

/**
 * Component for displaying inventory action cards
 */
export function InventoryActionCards({ shopId, inventoryStats }: InventoryActionCardsProps) {
  const navigate = useNavigate();

  // Handlers for inventory management options
  const handleViewStockLevels = () => {
    // This is already shown in the current view
    console.log('View stock levels');
  };

  const handleReceiveStock = () => {
    navigate(`/purchase-orders/new?shopId=${shopId}`);
  };

  const handleTransferStock = () => {
    navigate(`/products/transfers?shopId=${shopId}`);
  };

  const handleAdjustments = () => {
    navigate(`/products/history?shopId=${shopId}`);
  };

  const handleViewHistory = () => {
    navigate(`/inventory/history?shopId=${shopId}`);
  };

  const handleAlerts = () => {
    navigate(`/products/low-stock?shopId=${shopId}`);
  };

  // Handlers for inventory stat cards
  const handleTotalItems = () => {
    navigate(`/products?shopId=${shopId}`);
  };

  const handleLowStockItems = () => {
    navigate(`/products/low-stock?shopId=${shopId}`);
  };

  const handleItemsInTransit = () => {
    navigate(`/products/transfers?shopId=${shopId}`);
  };

  return (
    <div className="space-y-6">
      {/* Inventory Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={handleTotalItems}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{inventoryStats?.totalItems || 0}</div>
              <ShoppingBag className="h-5 w-5 text-blue-500" />
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <p className="text-xs text-muted-foreground">Products in inventory</p>
          </CardFooter>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={handleLowStockItems}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{inventoryStats?.lowStockItems || 0}</div>
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <p className="text-xs text-muted-foreground">Items below threshold</p>
          </CardFooter>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={handleItemsInTransit}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Items In Transit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{inventoryStats?.itemsInTransit || 0}</div>
              <ArrowLeftRight className="h-5 w-5 text-violet-500" />
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <p className="text-xs text-muted-foreground">Pending transfers</p>
          </CardFooter>
        </Card>
      </div>

      {/* Inventory Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Receive Stock
            </CardTitle>
            <CardDescription>Create purchase orders and receive inventory</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Add new inventory to this shop by creating a purchase order or receiving items from suppliers.
            </p>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={handleReceiveStock}>
              Create Purchase Order
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ArrowLeftRight className="h-5 w-5 text-primary" />
              Transfer Stock
            </CardTitle>
            <CardDescription>Move inventory between shops</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Transfer products between this shop and other locations in your business.
            </p>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={handleTransferStock}>
              Create Transfer
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-primary" />
              Adjustments
            </CardTitle>
            <CardDescription>Adjust inventory quantities</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Make manual adjustments to inventory levels due to damage, theft, or counting errors.
            </p>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={handleAdjustments}>
              Adjust Inventory
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              History
            </CardTitle>
            <CardDescription>View inventory history</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Track all inventory movements, including sales, transfers, adjustments, and receipts.
            </p>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={handleViewHistory}>
              View History
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-primary" />
              Alerts
            </CardTitle>
            <CardDescription>Manage inventory alerts</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              View and manage low stock alerts and set up notifications for inventory issues.
            </p>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={handleAlerts}>
              View Alerts
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
