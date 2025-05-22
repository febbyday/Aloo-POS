/**
 * Customers Table Component
 *
 * Displays a table of customers with sorting, filtering, and pagination.
 * Uses real-time updates via WebSocket to keep the customer list up-to-date.
 */

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Input,
  Button,
  Badge,
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Checkbox,
} from '@/components/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Search,
  ChevronUp,
  ChevronDown,
  Plus,
  Edit,
  Trash2,
  Eye,
  UserPlus,
  BadgePercent,
  RefreshCcw,
  Mail,
  Phone,
  Calendar,
  User,
  Tag,
  MoreHorizontal,
  CreditCard
} from 'lucide-react';
import { useToast, useConfirm } from '@/hooks';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import CustomerDialog from './CustomerDialog';
import { useCustomersRealTime, useCustomerEvents } from '../hooks/useCustomerRealTime';
import { customerService } from '../services';
import type { Customer } from '../types/customer.types';
import { cn } from '@/lib/utils';
import { tableStyles } from "@/components/ui/shared-table-styles";

// Type for sort configuration
interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

// Add ActionMenu component
interface ActionMenuProps {
  customer: Customer;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
  onView: (customer: Customer) => void;
}

function ActionMenu({ customer, onEdit, onDelete, onView }: ActionMenuProps) {
  // Create a button element without using asChild
  const triggerButton = (
    <button className="h-8 w-8 p-0 hover:bg-accent">
      <span className="sr-only">Open menu</span>
      <MoreHorizontal className="h-4 w-4" />
    </button>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        {triggerButton}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onView(customer)}>
          <Eye className="mr-2 h-4 w-4" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEdit(customer)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Customer
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDelete(customer)}>
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Customer
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface CustomersTableProps {
  filters?: CustomerFilters;
  customers: Customer[];
  onEdit: (customer: Customer) => void;
  isLoading?: boolean;
  onSelectionChange?: (selectedCustomerIds: string[]) => void;
}

