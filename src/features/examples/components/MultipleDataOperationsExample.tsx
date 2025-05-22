import React, { useEffect } from 'react';
import { useDataOperation } from '@/hooks/useDataOperation';
import { DataState, Skeleton } from '@/components/ui/loading-state';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Users, ShoppingBag, DollarSign } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

/**
 * MultipleDataOperationsExample
 *
 * This component demonstrates how to handle multiple data dependencies
 * using the useDataOperation hook. It shows how to:
 *
 * 1. Load multiple data sources
 * 2. Handle independent loading and error states
 * 3. Coordinate multiple data operations
 * 4. Display combined loading and error states
 */

// Mock data interfaces
interface User {
  id: number;
  name: string;
  email: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
}

interface SalesData {
  totalSales: number;
  totalRevenue: number;
  averageOrderValue: number;
}

// Real API service
const apiService = {
  getUsers: async (): Promise<User[]> => {
    try {
      const response = await fetch('/api/users');
      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new Error('Failed to fetch users data');
    }
  },

  getProducts: async (): Promise<Product[]> => {
    try {
      const response = await fetch('/api/products');
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new Error('Failed to fetch product data');
    }
  },

  getSalesData: async (): Promise<SalesData> => {
    try {
      const response = await fetch('/api/sales/summary');
      if (!response.ok) {
        throw new Error(`Failed to fetch sales data: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching sales data:', error);
      throw new Error('Failed to fetch sales data');
    }
  }
};

export function MultipleDataOperationsExample() {
  // Set up each data operation independently
  const usersOperation = useDataOperation({
    operation: apiService.getUsers,
    errorTitle: 'Users Error',
    showSuccessToast: false,
  });

  const productsOperation = useDataOperation({
    operation: apiService.getProducts,
    errorTitle: 'Products Error',
    showSuccessToast: false,
  });

  const salesOperation = useDataOperation({
    operation: apiService.getSalesData,
    errorTitle: 'Sales Data Error',
    showSuccessToast: false,
  });

  // Function to load all data
  const loadAllData = () => {
    usersOperation.execute();
    productsOperation.execute();
    salesOperation.execute();
  };

  // Load data on component mount
  useEffect(() => {
    loadAllData();
  }, []);

  // Determine overall loading and error states
  const isLoading = usersOperation.loading || productsOperation.loading || salesOperation.loading;
  const hasAnyError = usersOperation.error || productsOperation.error || salesOperation.error;

  // Render the component
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Dashboard</CardTitle>
            <CardDescription>
              Multiple data operations example
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadAllData}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh All
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="users">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
              {usersOperation.loading && <RefreshCw className="h-3 w-3 ml-1 animate-spin" />}
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              Products
              {productsOperation.loading && <RefreshCw className="h-3 w-3 ml-1 animate-spin" />}
            </TabsTrigger>
            <TabsTrigger value="sales" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Sales
              {salesOperation.loading && <RefreshCw className="h-3 w-3 ml-1 animate-spin" />}
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <DataState
              loading={usersOperation.loading}
              error={usersOperation.error}
              text="Loading users data..."
              errorComponent={
                <div className="p-4 border border-red-200 rounded bg-red-50">
                  <h3 className="text-red-800 font-medium">Error Loading Users</h3>
                  <p className="text-red-600 text-sm mt-1">{usersOperation.error?.message}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => usersOperation.execute()}
                  >
                    <RefreshCw className="h-3 w-3 mr-2" /> Retry
                  </Button>
                </div>
              }
            >
              {usersOperation.data ? (
                <div className="space-y-3">
                  {usersOperation.data.map(user => (
                    <div
                      key={user.id}
                      className="p-3 border rounded shadow-sm"
                    >
                      <h3 className="font-medium">{user.name}</h3>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="p-3 border rounded">
                      <Skeleton className="h-5 w-40 mb-2" />
                      <Skeleton className="h-4 w-60" />
                    </div>
                  ))}
                </div>
              )}
            </DataState>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products">
            <DataState
              loading={productsOperation.loading}
              error={productsOperation.error}
              text="Loading products data..."
              errorComponent={
                <div className="p-4 border border-red-200 rounded bg-red-50">
                  <h3 className="text-red-800 font-medium">Error Loading Products</h3>
                  <p className="text-red-600 text-sm mt-1">{productsOperation.error?.message}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => productsOperation.execute()}
                  >
                    <RefreshCw className="h-3 w-3 mr-2" /> Retry
                  </Button>
                </div>
              }
            >
              {productsOperation.data ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Product</th>
                        <th className="text-right p-2">Price</th>
                        <th className="text-right p-2">In Stock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productsOperation.data.map(product => (
                        <tr key={product.id} className="border-b">
                          <td className="p-2 font-medium">{product.name}</td>
                          <td className="p-2 text-right">${product.price.toFixed(2)}</td>
                          <td className="p-2 text-right">{product.stock}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="space-y-2">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              )}
            </DataState>
          </TabsContent>

          {/* Sales Tab */}
          <TabsContent value="sales">
            <DataState
              loading={salesOperation.loading}
              error={salesOperation.error}
              text="Loading sales data..."
              errorComponent={
                <div className="p-4 border border-red-200 rounded bg-red-50">
                  <h3 className="text-red-800 font-medium">Error Loading Sales Data</h3>
                  <p className="text-red-600 text-sm mt-1">{salesOperation.error?.message}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => salesOperation.execute()}
                  >
                    <RefreshCw className="h-3 w-3 mr-2" /> Retry
                  </Button>
                </div>
              }
            >
              {salesOperation.data ? (
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 border rounded bg-blue-50 dark:bg-blue-900/20">
                    <h3 className="text-sm font-medium text-muted-foreground">Total Sales</h3>
                    <p className="text-2xl font-bold">{salesOperation.data.totalSales}</p>
                  </div>
                  <div className="p-4 border rounded bg-green-50 dark:bg-green-900/20">
                    <h3 className="text-sm font-medium text-muted-foreground">Revenue</h3>
                    <p className="text-2xl font-bold">${salesOperation.data.totalRevenue.toFixed(2)}</p>
                  </div>
                  <div className="p-4 border rounded bg-purple-50 dark:bg-purple-900/20">
                    <h3 className="text-sm font-medium text-muted-foreground">Avg. Order</h3>
                    <p className="text-2xl font-bold">${salesOperation.data.averageOrderValue.toFixed(2)}</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              )}
            </DataState>
          </TabsContent>
        </Tabs>

        {/* Overall status footer */}
        {hasAnyError && (
          <div className="mt-6 p-3 border border-amber-200 rounded bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800">
            <p className="text-amber-800 dark:text-amber-400 text-sm">
              Some data failed to load. You can try refreshing each section individually.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}