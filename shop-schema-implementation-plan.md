# Shop Schema Implementation Plan

This document outlines the specific implementation steps to address the recommendations from the shop schema comparison between frontend and backend.

## 1. Standardize Address Handling

### Current Issues
- Backend uses flattened fields (addressStreet, addressCity, etc.)
- Frontend has inconsistent address handling (sometimes string, sometimes object)
- Shared schema uses a structured address object

### Implementation Steps

1. **Update Prisma Schema**
   - Create a new migration to modify the Shop model:
   ```prisma
   model Shop {
     // ... other fields
     
     // Remove individual address fields
     // addressStreet, addressStreet2, addressCity, etc.
     
     // Add JSON field for structured address
     address Json
     
     // ... other fields
   }
   ```

2. **Create Migration Script**
   - Create a migration script to convert existing data:
   ```typescript
   // In migration script
   const shops = await prisma.shop.findMany();
   
   for (const shop of shops) {
     await prisma.shop.update({
       where: { id: shop.id },
       data: {
         address: {
           street: shop.addressStreet,
           street2: shop.addressStreet2 || null,
           city: shop.addressCity,
           state: shop.addressState,
           postalCode: shop.addressPostalCode,
           country: shop.addressCountry,
           latitude: shop.addressLatitude,
           longitude: shop.addressLongitude
         }
       }
     });
   }
   ```

3. **Update Backend DTOs and Mappers**
   - Modify `ShopDto` interface in `backend/src/types/dto/shopDto.ts`:
   ```typescript
   export interface ShopDto {
     // ... other fields
     address: {
       street: string;
       street2?: string | null;
       city: string;
       state: string;
       postalCode: string;
       country: string;
       latitude?: number | null;
       longitude?: number | null;
     };
     // Remove individual address fields
     // ... other fields
   }
   ```
   
   - Update mapper functions in `backend/src/types/mappers/shopMappers.ts`

4. **Update Frontend Components**
   - Ensure all components use the structured address object
   - Update form components to handle the nested address structure
   - Update display components to properly show address information

5. **Update API Validation**
   - Ensure API validation uses the shared address schema

## 2. Complete Migration from Store to Shop

### Current Issues
- Codebase has both `Store` and `Shop` models
- Some controllers and routes still use "store" naming
- Comment indicates "Store model has been consolidated with Shop model"

### Implementation Steps

1. **Rename Backend Files**
   - Rename `storeController.ts` to `shopController.ts` (if not already done)
   - Rename `storeRepository.ts` to `shopRepository.ts` (if not already done)
   - Rename `storeRoutes.ts` to `shopRoutes.ts` (if not already done)

2. **Update Route Definitions**
   - Update all route handlers in `backend/src/routes/storeRoutes.ts` to use shop naming:
   ```typescript
   router.get('/', shopController.getAllShops.bind(shopController));
   router.get('/:id', shopController.getShopById.bind(shopController));
   // etc.
   ```

3. **Update Controller Methods**
   - Rename methods in controllers:
     - `getAllStores` → `getAllShops`
     - `getStoreById` → `getShopById`
     - `createStore` → `createShop`
     - `updateStore` → `updateShop`
     - `deleteStore` → `deleteShop`
     - `getStoreInventory` → `getShopInventory`

4. **Update Service Methods**
   - Ensure all service methods use "shop" naming consistently

5. **Update API Documentation**
   - Update API documentation to reflect the "shop" terminology

6. **Search and Replace**
   - Perform a global search for "store" and "Store" in the codebase
   - Replace with "shop" and "Shop" where appropriate (careful with context)

## 3. Align Frontend and Backend Types

### Current Issues
- Legacy `FrontendShop` interface exists for backward compatibility
- Inconsistent use of shared Shop type across the codebase

### Implementation Steps

1. **Identify Usage of Legacy Interface**
   - Search for all occurrences of `FrontendShop` in the codebase
   - Document components and services that use this interface

2. **Update Frontend Components**
   - Modify components to use the shared `Shop` type from `shared/schemas/shopSchema.ts`
   - Update prop types, state definitions, and function parameters

3. **Update Frontend Services**
   - Modify service methods to use the shared `Shop` type
   - Update return types and parameter types

4. **Update Backend Mappers**
   - Modify `mapShopDtoToShop` to return the shared `Shop` type instead of `FrontendShop`
   ```typescript
   import { Shop } from '../../../shared/schemas/shopSchema';
   
   export function mapShopDtoToShop(shopDto: ShopDto): Shop {
     // Mapping logic
   }
   ```

5. **Remove Legacy Interface**
   - Once all usages are updated, remove the `FrontendShop` interface
   - Update import statements across the codebase

6. **Add Type Guards if Needed**
   - If backward compatibility is still needed in some places, add type guards

