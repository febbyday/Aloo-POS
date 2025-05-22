# Prisma Client Usage Guide

This document explains how to use the Prisma client in the POS application.

## Overview

The Prisma client is a type-safe database client that provides an interface to interact with the database. It is used throughout the application to perform database operations.

## Single Instance Pattern

The application uses a single instance of the Prisma client to improve performance and prevent connection pool exhaustion. This instance is created in `src/prisma.ts` and should be imported from there.

## Importing the Prisma Client

```typescript
// Import as default export
import prisma from '../prisma';

// Or import as named export
import { prisma } from '../prisma';
```

## Features

The centralized Prisma client instance includes the following features:

- **Singleton Pattern**: Prevents multiple instances of the Prisma client
- **Hot-Reload Safe**: Uses global variables to preserve the client across hot-reloads in development
- **Logging**: Configurable logging based on environment
- **Error Handling**: Built-in error handling for database connection issues
- **Connection Testing**: Automatic connection testing on startup
- **Extensions**: Includes extensions for typed JSON fields

## Using the Prisma Client

```typescript
// Example: Find a user by ID
const user = await prisma.user.findUnique({
  where: { id: userId }
});

// Example: Create a new product
const product = await prisma.product.create({
  data: {
    name: 'New Product',
    price: 9.99,
    description: 'A new product'
  }
});

// Example: Update a shop
const shop = await prisma.shop.update({
  where: { id: shopId },
  data: {
    name: 'Updated Shop Name'
  }
});

// Example: Delete a customer
const customer = await prisma.customer.delete({
  where: { id: customerId }
});
```

## Error Handling

The Prisma client includes built-in error handling, but you should still handle errors in your application code:

```typescript
try {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  return res.json(user);
} catch (error) {
  console.error('Error fetching user:', error);
  return res.status(500).json({ error: 'Internal server error' });
}
```

## Transactions

For operations that require multiple database queries to be executed as a single unit, use transactions:

```typescript
// Example: Create a product and update inventory in a transaction
const result = await prisma.$transaction(async (tx) => {
  // Create the product
  const product = await tx.product.create({
    data: {
      name: 'New Product',
      price: 9.99,
      description: 'A new product'
    }
  });
  
  // Update the inventory
  const inventory = await tx.inventory.create({
    data: {
      productId: product.id,
      quantity: 10,
      location: 'Warehouse A'
    }
  });
  
  return { product, inventory };
});
```

## Deprecated Files

The following files are deprecated and should not be used:

- `src/lib/prisma.ts`: Use `src/prisma.ts` instead
- `src/database/prisma.ts`: Use `src/prisma.ts` instead

These files re-export the centralized Prisma client for backward compatibility but will be removed in a future update.

## Migrations and Schema

The Prisma schema is defined in `prisma/schema.prisma`. To make changes to the database schema:

1. Update the schema file
2. Run migrations: `npx prisma migrate dev --name <migration-name>`
3. Generate the Prisma client: `npx prisma generate`

## Best Practices

- Always import the Prisma client from `src/prisma.ts`
- Use transactions for operations that require multiple queries
- Handle errors appropriately in your application code
- Use the Prisma client's built-in methods for database operations
- Avoid creating new instances of the Prisma client
