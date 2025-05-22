# Backend Connection Implementation Plan

This document outlines the detailed plan for connecting the frontend modules to the backend API, with a phased approach starting from the most foundational modules.

## Overview

The implementation will follow a phased approach, starting with the Auth module as the foundation and progressively implementing other modules based on their dependencies. Each phase will include schema validation, service layer implementation, state management integration, UI component updates, error handling, and testing.

## Phase 1: Auth Module Implementation

**Duration: 1 week**

### 0. PIN Authentication Backend Requirements

The following backend endpoints need to be implemented to support PIN authentication:

- **POST /auth/pin/login**: Authenticate user with PIN
  - Request: `{ username, pin, deviceId, rememberDevice }`
  - Response: `{ success, user, token, refreshToken, expiresIn }`

- **POST /auth/pin/setup**: Set up PIN for a user
  - Request: `{ pin, confirmPin, currentPassword }`
  - Response: `{ success, error? }`

- **POST /auth/pin/change**: Change existing PIN
  - Request: `{ currentPin, newPin, confirmPin }`
  - Response: `{ success, error? }`

- **POST /auth/pin/verify**: Verify PIN
  - Request: `{ pin }`
  - Response: `{ success, error? }`

- **POST /auth/pin/disable**: Disable PIN authentication
  - Request: `{}`
  - Response: `{ success, error? }`

- **GET /auth/pin/status**: Get PIN status
  - Response: `{ isPinEnabled, lastPinChange? }`

- **GET /auth/devices/trusted**: Get trusted devices
  - Response: `{ devices: [{ id, name, browser, os, lastUsed, ipAddress }] }`

- **POST /auth/devices/trusted/add**: Add trusted device
  - Request: `{ device: { id, name, browser, os } }`
  - Response: `{ success, error? }`

- **POST /auth/devices/trusted/remove**: Remove trusted device
  - Request: `{ deviceId }`
  - Response: `{ success, error? }`

These endpoints should implement the following security features:
- CSRF protection
- Rate limiting
- Account lockout after multiple failed attempts
- Secure PIN storage (hashed, not plaintext)
- Device fingerprinting validation

### 1.1 Review and Update Shared Schemas
- ✅ Review existing auth schemas
- ✅ Create/update `UserSchema`
- ✅ Create/update `LoginRequestSchema`
- ✅ Create/update `LoginResponseSchema`
- ✅ Create/update `RefreshTokenSchema`
- ✅ Create/update `PasswordResetSchema`
- ✅ Create/update `PinLoginRequestSchema`
- ✅ Create/update `PinSetupRequestSchema`
- ✅ Create/update `PinChangeRequestSchema`
- ✅ Create/update `PinVerificationRequestSchema`
- ✅ Create/update `DeviceInfoSchema`

### 1.2 Implement Auth API Service
- ✅ Create `AuthService` class
- ✅ Implement login method
- ✅ Implement logout method
- ✅ Implement register method
- ✅ Implement token refresh method
- ✅ Add password reset functionality
- ✅ Add account recovery functionality
- ✅ Implement session management
- ✅ Set up proper error handling
- ✅ Implement token storage and management
- ✅ Implement CSRF protection
- ✅ Create `PinAuthService` class
- ✅ Implement PIN login method
- ✅ Implement PIN setup method
- ✅ Implement PIN change method
- ✅ Implement PIN verification method
- ✅ Implement device fingerprinting
- ✅ Implement trusted device management
- ✅ Add account lockout functionality
- ✅ Add suspicious activity detection

### 1.3 Update Auth Context and Hooks
- ✅ Enhance `AuthProvider` component
- ✅ Connect to the `AuthService`
- ✅ Manage authentication state
- ✅ Handle login/logout flows
- ✅ Create `useAuth` hook
- ✅ Create `useAuthenticatedFetch` hook
- ✅ Create `usePermissions` hook
- ✅ Add PIN authentication support to context
- ✅ Add security settings management to context
- ✅ Add trusted device management to context

