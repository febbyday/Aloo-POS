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
} from '@/components/ui';
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
  RefreshCcw
} from 'lucide-react';
import { useToast, useConfirm } from '@/hooks';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import CustomerDialog from './CustomerDialog';
import { useCustomersRealTime, useCustomerEvents } from '../hooks/useCustomerRealTime';
import { customerService } from '../services/customerService';
import type { Customer } from '../types/customer.types';

// Type for sort configuration
interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

const CustomersTable = () => {
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
  
  // Use real-time customers hook
  const { 
    customers, 
    loading, 
    error, 
    connected,
    refreshCustomers 
  } = useCustomersRealTime();
  
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
  
  // Pagination
  const paginatedCustomers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredAndSortedCustomers.slice(startIndex, startIndex + pageSize);
  }, [filteredAndSortedCustomers, currentPage, pageSize]);
  
  const totalPages = Math.ceil(filteredAndSortedCustomers.length / pageSize);
  
  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (sortConfig.key !== columnKey) {
      return <ChevronUp className="h-4 w-4 opacity-30" />;
    }
    
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="h-4 w-4" /> 
      : <ChevronDown className="h-4 w-4" />;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-auto sm:min-w-[300px]">
          <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customers..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {connected && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <span className="animate-pulse mr-1.5 h-2 w-2 rounded-full bg-green-500 inline-block"></span>
              Live Updates
            </Badge>
          )}
          
          <Button
            variant="outline" 
            onClick={refreshCustomers}
            disabled={loading}
          >
            <RefreshCcw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button onClick={() => {
            setEditCustomer(null);
            setIsDialogOpen(true);
          }}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        </div>
      </div>
      
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-md">
          Error loading customers. Please try refreshing the page.
        </div>
      )}
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">
                <Button 
                  variant="ghost" 
                  onClick={() => requestSort('lastName')}
                  className="flex items-center font-semibold"
                >
                  Name
                  <SortIcon columnKey="lastName" />
                </Button>
              </TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  onClick={() => requestSort('email')}
                  className="flex items-center font-semibold"
                >
                  Email
                  <SortIcon columnKey="email" />
                </Button>
              </TableHead>
              <TableHead className="hidden md:table-cell">Phone</TableHead>
              <TableHead className="hidden lg:table-cell">
                <Button 
                  variant="ghost" 
                  onClick={() => requestSort('createdAt')}
                  className="flex items-center font-semibold"
                >
                  Customer Since
                  <SortIcon columnKey="createdAt" />
                </Button>
              </TableHead>
              <TableHead className="hidden md:table-cell">
                <Button 
                  variant="ghost" 
                  onClick={() => requestSort('loyaltyPoints')}
                  className="flex items-center font-semibold"
                >
                  Loyalty
                  <SortIcon columnKey="loyaltyPoints" />
                </Button>
              </TableHead>
              <TableHead className="hidden lg:table-cell">
                <Button 
                  variant="ghost" 
                  onClick={() => requestSort('totalSpent')}
                  className="flex items-center font-semibold"
                >
                  Total Spent
                  <SortIcon columnKey="totalSpent" />
                </Button>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
                    <span className="ml-2">Loading customers...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : paginatedCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  {searchQuery ? (
                    <div className="flex flex-col items-center gap-2">
                      <p>No customers found matching "{searchQuery}"</p>
                      <Button 
                        variant="outline" 
                        onClick={() => setSearchQuery('')}
                        size="sm"
                      >
                        Clear search
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <p>No customers found</p>
                      <Button 
                        onClick={() => {
                          setEditCustomer(null);
                          setIsDialogOpen(true);
                        }}
                        size="sm"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add your first customer
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              paginatedCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">
                    {customer.firstName} {customer.lastName}
                  </TableCell>
                  <TableCell>{customer.email || '-'}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {customer.phone || '-'}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {formatDate(customer.createdAt)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-2">
                      <BadgePercent className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{customer.loyaltyPoints || 0}</span>
                      {customer.loyaltyTier && (
                        <Badge variant="outline" className="text-xs">
                          {customer.loyaltyTier.name}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {formatCurrency(customer.totalSpent || 0)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/customers/${customer.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditCustomer(customer);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(customer)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">
            Showing {paginatedCustomers.length} of {filteredAndSortedCustomers.length} customers
          </p>
          <div className="flex items-center gap-1">
            <p className="text-sm text-muted-foreground">Show</p>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => {
                setPageSize(Number(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={pageSize} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage <= 1}
                />
              </PaginationItem>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
                  // Show first page, last page, and pages around current page
                  return (
                    page === 1 ||
                    page === totalPages ||
                    Math.abs(page - currentPage) <= 1
                  );
                })
                .map((page, i, arr) => {
                  // Add ellipsis if pages are skipped
                  const prevPage = arr[i - 1];
                  const showEllipsis = prevPage && page - prevPage > 1;
                  
                  return (
                    <div key={page} className="flex items-center">
                      {showEllipsis && (
                        <span className="px-2 text-muted-foreground">...</span>
                      )}
                      <PaginationItem>
                        <Button
                          variant={currentPage === page ? "default" : "outline"}
                          className="h-8 w-8"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      </PaginationItem>
                    </div>
                  );
                })}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage >= totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
      
      <CustomerDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        customer={editCustomer}
        onSuccess={() => {
          setIsDialogOpen(false);
          // No need to refresh, WebSocket will update the list
        }}
      />
    </div>
  );
};

export default CustomersTable;
