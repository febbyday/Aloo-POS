import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Shop, ShopStaffMember } from '../types/shops.types'
import { 
  Building2, 
  Settings, 
  Users, 
  BarChart3,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  UserCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState, useRef } from 'react'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useStaff } from '@/features/staff/hooks/useStaff'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Staff } from '@/features/staff/types'
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface Column {
  id: string;
  label: string;
  icon: any;
  align?: 'left' | 'center' | 'right';
}

interface ShopsTableProps {
  shops: Shop[]
  columns: Column[]
  selectedShops: string[]
  onSelectShop: (shopId: string) => void
  onSelectAll: () => void
  sortConfig: { column: string; direction: 'asc' | 'desc' } | null
  onSort: (column: string) => void
  onRowClick?: (shop: Shop) => void
  onViewShopDetails?: (shop: Shop) => void
}

function getStatusColor(status: Shop['status']) {
  switch (status) {
    case 'active':
      return 'success'
    case 'inactive':
      return 'secondary'
    case 'maintenance':
      return 'default'
    default:
      return 'default'
  }
}

// Staff Cell component to display staff members for a shop
function StaffCell({ staffMembers }: { staffMembers?: ShopStaffMember[] }) {
  // Use the staff hook to get additional staff information if needed
  const { items: allStaff } = useStaff({ autoLoad: true });
  
  if (!staffMembers || staffMembers.length === 0) {
    return (
      <div className="flex items-center text-muted-foreground">
        <Users className="mr-2 h-4 w-4" />
        <span>No staff assigned</span>
      </div>
    );
  }
  
  // Show at most 3 staff members directly, the rest in a tooltip
  const displayCount = Math.min(staffMembers.length, 3);
  const remainingCount = staffMembers.length - displayCount;
  
  return (
    <div className="flex items-center">
      <div className="flex -space-x-2 mr-2">
        {staffMembers.slice(0, displayCount).map((staff) => (
          <TooltipProvider key={staff.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Avatar className="h-8 w-8 border-2 border-background">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {staff.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>
                <div className="space-y-1">
                  <p className="font-medium">{staff.name}</p>
                  <p className="text-xs text-muted-foreground">{staff.position}</p>
                  {staff.email && <p className="text-xs">{staff.email}</p>}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
        
        {remainingCount > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Avatar className="h-8 w-8 border-2 border-background">
                  <AvatarFallback className="bg-secondary text-secondary-foreground">
                    +{remainingCount}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>
                <div className="space-y-2">
                  <p className="font-medium">{remainingCount} more staff members</p>
                  <div className="space-y-1">
                    {staffMembers.slice(displayCount).map((staff) => (
                      <div key={staff.id} className="flex items-center gap-2">
                        <UserCircle className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm">{staff.name} <span className="text-xs text-muted-foreground">({staff.position})</span></p>
                      </div>
                    ))}
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <span>{staffMembers.length} staff</span>
    </div>
  );
}

export function ShopsTable({ 
  shops,
  columns,
  selectedShops, 
  onSelectShop,
  onSelectAll,
  sortConfig,
  onSort,
  onRowClick,
  onViewShopDetails
}: ShopsTableProps) {
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Track clicks for double-click detection
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastClickedRowRef = useRef<string | null>(null);
  
  // Handle row click (single click for select, double click for details)
  const handleRowClick = (shop: Shop) => {
    const currentTime = new Date().getTime();
    
    // If this is the same row that was clicked recently
    if (lastClickedRowRef.current === shop.id && clickTimeoutRef.current) {
      // Double click detected
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
      lastClickedRowRef.current = null;
      
      // Navigate to shop details
      if (onViewShopDetails) {
        onViewShopDetails(shop);
      }
    } else {
      // Single click - set timeout to handle selection
      lastClickedRowRef.current = shop.id;
      
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
      
      clickTimeoutRef.current = setTimeout(() => {
        // Single click logic: select the row
        onSelectShop(shop.id);
        
        // Also call the original onRowClick if provided
        if (onRowClick) {
          onRowClick(shop);
        }
        
        clickTimeoutRef.current = null;
      }, 250); // 250ms is typical double-click threshold
    }
  };
  
  const handleCheckboxClick = (e: React.MouseEvent, shopId: string) => {
    e.stopPropagation();
    onSelectShop(shopId);
  };
  
  const handleSortClick = (column: string) => {
    onSort(column);
  };
  
  const renderCellContent = (shop: Shop, columnId: string) => {
    switch (columnId) {
      case 'name':
        return (
          <div className="flex items-center">
            <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{shop.name}</span>
          </div>
        );
      case 'location':
        return shop.location;
      case 'type':
        return (
          <Badge variant="outline">
            {shop.type.charAt(0).toUpperCase() + shop.type.slice(1)}
          </Badge>
        );
      case 'status':
        return (
          <Badge variant={getStatusColor(shop.status)}>
            {shop.status.charAt(0).toUpperCase() + shop.status.slice(1)}
          </Badge>
        );
      case 'staff':
        return <StaffCell staffMembers={shop.staffMembers} />;
      case 'sales':
        return (
          <div className="flex items-center">
            <BarChart3 className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>
              ${shop.salesLastMonth?.toLocaleString() || '0'}
            </span>
          </div>
        );
      case 'lastSync':
        return shop.lastSync instanceof Date 
          ? shop.lastSync.toLocaleDateString() 
          : typeof shop.lastSync === 'string'
            ? new Date(shop.lastSync).toLocaleDateString()
            : 'N/A';
      case 'createdAt':
        return shop.createdAt instanceof Date 
          ? shop.createdAt.toLocaleDateString() 
          : typeof shop.createdAt === 'string'
            ? new Date(shop.createdAt).toLocaleDateString()
            : 'N/A';
      case 'actions':
        return (
          <div className="flex justify-end">
            <Button size="sm" variant="ghost">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        );
      default:
        // Safely handle different types of values
        const value = shop[columnId as keyof Shop];
        
        if (value === undefined || value === null) {
          return 'N/A';
        }
        
        if (value instanceof Date) {
          return value.toLocaleDateString();
        }
        
        if (typeof value === 'object') {
          return JSON.stringify(value);
        }
        
        return String(value);
    }
  };
  
  // Calculate pagination
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const displayedShops = shops.slice(startIndex, endIndex);
  const totalPages = Math.ceil(shops.length / rowsPerPage);
  
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[48px]">
              <Checkbox 
                checked={selectedShops.length === shops.length && shops.length > 0}
                onCheckedChange={onSelectAll}
              />
            </TableHead>
            {columns.map((column) => (
              <TableHead 
                key={column.id}
                className={cn(
                  'cursor-pointer select-none',
                  column.align === 'center' && 'text-center',
                  column.align === 'right' && 'text-right'
                )}
                onClick={() => handleSortClick(column.id)}
              >
                <div className="flex items-center space-x-1">
                  {column.icon && <column.icon className="h-4 w-4 text-muted-foreground" />}
                  <span>{column.label}</span>
                  {sortConfig?.column === column.id ? (
                    sortConfig.direction === 'asc' ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )
                  ) : (
                    <ChevronsUpDown className="h-4 w-4 text-muted-foreground opacity-50" />
                  )}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayedShops.length > 0 ? (
            displayedShops.map((shop) => (
              <TableRow 
                key={shop.id} 
                onClick={() => handleRowClick(shop)}
                className={cn(
                  'cursor-pointer transition-colors hover:bg-muted/50',
                  selectedShops.includes(shop.id) && 'bg-muted/50'
                )}
              >
                <TableCell className="py-2">
                  <Checkbox 
                    checked={selectedShops.includes(shop.id)}
                    onCheckedChange={() => onSelectShop(shop.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </TableCell>
                {columns.map(column => (
                  <TableCell 
                    key={column.id}
                    className={cn(
                      column.align === 'center' && 'text-center',
                      column.align === 'right' && 'text-right'
                    )}
                  >
                    {renderCellContent(shop, column.id)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length + 1} className="h-24 text-center">
                No shops found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      
      {/* Pagination controls */}
      <div className="flex items-center justify-between p-4 border-t">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">
            Rows per page:
          </span>
          <Select 
            value={rowsPerPage.toString()} 
            onValueChange={(value) => setRowsPerPage(parseInt(value))}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={rowsPerPage.toString()} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center space-x-6">
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
