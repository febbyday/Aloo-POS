import { getApiEndpoint } from '@/lib/api/config';
import {
  Market,
  CreateMarketInput,
  UpdateMarketInput,
  StockAllocation,
  CreateStockAllocationInput,
  StaffAssignment,
  CreateStaffAssignmentInput,
  MarketSettings,
  MarketLocation,
  MarketPerformance,
  MarketFilter,
  MARKET_STATUS
} from '../types';

// Mock data for development purposes
const MOCK_MARKETS: Market[] = [
  {
    id: '1',
    name: 'Downtown Market',
    description: 'Our flagship market in the heart of downtown',
    location: {
      address: '123 Main St',
      city: 'Metropolis',
      state: 'NY',
      zipCode: '10001',
      country: 'USA',
      coordinates: {
        latitude: 40.7128,
        longitude: -74.0060
      }
    },
    status: MARKET_STATUS.ACTIVE,
    openingDate: '2023-01-15',
    manager: {
      id: '101',
      name: 'John Smith',
      email: 'john.smith@example.com',
      phone: '555-123-4567'
    },
    settings: {
      operatingHours: {
        monday: { open: '08:00', close: '18:00' },
        tuesday: { open: '08:00', close: '18:00' },
        wednesday: { open: '08:00', close: '18:00' },
        thursday: { open: '08:00', close: '18:00' },
        friday: { open: '08:00', close: '20:00' },
        saturday: { open: '09:00', close: '17:00' },
        sunday: { open: '10:00', close: '16:00' }
      },
      paymentMethods: ['CASH', 'CREDIT_CARD', 'MOBILE_PAYMENT'],
      features: ['WIFI', 'RESTROOMS', 'PARKING', 'SEATING_AREA']
    },
    performance: {
      averageDailySales: 5200,
      customerTraffic: 350,
      topSellingCategories: ['PRODUCE', 'BAKERY', 'DAIRY']
    },
    createdAt: '2023-01-01T10:00:00Z',
    updatedAt: '2023-06-15T14:30:00Z'
  },
  {
    id: '2',
    name: 'Westside Market',
    description: 'Serving the western suburbs with fresh products',
    location: {
      address: '456 West Blvd',
      city: 'Westville',
      state: 'NY',
      zipCode: '10002',
      country: 'USA',
      coordinates: {
        latitude: 40.7500,
        longitude: -74.1000
      }
    },
    status: MARKET_STATUS.ACTIVE,
    openingDate: '2023-03-10',
    manager: {
      id: '102',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
      phone: '555-234-5678'
    },
    settings: {
      operatingHours: {
        monday: { open: '09:00', close: '19:00' },
        tuesday: { open: '09:00', close: '19:00' },
        wednesday: { open: '09:00', close: '19:00' },
        thursday: { open: '09:00', close: '19:00' },
        friday: { open: '09:00', close: '21:00' },
        saturday: { open: '10:00', close: '18:00' },
        sunday: { open: '11:00', close: '17:00' }
      },
      paymentMethods: ['CASH', 'CREDIT_CARD', 'MOBILE_PAYMENT', 'CHECK'],
      features: ['WIFI', 'RESTROOMS', 'PARKING', 'PLAYGROUND']
    },
    performance: {
      averageDailySales: 4800,
      customerTraffic: 320,
      topSellingCategories: ['MEAT', 'PRODUCE', 'PREPARED_FOODS']
    },
    createdAt: '2023-02-15T11:30:00Z',
    updatedAt: '2023-07-01T09:45:00Z'
  },
  {
    id: '3',
    name: 'Eastside Market',
    description: 'Serving the eastern community with organic options',
    location: {
      address: '789 East Ave',
      city: 'Eastborough',
      state: 'NY',
      zipCode: '10003',
      country: 'USA',
      coordinates: {
        latitude: 40.7700,
        longitude: -73.9500
      }
    },
    status: MARKET_STATUS.UNDER_MAINTENANCE,
    openingDate: '2023-05-20',
    manager: {
      id: '103',
      name: 'Michael Brown',
      email: 'michael.brown@example.com',
      phone: '555-345-6789'
    },
    settings: {
      operatingHours: {
        monday: { open: '08:30', close: '18:30' },
        tuesday: { open: '08:30', close: '18:30' },
        wednesday: { open: '08:30', close: '18:30' },
        thursday: { open: '08:30', close: '18:30' },
        friday: { open: '08:30', close: '20:30' },
        saturday: { open: '09:30', close: '17:30' },
        sunday: { open: '10:30', close: '16:30' }
      },
      paymentMethods: ['CASH', 'CREDIT_CARD', 'MOBILE_PAYMENT'],
      features: ['WIFI', 'RESTROOMS', 'BIKE_PARKING', 'ORGANIC_SECTION']
    },
    performance: {
      averageDailySales: 4200,
      customerTraffic: 280,
      topSellingCategories: ['ORGANIC_PRODUCE', 'HEALTH_FOODS', 'BEVERAGES']
    },
    createdAt: '2023-04-05T13:15:00Z',
    updatedAt: '2023-07-20T16:20:00Z'
  }
];

