/**
 * BatchedDashboard Component
 * 
 * This component demonstrates how to use batched API requests to load
 * dashboard data efficiently.
 */

import React from 'react';
import { BatchedDataLoader } from '@/components/BatchedDataLoader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * BatchedDashboard Component
 * 
 * Loads dashboard data using batched API requests
 */
export function BatchedDashboard() {
  // Define the endpoints to load data from
  const endpoints = [
    'dashboard/summary',
    'products/LIST?limit=5',
    'sales/summary',
    'customers/summary',
    'inventory/summary'
  ];
  
  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      
      <BatchedDataLoader endpoints={endpoints}>
        {(data, loading) => (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Summary Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Summary</CardTitle>
                <CardDescription>Overview of your business</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Sales</span>
                      <span className="font-medium">{data.summary?.totalSales || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Products</span>
                      <span className="font-medium">{data.summary?.totalProducts || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Customers</span>
                      <span className="font-medium">{data.summary?.totalCustomers || 'N/A'}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Products Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Recent Products</CardTitle>
                <CardDescription>Latest products added</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {data.LIST?.slice(0, 5).map((product: any) => (
                      <div key={product.id} className="flex justify-between">
                        <span className="truncate">{product.name}</span>
                        <span className="font-medium">{product.price}</span>
                      </div>
                    )) || (
                      <div className="text-muted-foreground">No products found</div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Sales Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Sales</CardTitle>
                <CardDescription>Recent sales activity</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Today</span>
                      <span className="font-medium">{data.summary?.todaySales || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">This Week</span>
                      <span className="font-medium">{data.summary?.weeklySales || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">This Month</span>
                      <span className="font-medium">{data.summary?.monthlySales || 'N/A'}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </BatchedDataLoader>
    </div>
  );
}

export default BatchedDashboard;
