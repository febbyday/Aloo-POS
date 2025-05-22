/**
 * Sales Services
 *
 * This module exports all services for the sales feature.
 */

// Export all services here
export { default as SalesService } from './salesService';

// Export gift card services
export {
  giftCardService,
  templateService
} from './gift-cards';

// Export legacy gift card services for backward compatibility
export { default as GiftCardService } from './gift-cards/factory-gift-card-service';
export { default as TemplateService } from './gift-cards/factory-template-service';