### 1.4 Update Protected Routes
- ✅ Enhance `ProtectedRoute` component
- ✅ Connect to the real authentication system
- ✅ Add role-based access control
- ✅ Implement permission checking
- ✅ Update route configuration

### 1.5 Implement Login and User Management UI
- ✅ Update `LoginPage` component
- ✅ Connect to real authentication API
- ✅ Add proper validation
- ✅ Implement error handling and loading states
- ⬜ Create profile management page
- ⬜ Create password change page
- ✅ Create security settings page
- ✅ Create `PinLoginForm` component
- ✅ Create `PinSetupForm` component
- ✅ Create `QuickLoginPage` component
- ✅ Create `SecuritySettings` component
- ✅ Implement PIN management UI

### 1.6 Testing
- ✅ Write unit tests for `AuthService`
- ✅ Write unit tests for auth hooks
- ✅ Write integration tests for auth flows
- ✅ Test error scenarios and edge cases
- ✅ Write unit tests for `PinAuthService`
- ✅ Write unit tests for PIN authentication components
- ✅ Test security features and CSRF protection

## Phase 2: Products Module Implementation

**Duration: 1 week**

### 2.1 Review and Update Product Schemas
- [ ] Review existing product schemas
- [ ] Update `ProductSchema`
- [ ] Update `CategorySchema`
- [ ] Create/update `ProductVariationSchema`
- [ ] Create/update `ProductAttributeSchema`

### 2.2 Implement Product API Service
- [ ] Enhance `ProductService` class
- [ ] Connect to real backend endpoints
- [ ] Implement CRUD operations
- [ ] Add specialized methods for product management
- [ ] Implement caching strategy
- [ ] Set up client-side caching for products
- [ ] Implement cache invalidation

### 2.3 Update Product Context and Hooks
- [ ] Enhance `ProductProvider` component
- [ ] Connect to the `ProductService`
- [ ] Manage product state
- [ ] Handle product CRUD operations
- [ ] Create `useProducts` hook
- [ ] Create `useProductCategories` hook
- [ ] Create `useProductVariations` hook

### 2.4 Update Product UI Components
- [ ] Update `ProductsPage` component
- [ ] Connect to real data
- [ ] Implement pagination and filtering
- [ ] Add loading and error states
- [ ] Update `ProductDetailsPage` component
- [ ] Implement edit functionality
- [ ] Add related products functionality
- [ ] Update `ProductForm` component
- [ ] Connect to real data for categories and attributes
- [ ] Implement validation
- [ ] Add image upload functionality

### 2.5 Testing
- [ ] Write unit tests for `ProductService`
- [ ] Write unit tests for product hooks
- [ ] Write integration tests for product CRUD operations
- [ ] Test error scenarios and edge cases

## Phase 3: Categories and Variations Implementation

**Duration: 3-4 days**

### 3.1 Implement Category API Service
- [ ] Create `CategoryService` class
- [ ] Connect to real backend endpoints
- [ ] Implement CRUD operations
- [ ] Add methods for category hierarchy

### 3.2 Implement Variations and Attributes API Service
- [ ] Create `VariationService` class
- [ ] Connect to real backend endpoints
- [ ] Implement CRUD operations
- [ ] Add methods for variation templates

### 3.3 Update UI Components
- [ ] Update `CategoryPage` component
- [ ] Connect to real data
- [ ] Implement category management
- [ ] Update `VariationsPage` component
- [ ] Connect to real data
- [ ] Implement variation and attribute management

### 3.4 Testing
- [ ] Write unit tests for `CategoryService`
- [ ] Write unit tests for `VariationService`
- [ ] Write integration tests for category and variation management
- [ ] Test error scenarios and edge cases

## Phase 4: Inventory Implementation

**Duration: 3-4 days**

