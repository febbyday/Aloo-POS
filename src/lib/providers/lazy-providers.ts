import { createLazyProvider } from './LazyProvider';

// Lazy load non-critical feature providers
export const LazyPricingSettingsProvider = createLazyProvider(
  () => import('@/features/products/context/BatchPricingSettingsContext').then(
    module => ({ default: module.BatchPricingSettingsProvider })
  ),
  'pricingSettings'
);

export const LazyRealShopProvider = createLazyProvider(
  () => import('@/features/shops/context/RealShopContext').then(
    module => ({ default: module.RealShopProvider })
  ),
  'realShop'
);

export const LazyCategoryProvider = createLazyProvider(
  () => import('@/features/products/context/BatchCategoryProvider').then(
    module => ({ default: module.BatchCategoryProvider })
  ),
  'category'
);

export const LazyBrandProvider = createLazyProvider(
  () => import('@/features/products/context/BatchBrandProvider').then(
    module => ({ default: module.BatchBrandProvider })
  ),
  'brand'
);

export const LazyVariationTemplateProvider = createLazyProvider(
  () => import('@/features/products/context/BatchVariationTemplateProvider').then(
    module => ({ default: module.BatchVariationTemplateProvider })
  ),
  'variationTemplate'
);

export const LazyProductProvider = createLazyProvider(
  () => import('@/features/products/context/BatchProductProvider').then(
    module => ({ default: module.BatchProductProvider })
  ),
  'product'
);

// Lazy load all history providers
export const LazyHistoryProviders = createLazyProvider(
  () => import('@/components/providers/HistoryProviders').then(
    module => ({ default: module.default })
  ),
  'historyProviders'
);

export const LazyUserSettingsProvider = createLazyProvider(
  () => import('@/features/users/context/BatchUserSettingsContext').then(
    module => ({ default: module.BatchUserSettingsProvider })
  ),
  'userSettings'
);
