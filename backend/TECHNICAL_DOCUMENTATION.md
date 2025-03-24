# POS System Technical Documentation

## Architecture Overview

The POS (Point of Sale) system is built using a layered architecture that promotes separation of concerns, maintainability, and testability. This document outlines the technical details of the system's implementation for developers working on the codebase.

## Technology Stack

- **Node.js & Express**: Server-side framework
- **TypeScript**: Type-safe JavaScript
- **Prisma ORM**: Database access layer
- **MySQL**: Relational database (configurable)
- **REST API**: Backend communication protocol

## Project Structure

```
backend/
├── src/
│   ├── controllers/     # HTTP request handlers
│   ├── repositories/    # Data access layer
│   ├── routes/          # API route definitions
│   ├── services/        # Business logic
│   ├── types/           # TypeScript type definitions
│   │   └── dto/         # Data Transfer Objects
│   ├── utils/           # Utility functions
│   └── index.ts         # Application entry point
├── prisma/
│   └── schema.prisma    # Database schema
├── tests/               # Test files
├── .env                 # Environment variables
└── package.json         # Dependencies and scripts
```

## Architectural Layers

### 1. Routes Layer

Routes define the API endpoints and map HTTP methods to controller methods. They handle URL patterns, route parameters, and middleware application.

**Example (`categoryRoutes.ts`):**
```typescript
import express from 'express';
import { categoryController } from '../controllers/categoryController';

const router = express.Router();

router.get('/', categoryController.getAllCategories.bind(categoryController));
router.get('/:id', categoryController.getCategoryById.bind(categoryController));
router.post('/', categoryController.createCategory.bind(categoryController));
router.put('/:id', categoryController.updateCategory.bind(categoryController));
router.delete('/:id', categoryController.deleteCategory.bind(categoryController));

export default router;
```

### 2. Controller Layer

Controllers handle HTTP requests and responses. They extract data from requests, validate inputs, call appropriate services, and format responses.

**Example (`categoryController.ts`):**
```typescript
export class CategoryController {
  async getAllCategories(req: Request, res: Response): Promise<void> {
    try {
      // Extract query parameters
      // Call service method
      // Format and send response
    } catch (error) {
      // Handle and report errors
    }
  }
}
```

### 3. Service Layer

Services implement business logic, orchestrate operations, and handle complex workflows. They're independent of HTTP and can be reused across different parts of the application.

**Example (`categoryService.ts`):**
```typescript
export class CategoryService {
  constructor(private repository: CategoryRepository) {}

  async getAllCategories(filters: CategoryFilters): Promise<Category[]> {
    // Apply business rules
    // Call repository methods
    // Process and return data
  }
}
```

### 4. Repository Layer

Repositories handle data access and persistence. They abstract database operations and provide a clean interface for services to interact with the database.

**Example (`categoryRepository.ts`):**
```typescript
export class CategoryRepository {
  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.CategoryWhereInput;
  }): Promise<Category[]> {
    return prisma.category.findMany(params);
  }
}
```

### 5. Data Transfer Objects (DTOs)

DTOs define the structure of data exchanged between the client and server. They help sanitize, transform, and structure API responses.

**Example (`categoryDto.ts`):**
```typescript
export interface CategoryDto {
  id: string;
  name: string;
  description: string | null;
  parentId: string | null;
  parentName: string | null;
  isActive: boolean;
  productCount: number;
  childrenCount: number;
  children: CategoryDto[];
  createdAt: Date;
  updatedAt: Date;
}

export function transformCategoryToDto(category: Category): CategoryDto {
  // Transform database entity to DTO
}
```

## Database Schema

The system uses Prisma ORM with a schema defined in `prisma/schema.prisma`. The main entities include:

- `Product`: Represents items for sale
- `Category`: Organizes products into hierarchical categories
- `Supplier`: Represents product vendors/suppliers
- `Store`: Represents physical or virtual store locations
- `ProductLocation`: Maps product inventory to specific stores
- `Order`: Represents sales transactions
- `OrderItem`: Represents individual line items in an order

## Core Features and Implementation

### 1. Product Management

Products are the central entity in the system. The implementation supports:

- Basic CRUD operations
- Stock management
- Multi-location inventory
- Categorization
- Supplier associations
- Barcode handling

The stock update logic in `productService.ts` ensures accurate inventory tracking:

```typescript
async updateProductStock(id: string, quantity: number): Promise<Product> {
  const product = await this.repository.findById(id);
  if (!product) {
    throw new Error('Product not found');
  }

  return this.repository.update(id, {
    stock: product.stock + quantity,
  });
}
```

