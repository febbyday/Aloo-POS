import React from 'react';
import { EnhancedDataTable, EnhancedDataTableColumn } from '@/components/ui/enhanced-data-table';
import { 
  UserCircle, 
  Mail, 
  Phone, 
  BadgeCheck, 
  Calendar,
  Building,
  Briefcase,
  Eye,
  Edit,
  Trash2,
  Clock
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Staff } from '../types/staff.types';

interface EnhancedStaffTableProps {
  data: Staff[];
  isLoading?: boolean;
  searchQuery?: string;
  selectedStaff?: string[];
  onSelectionChange?: (selectedStaff: string[]) => void;
  onStaffClick?: (staff: Staff) => void;
  onView?: (staff: Staff) => void;
  onEdit?: (staff: Staff) => void;
  onDelete?: (staff: Staff) => void;
  onManageSchedule?: (staff: Staff) => void;
}

export function EnhancedStaffTable({
  data,
  isLoading = false,
  searchQuery = '',
  selectedStaff = [],
  onSelectionChange,
  onStaffClick,
  onView,
  onEdit,
  onDelete,
  onManageSchedule,
}: EnhancedStaffTableProps) {
  
  // Filter staff based on search query
  const filteredStaff = React.useMemo(() => {
    if (!searchQuery) return data;
    
    return data.filter(staff => {
      const fullName = `${staff.firstName} ${staff.lastName}`.toLowerCase();
      const email = staff.email.toLowerCase();
      const role = staff.role?.name?.toLowerCase() || '';
      const query = searchQuery.toLowerCase();
      
      return fullName.includes(query) || 
             email.includes(query) || 
             role.includes(query) ||
             (staff.phone && staff.phone.includes(query));
    });
  }, [data, searchQuery]);
  
  // Define columns for the table
  const columns: EnhancedDataTableColumn<Staff, any>[] = [
    {
      id: 'name',
      header: 'Staff',
      accessorFn: (row) => `${row.firstName} ${row.lastName}`,
      enableSorting: true,
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <UserCircle className="h-8 w-8 text-muted-foreground" />
          <div>
            <p className="font-medium">
              {row.original.firstName} {row.original.lastName}
            </p>
            <p className="text-sm text-muted-foreground">
              {row.original.role?.name || "No role assigned"}
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'contact',
      header: 'Contact',
      accessorKey: 'email',
      enableSorting: true,
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{row.original.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{row.original.phone || "No phone"}</span>
          </div>
        </div>
      ),
    },
    {
      id: 'position',
      header: 'Position',
      accessorKey: 'code',
      enableSorting: true,
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{row.original.code || "No position"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {row.original.shops && row.original.shops.length > 0
                ? row.original.shops.map(shop => shop.name).join(', ')
                : "No shop assigned"}
            </span>
          </div>
        </div>
      ),
    },
    {
      id: 'employment',
      header: 'Employment',
      accessorFn: (row) => row.employmentType?.name || '',
      enableSorting: true,
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <BadgeCheck className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {row.original.employmentType?.name || "Not specified"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {row.original.employmentStatus?.name || "Not specified"}
            </span>
          </div>
        </div>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      enableSorting: true,
      cell: ({ row }) => {
        const status = row.original.status;
        const variant = 
          status === "ACTIVE" ? "success" :
          status === "INACTIVE" ? "secondary" :
          status === "ON_LEAVE" ? "warning" :
          "default";
        
        return (
          <Badge variant={variant} className="capitalize">
            {status === "ACTIVE" ? "Active" : 
             status === "INACTIVE" ? "Inactive" : 
             status === "ON_LEAVE" ? "On Leave" : 
             status}
          </Badge>
        );
      },
    },
  ];

  // Define actions for the table
  const actions = [];

  // Add conditional actions if handlers are provided
  if (onView) {
    actions.push({
      label: 'View',
      icon: Eye,
      onClick: onView,
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

  if (onManageSchedule) {
    actions.push({
      label: 'Schedule',
      icon: Clock,
      onClick: onManageSchedule,
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
  const getRowClassName = (staff: Staff) => {
    if (staff.status === "INACTIVE") return "bg-muted/20";
    if (staff.status === "ON_LEAVE") return "bg-yellow-50/10";
    return "";
  };

  return (
    <EnhancedDataTable
      columns={columns}
      data={filteredStaff}
      enableRowSelection={!!onSelectionChange}
      onRowSelectionChange={onSelectionChange ? 
        (selectedRows) => onSelectionChange(selectedRows as string[]) : 
        undefined
      }
      onRowClick={onStaffClick}
      onRowDoubleClick={onView}
      enableSearch={true}
      searchPlaceholder="Search staff..."
      enablePagination={true}
      enableSorting={true}
      enableColumnVisibility={true}
      isLoading={isLoading}
      emptyMessage="No staff found"
      loadingMessage="Loading staff..."
      rowClassName={getRowClassName}
      actions={actions}
    />
  );
}
