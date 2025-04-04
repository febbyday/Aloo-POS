# Shop Schema Documentation

This document provides a comprehensive overview of the Shop schema used in the POS system.

## Overview

The Shop schema represents retail locations in the system. It includes basic information, address details, operating hours, settings, and relations to other entities.

## Schema Structure

### Core Fields

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| id | string | Unique identifier | Auto-generated |
| code | string | Shop code (min 2 chars) | Yes |
| name | string | Shop name (min 2 chars) | Yes |
| description | string | Shop description | No |
| address | Address | Structured address object | Yes |
| phone | string | Contact phone number | Yes |
| email | string | Contact email address | No |
| status | ShopStatus | Current shop status | Yes (default: ACTIVE) |
| type | ShopType | Type of shop | Yes (default: RETAIL) |
| manager | string | Shop manager name | No |
| operatingHours | OperatingHours | Shop operating hours | No |
| settings | ShopSettings | Shop configuration settings | No |
| isHeadOffice | boolean | Whether this is the head office | No (default: false) |
| timezone | string | Shop timezone | No (default: UTC) |
| taxId | string | Tax identification number | No |
| licenseNumber | string | Business license number | No |
| website | string | Shop website URL | No |
| logoUrl | string | URL to shop logo | No |
| salesLastMonth | number | Sales amount from last month | No |
| inventoryCount | number | Current inventory count | No |
| averageOrderValue | number | Average order value | No |
| topSellingCategories | string[] | List of top selling categories | No |
| recentActivity | ShopActivity[] | Recent shop activities | No |
| staffCount | number | Number of staff members | No |
| createdAt | string/Date | Creation timestamp | Auto-generated |
| updatedAt | string/Date | Last update timestamp | Auto-generated |
| lastSync | string/Date | Last synchronization timestamp | Auto-generated |

### Address Structure

The address is stored as a structured object with the following fields:

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| street | string | Street address | Yes |
| street2 | string | Additional address info | No |
| city | string | City | Yes |
| state | string | State/Province | Yes |
| postalCode | string | Postal/ZIP code | Yes |
| country | string | Country | Yes |
| latitude | number | Latitude coordinate | No |
| longitude | number | Longitude coordinate | No |

### Settings Structure

Shop settings control various aspects of shop operation:

| Field | Type | Description | Default |
|-------|------|-------------|---------|
| allowNegativeInventory | boolean | Allow negative inventory | false |
| defaultTaxRate | number | Default tax rate | 0 |
| requireStockCheck | boolean | Require stock check on sales | true |
| autoPrintReceipt | boolean | Auto-print receipts | true |
| receiptFooter | string | Custom receipt footer text | null |
| receiptHeader | string | Custom receipt header text | null |
| defaultDiscountRate | number | Default discount rate | 0 |
| enableCashierTracking | boolean | Track cashier activity | true |
| allowReturnWithoutReceipt | boolean | Allow returns without receipt | false |
| maxItemsPerTransaction | number | Max items per transaction | null |
| minPasswordLength | number | Minimum password length | 8 |
| requireManagerApproval | object | Manager approval settings | See below |
| thresholds | object | Inventory threshold settings | See below |

#### Manager Approval Settings

| Field | Type | Description | Default |
|-------|------|-------------|---------|
| forDiscount | boolean | Require approval for discounts | true |
| forVoid | boolean | Require approval for voids | true |
| forReturn | boolean | Require approval for returns | true |
| forRefund | boolean | Require approval for refunds | true |
| forPriceChange | boolean | Require approval for price changes | true |

#### Threshold Settings

| Field | Type | Description | Default |
|-------|------|-------------|---------|
| lowStock | number | Low stock threshold | 5 |
| criticalStock | number | Critical stock threshold | 2 |
| reorderPoint | number | Reorder point threshold | 10 |

