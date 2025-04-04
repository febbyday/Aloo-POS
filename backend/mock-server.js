const express = require('express');
const cors = require('cors');

// Create Express app
const app = express();
const PORT = 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Total-Count'],
  maxAge: 600 // Preflight request results can be cached for 10 minutes
}));
app.use(express.json());

// Mock data for shops
const mockShops = [
  {
    id: "shop-1",
    name: "Main Street Store",
    code: "MSS-001",
    description: "Our flagship store in the downtown area",
    status: "ACTIVE",
    type: "RETAIL",
    address: {
      street: "123 Main Street",
      street2: "Suite 101",
      city: "Springfield",
      state: "IL",
      postalCode: "62701",
      country: "United States",
      latitude: 39.7817,
      longitude: -89.6501
    },
    phone: "+1 (555) 123-4567",
    email: "main@example.com",
    manager: "John Smith",
    lastSync: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isHeadOffice: true,
    timezone: "America/Chicago",
    taxId: "123456789",
    licenseNumber: "RET-12345",
    website: "https://example.com/main",
    logoUrl: "https://example.com/logo.png",
    settings: {
      allowNegativeInventory: false,
      defaultTaxRate: 8.5,
      requireStockCheck: true,
      autoPrintReceipt: true,
      defaultDiscountRate: 0,
      enableCashierTracking: true,
      allowReturnWithoutReceipt: false,
      minPasswordLength: 8,
      requireManagerApproval: {
        forDiscount: true,
        forVoid: true,
        forReturn: true,
        forRefund: true,
        forPriceChange: true
      },
      thresholds: {
        lowStock: 5,
        criticalStock: 2,
        reorderPoint: 10
      }
    }
  },
  {
    id: "shop-2",
    name: "Westfield Mall Kiosk",
    code: "WMK-002",
    description: "Our mall kiosk location",
    status: "ACTIVE",
    type: "KIOSK",
    address: {
      street: "200 Westfield Ave",
      street2: "Kiosk #42",
      city: "Springfield",
      state: "IL",
      postalCode: "62702",
      country: "United States",
      latitude: 39.7890,
      longitude: -89.6700
    },
    phone: "+1 (555) 987-6543",
    email: "mall@example.com",
    manager: "Jane Doe",
    lastSync: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isHeadOffice: false,
    timezone: "America/Chicago",
    taxId: "987654321",
    licenseNumber: "KSK-54321",
    website: "https://example.com/mall",
    logoUrl: "https://example.com/logo-mall.png",
    settings: {
      allowNegativeInventory: true,
      defaultTaxRate: 6.0,
      requireStockCheck: false,
      autoPrintReceipt: true,
      defaultDiscountRate: 10.0,
      enableCashierTracking: true,
      allowReturnWithoutReceipt: false,
      minPasswordLength: 8,
      requireManagerApproval: {
        forDiscount: false,
        forVoid: true,
        forReturn: true,
        forRefund: true,
        forPriceChange: false
      },
      thresholds: {
        lowStock: 3,
        criticalStock: 1,
        reorderPoint: 5
      }
    }
  }
];

// Health check endpoint
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Configuration endpoint
app.get('/api/v1/config', (req, res) => {
  res.json({
    version: '1.0.0',
    useMock: false,
    features: {
      inventory: true,
      customers: true,
      reporting: true
    },
    apiBase: '/api/v1'
  });
});

// Get all shops
app.get('/api/v1/shops', (req, res) => {
  console.log('GET /api/v1/shops request received');
  res.json({
    success: true,
    data: {
      data: mockShops,
      pagination: {
        page: 1,
        limit: 10,
        total: mockShops.length,
        totalPages: 1
      }
    }
  });
});

// Get shop by ID
app.get('/api/v1/shops/:id', (req, res) => {
  const shop = mockShops.find(s => s.id === req.params.id);

  if (!shop) {
    return res.status(404).json({
      success: false,
      error: {
        message: `Shop with ID ${req.params.id} not found`
      }
    });
  }

  res.json({
    success: true,
    data: shop
  });
});

