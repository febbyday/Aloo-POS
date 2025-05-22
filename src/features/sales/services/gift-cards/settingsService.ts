/**
 * @deprecated This service is deprecated. Use the gift-cards module service instead.
 * Import from '@/features/gift-cards/services/settingsService' instead.
 */

import { GiftCardSettings } from "../../types/gift-cards";
import { SettingsService as GiftCardSettingsService } from '@/features/gift-cards/services/settingsService';

// Re-export the service from the gift-cards module
export const SettingsService = GiftCardSettingsService;

// For backward compatibility, maintain the default export
export default SettingsService;