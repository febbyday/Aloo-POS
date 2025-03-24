/**
 * Suppliers Service
 * 
 * This service handles API calls and data operations for the suppliers feature.
 */

import { Supplier, SUPPLIER_STATUS, SupplierType } from '../types';

// Mock data for development
const MOCK_SUPPLIERS: Supplier[] = [
  {
    id: "sup-001",
    name: "Global Distribution Inc.",
    type: SupplierType.DISTRIBUTOR,
    contactPerson: "John Smith",
    email: "john@globaldist.com",
    phone: "+1 555-123-4567",
    products: 42,
    rating: 4.5,
    status: SUPPLIER_STATUS.ACTIVE,
    lastOrder: "2025-02-15",
    address: "123 Supply Chain Blvd, Warehouse District, CA 90210",
    website: "https://globaldistribution.com",
    yearEstablished: 2005,
    paymentTerms: "Net 30",
    creditLimit: 50000,
    taxId: "TAX-12345-GD",
    performance: {
      onTimeDelivery: 92,
      qualityRating: 4.7,
      responseTime: 24,
      returnRate: 1.2,
      priceCompetitiveness: 4.3
    }
  },
  {
    id: "sup-002",
    name: "Tech Components Ltd.",
    type: SupplierType.MANUFACTURER,
    contactPerson: "Sarah Johnson",
    email: "sarah@techcomponents.com",
    phone: "+1 555-987-6543",
    products: 78,
    rating: 4.2,
    status: SUPPLIER_STATUS.ACTIVE,
    lastOrder: "2025-02-28",
    address: "456 Manufacturing Way, Tech Park, CA 94043",
    website: "https://techcomponents.com",
    yearEstablished: 2010,
    paymentTerms: "Net 45",
    creditLimit: 75000,
    taxId: "TAX-67890-TC",
    performance: {
      onTimeDelivery: 88,
      qualityRating: 4.5,
      responseTime: 36,
      returnRate: 2.1,
      priceCompetitiveness: 3.9
    }
  },
  {
    id: "sup-003",
    name: "Retail Solutions Co.",
    type: SupplierType.RETAILER,
    contactPerson: "Michael Brown",
    email: "michael@retailsolutions.com",
    phone: "+1 555-456-7890",
    products: 23,
    rating: 3.8,
    status: SUPPLIER_STATUS.INACTIVE,
    lastOrder: "2025-01-10",
    address: "789 Retail Row, Shopping Center, CA 92614",
    website: "https://retailsolutions.com",
    yearEstablished: 2015,
    paymentTerms: "Net 15",
    creditLimit: 25000,
    taxId: "TAX-24680-RS",
    performance: {
      onTimeDelivery: 75,
      qualityRating: 3.6,
      responseTime: 48,
      returnRate: 3.5,
      priceCompetitiveness: 4.1
    }
  }
];

export const suppliersService = {
  /**
   * Fetch all suppliers
   */
  fetchAll: async (): Promise<Supplier[]> => {
    // In a real app, this would be an API call
    // return await api.get('/suppliers');
    
    // Simulate API delay
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...MOCK_SUPPLIERS]);
      }, 500);
    });
  },

  /**
   * Fetch a single supplier by ID
   */
  fetchById: async (id: string): Promise<Supplier | null> => {
    // In a real app, this would be an API call
    // return await api.get(`/suppliers/${id}`);
    
    // Simulate API delay
    return new Promise((resolve) => {
      setTimeout(() => {
        const supplier = MOCK_SUPPLIERS.find(s => s.id === id) || null;
        resolve(supplier ? { ...supplier } : null);
      }, 300);
    });
  },

  /**
   * Create a new supplier
   */
  create: async (data: Omit<Supplier, 'id'>): Promise<Supplier> => {
    // In a real app, this would be an API call
    // return await api.post('/suppliers', data);
    
    // Simulate API delay and response
    return new Promise((resolve) => {
      setTimeout(() => {
        const newSupplier: Supplier = {
          ...data,
          id: `sup-${Math.floor(Math.random() * 10000).toString().padStart(3, '0')}`,
          products: data.products || 0,
          rating: data.rating || 0,
          lastOrder: data.lastOrder || new Date().toISOString().split('T')[0]
        };
        resolve(newSupplier);
      }, 500);
    });
  },

  /**
   * Update an existing supplier
   */
  update: async (id: string, data: Partial<Supplier>): Promise<Supplier> => {
    // In a real app, this would be an API call
    // return await api.put(`/suppliers/${id}`, data);
    
    // Simulate API delay and response
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const supplierIndex = MOCK_SUPPLIERS.findIndex(s => s.id === id);
        if (supplierIndex === -1) {
          reject(new Error(`Supplier with ID ${id} not found`));
          return;
        }
        
        const updatedSupplier: Supplier = {
          ...MOCK_SUPPLIERS[supplierIndex],
          ...data,
          id // Ensure ID doesn't change
        };
        
        resolve(updatedSupplier);
      }, 500);
    });
  },

  /**
   * Delete a supplier
   */
  delete: async (id: string): Promise<boolean> => {
    // In a real app, this would be an API call
    // return await api.delete(`/suppliers/${id}`);
    
    // Simulate API delay and response
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const supplierIndex = MOCK_SUPPLIERS.findIndex(s => s.id === id);
        if (supplierIndex === -1) {
          reject(new Error(`Supplier with ID ${id} not found`));
          return;
        }
        
        resolve(true);
      }, 500);
    });
  },

  /**
   * Search suppliers by name or other criteria
   */
  search: async (query: string): Promise<Supplier[]> => {
    // In a real app, this would be an API call
    // return await api.get(`/suppliers/search?q=${query}`);
    
    // Simulate API delay and search functionality
    return new Promise((resolve) => {
      setTimeout(() => {
        const lowercaseQuery = query.toLowerCase();
        const results = MOCK_SUPPLIERS.filter(supplier => 
          supplier.name.toLowerCase().includes(lowercaseQuery) ||
          supplier.contactPerson.toLowerCase().includes(lowercaseQuery) ||
          supplier.email.toLowerCase().includes(lowercaseQuery)
        );
        resolve([...results]);
      }, 300);
    });
  },

  /**
   * Filter suppliers by status
   */
  filterByStatus: async (status: SUPPLIER_STATUS): Promise<Supplier[]> => {
    // In a real app, this would be an API call
    // return await api.get(`/suppliers?status=${status}`);
    
    // Simulate API delay and filter functionality
    return new Promise((resolve) => {
      setTimeout(() => {
        const results = MOCK_SUPPLIERS.filter(supplier => supplier.status === status);
        resolve([...results]);
      }, 300);
    });
  },

  /**
   * Filter suppliers by type
   */
  filterByType: async (type: SupplierType): Promise<Supplier[]> => {
    // In a real app, this would be an API call
    // return await api.get(`/suppliers?type=${type}`);
    
    // Simulate API delay and filter functionality
    return new Promise((resolve) => {
      setTimeout(() => {
        const results = MOCK_SUPPLIERS.filter(supplier => supplier.type === type);
        resolve([...results]);
      }, 300);
    });
  }
};