### 2. Order Processing

Order processing involves several critical operations:

1. Order creation with multiple items
2. Inventory updates
3. Total calculations
4. Order status management
5. Payment status tracking

The order creation workflow in `orderService.ts` uses a transaction to ensure data consistency:

```typescript
async createOrder(data: OrderCreateData): Promise<Order> {
  return prisma.$transaction(async (tx) => {
    // Create order
    // Create order items
    // Update inventory
    // Return complete order
  });
}
```

### 3. Multi-location Inventory

The system supports tracking inventory across multiple store locations:

- Each product can have different stock levels at different stores
- The `ProductLocation` entity maps products to stores with quantity
- Stock operations can be performed globally or per location

### 4. Reporting and Analytics

The system includes built-in reporting capabilities:

- Sales summaries (daily, weekly, monthly)
- Popular product analysis
- Inventory level reports
- Order history and status tracking

## Error Handling Strategy

The application uses a consistent error handling approach:

1. Service methods throw typed errors for business rule violations
2. Controllers catch errors and map them to appropriate HTTP responses
3. A global error handler middleware catches uncaught exceptions

Example error handling in controllers:

```typescript
try {
  // Business logic
} catch (error) {
  console.error('Error:', error);
  
  if (error instanceof NotFoundError) {
    res.status(404).json({ message: error.message });
  } else if (error instanceof ValidationError) {
    res.status(400).json({ message: error.message });
  } else {
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
```

## Transaction Management

Database transactions ensure data consistency for operations that modify multiple entities:

```typescript
return prisma.$transaction(async (tx) => {
  // Multiple database operations
  // All succeed or all fail together
});
```

Key transactions include:
- Order creation and updates
- Inventory adjustments
- Category hierarchy changes

## Data Validation

Input validation happens at multiple levels:

1. **Controller Level**: Basic request validation
2. **Service Level**: Business rule validation
3. **Repository Level**: Database constraints

## Performance Considerations

The system implements several optimizations:

1. **Pagination**: All list endpoints support pagination to limit data size
2. **Selective Loading**: Relations are loaded only when needed
3. **Indexing**: Database indexes on frequently queried fields
4. **Query Optimization**: Where clauses and joins are optimized

## Extension Points

The system is designed for extensibility:

1. **New Entities**: Add new model to Prisma schema and implement the repository-service-controller pattern
2. **Custom Business Logic**: Extend services with new methods
3. **Additional Endpoints**: Add new routes and controller methods
4. **Reporting**: Implement custom reports in services using raw queries

## Development Guidelines

### Creating a New Entity

To add a new entity to the system:

1. Add the entity to the Prisma schema
2. Run `npx prisma generate` to update the Prisma client
3. Create a repository class for data access
4. Create DTOs for API responses
5. Create a service class for business logic
6. Create a controller for HTTP handling
7. Define routes for the API endpoints
8. Register the routes in `index.ts`

### Testing Strategy

The codebase should be tested at multiple levels:

1. **Unit Tests**: Test individual functions and methods
2. **Integration Tests**: Test interactions between components
3. **API Tests**: Test HTTP endpoints
4. **Database Tests**: Test database queries and transactions

## Deployment Considerations

For production deployment:

1. Set `NODE_ENV=production`
2. Configure a secure database connection
3. Implement proper authentication and authorization
4. Set up logging and monitoring
5. Configure CORS for appropriate domains
6. Implement rate limiting for API endpoints
7. Set up database backups

## Future Enhancements

Planned technical improvements:

1. **Authentication & Authorization**: Implement JWT-based auth
2. **Caching Layer**: Add Redis for caching frequently accessed data
3. **WebSockets**: Real-time updates for inventory changes
4. **Microservices**: Split into smaller, focused services
5. **Event Sourcing**: Implement event-based architecture for better scalability
6. **GraphQL API**: Add GraphQL support alongside REST

## Troubleshooting

### Common Development Issues

1. **Prisma Client Generation**: After schema changes, run `npx prisma generate`
2. **Transaction Timeouts**: Long-running transactions may timeout in development
3. **Type Errors**: Ensure DTO transformations handle all possible null/undefined cases
4. **Database Connection Issues**: Check .env file for correct DATABASE_URL

### Debugging Tips

1. Use VSCode's built-in debugger with the provided launch configuration
2. Add logging at different layers to trace execution
3. Use Prisma Studio (`npx prisma studio`) to inspect the database
4. Check request/response with Postman or similar tools 