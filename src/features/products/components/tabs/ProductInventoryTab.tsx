// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
import {
  Settings,
  Edit,
  Shield,
  AlertTriangle,
  ShoppingCart,
  Package,
  Activity,
  Calendar,
  Truck,
  MapPin,
  Store,
  ClipboardList,
  Plus,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TemporaryProductAlert } from '../TemporaryProductAlert';
import { Product } from '../../types';

interface ProductInventoryTabProps {
  product: Product;
  onCompleteProduct: () => void;
  onEditInventorySettings: () => void;
  onAdjustStock: (locationId: string) => void;
  onStockTransfer: () => void;
  onReorder: () => void;
}

export function ProductInventoryTab({
  product,
  onCompleteProduct,
  onEditInventorySettings,
  onAdjustStock,
  onStockTransfer,
  onReorder
}: ProductInventoryTabProps) {
  // Function to determine stock status
  const getStockStatus = (stock: number, minStock: number) => {
    if (stock <= 0) return 'Out of Stock';
    if (stock <= minStock) return 'Low Stock';
    return 'In Stock';
  };

  // Get overall stock status
  const getOverallStockStatus = () => {
    const totalStock = product.locations && Array.isArray(product.locations)
      ? product.locations.reduce((sum, loc) => sum + (loc.stock || 0), 0)
      : product.stock || 0;

    if (totalStock <= 0) return 'Out of Stock';
    if (totalStock <= (product.minStock || 0)) return 'Low Stock';
    return 'In Stock';
  };

  return (
    <div>
      {product.isTemporary ? (
        <TemporaryProductAlert onComplete={onCompleteProduct} />
      ) : (
        <div className="grid grid-cols-1 gap-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Inventory Settings */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold flex items-center">
                  <Settings className="h-4 w-4 mr-2 text-primary" />
                  Inventory Settings
                </h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onEditInventorySettings}
                  className="text-xs"
                >
                  <Edit className="h-3.5 w-3.5 mr-1" />
                  Edit Settings
                </Button>
              </div>
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="grid grid-cols-2 divide-x divide-y">
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20">
                      <div className="flex flex-col items-center justify-center text-center h-full">
                        <span className="text-sm text-muted-foreground">Min Stock</span>
                        <div className="flex items-center mt-1">
                          <Shield className="h-4 w-4 mr-1.5 text-blue-500" />
                          <p className="text-2xl font-semibold">{product.minStock || '0'}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Safety threshold</p>
                      </div>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/20 dark:to-amber-900/20">
                      <div className="flex flex-col items-center justify-center text-center h-full">
                        <span className="text-sm text-muted-foreground">Reorder Point</span>
                        <div className="flex items-center mt-1">
                          <AlertTriangle className="h-4 w-4 mr-1.5 text-amber-500" />
                          <p className="text-2xl font-semibold">{product.reorderPoint || '0'}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Order trigger level</p>
                      </div>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20">
                      <div className="flex flex-col items-center justify-center text-center h-full">
                        <span className="text-sm text-muted-foreground">Reorder Quantity</span>
                        <div className="flex items-center mt-1">
                          <ShoppingCart className="h-4 w-4 mr-1.5 text-green-500" />
                          <p className="text-2xl font-semibold">{product.reorderQuantity || '0'}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Default order amount</p>
                      </div>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20">
                      <div className="flex flex-col items-center justify-center text-center h-full">
                        <span className="text-sm text-muted-foreground">Total Stock</span>
                        <div className="flex items-center mt-1">
                          <Package className="h-4 w-4 mr-1.5 text-purple-500" />
                          <p className="text-2xl font-semibold">{
                            product.locations && Array.isArray(product.locations)
                              ? product.locations.reduce((sum, loc) => sum + (loc.stock || 0), 0)
                              : product.stock || 0
                          }</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Units across all locations</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Inventory Status */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold flex items-center">
                  <Activity className="h-4 w-4 mr-2 text-primary" />
                  Inventory Status
                </h4>
                <Badge variant={
                  getOverallStockStatus() === 'Out of Stock'
                    ? 'destructive'
                    : getOverallStockStatus() === 'Low Stock'
                      ? 'outline'
                      : 'default'
                } className={
                  getOverallStockStatus() === 'Out of Stock'
                    ? 'bg-red-100 text-red-800 hover:bg-red-100'
                    : getOverallStockStatus() === 'Low Stock'
                      ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
                      : 'bg-green-100 text-green-800 hover:bg-green-100'
                }>
                  {getOverallStockStatus()}
                </Badge>
              </div>
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y">
                    <div className="p-4 border-b">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full mr-3">
                            <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="font-medium">Last Counted</p>
                            <p className="text-sm text-muted-foreground">Physical inventory check</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{product.lastCounted
                            ? new Date(product.lastCounted).toLocaleDateString()
                            : 'Never'}</p>
                          {product.lastCounted && (
                            <p className="text-xs text-muted-foreground">
                              {new Date(product.lastCounted).toLocaleTimeString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border-b">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full mr-3">
                            <Truck className="h-4 w-4 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <p className="font-medium">Last Received</p>
                            <p className="text-sm text-muted-foreground">Inventory restocked</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{product.lastReceived
                            ? new Date(product.lastReceived).toLocaleDateString()
                            : 'Never'}</p>
                          {product.lastReceived && (
                            <p className="text-xs text-muted-foreground">
                              {new Date(product.lastReceived).toLocaleTimeString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border-b">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full mr-3">
                            <ShoppingCart className="h-4 w-4 text-red-600 dark:text-red-400" />
                          </div>
                          <div>
                            <p className="font-medium">Last Sold</p>
                            <p className="text-sm text-muted-foreground">Most recent sale</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{product.lastSold
                            ? new Date(product.lastSold).toLocaleDateString()
                            : 'Never'}</p>
                          {product.lastSold && (
                            <p className="text-xs text-muted-foreground">
                              {new Date(product.lastSold).toLocaleTimeString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Stock Locations */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-primary" />
                Stock Locations
              </h4>
              <Button variant="outline" size="sm" onClick={onStockTransfer}>
                <ArrowRight className="h-4 w-4 mr-2" />
                Transfer Stock
              </Button>
            </div>
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">
                      <div className="flex items-center">
                        <Store className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                        Location
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center">
                        <Package className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                        Current Stock
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center">
                        <Shield className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                        Min Stock
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center">
                        <Activity className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                        Status
                      </div>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {product.locations && Array.isArray(product.locations) ? (
                    product.locations.map((location) => (
                      <TableRow key={location.id}>
                        <TableCell className="font-medium">{location.name}</TableCell>
                        <TableCell>{location.stock || 0}</TableCell>
                        <TableCell>{location.minStock || 0}</TableCell>
                        <TableCell>
                          {(location.stock || 0) <= 0 ? (
                            <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100">Out of Stock</Badge>
                          ) : (location.stock || 0) <= (location.minStock || 0) ? (
                            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Low Stock</Badge>
                          ) : (
                            <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">In Stock</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => onAdjustStock(location.id)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No location data available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          </div>

          {/* Stock Order History */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold flex items-center">
                <ClipboardList className="h-4 w-4 mr-2 text-primary" />
                Stock Order History
              </h4>
              <Button variant="outline" size="sm" onClick={onReorder}>
                <Plus className="h-4 w-4 mr-2" />
                Create New Order
              </Button>
            </div>
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Mock data for orders - would be replaced with actual data */}
                  {[
                    {
                      id: 'PO-2025-0021',
                      date: '2025-01-20',
                      supplier: 'Global Electronics',
                      quantity: 30,
                      status: 'Delivered'
                    },
                    {
                      id: 'PO-2024-0198',
                      date: '2024-12-05',
                      supplier: 'Tech Supplies Inc.',
                      quantity: 20,
                      status: 'Delivered'
                    }
                  ].map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                      <TableCell>{order.supplier}</TableCell>
                      <TableCell>{order.quantity}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          order.status === 'Delivered'
                            ? 'bg-green-100 text-green-800 hover:bg-green-100'
                            : order.status === 'In Transit'
                              ? 'bg-blue-100 text-blue-800 hover:bg-blue-100'
                              : order.status === 'Processing'
                                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
                                : 'bg-gray-100 text-gray-800 hover:bg-gray-100'
                        }>
                          {order.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
