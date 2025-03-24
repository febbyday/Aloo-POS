// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤

# Shop/Store Alignment Implementation Plan

This document outlines the steps required to standardize the shop/store terminology and align the frontend and backend data models in the POS system.

## 1. Problem Statement

The system currently uses different terminology and data structures between frontend and backend:

| Component | Frontend | Backend |
|-----------|----------|---------|
| **Terminology** | "shop" | "store" |
| **File Naming** | `shopsService.ts` | `storeController.ts` |
| **API Endpoints** | Expects `/shops` | Provides `/stores` |
| **Data Fields** | Has additional fields | Missing some fields |
| **Error Format** | Expects specific format | Uses different format |

## 2. Implementation Steps

### Phase 1: Schema and Validation Alignment (Complete)

- [x] Create shared Zod validation schemas (`shopSchema.ts`)
- [x] Add validation middleware to API endpoints
- [x] Create data mappers between frontend/backend models
- [x] Standardize error response format

### Phase 2: Backend Renaming

```bash
# Execute these commands in the backend directory
# First, create backups of the original files
mkdir -p backups/controllers backups/services backups/routes backups/types

# Copy files to backup
cp src/controllers/storeController.ts backups/controllers/
cp src/services/storeService.ts backups/services/
cp src/routes/storeRoutes.ts backups/routes/
cp src/types/dto/storeDto.ts backups/types/

# Create new files with renamed content
cp src/controllers/storeController.ts src/controllers/shopController.ts
cp src/services/storeService.ts src/services/shopService.ts
cp src/routes/storeRoutes.ts src/routes/shopRoutes.ts
cp src/types/dto/storeDto.ts src/types/dto/shopDto.ts
```

### Phase 3: Code Updates

#### Update Backend Controller (`shopController.ts`)

```typescript
// Replace class name and imports
import { Request, Response } from 'express';
import { shopService } from '../services/shopService';
import { sendSuccessResponse, sendErrorResponse } from '../utils/errorHandling';
import { mapShopToStoreInput, mapStoreDtoToShop } from '../types/mappers/shopMappers';

export class ShopController {
  // Replace method implementations to use mappers and standardized responses
  async getAllShops(req: Request, res: Response): Promise<void> {
    try {
      // ... existing code ...
      
      const result = await shopService.getAllShops({
        // ... params ...
      });
      
      // Use standardized success response
      sendSuccessResponse(res, {
        shops: result.stores.map(mapStoreDtoToShop),
        total: result.total,
        page: result.page,
        limit: result.limit
      });
    } catch (error) {
      // Use standardized error handling
      sendErrorResponse(res, error);
    }
  }
  
  // ... update other methods ...
}

// Export singleton instance
export const shopController = new ShopController();
```

#### Update Backend Service (`shopService.ts`)

```typescript
// Update class name and rename methods for consistency
export class ShopService {
  async getAllShops(...) { 
    // Rename from getAllStores to getAllShops
  }
  
  async getShopById(...) {
    // Rename from getStoreById to getShopById
  }
  
  // ... update other methods ...
}

export const shopService = new ShopService();
```

#### Update Main App Routes

```typescript
// In your main app.ts or server.ts file
import shopRoutes from './routes/shopRoutes';

// Update API endpoint to use standardized path
app.use('/api/v1/shops', shopRoutes);
```

#### Update Frontend Service (`shopsService.ts`)

```typescript
// Update API endpoint to match the new backend structure
const API_BASE_URL = `${getApiEndpoint('shops')}/api/v1/shops`;
```

### Phase 4: Database Alignment (If Needed)

If you're using Prisma, you may need to create a migration:

```bash
# Generate a new migration that renames Store to Shop
npx prisma migrate dev --name rename_store_to_shop
```

Prisma schema update (`schema.prisma`):

```prisma
// OLD
model Store {
  id          String   @id @default(uuid())
  // ... fields ...
}

// NEW
model Shop {
  id          String   @id @default(uuid())
  // ... fields ...
  
  // Add new fields to match frontend expectations
  salesLastMonth Float?
  averageOrderValue Float?
  // ... other fields ...
}
```

## 3. Testing Plan

### API Endpoint Testing

1. Test each renamed endpoint to ensure it functions correctly
2. Verify correct data format in responses
3. Test error handling to ensure formatted errors
4. Verify frontend can successfully connect to new endpoints

### Frontend Integration Testing

1. Test shop creation/update/delete flows
2. Verify correct data display in shop list and details
3. Test staff management within shops
4. Verify error messages display correctly

## 4. Rollback Plan

If issues occur, the following rollback procedure can be executed:

```bash
# Restore backup files
cp backups/controllers/storeController.ts src/controllers/
cp backups/services/storeService.ts src/services/
cp backups/routes/storeRoutes.ts src/routes/
cp backups/types/storeDto.ts src/types/dto/

# Revert app routes to old version
# In app.ts or server.ts
app.use('/api/stores', storeRoutes);
```

## 5. Future Considerations

1. **Shared Types Package**: Create a shared npm package for types used in both frontend and backend
2. **API Versioning**: Implement proper API versioning strategy
3. **Swagger Documentation**: Add OpenAPI/Swagger documentation
4. **Error Monitoring**: Integrate with error monitoring service
5. **Performance Metrics**: Add performance tracking for API endpoints

## 6. Timeline

| Task | Estimated Time | Dependencies |
|------|----------------|--------------|
| Schema & Validation | 1 day | None |
| Backend Renaming | 0.5 day | Schema & Validation |
| Code Updates | 1 day | Backend Renaming |
| Database Alignment | 1 day | Code Updates |
| Testing | 1 day | All previous tasks |
| Documentation | 0.5 day | All previous tasks |

Total estimated time: 5 days
