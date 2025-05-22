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
  Plus,
  ArrowRight,
  History,
  Bell,
  RefreshCw,
  Filter,
  Eye,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TemporaryProductAlert } from '../TemporaryProductAlert';
import { Product } from '../../types';
import { toast } from '@/lib/toast';
import { format } from 'date-fns';
import { useState } from 'react';
import {
  useStockReceipts,
  useStockTransfers,
  useStockAdjustments,
  useInventoryHistory,
  useStockAlerts
} from '../../hooks/useInventory';
import {
  TablePagination,
  HistoryFilterDialog,
  StockAdjustmentDialog,
  StockTransferDialog,
  ReceiveStockDialog
} from '../inventory';

interface ProductInventoryTabProps {
  product: Product;
  onCompleteProduct: () => void;
  onEditInventorySettings: () => void;
  onAdjustStock: (locationId: string) => void;
  onStockTransfer: () => void;
  onReorder: () => void;
}

// Section Components
const StockLevelsSection = ({ product, onAdjustStock }: { product: Product; onAdjustStock: (locationId: string) => void }) => {
  // State for stock adjustment dialog
  const [adjustmentDialogOpen, setAdjustmentDialogOpen] = useState(false);

  // Handle opening the adjustment dialog
  const handleOpenAdjustmentDialog = (locationId: string, e?: React.MouseEvent) => {
    // Stop event propagation to prevent parent div's onClick from firing
    if (e) e.stopPropagation();
    setAdjustmentDialogOpen(true);
  };

  // Handle stock adjustment
  const handleAdjustStock = (locationId: string, type: "add" | "remove" | "set", quantity: number, _reason: string) => {
    onAdjustStock(locationId);
    toast({
      title: "Stock Adjusted",
      description: `${type === 'add' ? 'Added' : type === 'remove' ? 'Removed' : 'Set'} ${quantity} units ${type === 'set' ? 'to' : type === 'add' ? 'to' : 'from'} ${product.locations?.find(loc => loc.id === locationId)?.name || locationId}`
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold flex items-center">
          <Package className="h-4 w-4 mr-2 text-primary" />
          Stock Levels
        </h4>
      </div>
      <Card>
        <CardContent className="p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Location</TableHead>
                <TableHead>Current Stock</TableHead>
                <TableHead>Min Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {product.locations?.length > 0 ? (
                product.locations.map((location) => (
                  <TableRow key={location.id || location.locationId}>
                    <TableCell className="font-medium">{location.name}</TableCell>
                    <TableCell>{location.stock || 0}</TableCell>
                    <TableCell>{location.minStock || 0}</TableCell>
                    <TableCell>
                      <Badge variant={(location.stock || 0) <= 0 ? 'destructive' : ((location.stock || 0) <= (location.minStock || 0) ? 'outline' : 'default')}>
                        {(location.stock || 0) <= 0 ? 'Out of Stock' : ((location.stock || 0) <= (location.minStock || 0) ? 'Low Stock' : 'In Stock')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={(e) => handleOpenAdjustmentDialog(location.id || location.locationId || "", e)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">No locations found for this product.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Stock Adjustment Dialog */}
      <StockAdjustmentDialog
        open={adjustmentDialogOpen}
        onOpenChange={setAdjustmentDialogOpen}
        product={product}
        onAdjustStock={handleAdjustStock}
      />
    </div>
  );
};

const ReceiveStockSection = ({ product, onReceiveStock: _ }: { product: Product; onReceiveStock: () => void }) => {
  // State for receive stock dialog
  const [receiveDialogOpen, setReceiveDialogOpen] = useState(false);

  // Use the stock receipts hook
  const {
    receipts,
    pagination,
    loading,
    updateParams,
    createReceipt
  } = useStockReceipts(product.id);

  // Handle receive stock
  const handleReceiveStock = (
    locationId: string,
    quantity: number,
    poNumber?: string,
    _notes?: string,
    _expectedDeliveryDate?: Date
  ) => {
    createReceipt({
      productId: product.id,
      locationId,
      locationName: product.locations?.find(loc => loc.id === locationId || loc.locationId === locationId)?.name || '',
      quantity,
      poNumber: poNumber || '',
      receivedBy: 'Current User' // In a real app, this would be the current user
    });

    toast({
      title: "Stock Received",
      description: `Received ${quantity} units at ${product.locations?.find(loc => loc.id === locationId || loc.locationId === locationId)?.name || locationId}`
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold flex items-center">
          <Truck className="h-4 w-4 mr-2 text-primary" />
          Receive Stock
        </h4>
        <Button variant="outline" size="sm" onClick={(e) => {
          e.stopPropagation();
          setReceiveDialogOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Receive New Stock
        </Button>
      </div>
      <Card>
        <CardContent className="p-4">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Receipt ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {receipts.length > 0 ? (
                    receipts.map(receipt => (
                      <TableRow key={receipt.id}>
                        <TableCell className="font-medium">{receipt.id}</TableCell>
                        <TableCell>{format(new Date(receipt.date), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>{receipt.locationName}</TableCell>
                        <TableCell>{receipt.quantity}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => {
                            toast({
                              title: "Viewing Receipt Details",
                              description: `Receipt ${receipt.id} for ${receipt.quantity} units`
                            });
                          }}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">No stock receipts found. Select Receive Stock to add inventory.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {pagination && pagination.totalPages > 1 && (
                <div className="mt-4">
                  <TablePagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    onPageChange={(page) => updateParams({ page })}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Receive Stock Dialog */}
      <ReceiveStockDialog
        open={receiveDialogOpen}
        onOpenChange={setReceiveDialogOpen}
        product={product}
        onReceiveStock={handleReceiveStock}
      />
    </div>
  );
};

const TransferStockSection = ({ product, onStockTransfer }: { product: Product; onStockTransfer: () => void }) => {
  // State for transfer dialog
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);

  // Use the stock transfers hook
  const {
    transfers,
    pagination,
    loading,
    updateParams,
    createTransfer,
    refresh
  } = useStockTransfers(product.id);

  // Handle stock transfer
  const handleTransferStock = (
    fromLocationId: string,
    toLocationId: string,
    quantity: number,
    notes?: string
  ) => {
    createTransfer({
      productId: product.id,
      fromLocationId,
      fromLocationName: product.locations?.find(loc => loc.id === fromLocationId || loc.locationId === fromLocationId)?.name || '',
      toLocationId,
      toLocationName: product.locations?.find(loc => loc.id === toLocationId || loc.locationId === toLocationId)?.name || '',
      quantity,
      transferredBy: 'Current User' // In a real app, this would be the current user
    });

    toast({
      title: "Stock Transferred",
      description: `Transferred ${quantity} units from ${product.locations?.find(loc => loc.id === fromLocationId || loc.locationId === fromLocationId)?.name || fromLocationId} to ${product.locations?.find(loc => loc.id === toLocationId || loc.locationId === toLocationId)?.name || toLocationId}`
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold flex items-center">
          <ArrowRight className="h-4 w-4 mr-2 text-primary" />
          Transfer Stock
        </h4>
        <Button variant="outline" size="sm" onClick={(e) => {
          e.stopPropagation();
          setTransferDialogOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Transfer Stock
        </Button>
      </div>
      <Card>
        <CardContent className="p-4">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transfer ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transfers.length > 0 ? (
                    transfers.map(transfer => (
                      <TableRow key={transfer.id}>
                        <TableCell className="font-medium">{transfer.id}</TableCell>
                        <TableCell>{format(new Date(transfer.date), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>{transfer.fromLocationName}</TableCell>
                        <TableCell>{transfer.toLocationName}</TableCell>
                        <TableCell>{transfer.quantity}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant={transfer.status === 'completed' ? 'default' : 'outline'}>
                            {transfer.status === 'completed' ? 'Completed' : 'Pending'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">No stock transfers found. Select Transfer Stock to move inventory.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {pagination && pagination.totalPages > 1 && (
                <div className="mt-4">
                  <TablePagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    onPageChange={(page) => updateParams({ page })}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Stock Transfer Dialog */}
      <StockTransferDialog
        open={transferDialogOpen}
        onOpenChange={setTransferDialogOpen}
        product={product}
        onTransferStock={handleTransferStock}
      />
    </div>
  );
};

const AdjustmentsSection = ({ product, onCreateAdjustment }: { product: Product; onCreateAdjustment: () => void }) => {
  // State for adjustment dialog
  const [adjustmentDialogOpen, setAdjustmentDialogOpen] = useState(false);

  // Use the stock adjustments hook
  const {
    adjustments,
    pagination,
    loading,
    updateParams,
    createAdjustment,
    refresh
  } = useStockAdjustments(product.id);

  // Handle create adjustment
  const handleCreateAdjustment = (
    locationId: string,
    type: "add" | "remove" | "set",
    quantity: number,
    reason: string
  ) => {
    createAdjustment({
      productId: product.id,
      locationId,
      locationName: product.locations?.find(loc => loc.id === locationId || loc.locationId === locationId)?.name || '',
      quantity,
      type,
      reason,
      adjustedBy: 'Current User' // In a real app, this would be the current user
    });

    toast({
      title: "Stock Adjusted",
      description: `${type === 'add' ? 'Added' : type === 'remove' ? 'Removed' : 'Set'} ${quantity} units ${type === 'set' ? 'to' : type === 'add' ? 'to' : 'from'} ${product.locations?.find(loc => loc.id === locationId || loc.locationId === locationId)?.name || locationId}`
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold flex items-center">
          <Activity className="h-4 w-4 mr-2 text-primary" />
          Adjustments
        </h4>
        <Button variant="outline" size="sm" onClick={(e) => {
          e.stopPropagation();
          setAdjustmentDialogOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Create Adjustment
        </Button>
      </div>
      <Card>
        <CardContent className="p-4">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Adjustment ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Location</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adjustments.length > 0 ? (
                    adjustments.map(adjustment => (
                      <TableRow key={adjustment.id}>
                        <TableCell className="font-medium">{adjustment.id}</TableCell>
                        <TableCell>{format(new Date(adjustment.date), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>
                          <Badge variant={adjustment.type === 'add' ? 'default' : 'destructive'}>
                            {adjustment.type === 'add' ? 'Add' : adjustment.type === 'remove' ? 'Remove' : 'Set'}
                          </Badge>
                        </TableCell>
                        <TableCell>{adjustment.quantity}</TableCell>
                        <TableCell>{adjustment.reason}</TableCell>
                        <TableCell>{adjustment.locationName}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">No stock adjustments found. Select Create Adjustment to modify inventory.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {pagination && pagination.totalPages > 1 && (
                <div className="mt-4">
                  <TablePagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    onPageChange={(page) => updateParams({ page })}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Stock Adjustment Dialog */}
      <StockAdjustmentDialog
        open={adjustmentDialogOpen}
        onOpenChange={setAdjustmentDialogOpen}
        product={product}
        onAdjustStock={handleCreateAdjustment}
      />
    </div>
  );
};

const HistorySection = ({ product, onFilterHistory }: { product: Product; onFilterHistory: () => void }) => {
  // State for filter dialog
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filters, setFilters] = useState<{
    search?: string;
    startDate?: Date;
    endDate?: Date;
    type?: string;
    locationId?: string;
  }>({});

  // Use the inventory history hook
  const {
    history: productHistory,
    pagination,
    loading,
    updateParams,
    refresh
  } = useInventoryHistory(product.id);

  // Helper function to get badge variant based on history type
  const getHistoryBadgeVariant = (type: string) => {
    switch (type) {
      case 'sale': return 'destructive';
      case 'receive': return 'default';
      case 'transfer_in': return 'outline';
      case 'transfer_out': return 'secondary';
      case 'adjustment': return 'warning';
      default: return 'outline';
    }
  };

  // Handle filter application
  const handleApplyFilters = (newFilters: any) => {
    setFilters(newFilters);

    // Convert dates to ISO strings for the API
    const apiFilters: any = { ...newFilters };
    if (newFilters.startDate) {
      apiFilters.startDate = newFilters.startDate.toISOString();
    }
    if (newFilters.endDate) {
      apiFilters.endDate = newFilters.endDate.toISOString();
    }

    updateParams({
      page: 1, // Reset to first page when filtering
      ...apiFilters
    });
  };

  // Get locations for the filter dialog
  const locations = product.locations?.map(loc => ({
    id: loc.id || loc.locationId || '',
    name: loc.name || `Location ${loc.id || loc.locationId}`
  })) || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold flex items-center">
          <History className="h-4 w-4 mr-2 text-primary" />
          History
        </h4>
        <Button variant="outline" size="sm" onClick={(e) => {
          e.stopPropagation();
          setFilterDialogOpen(true);
        }}>
          <Filter className="h-4 w-4 mr-2" />
          Filter History
        </Button>
      </div>
      <Card>
        <CardContent className="p-4">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Reference</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productHistory.length > 0 ? (
                    productHistory.map(history => (
                      <TableRow key={history.id}>
                        <TableCell>{format(new Date(history.date), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>
                          <Badge variant={getHistoryBadgeVariant(history.type)}>
                            {history.type.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>{history.locationName}</TableCell>
                        <TableCell className={history.quantity < 0 ? 'text-red-500' : 'text-green-500'}>
                          {history.quantity > 0 ? `+${history.quantity}` : history.quantity}
                        </TableCell>
                        <TableCell>{history.reference}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">No history available yet</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {pagination && pagination.totalPages > 1 && (
                <div className="mt-4">
                  <TablePagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    onPageChange={(page) => updateParams({ page })}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* History Filter Dialog */}
      <HistoryFilterDialog
        open={filterDialogOpen}
        onOpenChange={setFilterDialogOpen}
        onFilter={handleApplyFilters}
        locations={product.locations ? product.locations.map(loc => ({
          id: loc.id || loc.locationId || '',
          name: loc.name || `Location ${loc.id || loc.locationId}`
        })) : []}
        currentFilters={{}}
      />
    </div>
  );
};

const AlertsSection = ({ product, onConfigureAlerts }: { product: Product; onConfigureAlerts: () => void }) => {
  // Use the stock alerts hook
  const {
    alerts: productAlerts,
    pagination,
    loading,
    updateParams,
    updateAlert
  } = useStockAlerts(product.id);

  // Handle alert status toggle
  const handleToggleAlertStatus = (alertId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'resolved' : 'active';
    updateAlert(alertId, { status: newStatus });

    toast({
      title: `Alert ${newStatus === 'active' ? 'Activated' : 'Resolved'}`,
      description: `Alert has been ${newStatus === 'active' ? 'activated' : 'resolved'}`
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold flex items-center">
          <Bell className="h-4 w-4 mr-2 text-primary" />
          Alerts
        </h4>
        <Button variant="outline" size="sm" onClick={(e) => {
          e.stopPropagation();
          onConfigureAlerts();
        }}>
          <Settings className="h-4 w-4 mr-2" />
          Configure Alerts
        </Button>
      </div>
      <Card>
        <CardContent className="p-4">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Threshold</TableHead>
                    <TableHead>Current</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productAlerts.length > 0 ? (
                    productAlerts.map(alert => (
                      <TableRow key={alert.id}>
                        <TableCell>
                          <Badge variant={alert.type === 'low_stock' ? 'warning' : 'destructive'}>
                            {alert.type === 'low_stock' ? 'Low Stock' : 'Out of Stock'}
                          </Badge>
                        </TableCell>
                        <TableCell>{alert.locationName}</TableCell>
                        <TableCell>{alert.threshold}</TableCell>
                        <TableCell>{alert.current}</TableCell>
                        <TableCell>
                          <Badge variant={alert.status === 'active' ? 'outline' : 'secondary'}>
                            {alert.status === 'active' ? 'Active' : 'Resolved'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleAlertStatus(alert.id, alert.status)}
                          >
                            {alert.status === 'active' ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              <AlertCircle className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">No alerts configured yet</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {pagination && pagination.totalPages > 1 && (
                <div className="mt-4">
                  <TablePagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    onPageChange={(page) => updateParams({ page })}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export function ProductInventoryTab({
  product,
  onCompleteProduct,
  onEditInventorySettings,
  onAdjustStock,
  onStockTransfer,
  onReorder
}: ProductInventoryTabProps) {
  // Set up hooks for each section to properly handle direct API operations
  const { createAdjustment } = useStockAdjustments(product.id);
  const { createReceipt } = useStockReceipts(product.id);
  const { createTransfer } = useStockTransfers(product.id);

  // Create handler functions that perform the actual operations
  const handleAdjustStock = (locationId: string, type: "add" | "remove" | "set", quantity: number, reason: string) => {
    createAdjustment({
      productId: product.id,
      locationId,
      locationName: product.locations?.find(loc => loc.id === locationId || loc.locationId === locationId)?.name || '',
      quantity: type === 'remove' ? -quantity : quantity,
      type,
      reason,
      adjustedBy: 'Current User' // In a real app, this would be the current user
    });

    // Also call the parent handler for UI feedback
    onAdjustStock(locationId);

    toast({
      title: "Stock Adjusted",
      description: `${type === 'add' ? 'Added' : type === 'remove' ? 'Removed' : 'Set'} ${quantity} units ${type === 'set' ? 'to' : type === 'add' ? 'to' : 'from'} ${product.locations?.find(loc => loc.id === locationId)?.name || locationId}`
    });
  };

  const handleReceiveStock = (
    locationId: string,
    quantity: number,
    poNumber?: string,
    notes?: string,
    expectedDeliveryDate?: Date
  ) => {
    createReceipt({
      productId: product.id,
      locationId,
      locationName: product.locations?.find(loc => loc.id === locationId || loc.locationId === locationId)?.name || '',
      quantity,
      poNumber: poNumber || '',
      receivedBy: 'Current User' // In a real app, this would be the current user
    });

    // Also call the parent handler for UI feedback
    onReorder();

    toast({
      title: "Stock Received",
      description: `Received ${quantity} units at ${product.locations?.find(loc => loc.id === locationId || loc.locationId === locationId)?.name || locationId}`
    });
  };

  const handleTransferStock = (
    fromLocationId: string,
    toLocationId: string,
    quantity: number,
    notes?: string
  ) => {
    createTransfer({
      productId: product.id,
      fromLocationId,
      fromLocationName: product.locations?.find(loc => loc.id === fromLocationId || loc.locationId === fromLocationId)?.name || '',
      toLocationId,
      toLocationName: product.locations?.find(loc => loc.id === toLocationId || loc.locationId === toLocationId)?.name || '',
      quantity,
      transferredBy: 'Current User' // In a real app, this would be the current user
    });

    // Also call the parent handler for UI feedback
    onStockTransfer();

    toast({
      title: "Stock Transferred",
      description: `Transferred ${quantity} units from ${product.locations?.find(loc => loc.id === fromLocationId)?.name || fromLocationId} to ${product.locations?.find(loc => loc.id === toLocationId)?.name || toLocationId}`
    });
  };

  // Function to determine stock status for a given stock level and minimum stock threshold
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

  // Create wrapper functions that match the expected signatures
  const handleStockLevelsAdjust = (locationId: string) => {
    // This will be replaced by the dialog's callback
    onAdjustStock(locationId);
  };

  const handleReceiveAction = () => {
    // This will be replaced by the dialog's callback
    onReorder();
  };

  const handleTransferAction = () => {
    // This will be replaced by the dialog's callback
    onStockTransfer();
  };

  const handleCreateAdjustment = () => {
    // This will be replaced by the dialog's callback
    const defaultLocationId = product.locations?.[0]?.id || product.locations?.[0]?.locationId || '';
    onAdjustStock(defaultLocationId);
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

          {/* Bottom Section Cards */}
          <div
            className="cursor-pointer hover:opacity-95 transition-all duration-200"
            onClick={() => {
              const defaultLocationId = product.locations?.[0]?.id || product.locations?.[0]?.locationId || '';
              onAdjustStock(defaultLocationId);
            }}
          >
            <StockLevelsSection
              product={product}
              onAdjustStock={handleStockLevelsAdjust}
            />
          </div>

          <div
            className="cursor-pointer hover:opacity-95 transition-all duration-200"
            onClick={onReorder}
          >
            <ReceiveStockSection
              product={product}
              onReceiveStock={handleReceiveAction}
            />
          </div>

          <div
            className="cursor-pointer hover:opacity-95 transition-all duration-200"
            onClick={onStockTransfer}
          >
            <TransferStockSection
              product={product}
              onStockTransfer={handleTransferAction}
            />
          </div>

          <div
            className="cursor-pointer hover:opacity-95 transition-all duration-200"
            onClick={() => {
              const defaultLocationId = product.locations?.[0]?.id || product.locations?.[0]?.locationId || '';
              onAdjustStock(defaultLocationId);
            }}
          >
            <AdjustmentsSection
              product={product}
              onCreateAdjustment={handleCreateAdjustment}
            />
          </div>

          <div
            className="cursor-pointer hover:opacity-95 transition-all duration-200"
            onClick={() => {
              toast({
                title: "Viewing Complete History",
                description: "Opening full inventory history records"
              });
            }}
          >
            <HistorySection
              product={product}
              onFilterHistory={() => {
                toast({
                  title: "Viewing Complete History",
                  description: "Opening full inventory history records"
                });
              }}
            />
          </div>

          <div
            className="cursor-pointer hover:opacity-95 transition-all duration-200"
            onClick={onEditInventorySettings}
          >
            <AlertsSection
              product={product}
              onConfigureAlerts={onEditInventorySettings}
            />
          </div>
        </div>
      )}
    </div>
  );
}
