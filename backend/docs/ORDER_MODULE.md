# Order Module Documentation

## Overview

The Order module is a critical component of the POS system, responsible for managing sales transactions. It handles the creation, processing, and management of orders, including inventory adjustments, payment tracking, and sales analytics.

## Core Components

### 1. Order Repository (`orderRepository.ts`)

The Order Repository handles data access operations for orders, providing methods to:

- Find all orders with filtering and pagination
- Find orders by ID or order number
- Create, update, and delete orders
- Calculate sales summaries for reporting

Key methods include:

```typescript
async findAll(params: { /* ... */ }): Promise<Order[]>
async findById(id: string, include?: Prisma.OrderInclude): Promise<Order | null>
async findByOrderNumber(orderNumber: string, include?: Prisma.OrderInclude): Promise<Order | null>
async create(data: Prisma.OrderCreateInput): Promise<Order>
async update(id: string, data: Prisma.OrderUpdateInput): Promise<Order>
async delete(id: string): Promise<Order>
async getSalesSummary(where: Prisma.OrderWhereInput, groupBy: 'day' | 'week' | 'month'): Promise<any[]>
```

### 2. Order Item Repository (`orderItemRepository.ts`)

The Order Item Repository manages line items within orders:

- Find all items or items by order ID
- Create individual or batch items
- Update and delete items
- Calculate popular products

Notable methods:

```typescript
async findByOrderId(orderId: string, include?: Prisma.OrderItemInclude): Promise<OrderItem[]>
async createMany(data: Prisma.OrderItemCreateManyInput[]): Promise<Prisma.BatchPayload>
async deleteByOrderId(orderId: string): Promise<Prisma.BatchPayload>
async getPopularProducts(limit: number = 10, dateRange?: { start: Date; end: Date }): Promise<any[]>
```

### 3. Order DTOs (`orderDto.ts`)

Data Transfer Objects for order-related data:

- `OrderItemDto`: Represents a single line item in an order
- `OrderDto`: Represents a complete order with its items
- `OrderListDto`: Represents a paginated list of orders
- `OrderSummaryDto`: A condensed summary of an order
- `SalesSummaryDto`: Summary data for sales analytics

Transformation functions:

```typescript
transformOrderItemToDto(orderItem: OrderItem): OrderItemDto
transformOrderToDto(order: Order): OrderDto
transformToOrderSummary(order: Order): OrderSummaryDto
transformToOrderListDto(data: { /* ... */ }): OrderListDto
transformToSalesSummaryDto(data: Array<{ /* ... */ }>): SalesSummaryDto[]
```

### 4. Order Service (`orderService.ts`)

The Order Service implements business logic for orders:

- Order creation and processing
- Stock management tied to order status
- Order updates and cancellations
- Sales reporting and analytics

Key business operations:

```typescript
async createOrder(data: { /* ... */ }): Promise<Order>
async updateOrder(id: string, data: { /* ... */ }): Promise<Order>
async deleteOrder(id: string): Promise<Order>
async getSalesSummary(period: 'day' | 'week' | 'month', dateRange?: { start: Date; end: Date }): Promise<any[]>
```

### 5. Order Controller (`orderController.ts`)

The Order Controller handles HTTP requests for order operations:

- Process client requests and extract parameters
- Validate input data
- Call appropriate service methods
- Format and return responses

API endpoints handled:

```typescript
async getAllOrders(req: Request, res: Response): Promise<void>
async getOrderById(req: Request, res: Response): Promise<void>
async getOrderByOrderNumber(req: Request, res: Response): Promise<void>
async createOrder(req: Request, res: Response): Promise<void>
async updateOrder(req: Request, res: Response): Promise<void>
async deleteOrder(req: Request, res: Response): Promise<void>
async getOrderSummary(req: Request, res: Response): Promise<void>
async getSalesSummary(req: Request, res: Response): Promise<void>
```

### 6. Order Routes (`orderRoutes.ts`)

The Order Routes define API endpoints for order operations:

```
GET /api/orders                    - Get all orders with filtering
GET /api/orders/:id                - Get an order by ID
GET /api/orders/number/:orderNumber - Get an order by order number
GET /api/orders/:id/summary        - Get order summary for receipt
GET /api/orders/summary            - Get sales summary data
POST /api/orders                   - Create a new order
PUT /api/orders/:id                - Update an existing order
DELETE /api/orders/:id             - Delete an order
```

## Order Workflow

### Order Creation Process

1. **Client Request**: Client submits order data with items
2. **Validation**: Service validates product existence and availability
3. **Order Number Generation**: A unique order number is generated
4. **Total Calculation**: Subtotal, tax, discount, and total are calculated
5. **Transaction Execution**: All database operations run in a transaction
6. **Inventory Update**: If order status is COMPLETED, product stock is reduced
7. **Response**: The created order is returned with all details

### Order Status Management

Orders can have the following statuses:

- `PENDING`: Initial state, order created but not processed
- `PROCESSING`: Order is being prepared
- `COMPLETED`: Order is fulfilled and products delivered
- `CANCELLED`: Order is cancelled

Status transitions trigger inventory adjustments:

- When status changes to `COMPLETED`: Product stock decreases
- When status changes from `COMPLETED` to `CANCELLED`: Product stock is restored

### Payment Status Management

Payment statuses include:

- `PENDING`: Payment not yet received
- `PAID`: Payment completed successfully
- `REFUNDED`: Payment refunded to customer
- `FAILED`: Payment process failed

## Inventory Integration

The Order module integrates with inventory management through:

1. **Stock Checks**: Verifying product availability during order creation
2. **Automatic Stock Updates**: Decreasing inventory when orders are completed
3. **Stock Restoration**: Restoring inventory when orders are cancelled
4. **Multi-location Support**: Handling inventory across different store locations