const CustomersTable = ({ filters = {}, customers, onEdit, isLoading = false, onSelectionChange }: CustomersTableProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { confirm } = useConfirm();

  // State for dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);

  // State for filtering and pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'lastName',
    direction: 'asc'
  });

  // Add selection state
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Use real-time customers hook
  const {
    loading: hookLoading,
    error: hookError,
    connected,
    refreshCustomers
  } = useCustomersRealTime();

  // Use loading state from props or from the hook
  const loading = isLoading || hookLoading;

  // Use error from the hook
  const error = hookError;

  // Set up customer event handlers
  useCustomerEvents({
    onCustomerCreated: () => {
      toast({
        title: "Customer Added",
        description: "A new customer has been added to the system.",
      });
    },
    onCustomerUpdated: () => {
      // We don't need to do anything here since the list updates automatically
    },
    onCustomerDeleted: (customerId) => {
      toast({
        title: "Customer Deleted",
        description: "A customer has been removed from the system.",
      });
    }
  });

  // Reset to first page when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Handle sorting
  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';

    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }

    setSortConfig({ key, direction });
  };

  // Handle customer deletion
  const handleDelete = async (customer: Customer) => {
    const confirmed = await confirm({
      title: 'Delete Customer',
      description: `Are you sure you want to delete ${customer.firstName} ${customer.lastName}?`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      destructive: true
    });

    if (confirmed) {
      try {
        await customerService.delete(customer.id);
        // The list will update automatically via WebSocket
        toast({
          title: 'Customer Deleted',
          description: `${customer.firstName} ${customer.lastName} has been deleted successfully.`
        });
      } catch (error) {
        console.error('Failed to delete customer:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete customer.',
          variant: 'destructive'
        });
      }
    }
  };

  // Filter and sort customers
  const filteredAndSortedCustomers = useMemo(() => {
    // Filter customers based on search query
    const filtered = customers.filter(customer => {
      const searchable = `
        ${customer.firstName}
        ${customer.lastName}
        ${customer.email || ''}
        ${customer.phone || ''}
      `.toLowerCase();

      return searchable.includes(searchQuery.toLowerCase());
    });

    // Sort customers
    return [...filtered].sort((a, b) => {
      const key = sortConfig.key as keyof Customer;

      // Handle nested properties
      if (key === 'loyaltyTier') {
        const tierA = a.loyaltyTier?.name || '';
        const tierB = b.loyaltyTier?.name || '';

        if (sortConfig.direction === 'asc') {
          return tierA.localeCompare(tierB);
        } else {
          return tierB.localeCompare(tierA);
        }
      }

      // Handle regular properties
      const valueA = a[key] || '';
      const valueB = b[key] || '';

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sortConfig.direction === 'asc'
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }

      // Handle number comparisons
      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return sortConfig.direction === 'asc'
          ? valueA - valueB
          : valueB - valueA;
      }

      // Handle date comparisons
      if (valueA instanceof Date && valueB instanceof Date) {
        return sortConfig.direction === 'asc'
          ? valueA.getTime() - valueB.getTime()
          : valueB.getTime() - valueA.getTime();
      }

      return 0;
    });
  }, [customers, searchQuery, sortConfig]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredAndSortedCustomers.length / pageSize);
  const paginatedCustomers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredAndSortedCustomers.slice(startIndex, startIndex + pageSize);
  }, [filteredAndSortedCustomers, currentPage, pageSize]);

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (sortConfig.key !== columnKey) {
      return <ChevronUp className="h-4 w-4 opacity-30" />;
    }

    return sortConfig.direction === 'asc'
      ? <ChevronUp className="h-4 w-4" />
      : <ChevronDown className="h-4 w-4" />;
  };

  // Modify toggleAllRows to call onSelectionChange
  const toggleAllRows = (checked: boolean) => {
    const newSelected = checked ? filteredAndSortedCustomers.map(customer => customer.id) : [];
    setSelectedItems(newSelected);

    // Notify parent component of selection changes
    if (onSelectionChange) {
      onSelectionChange(newSelected);
    }
  };

  // Modify toggleRowSelection to call onSelectionChange
  const toggleRowSelection = (id: string) => {
    setSelectedItems(prev => {
      let newSelected;
      if (prev.includes(id)) {
        newSelected = prev.filter(item => item !== id);
      } else {
        newSelected = [...prev, id];
      }

      // Notify parent component of selection changes
      if (onSelectionChange) {
        onSelectionChange(newSelected);
      }

      return newSelected;
    });
  };

  // Add renderSortIcon function
  const renderSortIcon = () => {
    if (sortConfig.direction === 'asc') {
      return <ChevronUp className="h-4 w-4 ml-1" />;
    }
    return <ChevronDown className="h-4 w-4 ml-1" />;
  };

  // Define view handler
  const handleViewCustomer = (customer: Customer) => {
    navigate(`/customers/${customer.id}`);
  };

  // Modify the handleEdit function
  const handleEdit = (customer: Customer) => {
    setEditCustomer(customer);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-md">
          Error loading customers. Please try refreshing the page.
        </div>
      )}

      <div className="rounded-md">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={selectedItems.length === paginatedCustomers.length && paginatedCustomers.length > 0}
                  onCheckedChange={toggleAllRows}
                  aria-label="Select all customers"
                />
              </TableHead>
              <TableHead>
                <div className={tableStyles.headerCellContent} onClick={() => requestSort('firstName')}>
                  <User className="h-4 w-4" />
                  <span>Name</span>
                  {sortConfig.key === 'firstName' && renderSortIcon()}
                </div>
              </TableHead>
              <TableHead>
                <div className={tableStyles.headerCellContent} onClick={() => requestSort('email')}>
                  <Mail className="h-4 w-4" />
                  <span>Email</span>
                  {sortConfig.key === 'email' && renderSortIcon()}
                </div>
              </TableHead>
              <TableHead>
                <div className={tableStyles.headerCellContent} onClick={() => requestSort('phone')}>
                  <Phone className="h-4 w-4" />
                  <span>Phone</span>
                  {sortConfig.key === 'phone' && renderSortIcon()}
                </div>
              </TableHead>
              <TableHead>
                <div className={tableStyles.headerCellContent} onClick={() => requestSort('lastPurchaseDate')}>
                  <Calendar className="h-4 w-4" />
                  <span>Last Purchase</span>
                  {sortConfig.key === 'lastPurchaseDate' && renderSortIcon()}
                </div>
              </TableHead>
              <TableHead>
                <div className={tableStyles.headerCellContent} onClick={() => requestSort('loyaltyPoints')}>
                  <BadgePercent className="h-4 w-4" />
                  <span>Loyalty Points</span>
                  {sortConfig.key === 'loyaltyPoints' && renderSortIcon()}
                </div>
              </TableHead>
              <TableHead>
                <div className={tableStyles.headerCellContent} onClick={() => requestSort('totalSpent')}>
                  <CreditCard className="h-4 w-4" />
                  <span>Total Spent</span>
                  {sortConfig.key === 'totalSpent' && renderSortIcon()}
                </div>
              </TableHead>
              <TableHead>
                <div className={tableStyles.headerCellContent} onClick={() => requestSort('loyaltyTier')}>
                  <Tag className="h-4 w-4" />
                  <span>Tier</span>
                  {sortConfig.key === 'loyaltyTier' && renderSortIcon()}
                </div>
              </TableHead>
              <TableHead className="text-right">
                <span>Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin h-6 w-6 border-2 border-primary rounded-full border-t-transparent"></div>
                    <span className="ml-2">Loading customers...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : paginatedCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  No customers found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedCustomers.map((customer) => (
                <TableRow
                  key={customer.id}
                  className={cn(
                    "border-b border-border transition-colors hover:bg-muted/50 cursor-pointer",
                    selectedItems.includes(customer.id) && "bg-muted"
                  )}
                  onClick={() => toggleRowSelection(customer.id)}
                  onDoubleClick={() => handleViewCustomer(customer)}
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedItems.includes(customer.id)}
                      onCheckedChange={() => toggleRowSelection(customer.id)}
                      aria-label={`Select customer ${customer.firstName} ${customer.lastName}`}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    {customer.firstName} {customer.lastName}
                  </TableCell>
                  <TableCell>
                    {customer.email || '-'}
                  </TableCell>
                  <TableCell>
                    {customer.phone || '-'}
                  </TableCell>
                  <TableCell>
                    {customer.lastPurchaseDate ? formatDate(customer.lastPurchaseDate) : 'Never'}
                  </TableCell>
                  <TableCell>
                    {customer.loyaltyPoints || 0}
                  </TableCell>
                  <TableCell>
                    {formatCurrency(customer.totalSpent || 0)}
                  </TableCell>
                  <TableCell>
                    {customer.loyaltyTier ? (
                      <Badge variant="secondary" className="capitalize">
                        {customer.loyaltyTier.name}
                      </Badge>
                    ) : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <ActionMenu
                      customer={customer}
                      onView={handleViewCustomer}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between w-full gap-4">
        <div className="flex items-center space-x-2">
          <p className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, filteredAndSortedCustomers.length)} of {filteredAndSortedCustomers.length}
          </p>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => {
              setPageSize(parseInt(value, 10));
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={pageSize.toString()} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Pagination className="w-full md:w-auto">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              />
            </PaginationItem>
            {/* Render page numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + Math.max(1, Math.min(currentPage - 2, totalPages - 4));
              return (
                <PaginationItem key={pageNum}>
                  <Button
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="icon"
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                </PaginationItem>
              );
            })}
            <PaginationItem>
              <PaginationNext
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      <CustomerDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        customer={editCustomer}
        onSubmit={() => {
          setIsDialogOpen(false);
          setEditCustomer(null);
        }}
      />
    </div>
  );
};

export default CustomersTable;
