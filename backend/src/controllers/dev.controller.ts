import { Request, Response } from 'express';
import { BaseController } from './base.controller';

/**
 * Development Controller
 * 
 * Handles all API requests in development mode with mock data.
 * This prevents 404 errors while the actual API endpoints are being developed.
 */
export class DevController extends BaseController {
  /**
   * Handle any GET request in development mode
   */
  handleGet(req: Request, res: Response) {
    const path = req.path;
    const segments = path.split('/').filter(Boolean);
    
    // If no segments, return API info
    if (segments.length === 0) {
      return this.sendSuccess(res, {
        name: 'POS System API',
        version: '1.0.0',
        status: 'development'
      });
    }

    // Get the resource type from the path (e.g., 'products', 'categories')
    const resourceType = segments[segments.length - 1];
    
    // Handle specific resources
    switch (resourceType) {
      case 'health':
        return this.sendSuccess(res, { status: 'ok' });
        
      case 'products':
        return this.handleProducts(req, res);
        
      case 'categories':
        return this.handleCategories(req, res);
        
      case 'customers':
        return this.handleCustomers(req, res);
        
      case 'orders':
        return this.handleOrders(req, res);
        
      case 'inventory':
        return this.handleInventory(req, res);

      case 'staff':
        return this.handleStaff(req, res);
      
      case 'roles':
        return this.handleRoles(req, res);

      case 'permissions':
        return this.handlePermissions(req, res);
        
      case 'notifications':
        return this.handleNotifications(req, res);
        
      case 'attributes':
        return this.handleAttributes(req, res);
        
      case 'settings':
        return this.handleSettings(req, res);
        
      case 'pricing':
      case 'theme':
      case 'company':
      case 'inventory-settings':
      case 'printing':
      case 'discount':
      case 'tax':
        return this.handleSettingsType(req, res, resourceType);
        
      default:
        // For any other resource, return empty array data
        console.log(`[DEV] Returning empty data for unhandled resource: ${resourceType}`);
        return this.sendSuccess(res, []);
    }
  }

  /**
   * Handle any POST/PUT/DELETE request in development mode
   */
  handleWrite(req: Request, res: Response) {
    const path = req.path;
    const segments = path.split('/').filter(Boolean);
    const method = req.method.toLowerCase();
    
    // Mock a successful write operation
    const resourceId = segments.length > 0 ? segments[segments.length - 1] : 'unknown';
    const isCreate = method === 'post';
    const isDelete = method === 'delete';
    
    if (isDelete) {
      return this.sendSuccess(res, null, 204);
    }
    
    return this.sendSuccess(
      res, 
      { 
        id: isCreate ? `new-${Date.now()}` : resourceId,
        ...req.body,
        updatedAt: new Date().toISOString(),
        createdAt: isCreate ? new Date().toISOString() : undefined
      },
      isCreate ? 201 : 200
    );
  }

  // Resource Handlers

  private handleProducts(req: Request, res: Response) {
    const productId = req.params.id;
    
    if (productId) {
      return this.sendSuccess(res, {
        id: productId,
        name: 'Sample Product',
        description: 'This is a sample product',
        sku: 'SAMPLE-001',
        price: 19.99,
        salePrice: 14.99,
        cost: 9.99,
        categoryId: 'cat-1',
        isActive: true,
        stockQuantity: 100,
        attributes: [],
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z'
      });
    }
    
    // Return a list of products
    const { page, pageSize } = this.getPaginationParams(req);
    
    return this.sendPaginatedSuccess(
      res,
      Array.from({ length: pageSize }, (_, i) => ({
        id: `prod-${i + 1}`,
        name: `Product ${i + 1}`,
        description: `Description for product ${i + 1}`,
        sku: `SKU-00${i + 1}`,
        price: (19.99 + i).toFixed(2),
        salePrice: i % 3 === 0 ? ((19.99 + i) * 0.8).toFixed(2) : null,
        cost: (9.99 + i).toFixed(2),
        categoryId: i % 5 === 0 ? 'cat-2' : 'cat-1',
        isActive: true,
        stockQuantity: 100 - i,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z'
      })),
      page,
      pageSize,
      100
    );
  }
  