// Mock stock allocations
const MOCK_STOCK_ALLOCATIONS: StockAllocation[] = [
  {
    id: '1',
    marketId: '1',
    productId: '101',
    quantity: 100,
    allocatedAt: '2023-07-01T08:00:00Z',
    status: 'ALLOCATED',
    notes: 'Regular weekly allocation'
  },
  {
    id: '2',
    marketId: '1',
    productId: '102',
    quantity: 50,
    allocatedAt: '2023-07-01T08:15:00Z',
    status: 'ALLOCATED',
    notes: 'Seasonal product'
  },
  {
    id: '3',
    marketId: '2',
    productId: '101',
    quantity: 75,
    allocatedAt: '2023-07-01T09:00:00Z',
    status: 'ALLOCATED',
    notes: 'Regular weekly allocation'
  }
];

// Mock staff assignments
const MOCK_STAFF_ASSIGNMENTS: StaffAssignment[] = [
  {
    id: '1',
    marketId: '1',
    staffId: '201',
    role: 'CASHIER',
    schedule: {
      monday: { start: '08:00', end: '16:00' },
      tuesday: { start: '08:00', end: '16:00' },
      wednesday: { start: '08:00', end: '16:00' },
      thursday: { start: '08:00', end: '16:00' },
      friday: { start: '08:00', end: '16:00' }
    },
    assignedAt: '2023-06-15T10:00:00Z'
  },
  {
    id: '2',
    marketId: '1',
    staffId: '202',
    role: 'STOCK_CLERK',
    schedule: {
      monday: { start: '07:00', end: '15:00' },
      tuesday: { start: '07:00', end: '15:00' },
      wednesday: { start: '07:00', end: '15:00' },
      thursday: { start: '07:00', end: '15:00' },
      friday: { start: '07:00', end: '15:00' }
    },
    assignedAt: '2023-06-15T10:30:00Z'
  },
  {
    id: '3',
    marketId: '2',
    staffId: '203',
    role: 'MANAGER_ASSISTANT',
    schedule: {
      monday: { start: '09:00', end: '17:00' },
      tuesday: { start: '09:00', end: '17:00' },
      wednesday: { start: '09:00', end: '17:00' },
      thursday: { start: '09:00', end: '17:00' },
      friday: { start: '09:00', end: '17:00' }
    },
    assignedAt: '2023-06-16T11:00:00Z'
  }
];

// API endpoint
const MARKETS_ENDPOINT = `${getApiEndpoint()}/markets`;

/**
 * Markets Service
 * 
 * This service handles all operations related to markets, including CRUD operations,
 * stock allocations, and staff assignments.
 */
