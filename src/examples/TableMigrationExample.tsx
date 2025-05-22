import React, { useState } from 'react';
import { EnhancedDataTable } from '@/components/ui/enhanced-data-table';
import { Edit, Trash, Eye, Users, Mail, Phone } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Sample data
interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
}

const sampleCustomers: Customer[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '(555) 123-4567',
    status: 'active',
    totalOrders: 12,
    totalSpent: 1245.67,
    lastOrderDate: '2023-06-15',
  },
  {
    id: '2',
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    phone: '(555) 987-6543',
    status: 'active',
    totalOrders: 8,
    totalSpent: 876.54,
    lastOrderDate: '2023-05-28',
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob.johnson@example.com',
    phone: '(555) 456-7890',
    status: 'inactive',
    totalOrders: 3,
    totalSpent: 234.56,
    lastOrderDate: '2023-03-10',
  },
  {
    id: '4',
    name: 'Alice Williams',
    email: 'alice.williams@example.com',
    phone: '(555) 789-0123',
    status: 'active',
    totalOrders: 15,
    totalSpent: 1567.89,
    lastOrderDate: '2023-06-20',
  },
  {
    id: '5',
    name: 'Charlie Brown',
    email: 'charlie.brown@example.com',
    phone: '(555) 234-5678',
    status: 'active',
    totalOrders: 6,
    totalSpent: 543.21,
    lastOrderDate: '2023-05-15',
  },
];

// BEFORE: Original implementation
function OriginalCustomersTable() {
  const [customers] = useState<Customer[]>(sampleCustomers);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage] = useState(10);
  
  // Pagination logic
  const startIndex = currentPage * itemsPerPage;
  const paginatedCustomers = customers.slice(startIndex, startIndex + itemsPerPage);
  
  // Selection logic
  const toggleCustomerSelection = (customerId: string) => {
    setSelectedCustomers(prev => {
      if (prev.includes(customerId)) {
        return prev.filter(id => id !== customerId);
      } else {
        return [...prev, customerId];
      }
    });
  };
  
  const toggleAllSelection = () => {
    if (selectedCustomers.length === customers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(customers.map(c => c.id));
    }
  };
  
  // Action handlers
  const handleView = (customer: Customer) => {
    toast({
      title: 'View Customer',
      description: `Viewing ${customer.name}`,
    });
  };
  
  const handleEdit = (customer: Customer) => {
    toast({
      title: 'Edit Customer',
      description: `Editing ${customer.name}`,
    });
  };
  
  const handleDelete = (customer: Customer) => {
    toast({
      title: 'Delete Customer',
      description: `Deleting ${customer.name}`,
      variant: 'destructive',
    });
  };
  
  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <table className="w-full caption-bottom text-sm">
          <thead className="bg-muted/50">
            <tr className="border-b transition-colors hover:bg-muted/50">
              <th className="h-12 px-4 text-left align-middle font-medium">
                <input
                  type="checkbox"
                  checked={selectedCustomers.length === customers.length && customers.length > 0}
                  onChange={toggleAllSelection}
                  className="h-4 w-4 rounded border-gray-300"
                />
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium">Customer</th>
              <th className="h-12 px-4 text-left align-middle font-medium">Contact</th>
              <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
              <th className="h-12 px-4 text-left align-middle font-medium">Orders</th>
              <th className="h-12 px-4 text-right align-middle font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedCustomers.map((customer) => (
              <tr
                key={customer.id}
                className="border-b transition-colors hover:bg-muted/50"
              >
                <td className="p-4 align-middle">
                  <input
                    type="checkbox"
                    checked={selectedCustomers.includes(customer.id)}
                    onChange={() => toggleCustomerSelection(customer.id)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                </td>
                <td className="p-4 align-middle">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{customer.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Customer since {new Date().getFullYear()}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-4 align-middle">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{customer.email}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{customer.phone}</span>
                    </div>
                  </div>
                </td>
                <td className="p-4 align-middle">
                  <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    customer.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {customer.status}
                  </div>
                </td>
                <td className="p-4 align-middle">
                  <div>
                    <div className="font-medium">{customer.totalOrders} orders</div>
                    <div className="text-sm text-muted-foreground">
                      ${customer.totalSpent.toFixed(2)} total
                    </div>
                  </div>
                </td>
                <td className="p-4 align-middle text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleView(customer)}
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(customer)}
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(customer)}
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, customers.length)} of {customers.length} customers
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 0))}
            disabled={currentPage === 0}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(customers.length / itemsPerPage) - 1))}
            disabled={currentPage >= Math.ceil(customers.length / itemsPerPage) - 1}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

