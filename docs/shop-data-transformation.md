# Shop Data Transformation

This document explains how shop data is transformed between different layers of the application.

## Overview

The application uses several data models for shops:

1. **Database Model**: Defined in Prisma schema
2. **Backend DTO**: Used for API responses
3. **Frontend Model**: Used in React components
4. **Shared Schema**: Defined with Zod for validation

## Transformation Flow

```
Database (Prisma) <-> ShopDto <-> FrontendShop <-> Shop (Shared Schema)
```

## Mapper Functions

### Database to DTO

The `mapShopToDto` function transforms a Prisma Shop entity to a ShopDto:

```typescript
function mapShopToDto(shop: Shop): ShopDto {
  // Parse the address from JSON
  let address: Address;
  try {
    address = typeof shop.address === 'object'
      ? shop.address as Address
      : JSON.parse(String(shop.address)) as Address;
  } catch (error) {
    console.error('Error parsing shop address:', error);
    // Fallback to a basic valid address
    address = {
      street: 'Unknown',
      city: 'Unknown',
      state: 'Unknown',
      postalCode: 'Unknown',
      country: 'Unknown'
    };
  }
  
  return {
    id: shop.id,
    code: shop.code,
    name: shop.name,
    description: shop.description,
    address,
    phone: shop.phone,
    // ... other fields
  };
}
```

Key transformations:
- Parses JSON fields (address, settings, operatingHours)
- Converts Decimal to number
- Handles validation and fallbacks for invalid data

### DTO to Frontend

The `mapShopDtoToShop` function transforms a ShopDto to a frontend Shop:

```typescript
function mapShopDtoToShop(shopDto: ShopDto): FrontendShop {
  return {
    id: shopDto.id,
    code: shopDto.code,
    name: shopDto.name,
    description: shopDto.description || undefined,
    address: shopDto.address,
    phone: shopDto.phone || undefined,
    // ... other fields
    lastSync: shopDto.lastSync.toISOString(),
    createdAt: shopDto.createdAt.toISOString(),
    updatedAt: shopDto.updatedAt.toISOString()
  };
}
```

Key transformations:
- Converts Date to ISO string
- Handles optional fields
- Structures nested objects

### Frontend to DTO

The `mapShopToShopInput` function transforms a frontend Shop to a Prisma input:

```typescript
function mapShopToShopInput(shop: any): Prisma.ShopCreateInput | Prisma.ShopUpdateInput {
  // Map status string to ShopStatus enum
  const mapStatus = (status: string): ShopStatus => {
    switch (status.toUpperCase()) {
      case 'ACTIVE': return ShopStatus.ACTIVE;
      // ... other cases
    }
  };

  // Handle address properly
  let address: Address;
  try {
    // If address is already an object, use it
    if (typeof shop.address === 'object' && shop.address !== null) {
      address = shop.address;
    } 
    // ... other cases
    
    // Validate the address with Zod schema
    addressSchema.parse(address);
  } catch (error) {
    // Fallback handling
  }

  return {
    code: shop.code,
    name: shop.name,
    description: shop.description || null,
    address,
    // ... other fields
  };
}
```

Key transformations:
- Maps enum string values to Prisma enums
- Validates and handles address object
- Prepares data for database operations

## Validation

Validation is performed at multiple levels:

1. **Shared Schema**: Zod schemas define the structure and validation rules
2. **Frontend**: Form validation using Zod schemas
3. **Backend**: API validation using Zod schemas
4. **Mappers**: Validation during transformation
5. **Database**: Prisma schema constraints

## Error Handling

Error handling is implemented at multiple levels:

1. **Mappers**: Try-catch blocks with fallbacks for invalid data
2. **Services**: Validation before database operations
3. **Controllers**: Error handling for API responses

Example error handling in mappers:

```typescript
try {
  address = typeof shop.address === 'object'
    ? shop.address as Address
    : JSON.parse(String(shop.address)) as Address;
} catch (error) {
  console.error('Error parsing shop address:', error);
  // Fallback to a basic valid address
  address = {
    street: 'Unknown',
    city: 'Unknown',
    state: 'Unknown',
    postalCode: 'Unknown',
    country: 'Unknown'
  };
}
```

## Type Safety

Type safety is enhanced through:

1. **Shared Types**: Types derived from Zod schemas
2. **Type Guards**: Functions to check if values match expected types
3. **Prisma Extensions**: Extensions to provide better typing for JSON fields

Example type guard:

```typescript
function isShopAddress(value: unknown): value is ShopAddress {
  if (!value || typeof value !== 'object') return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.street === 'string' &&
    typeof obj.city === 'string' &&
    typeof obj.state === 'string' &&
    typeof obj.postalCode === 'string' &&
    typeof obj.country === 'string'
  );
}
```

## Best Practices

1. **Always validate data** before storing it in the database
2. **Use type guards** when working with JSON fields
3. **Provide fallbacks** for invalid data
4. **Log validation errors** for debugging
5. **Use shared schemas** for consistent validation across frontend and backend