### 4.1 Implement Inventory API Service
- [ ] Create `InventoryService` class
- [ ] Connect to real backend endpoints
- [ ] Implement stock management operations
- [ ] Add methods for inventory tracking

### 4.2 Update Inventory Context and Hooks
- [ ] Create `InventoryProvider` component
- [ ] Connect to the `InventoryService`
- [ ] Manage inventory state
- [ ] Handle inventory operations
- [ ] Create `useInventory` hook
- [ ] Create `useStockLevels` hook
- [ ] Create `useInventoryHistory` hook

### 4.3 Update Inventory UI Components
- [ ] Update `InventoryPage` component
- [ ] Connect to real data
- [ ] Implement stock management functionality
- [ ] Add stock transfer functionality
- [ ] Add stock history tracking

### 4.4 Testing
- [ ] Write unit tests for `InventoryService`
- [ ] Write unit tests for inventory hooks
- [ ] Write integration tests for inventory management
- [ ] Test error scenarios and edge cases

## Phase 5: Shops Implementation

**Duration: 3-4 days**

### 5.1 Implement Shop API Service
- [ ] Enhance `ShopService` class
- [ ] Connect to real backend endpoints
- [ ] Implement CRUD operations
- [ ] Add methods for shop management

### 5.2 Update Shop Context and Hooks
- [ ] Enhance `ShopProvider` component
- [ ] Connect to the `ShopService`
- [ ] Manage shop state
- [ ] Handle shop operations
- [ ] Create `useShops` hook
- [ ] Create `useShopStaff` hook
- [ ] Create `useShopInventory` hook

### 5.3 Update Shop UI Components
- [ ] Update `ShopsPage` component
- [ ] Connect to real data
- [ ] Implement shop management functionality
- [ ] Update `ShopDetailsPage` component
- [ ] Connect to real data
- [ ] Implement shop details management

### 5.4 Testing
- [ ] Write unit tests for `ShopService`
- [ ] Write unit tests for shop hooks
- [ ] Write integration tests for shop management
- [ ] Test error scenarios and edge cases

## Phase 6: Staff Implementation

**Duration: 3-4 days**

### 6.1 Implement Staff API Service
- [ ] Create `StaffService` class
- [ ] Connect to real backend endpoints
- [ ] Implement CRUD operations
- [ ] Add methods for staff management

### 6.2 Update Staff Context and Hooks
- [ ] Create `StaffProvider` component
- [ ] Connect to the `StaffService`
- [ ] Manage staff state
- [ ] Handle staff operations
- [ ] Create `useStaff` hook
- [ ] Create `useStaffRoles` hook

### 6.3 Update Staff UI Components
- [ ] Update `StaffPage` component
- [ ] Connect to real data
- [ ] Implement staff management functionality
- [ ] Add staff assignment functionality
- [ ] Add staff performance tracking

### 6.4 Testing
- [ ] Write unit tests for `StaffService`
- [ ] Write unit tests for staff hooks
- [ ] Write integration tests for staff management
- [ ] Test error scenarios and edge cases

## Phase 7: Customers Implementation

**Duration: 3-4 days**

### 7.1 Enhance Customer API Service
- [ ] Update `CustomerService` class
- [ ] Connect to real backend endpoints
- [ ] Implement CRUD operations
- [ ] Add methods for customer management

### 7.2 Update Customer Context and Hooks
- [ ] Create `CustomerProvider` component
- [ ] Connect to the `CustomerService`
- [ ] Manage customer state
- [ ] Handle customer operations
- [ ] Create `useCustomers` hook
- [ ] Create `useCustomerGroups` hook

### 7.3 Update Customer UI Components
- [ ] Update `CustomersPage` component
- [ ] Connect to real data
- [ ] Implement customer management functionality
- [ ] Add customer group management
- [ ] Add customer loyalty tracking

### 7.4 Testing
- [ ] Write unit tests for `CustomerService`
- [ ] Write unit tests for customer hooks
- [ ] Write integration tests for customer management
- [ ] Test error scenarios and edge cases