## 4. Improve Type Safety for JSON Fields

### Current Issues
- Prisma schema uses `Json` type for complex objects
- Lack of type definitions for these JSON fields
- Potential for type inconsistencies between frontend and backend

### Implementation Steps

1. **Create Type Definitions for JSON Fields**
   - Create type definitions in `backend/src/types/models/shopTypes.ts`:
   ```typescript
   export interface ShopSettings {
     allowNegativeInventory: boolean;
     defaultTaxRate: number;
     requireStockCheck: boolean;
     autoPrintReceipt: boolean;
     receiptFooter?: string;
     receiptHeader?: string;
     defaultDiscountRate: number;
     enableCashierTracking: boolean;
     allowReturnWithoutReceipt: boolean;
     maxItemsPerTransaction?: number;
     minPasswordLength: number;
     requireManagerApproval: {
       forDiscount: boolean;
       forVoid: boolean;
       forReturn: boolean;
       forRefund: boolean;
       forPriceChange: boolean;
     };
     thresholds: {
       lowStock: number;
       criticalStock: number;
       reorderPoint: number;
     };
   }
   
   export interface OperatingHours {
     monday: OperatingDay;
     tuesday: OperatingDay;
     wednesday: OperatingDay;
     thursday: OperatingDay;
     friday: OperatingDay;
     saturday: OperatingDay;
     sunday: OperatingDay;
     holidays?: Holiday[];
   }
   
   export interface OperatingDay {
     open: boolean;
     openTime: string | null;
     closeTime: string | null;
     breakStart: string | null;
     breakEnd: string | null;
   }
   
   export interface Holiday {
     date: string;
     name: string;
     closed: boolean;
     specialHours?: {
       openTime: string | null;
       closeTime: string | null;
     };
   }
   
   export interface ShopActivity {
     id: string;
     type: string;
     description: string;
     timestamp: string;
     userId: string;
     userName: string;
     metadata?: Record<string, any>;
   }
   ```

2. **Update Prisma Client Extensions**
   - Add Prisma Client extensions to properly type JSON fields:
   ```typescript
   import { Prisma } from '@prisma/client';
   import { ShopSettings, OperatingHours, ShopActivity } from './types/models/shopTypes';
   
   export const prismaClientExtensions = Prisma.defineExtension((client) => {
     return client.$extends({
       result: {
         shop: {
           settings: {
             needs: { settings: true },
             compute(shop) {
               return shop.settings as unknown as ShopSettings | null;
             },
           },
           operatingHours: {
             needs: { operatingHours: true },
             compute(shop) {
               return shop.operatingHours as unknown as OperatingHours | null;
             },
           },
           recentActivity: {
             needs: { recentActivity: true },
             compute(shop) {
               return shop.recentActivity as unknown as ShopActivity[] | null;
             },
           },
         },
       },
     });
   });
   
   // Use the extended client
   export const prisma = new PrismaClient().$extends(prismaClientExtensions);
   ```

3. **Update Repository Methods**
   - Update repository methods to use the typed JSON fields:
   ```typescript
   async update(
     id: string,
     data: Prisma.ShopUpdateInput & {
       settings?: ShopSettings;
       operatingHours?: OperatingHours;
       recentActivity?: ShopActivity[];
     }
   ): Promise<Shop> {
     return prisma.shop.update({
       where: { id },
       data,
     });
   }
   ```

4. **Add Validation**
   - Add validation for JSON fields using Zod schemas:
   ```typescript
   // In backend/src/validators/shopValidators.ts
   import { shopSettingsSchema, operatingHoursSchema } from '../../../shared/schemas/shopSchema';
   
   export function validateShopSettings(settings: unknown): ShopSettings {
     return shopSettingsSchema.parse(settings);
   }
   
   export function validateOperatingHours(hours: unknown): OperatingHours {
     return operatingHoursSchema.parse(hours);
   }
   ```

5. **Apply Validation in Services**
   - Add validation in service methods:
   ```typescript
   async updateShop(id: string, data: Partial<Shop>): Promise<Shop> {
     // Validate JSON fields if present
     if (data.settings) {
       validateShopSettings(data.settings);
     }
     if (data.operatingHours) {
       validateOperatingHours(data.operatingHours);
     }
     
     // Proceed with update
     return this.repository.update(id, data);
   }
   ```

## 5. Enhance Data Transformation

### Current Issues
- Mappers don't fully handle the nested address structure
- Potential for data inconsistencies during transformation

### Implementation Steps

