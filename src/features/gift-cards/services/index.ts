/**
 * Gift Cards Services
 *
 * @deprecated These services have been moved to the sales module.
 * Import from '@/features/sales/services' instead:
 * import { giftCardService, templateService } from '@/features/sales/services';
 */

// Re-export the factory-based services from the sales module
export { giftCardService as GiftCardService } from '@/features/sales/services/gift-cards';
export { templateService as TemplateService } from '@/features/sales/services/gift-cards';