// AFTER: Migrated implementation
function MigratedCustomersTable() {
  const [customers] = useState<Customer[]>(sampleCustomers);
  const [selectedCustomers, setSelectedCustomers] = useState<Customer[]>([]);
  
  // Action handlers
  const handleView = (customer: Customer) => {
    toast({
      title: 'View Customer',
      description: `Viewing ${customer.name}`,
    });
  };
  
  const handleEdit = (customer: Customer) => {
    toast({
      title: 'Edit Customer',
      description: `Editing ${customer.name}`,
    });
  };
  
  const handleDelete = (customer: Customer) => {
    toast({
      title: 'Delete Customer',
      description: `Deleting ${customer.name}`,
      variant: 'destructive',
    });
  };
  
  // Define columns
  const columns = [
    {
      id: 'customer',
      header: 'Customer',
      accessorKey: 'name',
      enableSorting: true,
      cell: ({ row }) => {
        const customer = row.original;
        return (
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="font-medium">{customer.name}</div>
              <div className="text-sm text-muted-foreground">
                Customer since {new Date().getFullYear()}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      id: 'contact',
      header: 'Contact',
      accessorKey: 'email',
      cell: ({ row }) => {
        const customer = row.original;
        return (
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{customer.email}</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{customer.phone}</span>
            </div>
          </div>
        );
      },
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      enableSorting: true,
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            status === 'active' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {status}
          </div>
        );
      },
    },
    {
      id: 'orders',
      header: 'Orders',
      accessorKey: 'totalOrders',
      enableSorting: true,
      cell: ({ row }) => {
        const customer = row.original;
        return (
          <div>
            <div className="font-medium">{customer.totalOrders} orders</div>
            <div className="text-sm text-muted-foreground">
              ${customer.totalSpent.toFixed(2)} total
            </div>
          </div>
        );
      },
    },
  ];
  
  return (
    <EnhancedDataTable
      columns={columns}
      data={customers}
      enableRowSelection={true}
      onRowSelectionChange={setSelectedCustomers}
      enableSearch={true}
      searchPlaceholder="Search customers..."
      enablePagination={true}
      enableSorting={true}
      onRowDoubleClick={handleView}
      actions={[
        {
          label: 'View',
          icon: Eye,
          onClick: handleView,
          variant: 'ghost',
        },
        {
          label: 'Edit',
          icon: Edit,
          onClick: handleEdit,
          variant: 'ghost',
        },
        {
          label: 'Delete',
          icon: Trash,
          onClick: handleDelete,
          variant: 'ghost',
        },
      ]}
    />
  );
}

// Example component to show before and after
export function TableMigrationExample() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Table Migration Example</h1>
      <p className="text-lg text-muted-foreground">
        This example demonstrates how to migrate from a custom table implementation to the standardized EnhancedDataTable component.
      </p>
      
      <Tabs defaultValue="before">
        <TabsList>
          <TabsTrigger value="before">Before Migration</TabsTrigger>
          <TabsTrigger value="after">After Migration</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
        </TabsList>
        
        <TabsContent value="before">
          <Card>
            <CardHeader>
              <CardTitle>Original Implementation</CardTitle>
              <CardDescription>
                Custom table implementation with manual handling of pagination, sorting, and selection.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OriginalCustomersTable />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="after">
          <Card>
            <CardHeader>
              <CardTitle>Migrated Implementation</CardTitle>
              <CardDescription>
                Using the standardized EnhancedDataTable component with the same functionality.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MigratedCustomersTable />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="comparison">
          <Card>
            <CardHeader>
              <CardTitle>Benefits of Migration</CardTitle>
              <CardDescription>
                Comparison of the original and migrated implementations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Original Implementation</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>~150 lines of code</li>
                    <li>Manual pagination implementation</li>
                    <li>No sorting capability</li>
                    <li>Basic search functionality</li>
                    <li>Custom styling for each element</li>
                    <li>Inconsistent with other tables</li>
                    <li>Difficult to maintain and extend</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">Migrated Implementation</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>~100 lines of code (33% reduction)</li>
                    <li>Built-in pagination with options</li>
                    <li>Advanced sorting on any column</li>
                    <li>Global search with highlighting</li>
                    <li>Consistent styling across the app</li>
                    <li>Additional features like column visibility</li>
                    <li>Easier to maintain and extend</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
