import React from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { RefreshCw, FileDown, Filter } from 'lucide-react';

// Define the refund data type
interface Refund {
  id: string;
  saleId: string;
  amount: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  createdAt: string;
  updatedAt: string;
  processedBy: string;
}

// Sample data for development
const sampleRefunds: Refund[] = [
  {
    id: '1',
    saleId: 'SALE-001',
    amount: 49.99,
    reason: 'Customer dissatisfied with product',
    status: 'COMPLETED',
    createdAt: '2023-10-15T14:30:00Z',
    updatedAt: '2023-10-15T15:00:00Z',
    processedBy: 'John Doe'
  },
  {
    id: '2',
    saleId: 'SALE-002',
    amount: 129.50,
    reason: 'Product defective',
    status: 'APPROVED',
    createdAt: '2023-10-16T09:15:00Z',
    updatedAt: '2023-10-16T10:00:00Z',
    processedBy: 'Jane Smith'
  },
  {
    id: '3',
    saleId: 'SALE-003',
    amount: 75.25,
    reason: 'Wrong item shipped',
    status: 'PENDING',
    createdAt: '2023-10-17T11:45:00Z',
    updatedAt: '2023-10-17T11:45:00Z',
    processedBy: 'Pending'
  },
  {
    id: '4',
    saleId: 'SALE-004',
    amount: 199.99,
    reason: 'Customer changed mind',
    status: 'REJECTED',
    createdAt: '2023-10-18T13:20:00Z',
    updatedAt: '2023-10-18T14:00:00Z',
    processedBy: 'Mike Johnson'
  }
];

// Define the columns for the data table
const columns: ColumnDef<Refund>[] = [
  {
    accessorKey: 'id',
    header: 'Refund ID',
  },
  {
    accessorKey: 'saleId',
    header: 'Sale ID',
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }) => formatCurrency(row.original.amount),
  },
  {
    accessorKey: 'reason',
    header: 'Reason',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.status;
      let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'default';

      switch (status) {
        case 'COMPLETED':
          variant = 'default'; // Green
          break;
        case 'APPROVED':
          variant = 'secondary'; // Blue
          break;
        case 'PENDING':
          variant = 'outline'; // Gray
          break;
        case 'REJECTED':
          variant = 'destructive'; // Red
          break;
      }

      return <Badge variant={variant}>{status}</Badge>;
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Created',
    cell: ({ row }) => formatDate(row.original.createdAt),
  },
  {
    accessorKey: 'processedBy',
    header: 'Processed By',
  },
];

export const RefundsPage: React.FC = () => {
  // In a real application, you would fetch this data from an API
  const refunds = sampleRefunds;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        title="Refunds"
        description="Manage and process customer refunds"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <FileDown className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button size="sm">New Refund</Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold">Total Refunds</CardTitle>
            <CardDescription>All time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(454.73)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold">Pending Refunds</CardTitle>
            <CardDescription>Awaiting approval</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">3</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold">Refund Rate</CardTitle>
            <CardDescription>Last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">2.4%</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Refunds</CardTitle>
          <CardDescription>
            View and manage all refund requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={refunds} />
        </CardContent>
      </Card>
    </div>
  );
};

export default RefundsPage;