export const marketsService = {
  /**
   * Get all markets with optional filtering
   */
  async getAllMarkets(filters?: MarketFilter): Promise<Market[]> {
    // In a real application, this would make an API call
    // For now, we'll just return mock data
    console.log('Getting all markets with filters:', filters);
    
    let filteredMarkets = [...MOCK_MARKETS];
    
    // Apply filters if provided
    if (filters) {
      if (filters.status) {
        filteredMarkets = filteredMarkets.filter(market => market.status === filters.status);
      }
      
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredMarkets = filteredMarkets.filter(market => 
          market.name.toLowerCase().includes(searchLower) || 
          market.description.toLowerCase().includes(searchLower)
        );
      }
      
      if (filters.city) {
        filteredMarkets = filteredMarkets.filter(market => 
          market.location.city.toLowerCase() === filters.city?.toLowerCase()
        );
      }
    }
    
    return filteredMarkets;
  },
  
  /**
   * Get a market by ID
   */
  async getMarketById(id: string): Promise<Market | null> {
    console.log(`Getting market with ID: ${id}`);
    const market = MOCK_MARKETS.find(m => m.id === id);
    return market || null;
  },
  
  /**
   * Create a new market
   */
  async createMarket(data: CreateMarketInput): Promise<Market> {
    console.log('Creating new market:', data);
    
    // Generate a new ID (in a real app, the server would do this)
    const newId = (Math.max(...MOCK_MARKETS.map(m => parseInt(m.id))) + 1).toString();
    
    const newMarket: Market = {
      id: newId,
      name: data.name,
      description: data.description,
      location: data.location,
      status: data.status || MARKET_STATUS.PENDING,
      openingDate: data.openingDate,
      manager: data.manager,
      settings: data.settings || {
        operatingHours: {
          monday: { open: '09:00', close: '17:00' },
          tuesday: { open: '09:00', close: '17:00' },
          wednesday: { open: '09:00', close: '17:00' },
          thursday: { open: '09:00', close: '17:00' },
          friday: { open: '09:00', close: '17:00' },
          saturday: { open: '10:00', close: '16:00' },
          sunday: { open: '10:00', close: '16:00' }
        },
        paymentMethods: ['CASH', 'CREDIT_CARD'],
        features: []
      },
      performance: {
        averageDailySales: 0,
        customerTraffic: 0,
        topSellingCategories: []
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // In a real app, this would be saved to a database
    MOCK_MARKETS.push(newMarket);
    
    return newMarket;
  },
  
  /**
   * Update an existing market
   */
  async updateMarket(id: string, data: UpdateMarketInput): Promise<Market | null> {
    console.log(`Updating market with ID: ${id}`, data);
    
    const marketIndex = MOCK_MARKETS.findIndex(m => m.id === id);
    if (marketIndex === -1) {
      return null;
    }
    
    // Update the market with the new data
    const updatedMarket = {
      ...MOCK_MARKETS[marketIndex],
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    // In a real app, this would update a database record
    MOCK_MARKETS[marketIndex] = updatedMarket;
    
    return updatedMarket;
  },
  
  /**
   * Delete a market
   */
  async deleteMarket(id: string): Promise<boolean> {
    console.log(`Deleting market with ID: ${id}`);
    
    const marketIndex = MOCK_MARKETS.findIndex(m => m.id === id);
    if (marketIndex === -1) {
      return false;
    }
    
    // In a real app, this would delete from a database
    MOCK_MARKETS.splice(marketIndex, 1);
    
    return true;
  },
  
  /**
   * Get stock allocations for a market
   */
  async getStockAllocations(marketId: string): Promise<StockAllocation[]> {
    console.log(`Getting stock allocations for market ID: ${marketId}`);
    return MOCK_STOCK_ALLOCATIONS.filter(sa => sa.marketId === marketId);
  },
  
  /**
   * Create a new stock allocation
   */
  async createStockAllocation(data: CreateStockAllocationInput): Promise<StockAllocation> {
    console.log('Creating new stock allocation:', data);
    
    // Generate a new ID
    const newId = (Math.max(...MOCK_STOCK_ALLOCATIONS.map(sa => parseInt(sa.id))) + 1).toString();
    
    const newAllocation: StockAllocation = {
      id: newId,
      marketId: data.marketId,
      productId: data.productId,
      quantity: data.quantity,
      allocatedAt: new Date().toISOString(),
      status: 'ALLOCATED',
      notes: data.notes || ''
    };
    
    // In a real app, this would be saved to a database
    MOCK_STOCK_ALLOCATIONS.push(newAllocation);
    
    return newAllocation;
  },
  
  /**
   * Get staff assignments for a market
   */
  async getStaffAssignments(marketId: string): Promise<StaffAssignment[]> {
    console.log(`Getting staff assignments for market ID: ${marketId}`);
    return MOCK_STAFF_ASSIGNMENTS.filter(sa => sa.marketId === marketId);
  },
  
  /**
   * Create a new staff assignment
   */
  async createStaffAssignment(data: CreateStaffAssignmentInput): Promise<StaffAssignment> {
    console.log('Creating new staff assignment:', data);
    
    // Generate a new ID
    const newId = (Math.max(...MOCK_STAFF_ASSIGNMENTS.map(sa => parseInt(sa.id))) + 1).toString();
    
    const newAssignment: StaffAssignment = {
      id: newId,
      marketId: data.marketId,
      staffId: data.staffId,
      role: data.role,
      schedule: data.schedule,
      assignedAt: new Date().toISOString()
    };
    
    // In a real app, this would be saved to a database
    MOCK_STAFF_ASSIGNMENTS.push(newAssignment);
    
    return newAssignment;
  },
  
  /**
   * Get market performance data
   */
  async getMarketPerformance(marketId: string): Promise<MarketPerformance | null> {
    console.log(`Getting performance data for market ID: ${marketId}`);
    
    const market = MOCK_MARKETS.find(m => m.id === marketId);
    if (!market) {
      return null;
    }
    
    return market.performance;
  },
  
  /**
   * Update market settings
   */
  async updateMarketSettings(marketId: string, settings: MarketSettings): Promise<Market | null> {
    console.log(`Updating settings for market ID: ${marketId}`, settings);
    
    const marketIndex = MOCK_MARKETS.findIndex(m => m.id === marketId);
    if (marketIndex === -1) {
      return null;
    }
    
    // Update the settings
    MOCK_MARKETS[marketIndex].settings = settings;
    MOCK_MARKETS[marketIndex].updatedAt = new Date().toISOString();
    
    return MOCK_MARKETS[marketIndex];
  }
};

export default marketsService;
