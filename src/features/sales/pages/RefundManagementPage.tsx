import { useState } from 'react';
import { 
  Search,
  RefreshCw,
  Filter,
  Download,
  Plus,
  ArrowUpDown,
  MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';

interface Refund {
  id: string;
  orderId: string;
  customerName: string;
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  type: 'full' | 'partial';
  createdAt: Date;
  updatedAt: Date;
}

interface RefundFilter {
  search?: string;
  status?: Refund['status'];
  type?: Refund['type'];
  dateRange?: {
    from: Date;
    to: Date;
  };
}

export function RefundManagementPage() {
  const [filters, setFilters] = useState<RefundFilter>({});
  const { toast } = useToast();

  // Mock refunds data - in a real app, this would come from an API
  const [refunds] = useState<Refund[]>([
    {
      id: 'ref_1',
      orderId: 'ord_123',
      customerName: 'John Doe',
      amount: 99.99,
      reason: 'Item damaged during shipping',
      status: 'pending',
      type: 'full',
      createdAt: new Date(2024, 2, 1),
      updatedAt: new Date(2024, 2, 1)
    },
    {
      id: 'ref_2',
      orderId: 'ord_456',
      customerName: 'Jane Smith',
      amount: 25.50,
      reason: 'Wrong size',
      status: 'approved',
      type: 'partial',
      createdAt: new Date(2024, 2, 2),
      updatedAt: new Date(2024, 2, 3)
    }
  ]);

  const handleRefresh = () => {
    toast({
      title: "Refreshing data...",
      description: "Your refund data is being updated."
    });
  };

  const handleStatusChange = (refundId: string, newStatus: Refund['status']) => {
    toast({
      title: "Status Updated",
      description: `Refund ${refundId} status changed to ${newStatus}.`
    });
  };

  const handleExport = () => {
    toast({
      title: "Exporting Data",
      description: "Your refund data export is being prepared."
    });
  };

  const getStatusBadgeVariant = (status: Refund['status']) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'destructive';
      case 'completed':
        return 'default';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Refund Management</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleExport}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Refund
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search refunds..."
            className="pl-8"
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          />
        </div>

        <Select
          value={filters.status}
          onValueChange={(value: Refund['status']) => 
            setFilters(prev => ({ ...prev, status: value }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.type}
          onValueChange={(value: Refund['type']) => 
            setFilters(prev => ({ ...prev, type: value }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="full">Full Refund</SelectItem>
            <SelectItem value="partial">Partial Refund</SelectItem>
          </SelectContent>
        </Select>

        <Button 
          variant="outline"
          onClick={() => setFilters({})}
          className="h-10"
        >
          <Filter className="h-4 w-4 mr-2" />
          Clear Filters
        </Button>
      </div>

      {/* Refunds Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {refunds.map(refund => (
              <TableRow key={refund.id}>
                <TableCell className="font-medium">{refund.id}</TableCell>
                <TableCell>{refund.orderId}</TableCell>
                <TableCell>{refund.customerName}</TableCell>
                <TableCell className="text-right">${refund.amount.toFixed(2)}</TableCell>
                <TableCell>{refund.reason}</TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {refund.type === 'full' ? 'Full' : 'Partial'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(refund.status)}>
                    {refund.status.charAt(0).toUpperCase() + refund.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>{format(refund.createdAt, 'MMM d, yyyy')}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleStatusChange(refund.id, 'approved')}>
                        Approve
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusChange(refund.id, 'rejected')}>
                        Reject
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusChange(refund.id, 'completed')}>
                        Mark as Completed
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>View Order</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
