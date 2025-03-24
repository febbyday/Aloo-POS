# POS System API Documentation

## Overview

This document provides comprehensive documentation for the Point of Sale (POS) System REST API. The API allows clients to manage products, categories, suppliers, stores, inventory, and orders, enabling a complete retail management solution.

## Table of Contents

1. [Getting Started](#getting-started)
   - [Installation](#installation)
   - [Environment Setup](#environment-setup)
   - [Running the API](#running-the-api)
2. [Architecture](#architecture)
   - [System Architecture](#system-architecture)
   - [Data Flow](#data-flow)
3. [Authentication](#authentication)
4. [API Endpoints](#api-endpoints)
   - [Products](#products)
   - [Categories](#categories)
   - [Suppliers](#suppliers)
   - [Stores & Locations](#stores--locations)
   - [Orders](#orders)
5. [Data Models](#data-models)
6. [Error Handling](#error-handling)
7. [Examples](#examples)
8. [Troubleshooting](#troubleshooting)

## Getting Started

### Installation

To set up the POS System API locally:

```bash
# Clone the repository
git clone [repository-url]

# Navigate to the backend directory
cd POS/backend

# Install dependencies
npm install
```

### Environment Setup

Create a `.env` file in the root of the backend directory with the following variables:

```
PORT=5000
DATABASE_URL="mysql://username:password@localhost:3306/pos_db"
```

Adjust the database connection string according to your database setup.

### Running the API

```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start
```

## Architecture

### System Architecture

The POS System follows a layered architecture:

1. **Routes Layer**: Defines API endpoints and routes requests to controllers
2. **Controller Layer**: Handles HTTP requests/responses and calls appropriate services
3. **Service Layer**: Contains business logic and orchestrates operations
4. **Repository Layer**: Handles data access and persistence using Prisma ORM
5. **DTO Layer**: Defines data transfer objects for structured API responses

### Data Flow

```
Client Request → Routes → Controllers → Services → Repositories → Database
```

For responses, data flows in the reverse direction, with DTOs transforming data before sending it to the client.

## Authentication

> Note: Authentication is not currently implemented in this version. Future versions will include JWT-based authentication and role-based access control.

## API Endpoints

### Products

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/products` | Get all products with filtering and pagination | Public |
| GET | `/api/products/:id` | Get a product by ID | Public |
| GET | `/api/products/barcode/:barcode` | Get a product by barcode | Public |
| GET | `/api/products/category/:categoryId` | Get products by category | Public |
| GET | `/api/products/supplier/:supplierId` | Get products by supplier | Public |
| GET | `/api/products/search` | Search products (autocomplete) | Public |
| POST | `/api/products` | Create a new product | Private |
| PUT | `/api/products/:id` | Update a product | Private |
| PUT | `/api/products/:id/stock` | Update product stock | Private |
| PUT | `/api/products/:id/stock/locations` | Update product stock across locations | Private |
| DELETE | `/api/products/:id` | Delete a product | Private |

#### Query Parameters for Product Listing

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `search`: Search term for product name or SKU
- `category`: Filter by category ID
- `supplier`: Filter by supplier ID
- `minPrice`: Minimum price filter
- `maxPrice`: Maximum price filter
- `inStock`: Filter for in-stock products (true/false)
- `sortBy`: Field to sort by (name, price, stock, createdAt)
- `sortOrder`: Sort direction (asc/desc)

### Categories

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/categories` | Get all categories with filtering and pagination | Public |
| GET | `/api/categories/:id` | Get a category by ID | Public |
| GET | `/api/categories/subcategories/:parentId` | Get subcategories by parent ID | Public |
| GET | `/api/categories/hierarchy` | Get category hierarchy in tree structure | Public |
| POST | `/api/categories` | Create a new category | Private |
| PUT | `/api/categories/:id` | Update a category | Private |
| DELETE | `/api/categories/:id` | Delete a category | Private |

#### Query Parameters for Category Listing

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `search`: Search term for category name
- `parentId`: Filter by parent category ID
- `sortBy`: Field to sort by (name, createdAt)
- `sortOrder`: Sort direction (asc/desc)

### Suppliers

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/suppliers` | Get all suppliers with filtering and pagination | Private |
| GET | `/api/suppliers/:id` | Get a supplier by ID | Private |
| POST | `/api/suppliers` | Create a new supplier | Private |
| PUT | `/api/suppliers/:id` | Update a supplier | Private |
| DELETE | `/api/suppliers/:id` | Delete a supplier | Private |

#### Query Parameters for Supplier Listing

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `search`: Search term for supplier name or contact
- `sortBy`: Field to sort by (name, createdAt)
- `sortOrder`: Sort direction (asc/desc)

### Stores & Locations

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/stores` | Get all stores with filtering and pagination | Private |
| GET | `/api/stores/:id` | Get a store by ID | Private |
| GET | `/api/stores/:id/inventory` | Get inventory for a store | Private |
| POST | `/api/stores` | Create a new store | Private |
| PUT | `/api/stores/:id` | Update a store | Private |
| DELETE | `/api/stores/:id` | Delete a store | Private |
| POST | `/api/stores/:id/inventory` | Add product to store inventory | Private |
| PUT | `/api/stores/:id/inventory/:productId` | Update product quantity in store inventory | Private |
| DELETE | `/api/stores/:id/inventory/:productId` | Remove product from store inventory | Private |

#### Query Parameters for Store Listing

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `search`: Search term for store name or location
- `sortBy`: Field to sort by (name, location, createdAt)
- `sortOrder`: Sort direction (asc/desc)

### Orders

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/orders` | Get all orders with filtering and pagination | Private |
| GET | `/api/orders/:id` | Get an order by ID | Private |
| GET | `/api/orders/number/:orderNumber` | Get an order by order number | Private |
| GET | `/api/orders/:id/summary` | Get order summary for receipt/invoice | Private |
| GET | `/api/orders/summary` | Get sales summary data (daily, weekly, monthly) | Private |
| POST | `/api/orders` | Create a new order | Private |
| PUT | `/api/orders/:id` | Update an existing order | Private |
| DELETE | `/api/orders/:id` | Delete an order | Private |

#### Query Parameters for Order Listing

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `search`: Search term for order number
- `status`: Filter by order status (PENDING, PROCESSING, COMPLETED, CANCELLED)
- `paymentStatus`: Filter by payment status (PENDING, PAID, REFUNDED, FAILED)
- `storeId`: Filter by store ID
- `startDate`: Filter by start date (ISO format)
- `endDate`: Filter by end date (ISO format)
- `minTotal`: Filter by minimum order total
- `maxTotal`: Filter by maximum order total
- `sortBy`: Field to sort by (orderNumber, total, createdAt)
- `sortOrder`: Sort direction (asc/desc)

## Data Models

### Product

```typescript
{
  id: string;
  name: string;
  description: string | null;
  sku: string;
  barcode: string | null;
  retailPrice: number;
  wholesalePrice: number | null;
  purchasePrice: number | null;
  stock: number;
  isActive: boolean;
  categoryId: string | null;
  supplierId: string | null;
  category: Category | null;
  supplier: Supplier | null;
  locations: ProductLocation[];
  images: string[] | null;
  createdAt: Date;
  updatedAt: Date;
}
```

### Category

```typescript
{
  id: string;
  name: string;
  description: string | null;
  parentId: string | null;
  isActive: boolean;
  parent: Category | null;
  children: Category[];
  products: Product[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Supplier

```typescript
{
  id: string;
  name: string;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  isActive: boolean;
  products: Product[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Store

```typescript
{
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  phone: string | null;
  email: string | null;
  isActive: boolean;
  products: ProductLocation[];
  orders: Order[];
  createdAt: Date;
  updatedAt: Date;
}
```

### ProductLocation

```typescript
{
  id: string;
  productId: string;
  storeId: string;
  quantity: number;
  minimumStockLevel: number | null;
  product: Product;
  store: Store;
  createdAt: Date;
  updatedAt: Date;
}
```

### Order

```typescript
{
  id: string;
  orderNumber: string;
  status: OrderStatus; // PENDING, PROCESSING, COMPLETED, CANCELLED
  paymentStatus: PaymentStatus; // PENDING, PAID, REFUNDED, FAILED
  paymentMethod: string | null;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  notes: string | null;
  storeId: string | null;
  store: Store | null;
  items: OrderItem[];
  createdAt: Date;
  updatedAt: Date;
}
```

### OrderItem

```typescript
{
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  discount: number;
  tax: number;
  order: Order;
  product: Product;
  createdAt: Date;
  updatedAt: Date;
}
```

## Error Handling

The API returns appropriate HTTP status codes and error messages in a consistent format:

```json
{
  "message": "Error message describing what went wrong",
  "error": "Detailed error information (in development mode)"
}
```

Common HTTP status codes:

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid input or parameters
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server-side error

## Examples

### Creating a Product

**Request:**

```http
POST /api/products
Content-Type: application/json

{
  "name": "Organic Banana",
  "description": "Fresh organic bananas",
  "sku": "FRUIT-BAN-001",
  "barcode": "1234567890123",
  "retailPrice": 1.99,
  "wholesalePrice": 1.50,
  "purchasePrice": 1.20,
  "stock": 100,
  "isActive": true,
  "categoryId": "category-uuid-here",
  "supplierId": "supplier-uuid-here",
  "images": ["https://example.com/banana.jpg"]
}
```

**Response:**

```json
{
  "id": "product-uuid-here",
  "name": "Organic Banana",
  "description": "Fresh organic bananas",
  "sku": "FRUIT-BAN-001",
  "barcode": "1234567890123",
  "retailPrice": 1.99,
  "wholesalePrice": 1.50,
  "purchasePrice": 1.20,
  "stock": 100,
  "isActive": true,
  "categoryId": "category-uuid-here",
  "categoryName": "Fruit",
  "supplierId": "supplier-uuid-here",
  "supplierName": "Organic Farms Inc.",
  "images": ["https://example.com/banana.jpg"],
  "createdAt": "2023-07-01T12:00:00Z",
  "updatedAt": "2023-07-01T12:00:00Z"
}
```

### Creating an Order

**Request:**

```http
POST /api/orders
Content-Type: application/json

{
  "storeId": "store-uuid-here",
  "paymentMethod": "CREDIT_CARD",
  "notes": "Customer requested fast delivery",
  "items": [
    {
      "productId": "product-uuid-1",
      "quantity": 2,
      "price": 1.99
    },
    {
      "productId": "product-uuid-2",
      "quantity": 1,
      "price": 3.99,
      "discount": 0.50
    }
  ]
}
```

**Response:**

```json
{
  "id": "order-uuid-here",
  "orderNumber": "230701-0001",
  "status": "PENDING",
  "paymentStatus": "PENDING",
  "paymentMethod": "CREDIT_CARD",
  "subtotal": 7.97,
  "tax": 0,
  "discount": 0.50,
  "total": 7.47,
  "notes": "Customer requested fast delivery",
  "storeId": "store-uuid-here",
  "storeName": "Main Street Store",
  "items": [
    {
      "id": "item-uuid-1",
      "productId": "product-uuid-1",
      "productName": "Organic Banana",
      "productSku": "FRUIT-BAN-001",
      "quantity": 2,
      "price": 1.99,
      "discount": 0,
      "tax": 0,
      "subtotal": 3.98,
      "total": 3.98
    },
    {
      "id": "item-uuid-2",
      "productId": "product-uuid-2",
      "productName": "Organic Apple",
      "productSku": "FRUIT-APP-001",
      "quantity": 1,
      "price": 3.99,
      "discount": 0.50,
      "tax": 0,
      "subtotal": 3.99,
      "total": 3.49
    }
  ],
  "itemCount": 2,
  "createdAt": "2023-07-01T12:00:00Z",
  "updatedAt": "2023-07-01T12:00:00Z"
}
```

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify that your database server is running
   - Check that the DATABASE_URL in .env is correct
   - Ensure your database user has appropriate permissions

2. **Prisma Client Errors**
   - Run `npx prisma generate` to update the Prisma client
   - Ensure your database schema matches your Prisma schema

3. **API Returns 500 Error**
   - Check the server logs for detailed error information
   - Verify that all required environment variables are set
   - Check for syntax errors in recent code changes

### Getting Help

For additional help or to report issues, please contact the development team or submit an issue in the project repository. 