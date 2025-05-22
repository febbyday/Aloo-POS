import React, { useState } from 'react';
import { EnhancedDataTable } from '@/components/ui/enhanced-data-table';
import { Badge } from '@/components/ui/badge';
import { Shop, ShopStaffMember } from '../types/shops.types';
import { 
  Building2, 
  Settings, 
  Users, 
  BarChart3,
  UserCircle,
  MapPin,
  Calendar,
  Mail,
  Phone,
} from 'lucide-react';
import { useStaff } from '@/features/staff/hooks/useStaff';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface EnhancedShopsTableProps {
  shops: Shop[];
  onRowSelectionChange?: (selectedShops: Shop[]) => void;
  onRowClick?: (shop: Shop) => void;
  onRowDoubleClick?: (shop: Shop) => void;
  isLoading?: boolean;
  onSettingsClick?: (shop: Shop) => void;
}

// Helper function to get status badge variant
function getStatusColor(status: Shop['status']) {
  switch (status) {
    case 'active':
      return 'success';
    case 'inactive':
      return 'secondary';
    case 'maintenance':
      return 'default';
    case 'closed':
      return 'destructive';
    case 'pending':
      return 'warning';
    default:
      return 'default';
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
  
  // Determine how many staff members to display
  const displayCount = Math.min(staffMembers.length, 3);
  
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
        
        {staffMembers.length > displayCount && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Avatar className="h-8 w-8 border-2 border-background">
                  <AvatarFallback className="bg-muted text-muted-foreground">
                    +{staffMembers.length - displayCount}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>
                <div>
                  <p className="font-medium">{staffMembers.length - displayCount} more staff</p>
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

export function EnhancedShopsTable({ 
  shops,
  onRowSelectionChange,
  onRowClick,
  onRowDoubleClick,
  isLoading = false,
  onSettingsClick,
}: EnhancedShopsTableProps) {
  
  // Define columns for the table
  const columns = [
    {
      id: 'name',
      header: 'Shop Name',
      accessorKey: 'name',
      enableSorting: true,
      cell: ({ row }: any) => {
        const shop = row.original;
        return (
          <div className="flex items-center">
            <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{shop.name}</span>
          </div>
        );
      },
    },
    {
      id: 'location',
      header: 'Location',
      accessorKey: 'address',
      enableSorting: true,
      cell: ({ row }: any) => {
        const shop = row.original;
        const address = shop.address;
        
        if (!address) return 'N/A';
        
        return (
          <div className="flex items-center">
            <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>
              {address.city}
              {address.state ? `, ${address.state}` : ''}
            </span>
          </div>
        );
      },
    },
    {
      id: 'type',
      header: 'Type',
      accessorKey: 'type',
      enableSorting: true,
      cell: ({ row }: any) => {
        const shop = row.original;
        return (
          <Badge variant="outline">
            {shop.type.charAt(0).toUpperCase() + shop.type.slice(1).toLowerCase()}
          </Badge>
        );
      },
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      enableSorting: true,
      cell: ({ row }: any) => {
        const shop = row.original;
        return (
          <Badge variant={getStatusColor(shop.status)}>
            {shop.status.charAt(0).toUpperCase() + shop.status.slice(1).toLowerCase()}
          </Badge>
        );
      },
    },
    {
      id: 'staff',
      header: 'Staff',
      accessorKey: 'staffMembers',
      enableSorting: false,
      cell: ({ row }: any) => {
        const shop = row.original;
        return <StaffCell staffMembers={shop.staffMembers} />;
      },
    },
    {
      id: 'sales',
      header: 'Monthly Sales',
      accessorKey: 'salesLastMonth',
      enableSorting: true,
      cell: ({ row }: any) => {
        const shop = row.original;
        return (
          <div className="flex items-center">
            <BarChart3 className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>
              ${shop.salesLastMonth?.toLocaleString() || '0'}
            </span>
          </div>
        );
      },
    },
    {
      id: 'lastSync',
      header: 'Last Sync',
      accessorKey: 'lastSync',
      enableSorting: true,
      cell: ({ row }: any) => {
        const shop = row.original;
        const lastSync = shop.lastSync instanceof Date 
          ? shop.lastSync
          : typeof shop.lastSync === 'string'
            ? new Date(shop.lastSync)
            : null;
            
        if (!lastSync) return 'N/A';
        
        return (
          <div className="flex items-center">
            <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>{lastSync.toLocaleDateString()}</span>
          </div>
        );
      },
    },
  ];
  
  return (
    <EnhancedDataTable
      columns={columns}
      data={shops}
      enableRowSelection={!!onRowSelectionChange}
      onRowSelectionChange={onRowSelectionChange}
      onRowClick={onRowClick}
      onRowDoubleClick={onRowDoubleClick}
      enableSearch={true}
      searchPlaceholder="Search shops..."
      enablePagination={true}
      enableSorting={true}
      enableColumnVisibility={true}
      isLoading={isLoading}
      emptyMessage="No shops found"
      loadingMessage="Loading shops..."
      stickyHeader={true}
      actions={onSettingsClick ? [
        {
          label: 'Settings',
          icon: Settings,
          onClick: onSettingsClick,
          variant: 'ghost',
        },
      ] : []}
    />
  );
}
