/**
 * Inventory Service
 * 
 * This service handles all inventory-related API calls.
 */
import { apiClient } from '@/lib/api/api-client';
import { withApiTransition } from '@/lib/api/api-transition-utils';
import { v4 as uuidv4 } from 'uuid';

// Types for inventory data
export interface StockReceipt {
  id: string;
  date: string;
  locationId: string;
  locationName: string;
  quantity: number;
  productId: string;
  poNumber: string;
  receivedBy: string;
}

export interface StockTransfer {
  id: string;
  date: string;
  fromLocationId: string;
  fromLocationName: string;
  toLocationId: string;
  toLocationName: string;
  quantity: number;
  productId: string;
  transferredBy: string;
  status: string;
}

export interface StockAdjustment {
  id: string;
  date: string;
  locationId: string;
  locationName: string;
  quantity: number;
  type: 'add' | 'remove' | 'set';
  reason: string;
  productId: string;
  adjustedBy: string;
}

export interface InventoryHistory {
  id: string;
  date: string;
  type: string;
  locationId: string;
  locationName: string;
  quantity: number;
  reference: string;
  productId: string;
}

export interface StockAlert {
  id: string;
  type: string;
  locationId: string;
  locationName: string;
  threshold: number;
  current: number;
  status: string;
  productId: string;
}

// Pagination and filtering types
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface FilterParams {
  search?: string;
  startDate?: string;
  endDate?: string;
  locationId?: string;
  type?: string;
  status?: string;
}

export interface SortParams {
  field: string;
  direction: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Fallback data for when API is unavailable
const fallbackStockReceipts: StockReceipt[] = [
  {
    id: "1",
    date: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
    locationId: "loc-001",
    locationName: "Main Warehouse",
    quantity: 25,
    productId: "p-001",
    poNumber: "PO-2025-0042",
    receivedBy: "John Smith"
  },
  {
    id: "2",
    date: new Date(new Date().setDate(new Date().getDate() - 12)).toISOString(),
    locationId: "loc-001",
    locationName: "Main Warehouse",
    quantity: 10,
    productId: "p-002",
    poNumber: "PO-2025-0038",
    receivedBy: "Jane Doe"
  },
  {
    id: "3",
    date: new Date(new Date().setDate(new Date().getDate() - 18)).toISOString(),
    locationId: "loc-002",
    locationName: "Downtown Store",
    quantity: 5,
    productId: "p-003",
    poNumber: "PO-2025-0033",
    receivedBy: "Michael Johnson"
  }
];

const fallbackStockTransfers: StockTransfer[] = [
  {
    id: "1",
    date: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
    fromLocationId: "loc-001",
    fromLocationName: "Main Warehouse",
    toLocationId: "loc-002",
    toLocationName: "Downtown Store",
    quantity: 10,
    productId: "p-001",
    transferredBy: "Emily Davis",
    status: "completed"
  },
  {
    id: "2",
    date: new Date(new Date().setDate(new Date().getDate() - 8)).toISOString(),
    fromLocationId: "loc-001",
    fromLocationName: "Main Warehouse",
    toLocationId: "loc-003",
    toLocationName: "Uptown Store",
    quantity: 5,
    productId: "p-002",
    transferredBy: "Robert Wilson",
    status: "in-transit"
  }
];

const fallbackStockAdjustments: StockAdjustment[] = [
  {
    id: "1",
    date: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
    locationId: "loc-002",
    locationName: "Downtown Store",
    quantity: 2,
    type: "remove",
    reason: "Damaged in store",
    productId: "p-001",
    adjustedBy: "Sarah Miller"
  },
  {
    id: "2",
    date: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(),
    locationId: "loc-001",
    locationName: "Main Warehouse",
    quantity: 5,
    type: "add",
    reason: "Inventory count correction",
    productId: "p-003",
    adjustedBy: "David Brown"
  },
  {
    id: "3",
    date: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString(),
    locationId: "loc-003",
    locationName: "Uptown Store",
    quantity: 10,
    type: "set",
    reason: "Annual stock take",
    productId: "p-002",
    adjustedBy: "Jennifer Lee"
  }
];

const fallbackInventoryHistory: InventoryHistory[] = [
  {
    id: "1",
    date: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
    type: "adjustment",
    locationId: "loc-002",
    locationName: "Downtown Store",
    quantity: -2,
    reference: "ADJ-001",
    productId: "p-001"
  },
  {
    id: "2",
    date: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
    type: "transfer",
    locationId: "loc-001",
    locationName: "Main Warehouse",
    quantity: -10,
    reference: "TRF-001",
    productId: "p-001"
  },
  {
    id: "3",
    date: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
    type: "transfer",
    locationId: "loc-002",
    locationName: "Downtown Store",
    quantity: 10,
    reference: "TRF-001",
    productId: "p-001"
  },
  {
    id: "4",
    date: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
    type: "receipt",
    locationId: "loc-001",
    locationName: "Main Warehouse",
    quantity: 25,
    reference: "REC-001",
    productId: "p-001"
  }
];

const fallbackStockAlerts: StockAlert[] = [
  {
    id: "1",
    type: "low_stock",
    locationId: "loc-002",
    locationName: "Downtown Store",
    threshold: 5,
    current: 3,
    status: "active",
    productId: "p-003"
  },
  {
    id: "2",
    type: "out_of_stock",
    locationId: "loc-003",
    locationName: "Uptown Store",
    threshold: 0,
    current: 0,
    status: "active",
    productId: "p-004"
  },
  {
    id: "3",
    type: "overstock",
    locationId: "loc-001",
    locationName: "Main Warehouse",
    threshold: 100,
    current: 150,
    status: "active",
    productId: "p-005"
  }
];

// Inventory service class
class InventoryService {
  // Base URL for inventory API
  private baseUrl = '/api/inventory';

