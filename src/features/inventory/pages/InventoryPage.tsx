import { useState } from 'react';
import { 
  Search,
  RefreshCw,
  Filter,
  Download,
  Plus,
  ArrowUpDown,
  MoreHorizontal,
  Boxes,
  AlertTriangle,
  TrendingUp,
  TrendingDown
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

interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  quantity: number;
  lowStockThreshold: number;
  reorderPoint: number;
  location: string;
  lastUpdated: Date;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

interface InventoryFilter {
  search?: string;
  category?: string;
  status?: InventoryItem['status'];
  location?: string;
}

export function InventoryPage() {
  const [filters, setFilters] = useState<InventoryFilter>({});
  const { toast } = useToast();

  // Mock inventory data - in a real app, this would come from an API
  const [inventory] = useState<InventoryItem[]>([
    {
      id: 'inv_1',
      sku: 'BTS-001',
      name: 'Blue T-Shirt',
      category: 'Apparel',
      quantity: 50,
      lowStockThreshold: 20,
      reorderPoint: 15,
      location: 'Warehouse A',
      lastUpdated: new Date(2024, 2, 1),
      status: 'in_stock'
    },
    {
      id: 'inv_2',
      sku: 'BJ-001',
      name: 'Black Jeans',
      category: 'Apparel',
      quantity: 10,
      lowStockThreshold: 15,
      reorderPoint: 12,
      location: 'Warehouse B',
      lastUpdated: new Date(2024, 2, 2),
      status: 'low_stock'
    },
    {
      id: 'inv_3',
      sku: 'RS-001',
      name: 'Running Shoes',
      category: 'Footwear',
      quantity: 0,
      lowStockThreshold: 10,
      reorderPoint: 8,
      location: 'Warehouse A',
      lastUpdated: new Date(2024, 2, 3),
      status: 'out_of_stock'
    }
  ]);

  const handleRefresh = () => {
    toast({
      title: "Refreshing data...",
      description: "Your inventory data is being updated."
    });
  };

  const handleExport = () => {
    toast({
      title: "Exporting Data",
      description: "Your inventory data export is being prepared."
    });
  };

  const handleAdjustQuantity = (itemId: string, adjustment: number) => {
    toast({
      title: "Quantity Adjusted",
      description: `Inventory quantity adjusted by ${adjustment}.`
    });
  };

  const getStatusBadgeVariant = (status: InventoryItem['status']) => {
    switch (status) {
      case 'in_stock':
        return 'success';
      case 'low_stock':
        return 'warning';
      case 'out_of_stock':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusLabel = (status: InventoryItem['status']) => {
    switch (status) {
      case 'in_stock':
        return 'In Stock';
      case 'low_stock':
        return 'Low Stock';
      case 'out_of_stock':
        return 'Out of Stock';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Boxes className="h-5 w-5" />
          <h1 className="text-2xl font-bold">Inventory Management</h1>
        </div>
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
            Add Item
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border rounded-lg p-4 flex items-center gap-4">
          <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
            <Boxes className="h-6 w-6 text-green-600 dark:text-green-300" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Items</p>
            <p className="text-2xl font-bold">{inventory.length}</p>
          </div>
        </div>
        <div className="border rounded-lg p-4 flex items-center gap-4">
          <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-full">
            <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-300" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Low Stock Items</p>
            <p className="text-2xl font-bold">
              {inventory.filter(item => item.status === 'low_stock').length}
            </p>
          </div>
        </div>
        <div className="border rounded-lg p-4 flex items-center gap-4">
          <div className="bg-red-100 dark:bg-red-900 p-3 rounded-full">
            <Boxes className="h-6 w-6 text-red-600 dark:text-red-300" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Out of Stock</p>
            <p className="text-2xl font-bold">
              {inventory.filter(item => item.status === 'out_of_stock').length}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search inventory..."
            className="pl-8"
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          />
        </div>

        <Select
          value={filters.category}
          onValueChange={(value: string) => 
            setFilters(prev => ({ ...prev, category: value }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="apparel">Apparel</SelectItem>
            <SelectItem value="footwear">Footwear</SelectItem>
            <SelectItem value="accessories">Accessories</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.status}
          onValueChange={(value: InventoryItem['status']) => 
            setFilters(prev => ({ ...prev, status: value }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="in_stock">In Stock</SelectItem>
            <SelectItem value="low_stock">Low Stock</SelectItem>
            <SelectItem value="out_of_stock">Out of Stock</SelectItem>
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

      {/* Inventory Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right">Low Stock Threshold</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventory.map(item => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.sku}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell className="text-right">{item.quantity}</TableCell>
                <TableCell className="text-right">{item.lowStockThreshold}</TableCell>
                <TableCell>{item.location}</TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(item.status)}>
                    {getStatusLabel(item.status)}
                  </Badge>
                </TableCell>
                <TableCell>{format(item.lastUpdated, 'MMM d, yyyy')}</TableCell>
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
                      <DropdownMenuItem onClick={() => handleAdjustQuantity(item.id, 1)}>
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Increase Quantity
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAdjustQuantity(item.id, -1)}>
                        <TrendingDown className="h-4 w-4 mr-2" />
                        Decrease Quantity
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Edit Details</DropdownMenuItem>
                      <DropdownMenuItem>View History</DropdownMenuItem>
                      <DropdownMenuItem>Print Label</DropdownMenuItem>
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
