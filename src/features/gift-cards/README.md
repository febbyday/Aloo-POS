# Gift Cards Module

This module provides functionality for managing gift cards, including creating, updating, and redeeming gift cards, as well as managing gift card templates.

## Migration Status

⚠️ **DEPRECATED**: This module has been fully integrated into the sales module. All components, hooks, and services have been moved to the sales module.

### Current Status

- ✅ All components have been moved to the sales module
- ✅ All hooks have been moved to the sales module
- ✅ All services have been moved to the sales module
- ✅ This module now only re-exports from the sales module

### Next Steps

This module will be removed in a future release. All code should be updated to import from the sales module instead.

## Usage

### Hooks

Use the hooks from the sales module to interact with gift cards and templates:

```typescript
// ❌ Don't do this
import { useGiftCards, useTemplates } from '@/features/gift-cards/hooks';

// ✅ Do this instead
import { useGiftCards, useTemplates } from '@/features/sales/hooks/gift-cards';
```

### Services

Use the factory-based services from the sales module:

```typescript
// ❌ Don't do this
import { GiftCardService, TemplateService } from '@/features/gift-cards/services';

// ✅ Do this instead
import { giftCardService, templateService } from '@/features/sales/services/gift-cards';
```

### Components

Use the components from the sales module:

```typescript
// ❌ Don't do this
import { GiftCardsToolbar, GiftCardForm } from '@/features/gift-cards/components';

// ✅ Do this instead
import { GiftCardsToolbar, GiftCardForm } from '@/features/sales/components/gift-cards';
```
