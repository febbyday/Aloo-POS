/**
 * Gift Cards Services Index
 * 
 * This module exports all services for the gift cards feature.
 */

// Import legacy services
import GiftCardService from './giftCardService';
import TemplateService from './templateService';

// Import factory-based services
import { giftCardService } from './factory-gift-card-service';
import { templateService } from './factory-template-service';

// Export factory-based services as the primary services
export { 
  giftCardService,
  templateService
};

// Export legacy services with deprecation warnings
/**
 * @deprecated Use the factory-based giftCardService from './factory-gift-card-service' instead
 */
export const legacyGiftCardService = GiftCardService;

/**
 * @deprecated Use the factory-based templateService from './factory-template-service' instead
 */
export const legacyTemplateService = TemplateService;

// Export default for backward compatibility
export default {
  giftCardService,
  templateService
};