1. **Update Shop DTO to Backend Mapper**
   - Enhance `mapShopToShopInput` in `backend/src/types/mappers/shopMappers.ts`:
   ```typescript
   export function mapShopToShopInput(shop: any): Prisma.ShopCreateInput | Prisma.ShopUpdateInput {
     // ... existing code
     
     // Handle address properly
     const address = typeof shop.address === 'object' 
       ? shop.address 
       : {
           street: '',
           city: shop.city || '',
           state: shop.state || '',
           postalCode: shop.postalCode || '',
           country: 'Unknown',
         };
     
     return {
       // ... other fields
       address,
       // Remove individual address fields from the return
       // ... other fields
     };
   }
   ```

2. **Update Backend to Shop DTO Mapper**
   - Enhance `mapShopToDto` in `backend/src/types/mappers/shopMappers.ts`:
   ```typescript
   export function mapShopToDto(shop: Shop & {
     _count?: { productLocations: number; orders: number; staff: number; assignments: number }
   }): ShopDto {
     // Extract address from JSON field
     const address = typeof shop.address === 'object' 
       ? shop.address 
       : {
           street: shop.addressStreet || '',
           street2: shop.addressStreet2 || null,
           city: shop.addressCity || '',
           state: shop.addressState || '',
           postalCode: shop.addressPostalCode || '',
           country: shop.addressCountry || '',
           latitude: shop.addressLatitude || null,
           longitude: shop.addressLongitude || null,
         };
     
     return {
       // ... other fields
       address,
       // Remove individual address fields
       // ... other fields
     };
   }
   ```

3. **Add Validation During Transformation**
   - Add validation to ensure data consistency:
   ```typescript
   import { addressSchema } from '../../../shared/schemas/shopSchema';
   
   export function mapShopToDto(shop: Shop & {
     _count?: { productLocations: number; orders: number; staff: number; assignments: number }
   }): ShopDto {
     // ... existing code
     
     // Validate address
     let validatedAddress;
     try {
       validatedAddress = addressSchema.parse(address);
     } catch (error) {
       console.error('Invalid address format:', error);
       // Fallback to a basic valid address
       validatedAddress = {
         street: address.street || 'Unknown',
         city: address.city || 'Unknown',
         state: address.state || 'Unknown',
         postalCode: address.postalCode || 'Unknown',
         country: address.country || 'Unknown',
       };
     }
     
     return {
       // ... other fields
       address: validatedAddress,
       // ... other fields
     };
   }
   ```

4. **Add Type Guards**
   - Add type guards to handle potential type mismatches:
   ```typescript
   function isOperatingHours(value: unknown): value is OperatingHours {
     if (!value || typeof value !== 'object') return false;
     const obj = value as Record<string, unknown>;
     return (
       'monday' in obj &&
       'tuesday' in obj &&
       'wednesday' in obj &&
       'thursday' in obj &&
       'friday' in obj &&
       'saturday' in obj &&
       'sunday' in obj
     );
   }
   
   export function mapShopToDto(shop: Shop): ShopDto {
     // ... existing code
     
     // Handle operating hours
     const operatingHours = isOperatingHours(shop.operatingHours)
       ? shop.operatingHours
       : null;
     
     return {
       // ... other fields
       operatingHours,
       // ... other fields
     };
   }
   ```

5. **Add Error Handling**
   - Enhance error handling during transformation:
   ```typescript
   export function mapShopDtoToShop(shopDto: ShopDto): Shop {
     try {
       return {
         // ... mapping logic
       };
     } catch (error) {
       console.error('Error mapping shop DTO to shop:', error);
       throw new Error('Failed to transform shop data');
     }
   }
   ```

## 6. Documentation Improvements

### Current Issues
- Lack of comprehensive documentation about the shop schema
- Limited documentation on the transformation process

### Implementation Steps

1. **Create Schema Documentation**
   - Create a new file `docs/shop-schema.md`:
   ```markdown
   # Shop Schema Documentation
   
   This document provides a comprehensive overview of the Shop schema used in the POS system.
   
   ## Overview
   
   The Shop schema represents retail locations in the system. It includes basic information,
   address details, operating hours, settings, and relations to other entities.
   
   ## Schema Structure
   
   ### Core Fields
   
   | Field | Type | Description | Required |
   |-------|------|-------------|----------|
   | id | string | Unique identifier | Auto-generated |
   | code | string | Shop code (min 2 chars) | Yes |
   | name | string | Shop name (min 2 chars) | Yes |
   | description | string | Shop description | No |
   | ... | ... | ... | ... |
   
   ### Address Structure
   
   The address is stored as a structured object with the following fields:
   
   | Field | Type | Description | Required |
   |-------|------|-------------|----------|
   | street | string | Street address | Yes |
   | street2 | string | Additional address info | No |
   | city | string | City | Yes |
   | ... | ... | ... | ... |
   
   ### Settings Structure
   
   Shop settings control various aspects of shop operation:
   
   | Field | Type | Description | Default |
   |-------|------|-------------|---------|
   | allowNegativeInventory | boolean | Allow negative inventory | false |
   | defaultTaxRate | number | Default tax rate | 0 |
   | ... | ... | ... | ... |
   
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
     // ... other fields
   };
   ```
   
   ### Updating Shop Settings
   
   ```typescript
   const updatedSettings = {
     allowNegativeInventory: false,
     defaultTaxRate: 8.875,
     requireStockCheck: true,
     // ... other settings
   };
   
   await shopService.updateShop(shopId, { settings: updatedSettings });
   ```
   ```
   
2. **Create Transformation Documentation**
   - Create a new file `docs/shop-data-transformation.md`:
   ```markdown
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
     // Transformation logic
   }
   ```
   
   Key transformations:
   - Converts Decimal to number
   - Structures address fields
   - Handles JSON fields
   
   ### DTO to Frontend
   
   The `mapShopDtoToShop` function transforms a ShopDto to a frontend Shop:
   
   ```typescript
   function mapShopDtoToShop(shopDto: ShopDto): Shop {
     // Transformation logic
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
     // Transformation logic
   }
   ```
   
   Key transformations:
   - Maps enum string values to Prisma enums
   - Handles nested objects
   - Prepares data for database operations
   ```
   
