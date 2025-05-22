import React from 'react';
import { EnhancedDataTable, EnhancedDataTableColumn } from '@/components/ui/enhanced-data-table';
import { 
  Tent, 
  MapPin, 
  Calendar, 
  Package, 
  Users, 
  Activity,
  Eye,
  Edit,
  Trash2,
  Settings
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Market, MarketFilter } from '../pages/MarketsPage';
import { format } from 'date-fns';

interface EnhancedMarketsTableProps {
  data: Market[];
  filters?: MarketFilter;
  isLoading?: boolean;
  selectedMarkets?: string[];
  onSelectionChange?: (selectedMarkets: string[]) => void;
  onMarketClick?: (market: Market) => void;
  onViewDetails?: (market: Market) => void;
  onEdit?: (market: Market) => void;
  onDelete?: (market: Market) => void;
  onManageStock?: (market: Market) => void;
}

export function EnhancedMarketsTable({
  data,
  filters = {},
  isLoading = false,
  selectedMarkets = [],
  onSelectionChange,
  onMarketClick,
  onViewDetails,
  onEdit,
  onDelete,
  onManageStock,
}: EnhancedMarketsTableProps) {
  
  // Filter markets based on filters
  const filteredMarkets = React.useMemo(() => {
    return data.filter(market => {
      // Search filter
      if (filters.search && !market.name.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      
      // Status filter
      if (filters.status && market.status !== filters.status) {
        return false;
      }
      
      return true;
    });
  }, [data, filters]);
  
  // Define columns for the table
  const columns: EnhancedDataTableColumn<Market, any>[] = [
    {
      id: 'name',
      header: 'Market Name',
      accessorKey: 'name',
      enableSorting: true,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Tent className="h-4 w-4 text-blue-400" />
          <span className="font-medium">{row.original.name}</span>
          <Badge className={getStatusColor(row.original.status)}>
            {row.original.status}
          </Badge>
        </div>
      ),
    },
    {
      id: 'location',
      header: 'Location',
      accessorKey: 'location',
      enableSorting: true,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span>{row.original.location}</span>
        </div>
      ),
    },
    {
      id: 'dates',
      header: 'Dates',
      accessorFn: (row) => row.startDate.toISOString(),
      enableSorting: true,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>
            {format(row.original.startDate, 'MMM d, yyyy')} - {format(row.original.endDate, 'MMM d, yyyy')}
          </span>
        </div>
      ),
    },
    {
      id: 'stock',
      header: 'Stock Allocation',
      accessorFn: (row) => (row.stockAllocation.allocated / row.stockAllocation.total) * 100,
      enableSorting: true,
      cell: ({ row }) => (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-sm">
            <span>
              {row.original.stockAllocation.allocated} / {row.original.stockAllocation.total} items
            </span>
            <span>
              {Math.round((row.original.stockAllocation.allocated / row.original.stockAllocation.total) * 100)}%
            </span>
          </div>
          <Progress
            value={(row.original.stockAllocation.allocated / row.original.stockAllocation.total) * 100}
            className="h-2"
          />
        </div>
      ),
    },
    {
      id: 'staff',
      header: 'Staff',
      accessorFn: (row) => (row.staffAssigned.assigned / row.staffAssigned.required) * 100,
      enableSorting: true,
      cell: ({ row }) => (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-sm">
            <span>
              {row.original.staffAssigned.assigned} / {row.original.staffAssigned.required} assigned
            </span>
            <span>
              {Math.round((row.original.staffAssigned.assigned / row.original.staffAssigned.required) * 100)}%
            </span>
          </div>
          <Progress
            value={(row.original.staffAssigned.assigned / row.original.staffAssigned.required) * 100}
            className="h-2"
          />
        </div>
      ),
    },
    {
      id: 'progress',
      header: 'Progress',
      accessorKey: 'progress',
      enableSorting: true,
      cell: ({ row }) => (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-sm">
            <span>
              <Activity className="h-4 w-4 text-muted-foreground inline mr-2" />
              Overall Progress
            </span>
            <span>{row.original.progress}%</span>
          </div>
          <Progress
            value={row.original.progress}
            className="h-2"
          />
        </div>
      ),
    },
  ];

  // Helper function to get status badge color
  function getStatusColor(status: Market['status']) {
    switch (status) {
      case 'planning':
        return 'bg-blue-500/20 text-blue-700 hover:bg-blue-500/30 border-blue-500/10';
      case 'active':
        return 'bg-green-500/20 text-green-700 hover:bg-green-500/30 border-green-500/10';
      case 'completed':
        return 'bg-gray-500/20 text-gray-700 hover:bg-gray-500/30 border-gray-500/10';
      case 'cancelled':
        return 'bg-red-500/20 text-red-700 hover:bg-red-500/30 border-red-500/10';
      default:
        return '';
    }
  }

  // Define actions for the table
  const actions = [];

  // Add conditional actions if handlers are provided
  if (onViewDetails) {
    actions.push({
      label: 'View Details',
      icon: Eye,
      onClick: onViewDetails,
      variant: 'ghost',
    });
  }

  if (onEdit) {
    actions.push({
      label: 'Edit',
      icon: Edit,
      onClick: onEdit,
      variant: 'ghost',
    });
  }

  if (onManageStock) {
    actions.push({
      label: 'Manage Stock',
      icon: Package,
      onClick: onManageStock,
      variant: 'ghost',
    });
  }

  if (onDelete) {
    actions.push({
      label: 'Delete',
      icon: Trash2,
      onClick: onDelete,
      variant: 'destructive',
    });
  }

  // Custom row class name function
  const getRowClassName = (market: Market) => {
    if (market.status === 'cancelled') return "bg-red-50/10";
    if (market.status === 'completed') return "bg-gray-50/10";
    if (market.status === 'active') return "bg-green-50/10";
    return "";
  };

  return (
    <EnhancedDataTable
      columns={columns}
      data={filteredMarkets}
      enableRowSelection={!!onSelectionChange}
      onRowSelectionChange={onSelectionChange ? 
        (selectedRows) => onSelectionChange(selectedRows as string[]) : 
        undefined
      }
      onRowClick={onMarketClick}
      onRowDoubleClick={onViewDetails}
      enableSearch={false} // We're using external search
      enablePagination={true}
      enableSorting={true}
      enableColumnVisibility={true}
      isLoading={isLoading}
      emptyMessage="No markets found"
      loadingMessage="Loading markets..."
      rowClassName={getRowClassName}
      actions={actions}
    />
  );
}
