# POS System Implementation Guide

This document provides a comprehensive overview of the implementation details for the POS (Point of Sale) system. It covers architecture, data models, frontend-backend interactions, and best practices used throughout the codebase.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Frontend Implementation](#frontend-implementation)
3. [Backend Implementation](#backend-implementation)
4. [Data Models](#data-models)
5. [API Integration](#api-integration)
6. [Authentication & Security](#authentication--security)
7. [Common Patterns & Best Practices](#common-patterns--best-practices)
8. [Module-Specific Implementations](#module-specific-implementations)

## Architecture Overview

The POS system follows a modern client-server architecture with:

- **Frontend**: React-based single-page application (SPA)
- **Backend**: Node.js API server with Express
- **Database**: PostgreSQL with Prisma ORM
- **Shared Code**: Common schemas and types shared between frontend and backend

### Key Architectural Principles

1. **Feature-based Organization**: Code is organized by business domain/feature rather than technical concerns
2. **Context-based State Management**: React Context API for state management
3. **Shared Validation**: Zod schemas shared between frontend and backend
4. **API-First Design**: Well-defined API contracts between frontend and backend

## Frontend Implementation

### Structure

The frontend follows a feature-based organization:

```
src/
├── features/           # Business domains
│   ├── shops/          # Shop management feature
│   │   ├── components/ # UI components
│   │   ├── context/    # State management
│   │   ├── hooks/      # Custom hooks
│   │   ├── pages/      # Page components
│   │   ├── services/   # API services
│   │   └── types/      # TypeScript types
│   ├── products/       # Product management feature
│   ├── sales/          # Sales feature
│   └── ...
├── lib/                # Shared utilities
├── routes/             # Route definitions
└── shared/             # Shared components
```

### State Management

The application uses React Context API for state management:

- Each feature has its own context provider
- Contexts expose data and methods for manipulating that data
- Real API services and mock services share the same interface

Example from Shop Context:

```typescript
// Define the shape of the context
interface ShopContextType {
  shops: Shop[];
  isLoading: boolean;
  error: Error | null;
  selectedShop: Shop | null;
  
  // Methods
  fetchShops: () => Promise<void>;
  fetchShopById: (id: string) => Promise<void>;
  createShop: (shop: Omit<Shop, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Shop>;
  updateShop: (id: string, shopData: Partial<Shop>) => Promise<Shop>;
  deleteShop: (id: string) => Promise<void>;
}
```

### Routing

The application uses a centralized routing configuration:

- Route definitions are stored in dedicated files
- Routes include metadata like labels, icons, and visibility settings
- Dynamic routes use parameter placeholders

## Backend Implementation

### Structure

The backend follows a layered architecture:

```
backend/
├── prisma/             # Database schema and migrations
├── src/
│   ├── controllers/    # Request handlers
│   ├── middleware/     # Express middleware
│   ├── repositories/   # Data access layer
│   ├── routes/         # API route definitions
│   ├── services/       # Business logic
│   ├── types/          # TypeScript types
│   │   ├── dto/        # Data Transfer Objects
│   │   ├── mappers/    # Data transformation
│   │   └── schemas/    # Validation schemas
│   └── utils/          # Utility functions
└── shared/             # Shared code with frontend
```

### API Layer

The backend exposes RESTful endpoints:

- Controllers handle HTTP requests and responses
- Services contain business logic
- Repositories handle database operations
- DTOs define the shape of data sent to/from the API
- Mappers transform between database entities and DTOs

### Database Access

The application uses Prisma ORM for database access:

- Database schema defined in `prisma/schema.prisma`
- Migrations managed through Prisma Migrate
- Repositories encapsulate database operations

## Data Models

### Shared Schemas

The application uses Zod for schema validation, with schemas shared between frontend and backend:

```typescript
// Base shop schema with common fields
export const baseShopSchema = z.object({
  code: z.string().min(2, 'Code must be at least 2 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  address: addressSchema,
  phone: z.string().min(1, 'Phone is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  status: z.nativeEnum(SHOP_STATUS).default(SHOP_STATUS.ACTIVE),
  type: z.nativeEnum(SHOP_TYPE).default(SHOP_TYPE.RETAIL),
  // ...
});
```

### Key Data Models

#### Shop/Store

The Shop model represents a physical or online store location:

- **Database Model**: Defined in `prisma/schema.prisma`
- **Shared Schema**: Defined in `shared/schemas/shopSchema.ts`
- **Frontend Type**: Defined in `src/features/shops/types/shops.types.ts`
- **DTO**: Defined in `backend/src/types/dto/shopDto.ts`

#### Product

The Product model represents items sold in shops:

- Supports simple and variable products
- Includes inventory tracking
- Supports categorization and attributes

#### User/Staff

The User model represents system users and staff members:

- Role-based permissions
- Shop assignments
- Authentication details

## API Integration

### Frontend API Client

The frontend uses a centralized API client:

```typescript
// API endpoints
const ENDPOINTS = {
  SHOPS: 'shops',
  SHOP_BY_ID: (id: string) => `shops/${id}`,
  SHOP_STAFF: (id: string) => `shops/${id}/staff`,
  // ...
};

// Shop service
export const realShopService = {
  // Fetch all shops
  async fetchAll(): Promise<Shop[]> {
    try {
      const response = await apiClient.get<ShopListResponse>(ENDPOINTS.SHOPS);
      // ...
    } catch (error) {
      // ...
    }
  },
  // ...
};
```

### Data Transformation

Data is transformed between frontend and backend formats:

```typescript
// Maps between backend ShopDto and frontend Shop structure
export function mapShopDtoToShop(shopDto: ShopDto): FrontendShop {
  return {
    id: shopDto.id,
    code: shopDto.code,
    name: shopDto.name,
    // ...
    lastSync: shopDto.lastSync.toISOString(),
    // ...
  };
}
```

## Authentication & Security

### Authentication Flow

The system uses JWT-based authentication:

1. User logs in with credentials
2. Backend validates credentials and issues JWT
3. Frontend stores JWT in secure storage
4. JWT is included in subsequent API requests
5. Backend validates JWT for protected routes

### Security Best Practices

- Input validation using Zod schemas
- CSRF protection
- Rate limiting
- Secure password storage with bcrypt
- Role-based access control

## Common Patterns & Best Practices

### Error Handling

The application uses a consistent error handling approach:

- Backend sends standardized error responses
- Frontend catches and processes errors
- Error boundaries for UI error handling

```typescript
try {
  // Operation that might fail
} catch (error) {
  console.error('Error message:', error);
  
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Handle specific database errors
  }
  
  // Send standardized error response
  sendErrorResponse(res, error instanceof Error ? error : String(error), 500);
}
```

### Form Handling

Forms follow these best practices:

- Zod schema validation
- Appropriate autocomplete attributes
- Cross-field validation
- Optimistic updates
- Proper loading states
- Consistent layout patterns

### Data Fetching

Data fetching follows these patterns:

- Centralized API services
- Loading states
- Error handling
- Caching where appropriate
- Pagination support

## Module-Specific Implementations

### Shop Management

The Shop management module allows:

- Creating, viewing, updating, and deleting shops
- Managing shop inventory
- Assigning staff to shops
- Configuring shop settings
- Viewing shop reports

Implementation details:
- Shop data is stored in the `Shop` table
- Shop settings are stored as JSON
- Shop inventory is tracked through the `ProductLocation` relation
- Staff assignments are tracked through the `StaffAssignment` relation

### Product Management

The Product management module includes:

- Simple and variable products
- Product categories
- Product attributes and variations
- Pricing management
- Inventory tracking

Implementation details:
- Products are stored in the `Product` table
- Variable products use attributes and variations
- Inventory is tracked per shop through `ProductLocation`
- Categories form a hierarchical structure

### Sales & Checkout

The Sales module handles:

- Point of sale transactions
- Order management
- Returns and refunds
- Discounts and promotions
- Receipt generation

Implementation details:
- Orders are stored in the `Order` table
- Order items are stored in the `OrderItem` table
- Transactions are stored in the `Transaction` table
- Receipts can be printed or emailed

### User & Staff Management

The User management module handles:

- User authentication
- Role-based permissions
- Staff assignments to shops
- Staff scheduling

Implementation details:
- Users are stored in the `User` table
- Roles are stored in the `Role` table
- Permissions are stored as JSON in roles
- Staff assignments are tracked in the `StaffAssignment` table

---

This implementation guide provides an overview of the key aspects of the POS system. For more detailed information about specific features or components, refer to the code documentation and comments.