## Phase 8: Sales and Orders Implementation

**Duration: 1 week**

### 8.1 Implement Sales API Service
- [ ] Create `SalesService` class
- [ ] Connect to real backend endpoints
- [ ] Implement CRUD operations
- [ ] Add methods for sales management

### 8.2 Implement Order API Service
- [ ] Enhance `OrderService` class
- [ ] Connect to real backend endpoints
- [ ] Implement CRUD operations
- [ ] Add methods for order management

### 8.3 Update Sales and Orders Context and Hooks
- [ ] Create `SalesProvider` component
- [ ] Connect to the `SalesService`
- [ ] Manage sales state
- [ ] Handle sales operations
- [ ] Create `OrdersProvider` component
- [ ] Connect to the `OrderService`
- [ ] Manage orders state
- [ ] Handle order operations

### 8.4 Update Sales and Orders UI Components
- [ ] Update `SalesPage` component
- [ ] Connect to real data
- [ ] Implement sales management functionality
- [ ] Update `OrdersPage` component
- [ ] Connect to real data
- [ ] Implement order management functionality

### 8.5 Testing
- [ ] Write unit tests for `SalesService`
- [ ] Write unit tests for `OrderService`
- [ ] Write unit tests for sales and orders hooks
- [ ] Write integration tests for sales and orders management
- [ ] Test error scenarios and edge cases

## Phase 9: Reports and Analytics Implementation

**Duration: 3-4 days**

### 9.1 Implement Reports API Service
- [ ] Create `ReportsService` class
- [ ] Connect to real backend endpoints
- [ ] Implement report generation methods
- [ ] Add methods for analytics

### 9.2 Update Reports Context and Hooks
- [ ] Create `ReportsProvider` component
- [ ] Connect to the `ReportsService`
- [ ] Manage reports state
- [ ] Handle report operations
- [ ] Create `useReports` hook
- [ ] Create `useAnalytics` hook

### 9.3 Update Reports UI Components
- [ ] Update `ReportsPage` component
- [ ] Connect to real data
- [ ] Implement report generation functionality
- [ ] Add analytics visualization
- [ ] Add export functionality

### 9.4 Testing
- [ ] Write unit tests for `ReportsService`
- [ ] Write unit tests for reports hooks
- [ ] Write integration tests for report generation
- [ ] Test error scenarios and edge cases

## Implementation Timeline

| Phase | Module | Estimated Duration |
|-------|--------|-------------------|
| 1 | Auth | 1 week |
| 2 | Products | 1 week |
| 3 | Categories and Variations | 3-4 days |
| 4 | Inventory | 3-4 days |
| 5 | Shops | 3-4 days |
| 6 | Staff | 3-4 days |
| 7 | Customers | 3-4 days |
| 8 | Sales and Orders | 1 week |
| 9 | Reports and Analytics | 3-4 days |

Total estimated time: 5-6 weeks

## Testing Strategy

For each module:

1. **Unit Tests**
   - Test API service methods
   - Test hooks and context providers
   - Test utility functions

2. **Integration Tests**
   - Test API service integration with backend
   - Test context providers with components

3. **End-to-End Tests**
   - Test complete user flows
   - Test error scenarios

## Monitoring and Error Handling

1. **Implement centralized error handling**
   - Create an ErrorBoundary component
   - Implement error logging

2. **Set up monitoring**
   - Track API request success/failure rates
   - Monitor performance metrics

3. **Implement retry mechanisms**
   - Add automatic retry for network failures
   - Implement exponential backoff

## Dependencies and Relationships

The implementation plan takes into account the following module dependencies:

- Auth is the foundation for all authenticated requests
- Products are required by Inventory, Orders, and Sales
- Categories are required by Products
- Inventory depends on Products and Shops
- Sales depend on Products, Inventory, and Customers
- Reports depend on most other modules

This dependency graph ensures that each module is implemented in the correct order to minimize integration issues.