Example of inventory update during order processing:

```typescript
// When an order is completed
if (order.status === OrderStatus.COMPLETED) {
  for (const item of processedItems) {
    await tx.product.update({
      where: { id: item.productId },
      data: {
        stock: {
          decrement: item.quantity,
        },
      },
    });
  }
}
```

## Sales Analytics

The Order module provides robust sales analytics through:

1. **Daily, Weekly, Monthly Reports**: Aggregated sales data over time
2. **Popular Product Analysis**: Most frequently purchased products
3. **Revenue Tracking**: Total revenue and average order value
4. **Trend Analysis**: Sales patterns over time

Sample sales summary query:

```sql
SELECT 
  DATE_FORMAT(createdAt, '%Y-%m-%d') as period,
  COUNT(*) as totalOrders,
  SUM(total) as revenue,
  AVG(total) as averageOrderValue
FROM `Order`
WHERE status != 'CANCELLED'
GROUP BY period
ORDER BY period DESC
```

## Error Handling

The Order module implements the following error handling strategies:

1. **Validation Errors**: Checks for required fields and valid data
2. **Not Found Errors**: When orders or products can't be found
3. **Business Rule Errors**: When operations violate business rules
4. **Transaction Errors**: When database transactions fail

Example error handling:

```typescript
try {
  // Business logic
} catch (error) {
  console.error('Error creating order:', error);
  res.status(500).json({
    message: 'Failed to create order',
    error: (error as Error).message,
  });
}
```

## Usage Examples

### Creating an Order

**Request:**

```http
POST /api/orders
Content-Type: application/json

{
  "storeId": "store-123",
  "paymentMethod": "CREDIT_CARD",
  "status": "PENDING",
  "paymentStatus": "PENDING",
  "notes": "Customer requested fast delivery",
  "items": [
    {
      "productId": "product-123",
      "quantity": 2,
      "price": 19.99
    },
    {
      "productId": "product-456",
      "quantity": 1,
      "price": 29.99,
      "discount": 5.00
    }
  ]
}
```

**Response:**

```json
{
  "id": "order-123",
  "orderNumber": "230715-0001",
  "status": "PENDING",
  "paymentStatus": "PENDING",
  "paymentMethod": "CREDIT_CARD",
  "subtotal": 69.97,
  "tax": 0,
  "discount": 5.00,
  "total": 64.97,
  "notes": "Customer requested fast delivery",
  "storeId": "store-123",
  "storeName": "Main Street Store",
  "items": [
    {
      "id": "item-123",
      "productId": "product-123",
      "productName": "T-Shirt",
      "productSku": "APPAREL-TS-001",
      "quantity": 2,
      "price": 19.99,
      "discount": 0,
      "tax": 0,
      "subtotal": 39.98,
      "total": 39.98
    },
    {
      "id": "item-456",
      "productId": "product-456",
      "productName": "Jeans",
      "productSku": "APPAREL-JN-001",
      "quantity": 1,
      "price": 29.99,
      "discount": 5.00,
      "tax": 0,
      "subtotal": 29.99,
      "total": 24.99
    }
  ],
  "itemCount": 2,
  "createdAt": "2023-07-15T10:30:00Z",
  "updatedAt": "2023-07-15T10:30:00Z"
}
```

### Updating an Order Status

**Request:**

```http
PUT /api/orders/order-123
Content-Type: application/json

{
  "status": "COMPLETED",
  "paymentStatus": "PAID"
}
```

**Response:**

```json
{
  "id": "order-123",
  "orderNumber": "230715-0001",
  "status": "COMPLETED",
  "paymentStatus": "PAID",
  "paymentMethod": "CREDIT_CARD",
  "subtotal": 69.97,
  "tax": 0,
  "discount": 5.00,
  "total": 64.97,
  "notes": "Customer requested fast delivery",
  "storeId": "store-123",
  "storeName": "Main Street Store",
  "items": [...],
  "itemCount": 2,
  "createdAt": "2023-07-15T10:30:00Z",
  "updatedAt": "2023-07-15T10:35:00Z"
}
```

### Getting Sales Summary

**Request:**

```http
GET /api/orders/summary?period=day&startDate=2023-07-01&endDate=2023-07-31
```

**Response:**

```json
[
  {
    "period": "2023-07-15",
    "totalOrders": 12,
    "revenue": 728.45,
    "averageOrderValue": 60.70
  },
  {
    "period": "2023-07-14",
    "totalOrders": 9,
    "revenue": 523.87,
    "averageOrderValue": 58.21
  },
  ...
]
```

## Best Practices for Using the Order Module

1. **Use Transactions**: Always use transactions when modifying orders to ensure data consistency.
2. **Check Stock First**: Verify product availability before creating orders.
3. **Handle Status Transitions Carefully**: Status changes can affect inventory.
4. **Generate Unique Order Numbers**: Use the service's order number generation.
5. **Monitor Performance**: Large orders with many items may impact performance.

## Future Enhancements

Planned improvements for the Order module:

1. **Discounts and Promotions**: More sophisticated discount logic
2. **Tax Calculation**: Advanced tax rules based on location
3. **Partial Fulfillment**: Support for partially fulfilled orders
4. **Reservation System**: Reserving inventory during checkout
5. **Returns Processing**: Dedicated workflows for returns and exchanges
6. **Multi-currency Support**: Handle different currencies and exchange rates

## Troubleshooting

Common issues and solutions:

1. **Inventory Discrepancies**: Use transactions and check for race conditions
2. **Order Creation Failures**: Verify all product IDs exist and are active
3. **Performance Issues**: Use pagination and optimize database queries
4. **Status Update Problems**: Ensure proper status transition paths

For further assistance with the Order module, contact the development team. 