3. **Add JSDoc Comments**
   - Add detailed JSDoc comments to mapper functions:
   ```typescript
   /**
    * Maps a Shop database entity to a ShopDto object
    * 
    * This function transforms the database representation of a Shop into a DTO
    * suitable for API responses. It handles the following transformations:
    * 
    * 1. Converts Decimal fields to numbers
    * 2. Structures address fields into an object
    * 3. Handles JSON fields like settings and operatingHours
    * 4. Calculates derived fields
    * 
    * @param shop The Shop entity from the database
    * @returns A ShopDto object ready for API response
    */
   export function mapShopToDto(shop: Shop & {
     _count?: { productLocations: number; orders: number; staff: number; assignments: number }
   }): ShopDto {
     // Implementation
   }
   ```

4. **Create API Documentation**
   - Create or update API documentation for shop endpoints:
   ```markdown
   # Shop API Endpoints
   
   ## GET /api/v1/shops
   
   Retrieves a list of shops with optional filtering and pagination.
   
   ### Query Parameters
   
   | Parameter | Type | Description | Default |
   |-----------|------|-------------|---------|
   | page | number | Page number | 1 |
   | limit | number | Items per page | 20 |
   | search | string | Search term | - |
   | type | string | Shop type filter | - |
   | status | string | Shop status filter | - |
   | sortBy | string | Field to sort by | name |
   | sortOrder | string | Sort direction (asc/desc) | asc |
   
   ### Response
   
   ```json
   {
     "success": true,
     "data": {
       "shops": [
         {
           "id": "shop123",
           "name": "Downtown Store",
           // ... other fields
         }
       ],
       "total": 42,
       "page": 1,
       "limit": 20
     },
     "message": "Shops retrieved successfully"
   }
   ```
   
   ## POST /api/v1/shops
   
   Creates a new shop.
   
   ### Request Body
   
   ```json
   {
     "code": "NYC001",
     "name": "Manhattan Store",
     "description": "Our flagship store in Manhattan",
     "address": {
       "street": "123 Broadway",
       "city": "New York",
       "state": "NY",
       "postalCode": "10001",
       "country": "USA"
     },
     // ... other fields
   }
   ```
   
   ### Response
   
   ```json
   {
     "success": true,
     "data": {
       "id": "shop123",
       "code": "NYC001",
       "name": "Manhattan Store",
       // ... other fields
     },
     "message": "Shop created successfully"
   }
   ```
   ```

5. **Update README**
   - Update the main README to reference the new documentation:
   ```markdown
   ## Documentation
   
   - [Shop Schema](docs/shop-schema.md)
   - [Shop Data Transformation](docs/shop-data-transformation.md)
   - [API Documentation](docs/api.md)
   ```

## Implementation Timeline

### Phase 1: Documentation and Planning (Week 1)
- Create comprehensive documentation
- Review implementation plan with team
- Set up test environments

### Phase 2: Backend Updates (Week 2)
- Update Prisma schema for address handling
- Create migration scripts
- Update backend DTOs and mappers
- Improve type safety for JSON fields

### Phase 3: Frontend Updates (Week 3)
- Update frontend components to use shared types
- Align frontend and backend types
- Enhance data transformation

### Phase 4: Naming Standardization (Week 4)
- Complete migration from Store to Shop
- Update route definitions
- Update controller and service methods

### Phase 5: Testing and Validation (Week 5)
- Comprehensive testing of all changes
- Validate data consistency
- Performance testing

### Phase 6: Deployment and Monitoring (Week 6)
- Deploy changes to staging
- Monitor for issues
- Deploy to production
