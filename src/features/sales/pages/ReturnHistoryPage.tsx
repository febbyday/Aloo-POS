import { useState } from 'react';
import { 
  Search,
  RefreshCw,
  Filter,
  Download,
  Calendar,
  MoreHorizontal,
  Eye
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

interface ReturnItem {
  id: string;
  productName: string;
  quantity: number;
  reason: string;
  condition: 'new' | 'used' | 'damaged';
}

interface Return {
  id: string;
  orderId: string;
  customerName: string;
  items: ReturnItem[];
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  totalAmount: number;
  createdAt: Date;
  processedAt?: Date;
}

interface ReturnFilter {
  search?: string;
  status?: Return['status'];
  dateRange?: {
    from: Date;
    to: Date;
  };
}

export function ReturnHistoryPage() {
  const [filters, setFilters] = useState<ReturnFilter>({});
  const { toast } = useToast();

  // Mock returns data - in a real app, this would come from an API
  const [returns] = useState<Return[]>([
    {
      id: 'ret_1',
      orderId: 'ord_123',
      customerName: 'John Doe',
      items: [
        {
          id: 'item_1',
          productName: 'Blue T-Shirt',
          quantity: 1,
          reason: 'Wrong size',
          condition: 'new'
        }
      ],
      status: 'completed',
      totalAmount: 29.99,
      createdAt: new Date(2024, 2, 1),
      processedAt: new Date(2024, 2, 2)
    },
    {
      id: 'ret_2',
      orderId: 'ord_456',
      customerName: 'Jane Smith',
      items: [
        {
          id: 'item_2',
          productName: 'Running Shoes',
          quantity: 1,
          reason: 'Defective',
          condition: 'damaged'
        }
      ],
      status: 'pending',
      totalAmount: 89.99,
      createdAt: new Date(2024, 2, 3)
    }
  ]);

  const handleRefresh = () => {
    toast({
      title: "Refreshing data...",
      description: "Your return history is being updated."
    });
  };

  const handleExport = () => {
    toast({
      title: "Exporting Data",
      description: "Your return history export is being prepared."
    });
  };

  const getStatusBadgeVariant = (status: Return['status']) => {
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

  const getConditionBadgeVariant = (condition: ReturnItem['condition']) => {
    switch (condition) {
      case 'new':
        return 'success';
      case 'used':
        return 'secondary';
      case 'damaged':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Return History</h1>
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
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search returns..."
            className="pl-8"
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          />
        </div>

        <Select
          value={filters.status}
          onValueChange={(value: Return['status']) => 
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

        <Button 
          variant="outline"
          className="h-10"
        >
          <Calendar className="h-4 w-4 mr-2" />
          Date Range
        </Button>

        <Button 
          variant="outline"
          onClick={() => setFilters({})}
          className="h-10"
        >
          <Filter className="h-4 w-4 mr-2" />
          Clear Filters
        </Button>
      </div>

      {/* Returns Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Return ID</TableHead>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead className="text-right">Total Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Processed</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {returns.map(returnItem => (
              <TableRow key={returnItem.id}>
                <TableCell className="font-medium">{returnItem.id}</TableCell>
                <TableCell>{returnItem.orderId}</TableCell>
                <TableCell>{returnItem.customerName}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {returnItem.items.map(item => (
                      <div key={item.id} className="flex items-center gap-2">
                        <span>{item.quantity}x {item.productName}</span>
                        <Badge variant={getConditionBadgeVariant(item.condition)}>
                          {item.condition}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-right">${returnItem.totalAmount.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(returnItem.status)}>
                    {returnItem.status.charAt(0).toUpperCase() + returnItem.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>{format(returnItem.createdAt, 'MMM d, yyyy')}</TableCell>
                <TableCell>
                  {returnItem.processedAt 
                    ? format(returnItem.processedAt, 'MMM d, yyyy')
                    : '-'
                  }
                </TableCell>
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
                      <DropdownMenuItem>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>View Order</DropdownMenuItem>
                      <DropdownMenuItem>Print Return Label</DropdownMenuItem>
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
