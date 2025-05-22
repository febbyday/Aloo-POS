# Gift Card Services Migration

This directory contains both legacy and factory-based gift card services. The factory-based services are the preferred way to interact with the gift card API.

## Legacy Services

- `giftCardService.ts` - Legacy gift card service using the old API client
- `templateService.ts` - Legacy template service using the old API client

## Factory-Based Services

- `factory-gift-card-service.ts` - Factory-based gift card service using the enhanced API client and endpoint registry
- `factory-template-service.ts` - Factory-based template service using the enhanced API client and endpoint registry

## Migration Status

The `index.ts` file in the parent directory has been updated to export the factory-based services. However, there are still some components that import the legacy services directly. These should be updated to use the exports from the `index.ts` file.

## Migration Steps

1. Update imports to use the exports from the `index.ts` file:

```typescript
// Before
import GiftCardService from '../services/gift-cards/giftCardService';
import { TemplateService } from '../services/gift-cards/templateService';

// After
import { GiftCardService, TemplateService } from '../services';
```

2. If you need to use methods that are only available in the legacy services, you can update the factory-based services to include those methods.

## Benefits of Factory-Based Services

- Consistent error handling
- Automatic retry for network errors
- Centralized endpoint configuration
- Type safety for API responses
- Reduced boilerplate code
- Better maintainability