  private handleCategories(req: Request, res: Response) {
    return this.sendSuccess(res, [
      {
        id: 'cat-1',
        name: 'Electronics',
        description: 'Electronic devices and accessories',
        slug: 'electronics',
        parentId: null,
        level: 0,
        image: null,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'cat-2',
        name: 'Computers',
        description: 'Desktop computers, laptops, and accessories',
        slug: 'computers',
        parentId: 'cat-1',
        level: 1,
        image: null,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'cat-3',
        name: 'Smartphones',
        description: 'Mobile phones and accessories',
        slug: 'smartphones',
        parentId: 'cat-1',
        level: 1,
        image: null,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]);
  }
  
  private handleCustomers(req: Request, res: Response) {
    const customerId = req.params.id;
    
    if (customerId) {
      return this.sendSuccess(res, {
        id: customerId,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        loyaltyPoints: 150,
        loyaltyTier: 'silver',
        lastPurchaseDate: '2023-05-01T10:30:00Z',
        totalPurchases: 1250.95,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-05-01T10:30:00Z'
      });
    }
    
    // Return a list of customers
    const { page, pageSize } = this.getPaginationParams(req);
    
    return this.sendPaginatedSuccess(
      res,
      Array.from({ length: pageSize }, (_, i) => ({
        id: `cust-${i + 1}`,
        firstName: `First${i + 1}`,
        lastName: `Last${i + 1}`,
        email: `customer${i + 1}@example.com`,
        phone: `+123456789${i}`,
        loyaltyPoints: i * 10,
        loyaltyTier: i % 3 === 0 ? 'gold' : i % 3 === 1 ? 'silver' : 'bronze',
        lastPurchaseDate: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
        totalPurchases: (100 * (i + 1)).toFixed(2),
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString()
      })),
      page,
      pageSize,
      100
    );
  }
  
  private handleOrders(req: Request, res: Response) {
    const orderId = req.params.id;
    
    if (orderId) {
      return this.sendSuccess(res, {
        id: orderId,
        orderNumber: `ORD-${orderId}`,
        customerId: 'cust-1',
        customerName: 'John Doe',
        date: new Date().toISOString(),
        total: 125.95,
        subtotal: 109.99,
        tax: 15.96,
        status: 'completed',
        paymentMethod: 'credit_card',
        items: [
          { 
            id: 'item-1', 
            productId: 'prod-1', 
            name: 'Sample Product', 
            price: 19.99, 
            quantity: 2, 
            total: 39.98 
          },
          { 
            id: 'item-2', 
            productId: 'prod-2', 
            name: 'Another Product', 
            price: 29.99, 
            quantity: 1, 
            total: 29.99 
          }
        ],
        createdAt: '2023-05-01T10:30:00Z',
        updatedAt: '2023-05-01T10:30:00Z'
      });
    }
    
    // Return a list of orders
    const { page, pageSize } = this.getPaginationParams(req);
    
    return this.sendPaginatedSuccess(
      res,
      Array.from({ length: pageSize }, (_, i) => ({
        id: `ord-${i + 1}`,
        orderNumber: `ORD-${1000 + i}`,
        customerId: `cust-${(i % 10) + 1}`,
        customerName: `Customer ${(i % 10) + 1}`,
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
        total: (100 + i * 10).toFixed(2),
        subtotal: (87 + i * 10).toFixed(2),
        tax: (13 + i).toFixed(2),
        status: i % 4 === 0 ? 'pending' : i % 4 === 1 ? 'processing' : i % 4 === 2 ? 'shipped' : 'completed',
        paymentMethod: i % 3 === 0 ? 'credit_card' : i % 3 === 1 ? 'cash' : 'bank_transfer',
        createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString()
      })),
      page,
      pageSize,
      100
    );
  }
  
  private handleInventory(req: Request, res: Response) {
    // Return inventory items
    const { page, pageSize } = this.getPaginationParams(req);
    
    return this.sendPaginatedSuccess(
      res,
      Array.from({ length: pageSize }, (_, i) => ({
        id: `inv-${i + 1}`,
        productId: `prod-${i + 1}`,
        productName: `Product ${i + 1}`,
        sku: `SKU-00${i + 1}`,
        quantity: 100 - i,
        reorderLevel: 10,
        lastRestockDate: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
        locationId: i % 3 === 0 ? 'loc-1' : i % 3 === 1 ? 'loc-2' : 'loc-3',
        locationName: i % 3 === 0 ? 'Main Warehouse' : i % 3 === 1 ? 'Store Front' : 'Back Storage',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString()
      })),
      page,
      pageSize,
      100
    );
  }
  
  private handleStaff(req: Request, res: Response) {
    const staffId = req.params.id;
    
    if (staffId) {
      return this.sendSuccess(res, {
        id: staffId,
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        phone: '+0987654321',
        position: 'Store Manager',
        roleId: 'role-1',
        roleName: 'Manager',
        department: 'Store Operations',
        isActive: true,
        lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-05-01T10:30:00Z'
      });
    }
    
    // Return a list of staff
    const { page, pageSize } = this.getPaginationParams(req);
    
    return this.sendPaginatedSuccess(
      res,
      Array.from({ length: pageSize }, (_, i) => ({
        id: `staff-${i + 1}`,
        firstName: `FirstName${i + 1}`,
        lastName: `LastName${i + 1}`,
        email: `staff${i + 1}@example.com`,
        phone: `+098765432${i}`,
        position: i % 3 === 0 ? 'Store Manager' : i % 3 === 1 ? 'Cashier' : 'Inventory Specialist',
        roleId: i % 3 === 0 ? 'role-1' : i % 3 === 1 ? 'role-2' : 'role-3',
        roleName: i % 3 === 0 ? 'Manager' : i % 3 === 1 ? 'Cashier' : 'Inventory',
        department: i % 2 === 0 ? 'Store Operations' : 'Inventory Management',
        isActive: i % 10 !== 9, // One inactive user for testing
        lastLogin: i % 5 === 0 ? null : new Date(Date.now() - i * 3 * 60 * 60 * 1000).toISOString(),
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString()
      })),
      page,
      pageSize,
      100
    );
  }
  
  private handleRoles(req: Request, res: Response) {
    return this.sendSuccess(res, [
      {
        id: 'role-1',
        name: 'Administrator',
        description: 'Full access to all system functions',
        permissions: {
          sales: { view: 'ALL', create: 'ALL', update: 'ALL', delete: 'ALL' },
          inventory: { view: 'ALL', create: 'ALL', update: 'ALL', delete: 'ALL' },
          customers: { view: 'ALL', create: 'ALL', update: 'ALL', delete: 'ALL' },
          staff: { view: 'ALL', create: 'ALL', update: 'ALL', delete: 'ALL' },
          reports: { view: 'ALL', create: 'ALL', update: 'ALL', delete: 'ALL' },
          settings: { view: 'ALL', create: 'ALL', update: 'ALL', delete: 'ALL' }
        },
        isSystem: true,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z'
      },
      {
        id: 'role-2',
        name: 'Cashier',
        description: 'Can process sales and view products',
        permissions: {
          sales: { view: 'ALL', create: 'ALL', update: 'DEPARTMENT', delete: 'NONE' },
          inventory: { view: 'ALL', create: 'NONE', update: 'NONE', delete: 'NONE' },
          customers: { view: 'ALL', create: 'ALL', update: 'SELF', delete: 'NONE' },
          staff: { view: 'NONE', create: 'NONE', update: 'NONE', delete: 'NONE' },
          reports: { view: 'SELF', create: 'NONE', update: 'NONE', delete: 'NONE' },
          settings: { view: 'NONE', create: 'NONE', update: 'NONE', delete: 'NONE' }
        },
        isSystem: true,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z'
      },
      {
        id: 'role-3',
        name: 'Inventory Manager',
        description: 'Manages products and inventory',
        permissions: {
          sales: { view: 'ALL', create: 'NONE', update: 'NONE', delete: 'NONE' },
          inventory: { view: 'ALL', create: 'ALL', update: 'ALL', delete: 'DEPARTMENT' },
          customers: { view: 'ALL', create: 'NONE', update: 'NONE', delete: 'NONE' },
          staff: { view: 'DEPARTMENT', create: 'NONE', update: 'NONE', delete: 'NONE' },
          reports: { view: 'DEPARTMENT', create: 'DEPARTMENT', update: 'NONE', delete: 'NONE' },
          settings: { view: 'NONE', create: 'NONE', update: 'NONE', delete: 'NONE' }
        },
        isSystem: false,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z'
      }
    ]);
  }
  
  private handlePermissions(req: Request, res: Response) {
    return this.sendSuccess(res, {
      modules: [
        {
          id: 'sales',
          name: 'Sales',
          permissions: ['view', 'create', 'update', 'delete', 'void', 'discount', 'refund']
        },
        {
          id: 'inventory',
          name: 'Inventory',
          permissions: ['view', 'create', 'update', 'delete', 'adjust', 'transfer', 'count']
        },
        {
          id: 'customers',
          name: 'Customers',
          permissions: ['view', 'create', 'update', 'delete', 'merge', 'export']
        },
        {
          id: 'staff',
          name: 'Staff',
          permissions: ['view', 'create', 'update', 'delete', 'assign']
        },
        {
          id: 'reports',
          name: 'Reports',
          permissions: ['view', 'create', 'export', 'schedule']
        },
        {
          id: 'settings',
          name: 'Settings',
          permissions: ['view', 'update']
        }
      ],
      accessLevels: [
        { id: 'ALL', name: 'All' },
        { id: 'DEPARTMENT', name: 'Department' },
        { id: 'SELF', name: 'Self Only' },
        { id: 'NONE', name: 'None' }
      ]
    });
  }
  
  private handleNotifications(req: Request, res: Response) {
    if (req.path.endsWith('/unread/count')) {
      return this.sendSuccess(res, { count: 0 });
    }
    
    // Return a list of notifications
    const { page, pageSize } = this.getPaginationParams(req);
    
    return this.sendSuccess(res, {
      notifications: [],
      pagination: {
        page,
        pageSize,
        totalItems: 0,
        totalPages: 0
      }
    });
  }
  
  private handleAttributes(req: Request, res: Response) {
    return this.sendSuccess(res, [
      {
        id: 'attr-1',
        name: 'Color',
        type: 'select',
        values: ['Red', 'Green', 'Blue', 'Black', 'White'],
        required: false,
        filterable: true,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z'
      },
      {
        id: 'attr-2',
        name: 'Size',
        type: 'select',
        values: ['S', 'M', 'L', 'XL', 'XXL'],
        required: false,
        filterable: true,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z'
      },
      {
        id: 'attr-3',
        name: 'Material',
        type: 'select',
        values: ['Cotton', 'Polyester', 'Wool', 'Silk', 'Linen'],
        required: false,
        filterable: true,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z'
      }
    ]);
  }
  
  private handleSettings(req: Request, res: Response) {
    const module = req.params.module;
    
    if (module) {
      return this.handleSettingsType(req, res, module);
    }
    
    return this.sendSuccess(res, {
      modules: [
        { id: 'company', name: 'Company Information' },
        { id: 'pricing', name: 'Pricing' },
        { id: 'theme', name: 'Theme' },
        { id: 'inventory', name: 'Inventory' },
        { id: 'tax', name: 'Tax' },
        { id: 'discount', name: 'Discounts' },
        { id: 'printing', name: 'Printing & Receipts' }
      ]
    });
  }
  
  private handleSettingsType(req: Request, res: Response, type: string) {
    switch (type) {
      case 'pricing':
        return this.sendSuccess(res, {
          id: 'pricing-settings',
          taxIncludedByDefault: true,
          defaultTaxRate: 10,
          roundToNearestUnit: true,
          roundingUnit: 0.05,
          showDiscountedPrices: true,
          currency: 'USD',
          currencySymbol: '$',
          currencyPosition: 'before'
        });
        
      case 'theme':
        return this.sendSuccess(res, {
          id: 'theme-settings',
          theme: 'system',
          accentColor: '#0284c7',
          fontSize: 'medium',
          borderRadius: 'medium',
          animation: {
            enabled: true,
            reducedMotion: false
          },
          layout: {
            sidebarCollapsed: false,
            contentWidth: 'contained',
            menuPosition: 'side',
            compactMode: false
          },
          cards: {
            shadow: 'medium',
            hover: true
          },
          tables: {
            striped: true,
            compact: false,
            bordered: false
          }
        });
        
      case 'company':
        return this.sendSuccess(res, {
          id: 'company-settings',
          name: 'Sample Company',
          legalName: 'Sample Company LLC',
          taxId: '123-45-6789',
          phone: '+1234567890',
          email: 'info@example.com',
          website: 'https://example.com',
          address: {
            line1: '123 Main St',
            line2: 'Suite 101',
            city: 'Sample City',
            state: 'ST',
            postalCode: '12345',
            country: 'United States'
          },
          logo: null,
          social: {
            facebook: '',
            twitter: '',
            instagram: ''
          }
        });
        
      case 'inventory-settings':
        return this.sendSuccess(res, {
          id: 'inventory-settings',
          allowNegativeStock: false,
          trackInventoryByDefault: true,
          lowStockThreshold: 5,
          criticalStockThreshold: 2,
          autoAdjustInventory: true,
          enableSerialNumberTracking: false,
          enableBatchTracking: false,
          defaultStockLocation: 'main-warehouse'
        });
        
      case 'printing':
        return this.sendSuccess(res, {
          id: 'printing-settings',
          receiptTitle: 'Thank You for Your Purchase',
          receiptFooter: 'Return policy: Items can be returned within 30 days with receipt',
          includeCompanyLogo: true,
          includeTaxDetails: true,
          paperSize: 'standard',
          fontSize: 'medium',
          defaultPrinter: 'Main Printer',
          printAutomatically: true,
          enableEmailReceipts: true,
          enableDigitalReceipts: true
        });
        
      case 'discount':
        return this.sendSuccess(res, {
          id: 'discount-settings',
          allowDiscountStacking: false,
          maxDiscountPercent: 50,
          requireManagerApproval: true,
          managerApprovalThreshold: 20,
          defaultDiscountType: 'percentage',
          trackDiscountsByUser: true,
          recordDiscountReason: true
        });
        
      case 'tax':
        return this.sendSuccess(res, {
          id: 'tax-settings',
          defaultTaxRate: 10,
          taxInclusive: true,
          enableTaxExemption: true,
          requireTaxExemptionNumber: true,
          taxCategories: [
            { id: 'standard', name: 'Standard Rate', rate: 10 },
            { id: 'reduced', name: 'Reduced Rate', rate: 5 },
            { id: 'zero', name: 'Zero Rate', rate: 0 }
          ],
          automaticTaxCalculation: true,
          recordTaxDetails: true
        });
        
      default:
        return this.sendSuccess(res, {
          id: `${type}-settings`,
          message: `Mock ${type} settings data`
        });
    }
  }
}

export const devController = new DevController();
