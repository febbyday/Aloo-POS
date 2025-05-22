import React, { useState } from 'react';
import { CrudTable, ReadOnlyTable, SelectableTable } from '@/components/ui/table-variants';
import { toast } from '@/lib/toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Trash, Mail, Download } from 'lucide-react';

// Sample data
interface Order {
  id: string;
  orderNumber: string;
  customer: string;
  date: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  total: number;
  items: number;
}

const sampleOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-001',
    customer: 'John Smith',
    date: '2023-06-15',
    status: 'completed',
    total: 125.99,
    items: 3,
  },
  {
    id: '2',
    orderNumber: 'ORD-002',
    customer: 'Jane Doe',
    date: '2023-06-18',
    status: 'processing',
    total: 89.50,
    items: 2,
  },
  {
    id: '3',
    orderNumber: 'ORD-003',
    customer: 'Bob Johnson',
    date: '2023-06-20',
    status: 'pending',
    total: 210.75,
    items: 5,
  },
  {
    id: '4',
    orderNumber: 'ORD-004',
    customer: 'Alice Williams',
    date: '2023-06-22',
    status: 'completed',
    total: 45.25,
    items: 1,
  },
  {
    id: '5',
    orderNumber: 'ORD-005',
    customer: 'Charlie Brown',
    date: '2023-06-25',
    status: 'cancelled',
    total: 150.00,
    items: 4,
  },
];

// Define columns
const orderColumns = [
  {
    id: 'orderNumber',
    header: 'Order #',
    accessorKey: 'orderNumber',
    enableSorting: true,
  },
  {
    id: 'customer',
    header: 'Customer',
    accessorKey: 'customer',
    enableSorting: true,
  },
  {
    id: 'date',
    header: 'Date',
    accessorKey: 'date',
    enableSorting: true,
  },
  {
    id: 'status',
    header: 'Status',
    accessorKey: 'status',
    enableSorting: true,
    cell: ({ row }: any) => {
      const status = row.original.status;
      let color = '';

      switch (status) {
        case 'pending':
          color = 'bg-yellow-100 text-yellow-800';
          break;
        case 'processing':
          color = 'bg-blue-100 text-blue-800';
          break;
        case 'completed':
          color = 'bg-green-100 text-green-800';
          break;
        case 'cancelled':
          color = 'bg-red-100 text-red-800';
          break;
      }

      return (
        <div className={`px-2 py-1 rounded-full text-xs font-medium inline-block ${color}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </div>
      );
    },
  },
  {
    id: 'total',
    header: 'Total',
    accessorKey: 'total',
    enableSorting: true,
    cell: ({ row }: any) => `$${row.original.total.toFixed(2)}`,
  },
  {
    id: 'items',
    header: 'Items',
    accessorKey: 'items',
    enableSorting: true,
  },
];

export function TableVariantsExample() {
  const [orders] = useState<Order[]>(sampleOrders);
  const [selectedOrders, setSelectedOrders] = useState<Order[]>([]);

  // Action handlers
  const handleView = (order: Order) => {
    toast({
      title: 'View Order',
      description: `Viewing order ${order.orderNumber}`,
    });
  };

  const handleEdit = (order: Order) => {
    toast({
      title: 'Edit Order',
      description: `Editing order ${order.orderNumber}`,
    });
  };

  const handleDelete = (order: Order) => {
    toast({
      title: 'Delete Order',
      description: `Deleting order ${order.orderNumber}`,
      variant: 'destructive',
    });
  };

  const handleAdd = () => {
    toast({
      title: 'Add Order',
      description: 'Creating a new order',
    });
  };

  const handleRefresh = () => {
    toast({
      title: 'Refresh',
      description: 'Refreshing orders data',
    });
  };

  const handleExport = () => {
    toast({
      title: 'Export',
      description: 'Exporting orders data',
    });
  };

  const handleBulkDelete = (orders: Order[]) => {
    toast({
      title: 'Bulk Delete',
      description: `Deleting ${orders.length} orders`,
      variant: 'destructive',
    });
  };

  const handleEmailSelected = () => {
    toast({
      title: 'Email Selected',
      description: `Sending email to ${selectedOrders.length} customers`,
    });
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Table Variants Example</h1>
      <p className="text-lg text-muted-foreground">
        This example demonstrates the different table variants available for common use cases.
      </p>

      <Tabs defaultValue="crud">
        <TabsList>
          <TabsTrigger value="crud">CRUD Table</TabsTrigger>
          <TabsTrigger value="readonly">Read-Only Table</TabsTrigger>
          <TabsTrigger value="selectable">Selectable Table</TabsTrigger>
        </TabsList>

        <TabsContent value="crud" className="pt-4">
          <CrudTable
            title="Orders Management"
            description="View and manage customer orders"
            columns={orderColumns}
            data={orders}
            enableSearch={true}
            searchPlaceholder="Search orders..."
            enablePagination={true}
            enableSorting={true}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAdd={handleAdd}
            onRefresh={handleRefresh}
            onExport={handleExport}
            onRowDoubleClick={handleView}
            selectedItems={selectedOrders}
            onRowSelectionChange={setSelectedOrders}
            onBulkDelete={handleBulkDelete}
            enableRowSelection={true}
          />
        </TabsContent>

        <TabsContent value="readonly" className="pt-4">
          <ReadOnlyTable
            title="Orders History"
            description="View past orders and their details"
            columns={orderColumns}
            data={orders}
            enableSearch={true}
            searchPlaceholder="Search orders..."
            enablePagination={true}
            enableSorting={true}
            onRefresh={handleRefresh}
            onExport={handleExport}
            onRowDoubleClick={handleView}
          />
        </TabsContent>

        <TabsContent value="selectable" className="pt-4">
          <SelectableTable
            title="Order Selection"
            description="Select orders for bulk actions"
            columns={orderColumns}
            data={orders}
            enableSearch={true}
            searchPlaceholder="Search orders..."
            enablePagination={true}
            enableSorting={true}
            onRefresh={handleRefresh}
            selectedItems={selectedOrders}
            onSelectionChange={setSelectedOrders}
            selectionActions={
              <>
                {selectedOrders.length > 0 && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleEmailSelected}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Email ({selectedOrders.length})
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExport()}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export ({selectedOrders.length})
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleBulkDelete(selectedOrders)}
                    >
                      <Trash className="h-4 w-4 mr-2" />
                      Delete ({selectedOrders.length})
                    </Button>
                  </>
                )}
              </>
            }
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