### Operating Hours Structure

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| monday | OperatingDay | Monday hours | Yes |
| tuesday | OperatingDay | Tuesday hours | Yes |
| wednesday | OperatingDay | Wednesday hours | Yes |
| thursday | OperatingDay | Thursday hours | Yes |
| friday | OperatingDay | Friday hours | Yes |
| saturday | OperatingDay | Saturday hours | Yes |
| sunday | OperatingDay | Sunday hours | Yes |
| holidays | Holiday[] | Special holiday hours | No |

#### Operating Day Structure

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| open | boolean | Whether the shop is open | Yes |
| openTime | string | Opening time (HH:MM format) | No |
| closeTime | string | Closing time (HH:MM format) | No |
| breakStart | string | Break start time (HH:MM format) | No |
| breakEnd | string | Break end time (HH:MM format) | No |

## Enums

### ShopStatus

| Value | Description |
|-------|-------------|
| ACTIVE | Shop is active and operational |
| INACTIVE | Shop is temporarily inactive |
| MAINTENANCE | Shop is under maintenance |
| CLOSED | Shop is permanently closed |
| PENDING | Shop is pending activation |

### ShopType

| Value | Description |
|-------|-------------|
| RETAIL | Standard retail location |
| WAREHOUSE | Warehouse or distribution center |
| OUTLET | Discount outlet store |
| MARKET | Market stall or temporary location |
| ONLINE | Online-only store |

## Usage Examples

### Creating a Shop

```typescript
const newShop = {
  code: 'NYC001',
  name: 'Manhattan Store',
  description: 'Our flagship store in Manhattan',
  address: {
    street: '123 Broadway',
    city: 'New York',
    state: 'NY',
    postalCode: '10001',
    country: 'USA'
  },
  phone: '212-555-1234',
  email: 'manhattan@example.com',
  status: SHOP_STATUS.ACTIVE,
  type: SHOP_TYPE.RETAIL,
  manager: 'John Smith',
  operatingHours: {
    monday: { open: true, openTime: '09:00', closeTime: '18:00' },
    tuesday: { open: true, openTime: '09:00', closeTime: '18:00' },
    wednesday: { open: true, openTime: '09:00', closeTime: '18:00' },
    thursday: { open: true, openTime: '09:00', closeTime: '18:00' },
    friday: { open: true, openTime: '09:00', closeTime: '20:00' },
    saturday: { open: true, openTime: '10:00', closeTime: '18:00' },
    sunday: { open: false }
  },
  settings: {
    allowNegativeInventory: false,
    defaultTaxRate: 8.875,
    requireStockCheck: true,
    autoPrintReceipt: true
  },
  isHeadOffice: false,
  timezone: 'America/New_York'
};

await shopService.createShop(newShop);
```

### Updating Shop Settings

```typescript
const updatedSettings = {
  allowNegativeInventory: false,
  defaultTaxRate: 8.875,
  requireStockCheck: true,
  autoPrintReceipt: true,
  receiptFooter: 'Thank you for shopping with us!',
  defaultDiscountRate: 0,
  requireManagerApproval: {
    forDiscount: true,
    forVoid: true,
    forReturn: true,
    forRefund: true,
    forPriceChange: false
  },
  thresholds: {
    lowStock: 10,
    criticalStock: 5,
    reorderPoint: 15
  }
};

await shopService.updateShop(shopId, { settings: updatedSettings });
```

### Updating Shop Address

```typescript
const updatedAddress = {
  street: '456 Fifth Avenue',
  street2: 'Floor 3',
  city: 'New York',
  state: 'NY',
  postalCode: '10018',
  country: 'USA',
  latitude: 40.7509,
  longitude: -73.9777
};

await shopService.updateShop(shopId, { address: updatedAddress });
```

## Related Entities

The Shop model has relationships with several other entities:

- **Staff**: Staff members assigned to the shop
- **StaffAssignment**: Staff assignments to the shop
- **Shift**: Work shifts at the shop
- **Order**: Orders placed at the shop
- **ProductLocation**: Product inventory at the shop

## Implementation Notes

- The address is stored as a JSON object in the database
- Operating hours and settings are also stored as JSON objects
- The frontend and backend share the same schema definition through Zod
- Validation is performed on both frontend and backend