// Create a new shop
app.post('/api/v1/shops', (req, res) => {
  const newShop = {
    ...req.body,
    id: `shop-${mockShops.length + 1}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  mockShops.push(newShop);

  res.status(201).json({
    success: true,
    data: newShop
  });
});

// Update a shop
app.put('/api/v1/shops/:id', (req, res) => {
  const shopIndex = mockShops.findIndex(s => s.id === req.params.id);

  if (shopIndex === -1) {
    return res.status(404).json({
      success: false,
      error: {
        message: `Shop with ID ${req.params.id} not found`
      }
    });
  }

  mockShops[shopIndex] = {
    ...mockShops[shopIndex],
    ...req.body,
    updatedAt: new Date().toISOString()
  };

  res.json({
    success: true,
    data: mockShops[shopIndex]
  });
});

// Delete a shop
app.delete('/api/v1/shops/:id', (req, res) => {
  const shopIndex = mockShops.findIndex(s => s.id === req.params.id);

  if (shopIndex === -1) {
    return res.status(404).json({
      success: false,
      error: {
        message: `Shop with ID ${req.params.id} not found`
      }
    });
  }

  mockShops.splice(shopIndex, 1);

  res.json({
    success: true,
    message: `Shop with ID ${req.params.id} deleted successfully`
  });
});

// Mock notification data
const mockNotifications = [
  {
    id: "notif-1",
    title: "Welcome to POS System",
    message: "Thank you for using our POS system. Get started by adding your first shop.",
    type: "SYSTEM",
    priority: "MEDIUM",
    isRead: false,
    isArchived: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    readAt: null,
    link: "/shops/new"
  },
  {
    id: "notif-2",
    title: "Setup Complete",
    message: "Your system setup is complete. You can now start using all features.",
    type: "SYSTEM",
    priority: "LOW",
    isRead: false,
    isArchived: false,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    readAt: null,
    link: null
  }
];

// Get all notifications
app.get('/api/v1/notifications', (req, res) => {
  console.log('GET /api/v1/notifications request received');
  res.json(mockNotifications);
});

// Get all notifications (fallback endpoint)
app.get('/notifications', (req, res) => {
  console.log('GET /notifications request received');
  res.json(mockNotifications);
});

// Get unread notification count
app.get('/api/v1/notifications/unread/count', (req, res) => {
  console.log('GET /api/v1/notifications/unread/count request received');
  const unreadCount = mockNotifications.filter(n => !n.isRead).length;
  res.json({
    count: unreadCount
  });
});

// Get unread notification count (fallback endpoint)
app.get('/notifications/unread/count', (req, res) => {
  console.log('GET /notifications/unread/count request received');
  const unreadCount = mockNotifications.filter(n => !n.isRead).length;
  res.json({
    count: unreadCount
  });
});

// Mark notification as read
app.post('/api/v1/notifications/:id/read', (req, res) => {
  console.log(`POST /api/v1/notifications/${req.params.id}/read request received`);
  const notification = mockNotifications.find(n => n.id === req.params.id);

  if (!notification) {
    return res.status(404).json({ message: 'Notification not found' });
  }

  notification.isRead = true;
  notification.readAt = new Date().toISOString();

  res.json(notification);
});

// Mark all notifications as read
app.post('/api/v1/notifications/read/all', (req, res) => {
  console.log('POST /api/v1/notifications/read/all request received');

  const count = mockNotifications.filter(n => !n.isRead).length;

  mockNotifications.forEach(notification => {
    notification.isRead = true;
    if (!notification.readAt) {
      notification.readAt = new Date().toISOString();
    }
  });

  res.json({ count });
});

// Delete notification
app.delete('/api/v1/notifications/:id', (req, res) => {
  console.log(`DELETE /api/v1/notifications/${req.params.id} request received`);

  const index = mockNotifications.findIndex(n => n.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ message: 'Notification not found' });
  }

  mockNotifications.splice(index, 1);

  res.json({ message: 'Notification deleted successfully' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Mock server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api/v1`);
});