  // Helper method to filter and paginate data
  private filterAndPaginateData<T>(
    data: T[],
    params?: PaginationParams & FilterParams & SortParams,
    searchFields: (keyof T)[] = ['id'] as (keyof T)[]
  ): PaginatedResponse<T> {
    let filteredData = [...data];
    
    // Apply search filter if provided
    if (params?.search) {
      const searchLower = params.search.toLowerCase();
      filteredData = filteredData.filter(item => {
        return searchFields.some(field => {
          const value = item[field];
          return value && String(value).toLowerCase().includes(searchLower);
        });
      });
    }
    
    // Apply date filters if provided
    if (params?.startDate && 'date' in filteredData[0]) {
      filteredData = filteredData.filter(item => 
        new Date((item as any).date) >= new Date(params.startDate!)
      );
    }
    
    if (params?.endDate && 'date' in filteredData[0]) {
      filteredData = filteredData.filter(item => 
        new Date((item as any).date) <= new Date(params.endDate!)
      );
    }
    
    // Apply location filter if provided
    if (params?.locationId) {
      filteredData = filteredData.filter(item => {
        if ('locationId' in item) {
          return (item as any).locationId === params.locationId;
        }
        return true;
      });
    }
    
    // Apply type filter if provided
    if (params?.type && 'type' in filteredData[0]) {
      filteredData = filteredData.filter(item => 
        (item as any).type === params.type
      );
    }
    
    // Apply status filter if provided
    if (params?.status && 'status' in filteredData[0]) {
      filteredData = filteredData.filter(item => 
        (item as any).status === params.status
      );
    }
    
    // Apply sorting if provided
    if (params?.field && params?.direction) {
      filteredData.sort((a, b) => {
        const aValue = (a as any)[params.field];
        const bValue = (b as any)[params.field];
        
        if (params.direction === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
    } else if ('date' in filteredData[0]) {
      // Default sort by date descending
      filteredData.sort((a, b) => 
        new Date((b as any).date).getTime() - new Date((a as any).date).getTime()
      );
    }
    
    // Apply pagination if provided
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = filteredData.slice(startIndex, endIndex);
    
    return {
      data: paginatedData,
      total: filteredData.length,
      page,
      limit,
      totalPages: Math.ceil(filteredData.length / limit)
    };
  }

  // Get stock receipts for a product
  async getStockReceipts(
    productId: string,
    params?: PaginationParams & FilterParams & SortParams
  ): Promise<PaginatedResponse<StockReceipt>> {
    try {
      const response = await withApiTransition(
        () => apiClient.get(`products/${productId}/stock-receipts`, { params }),
        () => {
          // Filter mock data based on productId
          const filteredReceipts = fallbackStockReceipts.filter(
            receipt => receipt.productId === productId
          );
          
          // Apply filtering and pagination
          return this.filterAndPaginateData(
            filteredReceipts,
            params,
            ['id', 'poNumber', 'locationName'] as (keyof StockReceipt)[]
          );
        },
        { endpoint: `products/${productId}/stock-receipts` }
      );

      if (response.success) {
        return response.data;
      } else if (response.isMock) {
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to fetch stock receipts');
      }
    } catch (error) {
      console.error('Error fetching stock receipts:', error);
      throw error;
    }
  }

  // Create a new stock receipt
  async createStockReceipt(data: Omit<StockReceipt, 'id' | 'date'>): Promise<StockReceipt> {
    try {
      const newReceipt: StockReceipt = {
        ...data,
        id: uuidv4(),
        date: new Date().toISOString()
      };

      const response = await withApiTransition(
        () => apiClient.post('products/stock-receipts', newReceipt),
        newReceipt,
        { endpoint: 'products/stock-receipts/create' }
      );

      if (response.success) {
        return response.data;
      } else if (response.isMock) {
        fallbackStockReceipts.push(newReceipt);
        return newReceipt;
      } else {
        throw new Error(response.error || 'Failed to create stock receipt');
      }
    } catch (error) {
      console.error('Error creating stock receipt:', error);
      throw error;
    }
  }

  // Get stock transfers for a product
  async getStockTransfers(
    productId: string,
    params?: PaginationParams & FilterParams & SortParams
  ): Promise<PaginatedResponse<StockTransfer>> {
    try {
      const response = await withApiTransition(
        () => apiClient.get(`products/${productId}/stock-transfers`, { params }),
        () => {
          // Filter mock data based on productId
          const filteredTransfers = fallbackStockTransfers.filter(
            transfer => transfer.productId === productId
          );
          
          // Apply filtering and pagination
          return this.filterAndPaginateData(
            filteredTransfers,
            params,
            ['id', 'fromLocationName', 'toLocationName', 'status'] as (keyof StockTransfer)[]
          );
        },
        { endpoint: `products/${productId}/stock-transfers` }
      );

      if (response.success) {
        return response.data;
      } else if (response.isMock) {
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to fetch stock transfers');
      }
    } catch (error) {
      console.error('Error fetching stock transfers:', error);
      throw error;
    }
  }

  // Create a new stock transfer
  async createStockTransfer(data: Omit<StockTransfer, 'id' | 'date' | 'status'>): Promise<StockTransfer> {
    try {
      const newTransfer: StockTransfer = {
        ...data,
        id: uuidv4(),
        date: new Date().toISOString(),
        status: 'pending'
      };

      const response = await withApiTransition(
        () => apiClient.post('products/stock-transfers', newTransfer),
        newTransfer,
        { endpoint: 'products/stock-transfers/create' }
      );

      if (response.success) {
        return response.data;
      } else if (response.isMock) {
        fallbackStockTransfers.push(newTransfer);
        return newTransfer;
      } else {
        throw new Error(response.error || 'Failed to create stock transfer');
      }
    } catch (error) {
      console.error('Error creating stock transfer:', error);
      throw error;
    }
  }

  // Update a stock transfer status
  async updateStockTransferStatus(id: string, status: string): Promise<StockTransfer> {
    try {
      const response = await withApiTransition(
        () => apiClient.put(`products/stock-transfers/${id}/status`, { status }),
        () => {
          const transferIndex = fallbackStockTransfers.findIndex(transfer => transfer.id === id);
          if (transferIndex === -1) {
            throw new Error('Stock transfer not found');
          }
          
          const updatedTransfer = {
            ...fallbackStockTransfers[transferIndex],
            status
          };
          
          fallbackStockTransfers[transferIndex] = updatedTransfer;
          return updatedTransfer;
        },
        { endpoint: `products/stock-transfers/${id}/status` }
      );

      if (response.success) {
        return response.data;
      } else if (response.isMock) {
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to update stock transfer status');
      }
    } catch (error) {
      console.error('Error updating stock transfer status:', error);
      throw error;
    }
  }

  // Get stock adjustments for a product
  async getStockAdjustments(
    productId: string,
    params?: PaginationParams & FilterParams & SortParams
  ): Promise<PaginatedResponse<StockAdjustment>> {
    try {
      const response = await withApiTransition(
        () => apiClient.get(`products/${productId}/stock-adjustments`, { params }),
        () => {
          // Filter mock data based on productId
          const filteredAdjustments = fallbackStockAdjustments.filter(
            adjustment => adjustment.productId === productId
          );
          
          // Apply filtering and pagination
          return this.filterAndPaginateData(
            filteredAdjustments,
            params,
            ['id', 'locationName', 'reason', 'type'] as (keyof StockAdjustment)[]
          );
        },
        { endpoint: `products/${productId}/stock-adjustments` }
      );

      if (response.success) {
        return response.data;
      } else if (response.isMock) {
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to fetch stock adjustments');
      }
    } catch (error) {
      console.error('Error fetching stock adjustments:', error);
      throw error;
    }
  }

  // Create a new stock adjustment
  async createStockAdjustment(data: Omit<StockAdjustment, 'id' | 'date'>): Promise<StockAdjustment> {
    try {
      const newAdjustment: StockAdjustment = {
        ...data,
        id: uuidv4(),
        date: new Date().toISOString()
      };

      const response = await withApiTransition(
        () => apiClient.post('products/stock-adjustments', newAdjustment),
        newAdjustment,
        { endpoint: 'products/stock-adjustments/create' }
      );

      if (response.success) {
        return response.data;
      } else if (response.isMock) {
        fallbackStockAdjustments.push(newAdjustment);
        return newAdjustment;
      } else {
        throw new Error(response.error || 'Failed to create stock adjustment');
      }
    } catch (error) {
      console.error('Error creating stock adjustment:', error);
      throw error;
    }
  }

  // Get inventory history for a product
  async getInventoryHistory(
    productId: string,
    params?: PaginationParams & FilterParams & SortParams
  ): Promise<PaginatedResponse<InventoryHistory>> {
    try {
      const response = await withApiTransition(
        () => apiClient.get(`products/${productId}/inventory-history`, { params }),
        () => {
          // Filter mock data based on productId
          const filteredHistory = fallbackInventoryHistory.filter(
            history => history.productId === productId
          );
          
          // Apply filtering and pagination
          return this.filterAndPaginateData(
            filteredHistory,
            params,
            ['id', 'type', 'locationName', 'reference'] as (keyof InventoryHistory)[]
          );
        },
        { endpoint: `products/${productId}/inventory-history` }
      );

      if (response.success) {
        return response.data;
      } else if (response.isMock) {
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to fetch inventory history');
      }
    } catch (error) {
      console.error('Error fetching inventory history:', error);
      throw error;
    }
  }

  // Get stock alerts
  async getStockAlerts(params?: PaginationParams & FilterParams & SortParams): Promise<PaginatedResponse<StockAlert>> {
    try {
      const response = await withApiTransition(
        () => apiClient.get('products/stock-alerts', { params }),
        () => {
          // Apply filtering and pagination
          return this.filterAndPaginateData(
            fallbackStockAlerts,
            params,
            ['id', 'type', 'locationName', 'status'] as (keyof StockAlert)[]
          );
        },
        { endpoint: 'products/stock-alerts' }
      );

      if (response.success) {
        return response.data;
      } else if (response.isMock) {
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to fetch stock alerts');
      }
    } catch (error) {
      console.error('Error fetching stock alerts:', error);
      throw error;
    }
  }

  // Update stock alert status
  async updateStockAlertStatus(id: string, status: string): Promise<StockAlert> {
    try {
      const response = await withApiTransition(
        () => apiClient.put(`products/stock-alerts/${id}/status`, { status }),
        () => {
          const alertIndex = fallbackStockAlerts.findIndex(alert => alert.id === id);
          if (alertIndex === -1) {
            throw new Error('Stock alert not found');
          }
          
          const updatedAlert = {
            ...fallbackStockAlerts[alertIndex],
            status
          };
          
          fallbackStockAlerts[alertIndex] = updatedAlert;
          return updatedAlert;
        },
        { endpoint: `products/stock-alerts/${id}/status` }
      );

      if (response.success) {
        return response.data;
      } else if (response.isMock) {
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to update stock alert status');
      }
    } catch (error) {
      console.error('Error updating stock alert status:', error);
      throw error;
    }
  }
}

// Export a singleton instance of the service
export const inventoryService = new InventoryService();
